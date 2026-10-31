import assert from 'node:assert/strict';
import {buildRequestBody,validatedEndpoint,classifySlip2Go,verifySlip2Go} from './slip2go.mjs';

const image={mime:'image/png',data:Buffer.from('a-fake-image-for-unit-tests')};
const payee={id:'0812345678'};
const url='https://api.slip2go.com/api/verify-slip/qr-base64/info';
const details={
  transRef:'MOCKBANK12345678',amount:100,receiver:{account:{proxy:{type:'MOBILE',account:'xxxx5678'}}},
  dateTime:new Date().toISOString()
};
const reply=(code,data=details)=>({code,data});
assert.equal(validatedEndpoint('http://api.slip2go.com'),null);
assert.equal(validatedEndpoint('https://api.slip2go.com.attacker.org'),null);
assert.equal(validatedEndpoint('https://user:pass@api.slip2go.com'),null);
assert.equal(validatedEndpoint('https://api.slip2go.com'),url);
assert.equal(validatedEndpoint(url),url);
const body=buildRequestBody(image,100,payee.id);
assert.equal(body.payload.checkCondition.checkAmount.amount,100,'docs expect THB amount not satang');
assert.equal(body.payload.checkCondition.checkReceiver[0].accountType,'02001');
assert.equal(body.payload.checkCondition.checkReceiver[0].accountNumber,payee.id);
assert.equal(body.payload.checkCondition.checkDuplicate,true);
assert.equal(classifySlip2Go(reply('200200'),100).state,'API_REVIEW');
assert.equal(classifySlip2Go(reply('200200',{...details,amount:99}),100).state,'FLAGGED');
assert.equal(classifySlip2Go(reply('200200',{...details,transRef:''}),100).state,'MANUAL_PENDING');
assert.equal(classifySlip2Go(reply('200000'),100).state,'MANUAL_PENDING');
for(const code of ['200401','200402','200403','200404','200500','200501']){
  assert.equal(classifySlip2Go(reply(code),100).state,'FLAGGED',code);
}
for(const code of ['401004','401005','401006','200502','500500','500503','429000']){
  assert.equal(classifySlip2Go(reply(code),100).state,'MANUAL_PENDING',code);
}
assert.equal(classifySlip2Go(reply('401001'),100).state,'RETRY_NEEDED');
assert.equal((await verifySlip2Go(image,100,payee,{},async()=>{throw Error('never fetch');})).state,'MANUAL_PENDING');
let requests=0;
const mockFetch=async(input,config)=>{
  requests++;
  assert.equal(input,url);
  assert.equal(config.headers.Authorization,'Bearer MOCK_SECRET');
  assert.equal(JSON.parse(config.body).payload.checkCondition.checkAmount.amount,100);
  return {json:async()=>reply('200200')};
};
const outcome=await verifySlip2Go(image,100,payee,{secret:'MOCK_SECRET',endpoint:url},mockFetch);
assert.equal(outcome.state,'API_REVIEW');
assert.equal(requests,1);
const error=await verifySlip2Go(image,100,payee,{secret:'MOCK_SECRET',endpoint:url},async()=>{throw Error('network offline');});
assert.equal(error.state,'RETRY_NEEDED');
console.log('PASS Slip2Go: exact THB, PromptPay account type, duplicate flag, genuine validated payload, expiry/quota/fraud, wrong amount, missing ref, fake endpoint, no credit');
