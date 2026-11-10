import { createConnection } from 'mysql2/promise';
import { spawn,execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const tmp=path.join(os.tmpdir(),'blitz-local-pay-test-'+crypto.randomBytes(5).toString('hex'));
const name='blitz_web_test_'+crypto.randomBytes(9).toString('hex');
const options={host:'127.0.0.1',port:3306,user:process.env.LOCAL_TOPUP_DB_USER||'root',password:process.env.LOCAL_TOPUP_DB_PASSWORD||'',multipleStatements:true};
const admin=await createConnection(options);
let server;
let serverAuto;
let mockSlipServer;
async function query(sql){return admin.query(sql);}
async function endpoint(url,body,cookie,port=3102) {
  const r=await fetch(`http://127.0.0.1:${port}/api/local/`+url,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await r.text();
  let parsed={};try{parsed=JSON.parse(text);}catch{}
  return {status:r.status,body:parsed,cookie:r.headers.get('set-cookie')};
}
try{
  assert.match(name,/^blitz_web_test_[0-9a-f]{18}$/);
  await query('CREATE DATABASE `'+name+'`');
  await query('USE `'+name+'`');
  await query("CREATE TABLE accounts(login VARCHAR(45) NOT NULL PRIMARY KEY);CREATE TABLE characters(charId INT UNSIGNED NOT NULL PRIMARY KEY,account_name VARCHAR(45),char_name VARCHAR(35),online TINYINT NOT NULL DEFAULT 0);");
  const game=process.env.LOCAL_TOPUP_GAME_ROOT || path.resolve(root, '../../Lineage2-H5-Solo');
  const migrations=[path.join(game,'docs/sql/blitz_topup.sql'),path.join(game,'docs/sql/blitz_topup_admin.sql'),path.join(game,'docs/sql/blitz_topup_character_items_v1.sql'),path.join(root,'schema.sql')];
  for(const f of migrations)await query(await fs.readFile(f,'utf8'));
  await query("INSERT INTO accounts(login) VALUES('local_test_account');INSERT INTO characters(charId,account_name,char_name,online) VALUES(41000001,'local_test_account','TestBlitz',1);INSERT INTO blitz_topup_package (package_id,name,price_thb,coins,bonus_coins,enabled,display_order) VALUES(5,'1000 Coin',1000,1000,0,1,5),(6,'1500 Coin',1500,1500,0,1,6);UPDATE blitz_topup_package SET enabled=0 WHERE package_id=1;");
  const env={...process.env,LOCAL_TOPUP_GAME_ROOT:game,LOCAL_TOPUP_DB_NAME:name,LOCAL_TOPUP_ENABLED:'1',LOCAL_TOPUP_ALLOW_ORDERS:'1',LOCAL_TOPUP_PORT:'3102',LOCAL_TOPUP_PRIVATE_STORAGE:tmp};
  delete env.SLIP2GO_SECRET_KEY;delete env.SLIP2GO_API_URL;delete env.LOCAL_TOPUP_TELEGRAM_CONFIG;
  const issue=execFileSync(process.execPath,[path.join(root,'operator.mjs'),'pair','41000001'],{env,encoding:'utf8'});
  const code=issue.match(/ONE_TIME_CODE: (\d{8})/)?.[1];
  assert(code,'pairing code generated');
  server=spawn(process.execPath,[path.join(root,'server.mjs')],{env,stdio:'ignore'});
  let healthy=false;
  for(let i=0;i<50;i++) {
    try{const r=await endpoint('health');if(r.status===200){healthy=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,100));
  }
  assert(healthy,'local test service healthy');
  const qrResponse=await fetch('http://127.0.0.1:3102/api/local/qr/300.png');
  assert.equal(qrResponse.status,200,'integrated portal QR available via local API');
  assert.ok((qrResponse.headers.get('content-type')||'').includes('image/png'),'QR MIME must be PNG');
  const directOldPage=await fetch('http://127.0.0.1:3102/index.html');
  assert.equal(directOldPage.status,404,'wrong standalone UI not publicly served');
  // GameServer-style browser tickets use 256-bit random secrets; only SHA-256 is stored in SQL.
  assert.equal((await endpoint('redeem',{ticket:'bad'})).status,400,'short/fake browser ticket rejected');
  const freshTicket=crypto.randomBytes(32).toString('base64url');
  await admin.execute("INSERT INTO blitz_local_browser_tickets(ticket_hash,account_name,character_id,expires_at) VALUES(?,?,?,DATE_ADD(NOW(6),INTERVAL 60 SECOND))",[crypto.createHash('sha256').update(freshTicket).digest(),'local_test_account',41000001]);
  const [browserA,browserB]=await Promise.all([endpoint('redeem',{ticket:freshTicket}),endpoint('redeem',{ticket:freshTicket})]);
  assert.deepEqual([browserA.status,browserB.status].sort((a,b)=>a-b),[200,401],'one-time browser login cannot be redeemed twice, even concurrently');
  const browserCookie=(browserA.status===200?browserA:browserB).cookie.split(';')[0];
  const browserPerson=await endpoint('me',undefined,browserCookie);
  assert.equal(browserPerson.body.character,'TestBlitz','browser session belongs to the game character');
  assert.equal((await endpoint('redeem',{ticket:freshTicket})).status,401,'replay rejected after first redemption');
  const expiredTicket=crypto.randomBytes(32).toString('base64url');
  await admin.execute("INSERT INTO blitz_local_browser_tickets(ticket_hash,account_name,character_id,expires_at) VALUES(?,?,?,DATE_SUB(NOW(6),INTERVAL 1 SECOND))",[crypto.createHash('sha256').update(expiredTicket).digest(),'local_test_account',41000001]);
  assert.equal((await endpoint('redeem',{ticket:expiredTicket})).status,401,'expired browser ticket rejected');
  const forgedTicket=crypto.randomBytes(32).toString('base64url');
  await admin.execute("INSERT INTO blitz_local_browser_tickets(ticket_hash,account_name,character_id,expires_at) VALUES(?,?,?,DATE_ADD(NOW(6),INTERVAL 60 SECOND))",[crypto.createHash('sha256').update(forgedTicket).digest(),'local_test_account',99999999]);
  assert.equal((await endpoint('redeem',{ticket:forgedTicket})).status,401,'browser ticket with unknown character rejected');
  // Character-based linking (?char=TestBlitz)
  assert.equal((await endpoint('redeem',{})).status,400,'missing ticket or character rejected');
  assert.equal((await endpoint('redeem',{character:''})).status,400,'empty character name rejected');
  assert.equal((await endpoint('redeem',{character:'A'.repeat(36)})).status,400,'oversized character name rejected');
  assert.equal((await endpoint('redeem',{character:'NoSuchChar'})).status,404,'unknown character name rejected');
  const charLogin=await endpoint('redeem',{character:'TestBlitz'});
  assert.equal(charLogin.status,200,'character linking accepted');
  const charCookie=charLogin.cookie.split(';')[0];
  const charPerson=await endpoint('me',undefined,charCookie);
  assert.equal(charPerson.body.character,'TestBlitz','character session matches character name');
  // Param alias { char: 'TestBlitz' }
  const aliasLogin=await endpoint('redeem',{char:'TestBlitz'});
  assert.equal(aliasLogin.status,200,'char alias parameter accepted');
  // Trim whitespace
  const trimLogin=await endpoint('redeem',{character:'  TestBlitz  '});
  assert.equal(trimLogin.status,200,'character name with whitespace trimmed');
  // Thai character name support
  await admin.execute("INSERT INTO accounts(login) VALUES('thai_test_account')");
  await admin.execute("INSERT INTO characters(charId,account_name,char_name,online) VALUES(41000002,'thai_test_account','จอมยุทธ์สยาม',1)");
  const thaiLogin=await endpoint('redeem',{character:'จอมยุทธ์สยาม'});
  assert.equal(thaiLogin.status,200,'Thai character name linking accepted');
  const thaiPerson=await endpoint('me',undefined,thaiLogin.cookie.split(';')[0]);
  assert.equal(thaiPerson.body.character,'จอมยุทธ์สยาม','Thai character session matches Thai name');

  assert.equal((await endpoint('orders')).status,401,'unauthenticated denied');
  assert.equal((await endpoint('login',{code:'00000000'})).status,401,'fake token denied');
  const login=await endpoint('login',{code});
  assert.equal(login.status,200,'real pairing accepted');
  const cookie=login.cookie.split(';')[0];
  assert.equal((await endpoint('login',{code})).status,401,'token replay denied');
  const me=await endpoint('me',undefined,cookie);assert.equal(me.body.character,'TestBlitz');
  const packs=await endpoint('packages',undefined,cookie);assert.equal(packs.body.packages.length,5);
  assert.equal((await endpoint('active-order',undefined,cookie)).body,null,'active-order returns null when no order');
  const bad=await endpoint('orders',{amount:50},cookie);assert.equal(bad.status,400,'legacy tier disabled');
  const order=await endpoint('orders',{amount:100},cookie);assert.equal(order.status,201,'order created');
  assert.equal(order.body.amount,100);
  assert.equal((await endpoint('orders',{amount:300},cookie)).status,409,'duplicate active order denied');

  // Verify active-order endpoint returns pending payment order
  const active1=await endpoint('active-order',undefined,cookie);
  assert.equal(active1.status,200);
  assert.equal(active1.body.orderId,order.body.orderId);
  assert.equal(active1.body.status,'PENDING_PAYMENT');
  assert.equal(active1.body.amount,100);
  assert.equal(active1.body.characterName,'TestBlitz');

  // Scope asymmetry: second character on same account can see orders, active-order, and upload slip
  await admin.execute("INSERT INTO characters(charId,account_name,char_name,online) VALUES(41000003,'local_test_account','TestAlt',1)");
  const altLogin=await endpoint('redeem',{character:'TestAlt'});
  assert.equal(altLogin.status,200,'second character on same account linked');
  const altCookie=altLogin.cookie.split(';')[0];
  const altOrders=await endpoint('orders',undefined,altCookie);
  assert.equal(altOrders.body.orders.length,1,'order visible from second character on same account');
  assert.equal(altOrders.body.orders[0].char_name,'TestBlitz','order retains original ordering character name');
  const altActive=await endpoint('active-order',undefined,altCookie);
  assert.equal(altActive.body.orderId,order.body.orderId,'active order visible across characters on same account');
  const altQr=await fetch('http://127.0.0.1:3102/api/local/qr/100.png',{headers:{Cookie:altCookie}});
  assert.equal(altQr.status,200,'QR accessible across characters on same account');

  const img=await fs.readFile(path.join(root,'public','qr','100.png'));
  const upload=await endpoint('orders/'+order.body.orderId+'/slip',{imageBase64:'data:image/png;base64,'+img.toString('base64')},altCookie);
  assert.equal(upload.status,202,'simulated receipt stored via alternate character on same account');
  assert.equal(upload.body.verification,'MANUAL_PENDING','missing provider is not approval');
  assert.equal((await endpoint('orders/'+order.body.orderId+'/slip',{imageBase64:'data:image/png;base64,'+img.toString('base64')},cookie)).status,409,'replay denied');

  // Verify active-order endpoint reflects PENDING_REVIEW
  const activeReview=await endpoint('active-order',undefined,cookie);
  assert.equal(activeReview.body.status,'PENDING_REVIEW','active-order reflects PENDING_REVIEW');

  const pending=(await query("SELECT status FROM blitz_topup_order WHERE order_id='"+order.body.orderId+"'"))[0];
  assert.equal(pending[0].status,'PENDING_REVIEW','not auto credited');
  let approved=false;
  const reference='MOCKBANKREF'+crypto.randomBytes(7).toString('hex');
  const output=execFileSync(process.execPath,[path.join(root,'operator.mjs'),'approve',order.body.orderId,reference,'--bank-confirmed'],{env,encoding:'utf8'});
  approved=output.includes('APPROVED_ON_LOCAL_ONLY');
  assert(approved);
  const outcome=(await query("SELECT status FROM blitz_topup_order WHERE order_id='"+order.body.orderId+"'"))[0];
  assert.equal(outcome[0].status,'APPROVED','manual approval recorded');
  assert.equal((await query('SELECT COUNT(*) n FROM blitz_local_bank_transfers'))[0][0].n,1);
  let replayApproved=false;
  try{execFileSync(process.execPath,[path.join(root,'operator.mjs'),'approve',order.body.orderId,reference,'--bank-confirmed'],{env,stdio:'pipe'});replayApproved=true;}catch{}
  assert.equal(replayApproved,false,'replay cannot reapprove');
  assert.equal((await endpoint('approve',{orderId:order.body.orderId},cookie)).status,404,'web cannot self-approve');

  // Test Order Cancellation in PENDING_PAYMENT
  await query("UPDATE blitz_topup_order SET status='CREDITED',status_changed_at=NOW(6) WHERE order_id='"+order.body.orderId+"'");
  const cancelTestOrder=await endpoint('orders',{amount:500},cookie);
  assert.equal(cancelTestOrder.status,201,'new order for cancel test created');
  const thaiCancel=await endpoint('orders/'+cancelTestOrder.body.orderId+'/cancel',{},thaiLogin.cookie.split(';')[0]);
  assert.equal(thaiCancel.status,404,'cannot cancel order from another account');
  assert.equal((await endpoint('orders/not-a-uuid/cancel',{},cookie)).status,400,'invalid order id format rejected');
  assert.equal((await endpoint('orders/00000000-0000-0000-0000-000000000000/cancel',{},cookie)).status,404,'nonexistent order rejected');
  const cancelRes=await endpoint('orders/'+cancelTestOrder.body.orderId+'/cancel',{},cookie);
  assert.equal(cancelRes.status,200,'order cancelled successfully');
  assert.equal(cancelRes.body.status,'CANCELLED');
  assert.equal((await endpoint('active-order',undefined,cookie)).body,null,'active-order is null after cancel');
  const replayCancel=await endpoint('orders/'+cancelTestOrder.body.orderId+'/cancel',{},cookie);
  assert.equal(replayCancel.status,409,'cannot re-cancel cancelled order');

  // Test Cancellation in PENDING_REVIEW
  const cancelReviewOrder=await endpoint('orders',{amount:500},cookie);
  assert.equal(cancelReviewOrder.status,201,'new order created after cancellation');
  const img500=await fs.readFile(path.join(root,'public','qr','500.png'));
  await endpoint('orders/'+cancelReviewOrder.body.orderId+'/slip',{imageBase64:'data:image/png;base64,'+img500.toString('base64')},cookie);
  const cancelReviewRes=await endpoint('orders/'+cancelReviewOrder.body.orderId+'/cancel',{},cookie);
  assert.equal(cancelReviewRes.status,200,'pending review order cancelled');
  const [cancelledSlip]=await query("SELECT verification FROM blitz_local_slips WHERE order_id='"+cancelReviewOrder.body.orderId+"'");
  assert.equal(cancelledSlip[0].verification,'MANUAL_REJECTED','cancelled slip marked MANUAL_REJECTED');

  // Test auto-expiration of stale PENDING_PAYMENT orders
  const staleOrder=await endpoint('orders',{amount:1000},cookie);
  assert.equal(staleOrder.status,201,'order to become stale created');
  await query("UPDATE blitz_topup_order SET expires_at=DATE_SUB(NOW(6),INTERVAL 1 MINUTE) WHERE order_id='"+staleOrder.body.orderId+"'");
  const activeStale=await endpoint('active-order',undefined,cookie);
  assert.equal(activeStale.body,null,'stale order auto-expired and not returned by active-order');
  const [staleCheck]=await query("SELECT status FROM blitz_topup_order WHERE order_id='"+staleOrder.body.orderId+"'");
  assert.equal(staleCheck[0].status,'EXPIRED','stale order transitioned to EXPIRED in database');
  const afterExpire=await endpoint('orders',{amount:1000},cookie);
  assert.equal(afterExpire.status,201,'new order created without conflict after stale order auto-expired');
  await query("UPDATE blitz_topup_order SET status='CANCELLED' WHERE order_id='"+afterExpire.body.orderId+"'");

  // Test auto-expiration of stale CREATED orders (from in-game Community Board) and bonus_coins in orders history
  const createdUuid=crypto.randomUUID();
  await admin.execute("INSERT INTO blitz_topup_order(order_id,account_name,character_id,package_id,package_name,price_thb,coins,bonus_coins,status,created_at,expires_at,status_changed_at) VALUES(?,?,?,5,'1000 Coin',1000,1000,50,'CREATED',DATE_SUB(NOW(6),INTERVAL 16 MINUTE),DATE_SUB(NOW(6),INTERVAL 1 MINUTE),NOW(6))",[createdUuid,'local_test_account',41000001]);
  const activeCreated=await endpoint('active-order',undefined,cookie);
  assert.equal(activeCreated.body,null,'stale CREATED order auto-expired and not returned by active-order');
  const [createdCheck]=await query("SELECT status FROM blitz_topup_order WHERE order_id='"+createdUuid+"'");
  assert.equal(createdCheck[0].status,'EXPIRED','stale CREATED order transitioned to EXPIRED');
  const historyWithBonus=await endpoint('orders',undefined,cookie);
  const foundOrder=historyWithBonus.body.orders.find(o=>o.order_id===createdUuid);
  assert.equal(foundOrder.coins,1050,'orders history calculates total coins including bonus_coins (1000 + 50)');

  // Test operator reject command
  const rejectOrder=await endpoint('orders',{amount:1500},cookie);
  assert.equal(rejectOrder.status,201,'order for operator reject created');
  const img1500=await fs.readFile(path.join(root,'public','qr','1500.png'));
  await endpoint('orders/'+rejectOrder.body.orderId+'/slip',{imageBase64:'data:image/png;base64,'+img1500.toString('base64')},cookie);
  const rejectOut=execFileSync(process.execPath,[path.join(root,'operator.mjs'),'reject',rejectOrder.body.orderId,'Slip blurred or invalid'],{env,encoding:'utf8'});
  assert(rejectOut.includes('REJECTED_ON_LOCAL_ONLY'),'operator reject output confirmed');
  const [rejectedOrder]=await query("SELECT status FROM blitz_topup_order WHERE order_id='"+rejectOrder.body.orderId+"'");
  assert.equal(rejectedOrder[0].status,'REJECTED','order status is REJECTED');
  const [rejectedSlip]=await query("SELECT verification FROM blitz_local_slips WHERE order_id='"+rejectOrder.body.orderId+"'");
  assert.equal(rejectedSlip[0].verification,'MANUAL_REJECTED','slip verification is MANUAL_REJECTED');
  const [adminAction]=await query("SELECT decision,reason FROM blitz_topup_admin_action WHERE order_id='"+rejectOrder.body.orderId+"'");
  assert.equal(adminAction[0].decision,'REJECTED','admin action decision is REJECTED');
  assert.equal(adminAction[0].reason,'Slip blurred or invalid');
  let rejectReapprove=false;
  try{execFileSync(process.execPath,[path.join(root,'operator.mjs'),'approve',rejectOrder.body.orderId,'REFBANK12345','--bank-confirmed'],{env,stdio:'pipe'});rejectReapprove=true;}catch{}
  assert.equal(rejectReapprove,false,'cannot approve rejected order');

  // Verify Slip2Go auto-approval when Slip2Go returns a valid API_REVIEW (200200)
  const autoTransRef='SLIP2GOREF'+crypto.randomBytes(6).toString('hex');
  mockSlipServer=http.createServer((req,res)=>{
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify({
      code:'200200',
      message:'Slip is valid.',
      data:{
        transRef:autoTransRef,
        dateTime:new Date().toISOString(),
        amount:300,
        receiver:{
          account:{
            name:'อภิสิทธิ์ อินทร์งาม',
            proxy:{type:'NATID',account:'X-XXXX-XXXX8-23-5'}
          }
        }
      }
    }));
  });
  await new Promise(resolve=>mockSlipServer.listen(3109,'127.0.0.1',resolve));
  const envAuto={...env,LOCAL_TOPUP_PORT:'3103',LOCAL_TOPUP_ALLOW_MOCK_SLIP2GO:'1',SLIP2GO_SECRET_KEY:'mock_secret_key_for_test_123456',SLIP2GO_API_URL:'http://127.0.0.1:3109/api/verify-slip/qr-base64/info'};
  serverAuto=spawn(process.execPath,[path.join(root,'server.mjs')],{env:envAuto,stdio:'ignore'});
  let healthyAuto=false;
  for(let i=0;i<50;i++){
    try{const r=await endpoint('health',undefined,undefined,3103);if(r.status===200){healthyAuto=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,100));
  }
  assert(healthyAuto,'auto-approve local test service healthy');
  await query("UPDATE blitz_topup_order SET status='CREDITED',status_changed_at=NOW(6) WHERE order_id='"+order.body.orderId+"'");
  const autoTicket=crypto.randomBytes(32).toString('base64url');
  await admin.execute("INSERT INTO blitz_local_browser_tickets(ticket_hash,account_name,character_id,expires_at) VALUES(?,?,?,DATE_ADD(NOW(6),INTERVAL 60 SECOND))",[crypto.createHash('sha256').update(autoTicket).digest(),'local_test_account',41000001]);
  const autoRedeem=await endpoint('redeem',{ticket:autoTicket},undefined,3103);
  assert.equal(autoRedeem.status,200,'auto-approve browser ticket redeemed');
  const autoCookie=autoRedeem.cookie.split(';')[0];
  const order2=await endpoint('orders',{amount:300},autoCookie,3103);
  assert.equal(order2.status,201,'second order created after first was credited');
  const img300=await fs.readFile(path.join(root,'public','qr','300.png'));
  const upload2=await endpoint('orders/'+order2.body.orderId+'/slip',{imageBase64:'data:image/png;base64,'+img300.toString('base64')},autoCookie,3103);
  assert.equal(upload2.status,200,'Slip2Go verified receipt returns 200');
  assert.equal(upload2.body.status,'APPROVED','Slip2Go verified receipt auto-approves order for GameServer delivery');
  assert.equal(upload2.body.verification,'API_REVIEW','Slip2Go verification state is API_REVIEW');
  const autoOutcome=(await query("SELECT status FROM blitz_topup_order WHERE order_id='"+order2.body.orderId+"'"))[0];
  assert.equal(autoOutcome[0].status,'APPROVED','DB order status transitioned to APPROVED automatically');
  const autoBank=(await query("SELECT verified_by,verified_amount FROM blitz_local_bank_transfers WHERE order_id='"+order2.body.orderId+"'"))[0];
  assert.equal(autoBank[0].verified_by,'SLIP2GO:AUTO','bank transfer audit recorded SLIP2GO:AUTO');
  assert.equal(Number(autoBank[0].verified_amount),300,'bank transfer audit recorded exact amount');
  console.log('PASS LOCAL PILOT: login one-time/replay, account ownership, five packs, pending order, 4MB slip guard, manual API fallback, Slip2Go auto-approval to APPROVED, single approved bank reference, duplicate approval blocked');
}finally{
  if(server){server.kill();await new Promise(r=>setTimeout(r,250));}
  if(serverAuto){serverAuto.kill();await new Promise(r=>setTimeout(r,250));}
  if(mockSlipServer){mockSlipServer.close();}
  if(/^blitz_web_test_[0-9a-f]{18}$/.test(name)){await admin.query('DROP DATABASE IF EXISTS `'+name+'`');}
  await admin.end(); await fs.rm(tmp,{recursive:true,force:true});
}
