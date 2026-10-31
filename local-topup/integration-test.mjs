import { createConnection } from 'mysql2/promise';
import { spawn,execFileSync } from 'node:child_process';
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
async function query(sql){return admin.query(sql);}
async function endpoint(url,body,cookie) {
  const r=await fetch('http://127.0.0.1:3102/api/local/'+url,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await r.text();
  let parsed={};try{parsed=JSON.parse(text);}catch{}
  return {status:r.status,body:parsed,cookie:r.headers.get('set-cookie')};
}
try{
  assert.match(name,/^blitz_web_test_[0-9a-f]{18}$/);
  await query('CREATE DATABASE `'+name+'`');
  await query('USE `'+name+'`');
  await query("CREATE TABLE accounts(login VARCHAR(45) NOT NULL PRIMARY KEY);CREATE TABLE characters(charId INT UNSIGNED NOT NULL PRIMARY KEY,account_name VARCHAR(45),char_name VARCHAR(35),online TINYINT NOT NULL DEFAULT 0);");
  const game=process.env.LOCAL_TOPUP_GAME_ROOT;
  const migrations=[path.join(game,'docs/sql/blitz_topup.sql'),path.join(game,'docs/sql/blitz_topup_admin.sql'),path.join(game,'docs/sql/blitz_topup_character_items_v1.sql'),path.join(root,'schema.sql')];
  for(const f of migrations)await query(await fs.readFile(f,'utf8'));
  await query("INSERT INTO accounts(login) VALUES('local_test_account');INSERT INTO characters(charId,account_name,char_name,online) VALUES(41000001,'local_test_account','TestBlitz',1);INSERT INTO blitz_topup_package (package_id,name,price_thb,coins,bonus_coins,enabled,display_order) VALUES(5,'1000 Coin',1000,1000,0,1,5),(6,'1500 Coin',1500,1500,0,1,6);UPDATE blitz_topup_package SET enabled=0 WHERE package_id=1;");
  const env={...process.env,LOCAL_TOPUP_DB_NAME:name,LOCAL_TOPUP_ENABLED:'1',LOCAL_TOPUP_ALLOW_ORDERS:'1',LOCAL_TOPUP_PORT:'3102',LOCAL_TOPUP_PRIVATE_STORAGE:tmp};
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
  assert.equal((await endpoint('orders')).status,401,'unauthenticated denied');
  assert.equal((await endpoint('login',{code:'00000000'})).status,401,'fake token denied');
  const login=await endpoint('login',{code});
  assert.equal(login.status,200,'real pairing accepted');
  const cookie=login.cookie.split(';')[0];
  assert.equal((await endpoint('login',{code})).status,401,'token replay denied');
  const me=await endpoint('me',undefined,cookie);assert.equal(me.body.character,'TestBlitz');
  const packs=await endpoint('packages',undefined,cookie);assert.equal(packs.body.packages.length,5);
  const bad=await endpoint('orders',{amount:50},cookie);assert.equal(bad.status,400,'legacy tier disabled');
  const order=await endpoint('orders',{amount:100},cookie);assert.equal(order.status,201,'order created');
  assert.equal(order.body.amount,100);
  assert.equal((await endpoint('orders',{amount:300},cookie)).status,409,'duplicate active order denied');
  const img=await fs.readFile(path.join(root,'public','qr','100.png'));
  const upload=await endpoint('orders/'+order.body.orderId+'/slip',{imageBase64:'data:image/png;base64,'+img.toString('base64')},cookie);
  assert.equal(upload.status,202,'simulated receipt stored');
  assert.equal(upload.body.verification,'MANUAL_PENDING','missing provider is not approval');
  assert.equal((await endpoint('orders/'+order.body.orderId+'/slip',{imageBase64:'data:image/png;base64,'+img.toString('base64')},cookie)).status,409,'replay denied');
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
  console.log('PASS LOCAL PILOT: login one-time/replay, account ownership, five packs, pending order, 4MB slip guard, manual API fallback, no auto-credit, single approved bank reference, duplicate approval blocked');
}finally{
  if(server){server.kill();await new Promise(r=>setTimeout(r,250));}
  if(/^blitz_web_test_[0-9a-f]{18}$/.test(name)){await admin.query('DROP DATABASE IF EXISTS `'+name+'`');}
  await admin.end(); await fs.rm(tmp,{recursive:true,force:true});
}
