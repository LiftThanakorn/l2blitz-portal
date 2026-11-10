import express from 'express';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { db, sha, sessionToken, allowedPacks, assertLocalMode, getServerRoot } from './common.mjs';
import { verifySlip2Go } from './slip2go.mjs';

assertLocalMode();
const app=express();
const root=path.dirname(fileURLToPath(import.meta.url));
const slipDirectory=path.resolve(process.env.LOCAL_TOPUP_PRIVATE_STORAGE || path.join(process.env.LOCALAPPDATA || os.tmpdir(),'L2Blitz','private-slips'));
const serverRoot=getServerRoot();
const purchasesAllowed=process.env.LOCAL_TOPUP_ALLOW_ORDERS==='1';
const port=Number(process.env.LOCAL_TOPUP_PORT||3101);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid local port');
const allowedOrigins=new Set(['http://127.0.0.1:'+port, 'http://127.0.0.1:5173', 'http://localhost:5173']);
const errors={};
process.on('unhandledRejection', (reason, p) => console.error('UNHANDLED_REJECTION', p, reason));
process.on('uncaughtException', (err) => console.error('UNCAUGHT_EXCEPTION', err));
db.on?.('error', (err) => console.error('[DB POOL ERROR]', err.code || err.message));
app.disable('x-powered-by');
app.use((req,res,next)=>{
  res.set('X-Content-Type-Options','nosniff');
  res.set('Cache-Control','no-store');
  res.set('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
  if(req.method==='POST' && req.get('origin') && !allowedOrigins.has(req.get('origin'))) return res.status(403).json({error:'Origin rejected'});
  next();
});
app.use(express.json({limit:'6mb',strict:true}));
// Serve payment data only; the UI is the real React portal at localhost:5173/topup.
app.get('/',(_req,res)=>res.redirect(302,'http://127.0.0.1:5173/topup'));
app.get('/api/local/qr/:tier.png',(req,res)=>{
  const tier=Number(req.params.tier);
  if(!allowedPacks.has(tier))return res.sendStatus(404);
  return res.sendFile(path.join(root,'public','qr',tier+'.png'),{headers:{'Cache-Control':'private, no-store'}});
});
const fail=(res,code,msg)=>res.status(code).json({error:msg});
function extractCookie(req,name){
  const m=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));
  return m?decodeURIComponent(m.slice(name.length+1)):'';
}
async function userSession(req){
  const token=extractCookie(req,'l2blitz_local');
  if(!/^[A-Za-z0-9_-]{30,90}$/.test(token)) return null;
  const [rows]=await db.execute("SELECT s.account_name,s.character_id,c.char_name FROM blitz_local_sessions s JOIN characters c ON c.charId=s.character_id AND c.account_name=s.account_name WHERE s.token_hash=? AND s.expires_at>NOW(6)",[sha(token)]);
  return rows[0]||null;
}
function limited(req,res,next) {
  const key=req.path;
  const now=Date.now();
  const state=errors[key]||{start:now,count:0};
  if(now-state.start>60000) {state.start=now;state.count=0;}
  state.count++;
  errors[key]=state;
  if(state.count>45) return fail(res,429,'Too many requests');
  next();
}
app.use('/api/local',limited);
async function payeeConfig(){
  const file=path.join(serverRoot,'server','game','config','Custom','BlitzCoinPromptPay.ini');
  const text=await fs.readFile(file,'utf8');
  const kv=Object.fromEntries(text.split(/\r?\n/).map(s=>s.match(/^\s*([A-Za-z0-9]+)\s*=\s*(.*?)\s*$/)).filter(Boolean).map(m=>[m[1],m[2]]));
  if(!kv.PromptPayId||!kv.RecipientName) throw Error('Local PromptPay missing');
  return {id:kv.PromptPayId,recipient:kv.RecipientName};
}
app.get('/api/local/health',async (_req,res)=>{
  try{await db.query('SELECT 1');res.json({ok:true,mode:'LOCAL_ONLY',payments:purchasesAllowed?'LOCAL_OPERATOR_PILOT':'LOCKED',publicVps:false,integrations:{slip2go:!!(process.env.SLIP2GO_SECRET_KEY&&process.env.SLIP2GO_API_URL),telegram:!!process.env.LOCAL_TOPUP_TELEGRAM_CONFIG}});}
  catch{fail(res,503,'Database unavailable');}
});
// Exchange a game-issued ticket or character name into an HttpOnly player session.
app.post('/api/local/redeem',async(req,res)=>{
  const ticket=String(req.body?.ticket||'');
  const charParam=String(req.body?.character||req.body?.char||'').trim();
  if(!ticket && !charParam) return fail(res,400,'Browser login ticket or character missing');
  const c=await db.getConnection();
  try{
    await c.beginTransaction();
    let identity;
    if(ticket){
      if(!/^[A-Za-z0-9_-]{43}$/.test(ticket)){await c.rollback();return fail(res,400,'Browser login ticket invalid');}
      const [rows]=await c.execute("SELECT t.account_name,t.character_id FROM blitz_local_browser_tickets t JOIN characters ch ON ch.charId=t.character_id AND ch.account_name=t.account_name JOIN accounts a ON a.login=t.account_name WHERE t.ticket_hash=? AND t.redeemed_at IS NULL AND t.expires_at>NOW(6) FOR UPDATE",[sha(ticket)]);
      if(rows.length!==1){await c.rollback();return fail(res,401,'Browser login expired or already used');}
      identity=rows[0];
      const [changed]=await c.execute('UPDATE blitz_local_browser_tickets SET redeemed_at=NOW(6) WHERE ticket_hash=? AND redeemed_at IS NULL',[sha(ticket)]);
      if(changed.affectedRows!==1){await c.rollback();return fail(res,401,'Browser login already used');}
    }else{
      if(charParam.length<1 || charParam.length>35){await c.rollback();return fail(res,400,'Character name invalid');}
      const [rows]=await c.execute("SELECT ch.account_name,ch.charId AS character_id FROM characters ch JOIN accounts a ON a.login=ch.account_name WHERE ch.char_name=? LIMIT 1",[charParam]);
      if(rows.length!==1){await c.rollback();return fail(res,404,'ไม่พบตัวละครในระบบ');}
      identity=rows[0];
    }
    const token=sessionToken();
    await c.execute('INSERT INTO blitz_local_sessions(token_hash,account_name,character_id,expires_at) VALUES(?,?,?,DATE_ADD(NOW(6),INTERVAL 2 HOUR))',[sha(token),identity.account_name,identity.character_id]);
    await c.commit();
    res.setHeader('Set-Cookie','l2blitz_local='+encodeURIComponent(token)+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=7200');
    res.json({ok:true,login:ticket?'GAME_VERIFIED':'CHARACTER_LINKED'});
  }catch(e){await c.rollback();console.error('game browser login error',e.code||e.message);fail(res,500,'Browser login unavailable');}
  finally{c.release();}
});
app.post('/api/local/login',async(req,res)=>{
  const code=String(req.body?.code||'').replace(/\s|-/g,'');
  if(!/^\d{8}$/.test(code)) return fail(res,400,'รหัสยืนยันไม่ถูกต้อง');
  const c=await db.getConnection();
  try{
    await c.beginTransaction();
    const [rows]=await c.execute('SELECT account_name,character_id FROM blitz_local_pairing WHERE code_hash=? AND used_at IS NULL AND expires_at>NOW(6) FOR UPDATE',[sha(code)]);
    if(rows.length!==1){await c.rollback();return fail(res,401,'รหัสหมดอายุหรือถูกใช้แล้ว');}
    const identity=rows[0], token=sessionToken();
    await c.execute('UPDATE blitz_local_pairing SET used_at=NOW(6) WHERE code_hash=?',[sha(code)]);
    await c.execute('INSERT INTO blitz_local_sessions(token_hash,account_name,character_id,expires_at) VALUES(?,?,?,DATE_ADD(NOW(6),INTERVAL 2 HOUR))',[sha(token),identity.account_name,identity.character_id]);
    await c.commit();
    res.setHeader('Set-Cookie','l2blitz_local='+encodeURIComponent(token)+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=7200');
    res.json({ok:true});
  }catch(e){await c.rollback();console.error('login error',e.code||e.message);fail(res,500,'เข้าสู่ระบบไม่สำเร็จ');}finally{c.release();}
});
app.post('/api/local/logout',async(req,res)=>{
  const token=extractCookie(req,'l2blitz_local');
  if(token) await db.execute('DELETE FROM blitz_local_sessions WHERE token_hash=?',[sha(token)]);
  res.setHeader('Set-Cookie','l2blitz_local=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ok:true});
});
app.get('/api/local/me',async(req,res)=>{
  const identity=await userSession(req);
  if(!identity) return fail(res,401,'กรุณาเชื่อมต่อบัญชีเกม');
  res.json({account:identity.account_name,characterId:identity.character_id,character:identity.char_name});
});
app.get('/api/local/qr/:amount.png',async(req,res)=>{
  const session=await userSession(req);
  if(!session)return fail(res,401,'กรุณาเชื่อมต่อบัญชีเกม');
  const amount=Number(req.params.amount);
  if(!allowedPacks.has(amount))return fail(res,404,'ไม่พบ QR');
  const [orders]=await db.execute("SELECT order_id FROM blitz_topup_order WHERE account_name=? AND price_thb=? AND status IN ('PENDING_PAYMENT','PENDING_REVIEW') LIMIT 1",[session.account_name,amount]);
  if(!orders.length)return fail(res,403,'ยังไม่มีคำสั่งซื้อแพ็กเกจนี้');
  try {
    const image=await fs.readFile(path.join(root,'public','qr',amount+'.png'));
    res.type('image/png').send(image);
  }catch {fail(res,503,'QR ยังไม่พร้อม');}
});
app.get('/api/local/packages',async(req,res)=>{
  const session=await userSession(req);
  if(!session)return fail(res,401,'กรุณาเชื่อมต่อบัญชีเกม');
  const [rows]=await db.execute("SELECT package_id,price_thb,coins,bonus_coins FROM blitz_topup_package WHERE enabled=1 AND price_thb IN (100,300,500,1000,1500) ORDER BY price_thb");
  res.json({packages:rows,ordersEnabled:purchasesAllowed});
});
app.get('/api/local/orders',async(req,res)=>{
  try{
    const session=await userSession(req);
    if(!session)return fail(res,401,'กรุณาเชื่อมต่อบัญชีเกม');
    await db.execute("UPDATE blitz_topup_order SET status='EXPIRED',status_changed_at=NOW(6) WHERE account_name=? AND status IN ('CREATED','PENDING_PAYMENT') AND expires_at<=NOW(6)",[session.account_name]);
    const [rows]=await db.execute("SELECT o.order_id,o.price_thb,(o.coins + o.bonus_coins) AS coins,o.status,o.created_at,c.char_name,s.verification FROM blitz_topup_order o LEFT JOIN characters c ON c.charId=o.character_id LEFT JOIN blitz_local_slips s ON s.order_id=o.order_id WHERE o.account_name=? ORDER BY o.created_at DESC LIMIT 15",[session.account_name]);
    res.json({orders:rows});
  }catch(e){console.error('orders error',e.code||e.message);fail(res,500,'ดึงข้อมูลคำสั่งซื้อไม่สำเร็จ');}
});
app.get('/api/local/active-order',async(req,res)=>{
  try{
    const session=await userSession(req);
    if(!session)return fail(res,401,'กรุณาเชื่อมต่อบัญชีเกม');
    await db.execute("UPDATE blitz_topup_order SET status='EXPIRED',status_changed_at=NOW(6) WHERE account_name=? AND status IN ('CREATED','PENDING_PAYMENT') AND expires_at<=NOW(6)",[session.account_name]);
    const [rows]=await db.execute("SELECT o.order_id,o.price_thb,o.coins,o.bonus_coins,o.status,o.created_at,o.expires_at,o.character_id,c.char_name,s.verification FROM blitz_topup_order o LEFT JOIN characters c ON c.charId=o.character_id LEFT JOIN blitz_local_slips s ON s.order_id=o.order_id WHERE o.account_name=? AND o.status IN ('CREATED','PENDING_PAYMENT','PENDING_REVIEW') ORDER BY o.created_at DESC LIMIT 1",[session.account_name]);
    if(!rows.length)return res.json(null);
    const row=rows[0];
    let payee={id:'',recipient:''};
    try{payee=await payeeConfig();}catch{}
    res.json({
      orderId:row.order_id,
      amount:Number(row.price_thb),
      coins:Number(row.coins)+Number(row.bonus_coins),
      promptpayId:payee.id,
      recipientName:payee.recipient,
      status:row.status,
      verification:row.verification||null,
      characterId:row.character_id,
      characterName:row.char_name,
      createdAt:row.created_at,
      expiresAt:row.expires_at
    });
  }catch(e){console.error('active-order error',e.code||e.message);fail(res,500,'ดึงคำสั่งซื้อไม่สำเร็จ');}
});
app.post('/api/local/orders/:orderId/cancel',async(req,res)=>{
  const session=await userSession(req);if(!session)return fail(res,401,'กรุณาเชื่อมต่อบัญชีเกม');
  const id=String(req.params.orderId||'');
  if(!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(id))return fail(res,400,'เลขคำสั่งซื้อไม่ถูกต้อง');
  const c=await db.getConnection();
  try{
    await c.beginTransaction();
    const [orders]=await c.execute("SELECT order_id,status FROM blitz_topup_order WHERE order_id=? AND account_name=? FOR UPDATE",[id,session.account_name]);
    if(!orders.length){await c.rollback();return fail(res,404,'ไม่พบคำสั่งซื้อ');}
    const currentStatus=orders[0].status;
    if(!['CREATED','PENDING_PAYMENT','PENDING_REVIEW'].includes(currentStatus)){
      await c.rollback();
      return fail(res,409,'ไม่สามารถยกเลิกคำสั่งซื้อในสถานะ '+currentStatus);
    }
    await c.execute("UPDATE blitz_topup_order SET status='CANCELLED',status_changed_at=NOW(6) WHERE order_id=?",[id]);
    await c.execute("UPDATE blitz_local_slips SET verification='MANUAL_REJECTED',reviewed_at=NOW(6) WHERE order_id=?",[id]);
    await c.commit();
    res.json({ok:true,status:'CANCELLED',message:'ยกเลิกคำสั่งซื้อแล้ว'});
  }catch(e){
    await c.rollback();
    console.error('cancel order error',e.code||e.message);
    fail(res,500,'ยกเลิกคำสั่งซื้อไม่สำเร็จ');
  }finally{
    c.release();
  }
});
app.post('/api/local/orders',async(req,res)=>{
  if(!purchasesAllowed)return fail(res,423,'การทดสอบรับเงินยังไม่เปิด');
  const session=await userSession(req);if(!session)return fail(res,401,'กรุณาเชื่อมต่อบัญชีเกม');
  const price=Number(req.body?.amount);
  if(!allowedPacks.has(price))return fail(res,400,'แพ็กเกจไม่ถูกต้อง');
  const c=await db.getConnection();
  try {
    await c.beginTransaction();
    const [owner]=await c.execute("SELECT a.login FROM accounts a JOIN characters ch ON ch.account_name=a.login WHERE a.login=? AND ch.charId=? FOR UPDATE",[session.account_name,session.character_id]);
    if(!owner.length)throw Error('Account ownership mismatch');
    await c.execute("UPDATE blitz_topup_order SET status='EXPIRED',status_changed_at=NOW(6) WHERE account_name=? AND status IN ('CREATED','PENDING_PAYMENT') AND expires_at<=NOW(6)",[session.account_name]);
    const [active]=await c.execute("SELECT order_id FROM blitz_topup_order WHERE account_name=? AND status IN ('CREATED','PENDING_PAYMENT','PENDING_REVIEW','APPROVED') LIMIT 1",[session.account_name]);
    if(active.length) {await c.rollback();return fail(res,409,'มีคำสั่งซื้อที่ยังไม่เสร็จ กรุณาตรวจประวัติ');}
    const [packs]=await c.execute('SELECT package_id,name,price_thb,coins,bonus_coins FROM blitz_topup_package WHERE enabled=1 AND price_thb=? LIMIT 1',[price]);
    if(!packs.length) throw Error('Package missing');
    const p=packs[0],uuid=crypto.randomUUID();
    await c.execute("INSERT INTO blitz_topup_order(order_id,account_name,character_id,package_id,package_name,price_thb,coins,bonus_coins,status,created_at,expires_at,status_changed_at) VALUES(?,?,?,?,?,?,?,?,'PENDING_PAYMENT',NOW(6),DATE_ADD(NOW(6),INTERVAL 30 MINUTE),NOW(6))",[uuid,session.account_name,session.character_id,p.package_id,p.name,p.price_thb,p.coins,p.bonus_coins]);
    await c.commit();
    const payee=await payeeConfig();
    res.status(201).json({orderId:uuid,amount:price,coins:Number(p.coins)+Number(p.bonus_coins),promptpayId:payee.id,recipientName:payee.recipient,message:'ต้องโอนด้วยตนเองแล้วแนบสลิปภายใน 30 นาที'});
  }catch(e){await c.rollback();console.error('order error',e.code||e.message);fail(res,500,'สร้างคำสั่งซื้อไม่สำเร็จ');}finally{c.release();}
});
function imageType(buffer){
  if(buffer.length>=8 && buffer.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')))return {mime:'image/png',ext:'png'};
  if(buffer.length>=3 && buffer.subarray(0,3).equals(Buffer.from('ffd8ff','hex')))return {mime:'image/jpeg',ext:'jpg'};
  if(buffer.length>=12 && buffer.toString('ascii',0,4)==='RIFF' && buffer.toString('ascii',8,12)==='WEBP')return {mime:'image/webp',ext:'webp'};
  return null;
}
async function sendTelegram(image,caption){
  const cfgPath=process.env.LOCAL_TOPUP_TELEGRAM_CONFIG;
  if(!cfgPath)return 'DISABLED';
  try{
    const cfg=JSON.parse(await fs.readFile(cfgPath,'utf8'));
    if(!cfg.telegramToken||!cfg.telegramChatId)return 'INCOMPLETE';
    const form=new FormData();
    form.set('chat_id',String(cfg.telegramChatId));
    form.set('caption',caption.slice(0,1000));
    form.set('photo',new Blob([image.data],{type:image.mime}),'slip.'+image.ext);
    const response=await fetch('https://api.telegram.org/bot'+cfg.telegramToken+'/sendPhoto',{method:'POST',body:form,signal:AbortSignal.timeout(15000)});
    const reply=await response.json().catch(()=>({}));
    return response.ok && reply.ok?'SENT':'FAILED';
  }catch{return 'FAILED';}
}
app.post('/api/local/orders/:orderId/slip',async(req,res)=>{
  if(!purchasesAllowed)return fail(res,423,'การทดสอบรับเงินยังไม่เปิด');
  const session=await userSession(req);if(!session)return fail(res,401,'กรุณาเชื่อมต่อบัญชีเกม');
  const id=String(req.params.orderId||'');
  if(!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(id))return fail(res,400,'เลขคำสั่งซื้อไม่ถูกต้อง');
  const dataUri=String(req.body?.imageBase64||'');
  const raw=dataUri.match(/^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if(!raw||raw[1].length>5_600_000)return fail(res,400,'รูปสลิปไม่ถูกต้องหรือใหญ่เกิน 4 MB');
  const buffer=Buffer.from(raw[1],'base64');
  if(buffer.length<256||buffer.length>4_194_304)return fail(res,400,'ขนาดไฟล์ไม่ถูกต้อง');
  const type=imageType(buffer);if(!type)return fail(res,400,'รองรับเฉพาะรูป JPEG, PNG หรือ WebP');
  const checksum=crypto.createHash('sha256').update(buffer).digest('hex');
  await fs.mkdir(slipDirectory,{recursive:true,mode:0o700});
  const filename=crypto.randomUUID()+'.'+type.ext;
  const full=path.join(slipDirectory,filename);
  const conn=await db.getConnection();
  let saved=false;
  let price=0;
  try{
    await conn.beginTransaction();
    const [orders]=await conn.execute("SELECT price_thb,status,expires_at FROM blitz_topup_order WHERE order_id=? AND account_name=? FOR UPDATE",[id,session.account_name]);
    if(!orders.length || orders[0].status!=='PENDING_PAYMENT') {await conn.rollback();return fail(res,409,'ไม่พบรายการที่รอแนบสลิป');}
    if(new Date(orders[0].expires_at).getTime() < Date.now()) {await conn.rollback();return fail(res,410,'คำสั่งซื้อหมดอายุ กรุณาติดต่อ GM');}
    price=Number(orders[0].price_thb);
    await fs.writeFile(full,buffer,{flag:'wx',mode:0o600});saved=true;
    await conn.execute("INSERT INTO blitz_local_slips(order_id,image_sha,private_file,mime) VALUES(?,?,?,?)",[id,checksum,filename,type.mime]);
    await conn.execute("UPDATE blitz_topup_order SET status='PENDING_REVIEW',status_changed_at=NOW(6) WHERE order_id=? AND status='PENDING_PAYMENT'",[id]);
    await conn.commit();
  }catch(e){await conn.rollback();if(saved)await fs.unlink(full).catch(()=>{});if(e.code==='ER_DUP_ENTRY')return fail(res,409,'สลิปนี้เคยถูกส่งแล้ว');console.error('slip error',e.code||e.message);return fail(res,500,'บันทึกสลิปไม่สำเร็จ');}
  finally{conn.release();}
  let result=await verifySlip2Go({data:buffer,mime:type.mime},price,await payeeConfig());
  let orderStatus='PENDING_REVIEW';
  if(result.state==='API_REVIEW' && result.transRef){
    const approveConn=await db.getConnection();
    try {
      await approveConn.beginTransaction();
      await approveConn.execute('INSERT INTO blitz_local_provider_receipts(trans_ref,order_id,provider_code,transferred_at) VALUES(?,?,?,?)',
        [result.transRef,id,result.code,new Date(result.transferredAt)]);
      await approveConn.execute('INSERT INTO blitz_local_bank_transfers(bank_reference,order_id,verified_amount,verified_by) VALUES(?,?,?,?)',
        [result.transRef,id,price,'SLIP2GO:AUTO']);
      await approveConn.execute("INSERT INTO blitz_topup_admin_action(order_id,admin_id,decision,reason) VALUES(?,?,'APPROVED',?)",
        [id,0,'Slip2Go auto-verified: '+result.transRef]);
      await approveConn.execute("UPDATE blitz_local_slips SET verification='API_REVIEW',provider_code=?,reviewed_at=NOW(6) WHERE order_id=?",
        [result.code,id]);
      const [upd]=await approveConn.execute("UPDATE blitz_topup_order SET status='APPROVED',status_changed_at=NOW(6) WHERE order_id=? AND status='PENDING_REVIEW'",
        [id]);
      if(upd.affectedRows!==1)throw new Error('ORDER_NOT_PENDING_REVIEW');
      await approveConn.commit();
      orderStatus='APPROVED';
    } catch(e) {
      await approveConn.rollback();
      if(e.code==='ER_DUP_ENTRY')result={state:'FLAGGED',code:'BANK_REFERENCE_DUPLICATED'};
      else result={state:'RETRY_NEEDED',code:'REFERENCE_STORAGE_ERROR'};
      await db.execute('UPDATE blitz_local_slips SET verification=?,provider_code=? WHERE order_id=?',[result.state,result.code,id]);
    } finally {
      approveConn.release();
    }
  } else {
    await db.execute('UPDATE blitz_local_slips SET verification=?,provider_code=? WHERE order_id=?',[result.state,result.code,id]);
  }
  const caption=['L2Blitz LOCAL payment review','Order: '+id,'Character: '+session.char_name,'Amount: '+price+' THB','Slip2Go: '+result.state+' ('+result.code+')','Status: '+orderStatus,'Public VPS: CLOSED'].join('\n');
  const telegram=await sendTelegram({data:buffer,mime:type.mime,ext:type.ext},caption);
  const msg=orderStatus==='APPROVED'?'ตรวจสอบสลิปสำเร็จ ระบบอนุมัติและกำลังส่ง L2Blitz Coin เข้าตัวละครในเกมอัตโนมัติ':'รับรูปสลิปแล้ว รอตรวจสอบรายการโอนเงิน';
  res.status(orderStatus==='APPROVED'?200:202).json({ok:true,status:orderStatus,verification:result.state,telegram:telegram==='SENT'?'SENT':'NOT_SENT',message:msg});
});
app.use('/api/local',(err,req,res,next)=>{
  if(err.type==='entity.too.large')return fail(res,413,'ไฟล์เกินขนาด');
  if(res.headersSent) return next(err);
  if((err instanceof SyntaxError || err.name==='SyntaxError') && (err.status===400 || err.statusCode===400)) return fail(res,400,'รูปแบบข้อมูล JSON ไม่ถูกต้อง');
  console.error('local API',err.code||err.message);
  fail(res,500,'เกิดข้อผิดพลาด');
});
await fs.mkdir(slipDirectory,{recursive:true,mode:0o700});
await db.query('SELECT 1');
app.listen(port,'127.0.0.1',()=>console.log('LOCAL_TOPUP_READY http://127.0.0.1:'+port+' only; VPS untouched; orders '+(purchasesAllowed?'pilot enabled':'disabled')));
