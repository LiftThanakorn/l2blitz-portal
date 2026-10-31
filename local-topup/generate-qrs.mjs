import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url);
const qr=require(path.join(process.env.LOCALAPPDATA,'L2Blitz','qr-build','node_modules','qrcode'));
const dataRoot=path.join(process.env.LOCALAPPDATA,'L2Blitz','qr-build','amount-qr-stage');
const output=new URL('./public/qr/',import.meta.url);
await fs.mkdir(output,{recursive:true});
for(const price of [100,300,500,1000,1500]){
  const payload=(await fs.readFile(path.join(dataRoot,String(price),'payload.txt'),'utf8')).trim();
  if(payload.length<70 || payload.length>140 || ![...payload].every(c=>c.charCodeAt(0)>=32 && c.charCodeAt(0)<=126))throw Error('Unexpected QR payload for '+price);
  await qr.toFile(fileURLToPath(new URL(price+'.png',output)),payload,{width:228,margin:3,errorCorrectionLevel:'M',color:{dark:'#000000',light:'#FFFFFF'}});
  console.log('QR_LOCAL_GENERATED '+price+' verified-payload');
}
