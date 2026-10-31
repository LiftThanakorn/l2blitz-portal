import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {db,sha,assertLocalMode} from './common.mjs';

assertLocalMode();
const [cmd,...args]=process.argv.slice(2);
function abort(s){console.error(s);process.exitCode=1;}
async function init(){
  const source=await fs.readFile(new URL('./schema.sql',import.meta.url),'utf8');
  const queries=source.split(';').map(x=>x.replace(/^\s*--.*$/gm,'').trim()).filter(Boolean);
  for(const q of queries) await db.query(q);
  console.log('LOCAL_SCHEMA_READY '+queries.length+' tables verified/created');
}
async function pairing(id){
  if(!/^\d+$/.test(id||''))return abort('Usage: node operator.mjs pair <online-character-id>');
  const [rows]=await db.execute('SELECT c.charId,c.char_name,c.account_name,c.online FROM characters c JOIN accounts a ON a.login=c.account_name WHERE c.charId=? LIMIT 1',[id]);
  if(rows.length!==1||Number(rows[0].online)!==1)return abort('Character must currently be ONLINE on the local GameServer.');
  const code=String(crypto.randomInt(0,100000000)).padStart(8,'0');
  await db.execute('DELETE FROM blitz_local_pairing WHERE account_name=? AND used_at IS NULL',[rows[0].account_name]);
  await db.execute('INSERT INTO blitz_local_pairing(code_hash,account_name,character_id,expires_at) VALUES(?,?,?,DATE_ADD(NOW(6),INTERVAL 5 MINUTE))',[sha(code),rows[0].account_name,rows[0].charId]);
  console.log('CHARACTER: '+rows[0].char_name+'; ONE_TIME_CODE: '+code+'; TTL: 5 minutes; http://127.0.0.1:3101');
}
async function status(orderId){
  if(!/^[0-9a-f-]{36}$/.test(orderId||''))return abort('Usage: node operator.mjs status <order-uuid>');
  const [rows]=await db.execute('SELECT o.order_id,o.account_name,o.character_id,o.price_thb,o.coins,o.status,s.verification,s.provider_code,s.private_file,t.bank_reference FROM blitz_topup_order o LEFT JOIN blitz_local_slips s ON s.order_id=o.order_id LEFT JOIN blitz_local_bank_transfers t ON t.order_id=o.order_id WHERE o.order_id=?',[orderId]);
  if(!rows.length)return abort('Order not found');
  console.log(JSON.stringify(rows[0],null,2));
}
async function approve(orderId,reference,confirmed){
  if(!/^[0-9a-f-]{36}$/.test(orderId||'')||!/^[A-Za-z0-9._:/-]{8,140}$/.test(reference||'')||confirmed!=='--bank-confirmed'){
    return abort('Usage: node operator.mjs approve <order-uuid> <unique-real-bank-reference> --bank-confirmed');
  }
  const admin=Number(process.env.LOCAL_TOPUP_OPERATOR_ID||101);
  if(!Number.isSafeInteger(admin)||admin<1) return abort('Invalid GM operator ID');
  const c=await db.getConnection();
  try{
    await c.beginTransaction();
    const [rows]=await c.execute('SELECT o.account_name,o.character_id,o.price_thb,o.status,s.verification FROM blitz_topup_order o JOIN blitz_local_slips s ON s.order_id=o.order_id WHERE o.order_id=? FOR UPDATE',[orderId]);
    if(rows.length!==1||rows[0].status!=='PENDING_REVIEW') throw Error('Order not awaiting GM review');
    if(rows[0].verification==='FLAGGED')throw Error('Flagged slip cannot be approved without independent investigation (block by default)');
    const [owner]=await c.execute('SELECT charId FROM characters WHERE charId=? AND account_name=?',[rows[0].character_id,rows[0].account_name]);
    if(owner.length!==1)throw Error('Character ownership changed');
    const amount=rows[0].price_thb;
    await c.execute('INSERT INTO blitz_local_bank_transfers(bank_reference,order_id,verified_amount,verified_by) VALUES(?,?,?,?)',[reference,orderId,amount,'GM:'+admin]);
    await c.execute("UPDATE blitz_local_slips SET verification='MANUAL_VERIFIED',reviewed_at=NOW(6) WHERE order_id=?",[orderId]);
    await c.execute("INSERT INTO blitz_topup_admin_action(order_id,admin_id,decision,reason) VALUES(?,?,'APPROVED',?)",[orderId,admin,'Verified bank transfer: '+reference]);
    const [result]=await c.execute("UPDATE blitz_topup_order SET status='APPROVED',status_changed_at=NOW(6) WHERE order_id=? AND status='PENDING_REVIEW'",[orderId]);
    if(result.affectedRows!==1)throw Error('Failed to advance order');
    await c.commit();
    console.log('APPROVED_ON_LOCAL_ONLY '+orderId+'; one unique verified reference; GameServer will deliver item 4037 through existing approved-order handler');
  }catch(e){await c.rollback();return abort('APPROVAL_FAILED '+(e.code||e.message));}finally{c.release();}
}
try{
  if(cmd==='init')await init();
  else if(cmd==='pair')await pairing(args[0]);
  else if(cmd==='status')await status(args[0]);
  else if(cmd==='approve')await approve(args[0],args[1],args[2]);
  else abort('Commands: init | pair <online-character-id> | status <order-id> | approve <order-id> <bank-ref> --bank-confirmed');
}finally{await db.end();}
