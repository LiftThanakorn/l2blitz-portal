// Sends ONE explicitly labelled NON-PAYMENT test photo to the already configured GM chat.
// Never creates an order, tests approvals, or distributes items.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const configPath=process.env.LOCAL_TOPUP_TELEGRAM_CONFIG ||
  path.join(process.env.LOCALAPPDATA || os.tmpdir(),'L2Blitz','telegram-worker.json');
const photoPath=process.argv[2];
if (!photoPath) throw Error('Usage: node telegram-photo-test.mjs <test-image.png>');
const cfg=JSON.parse(await fs.readFile(configPath,'utf8'));
if(!cfg.telegramToken || !cfg.telegramChatId || cfg.enabled===false)throw Error('Telegram not configured for this Local user');
const photo=await fs.readFile(photoPath);
if(photo.length<1000 || photo.length>1024*1024 || photo.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Not a safe test PNG');
const form=new FormData();
form.set('chat_id',String(cfg.telegramChatId));
form.set('caption','🧪 L2BLITZ LOCAL TEST — ทดสอบส่งภาพ Telegram\nไม่มีการโอนเงิน / ไม่มีการอนุมัติ / ไม่แจก Blitz Coin\nหากเห็นภาพนี้ แสดงว่า Telegram Bot รับรูปจาก Local ได้');
form.set('photo',new Blob([photo],{type:'image/png'}),'L2Blitz-TEST-NO-PAYMENT.png');
const response=await fetch('https://api.telegram.org/bot'+cfg.telegramToken+'/sendPhoto',{method:'POST',body:form,signal:AbortSignal.timeout(16000)});
const parsed=await response.json().catch(()=>({}));
if(!response.ok || parsed.ok!==true)throw Error('Telegram photo test failed (HTTP '+response.status+')');
console.log('LOCAL_TELEGRAM_PHOTO_SENT=YES');
console.log('TELEGRAM_MESSAGE_ID='+parsed.result.message_id);
console.log('NO_ORDER_NO_APPROVAL_NO_COIN=YES');
