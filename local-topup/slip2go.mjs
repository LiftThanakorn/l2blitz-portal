// Slip2Go REST adapter — strictly informational. Never delivers items or approves payments.
// Docs: https://slip2go.com/guide/rest-api/base64 ; https://slip2go.com/guide/response
const FLAGGED = new Set(['200401','200402','200403','200404','200500','200501']);
const MANUAL = new Set(['401004','401005','401006','200502','500500','500503','429000']);
const VALID_CODE = '200200';

export function validatedEndpoint(raw) {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash) return null;
    if (!(url.hostname === 'slip2go.com' || url.hostname.endsWith('.slip2go.com'))) return null;
    const route = '/api/verify-slip/qr-base64/info';
    if (url.pathname === '/' || url.pathname === '') url.pathname = route;
    if (url.pathname !== route) return null;
    return url.toString();
  } catch { return null; }
}

function actualAmount(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return NaN;
  const result = Number(value);
  return Number.isFinite(result) ? result : NaN;
}
export function classifySlip2Go(response, expectedBaht) {
  const code=String(response?.code ?? 'UNKNOWN');
  if(FLAGGED.has(code)) return {state:'FLAGGED',code};
  if(MANUAL.has(code)) return {state:'MANUAL_PENDING',code};
  if(code === '200000') return {state:'MANUAL_PENDING',code:'FOUND_NOT_VALIDATED'};
  if(code !== VALID_CODE) return {state:'RETRY_NEEDED',code};
  const info=response?.data;
  const reference=info?.transRef;
  if(!info || typeof info !== 'object' || !info.receiver || !info.dateTime
    || typeof reference !== 'string' || !/^[A-Za-z0-9._:/-]{8,140}$/.test(reference)) {
    return {state:'MANUAL_PENDING',code:'MISSING_BANK_DETAILS'};
  }
  if(actualAmount(info.amount) !== expectedBaht) return {state:'FLAGGED',code:'LOCAL_AMOUNT_MISMATCH'};
  const transferred=Date.parse(String(info.dateTime));
  if(!Number.isFinite(transferred) || transferred > Date.now()+5*60*1000 || transferred < Date.now()-365*24*3600*1000) {
    return {state:'MANUAL_PENDING',code:'INVALID_TRANSFER_DATE'};
  }
  // Code 200200 means Slip2Go reports its requested duplicate, recipient and amount conditions matched.
  // Still requires bank reconciliation and explicitly authorized GM approval.
  return {state:'API_REVIEW',code,transRef:reference,transferredAt:info.dateTime};
}
export function buildRequestBody(image, expectedBaht, promptpayDigits) {
  if(!Number.isSafeInteger(expectedBaht) || expectedBaht<1 || !/^0[0-9]{9}$/.test(promptpayDigits)) {
    throw Error('Unsafe amount or PromptPay recipient');
  }
  return {payload:{
    imageBase64:'data:'+image.mime+';base64,'+image.data.toString('base64'),
    checkCondition:{
      checkDuplicate:true,
      checkReceiver:[{accountType:'02001',accountNumber:promptpayDigits}],
      checkAmount:{type:'eq',amount:expectedBaht}
    }
  }};
}
export async function verifySlip2Go(image, expectedBaht, recipient, settings={}, transport=fetch) {
  const secret=settings.secret ?? process.env.SLIP2GO_SECRET_KEY;
  const rawUrl=settings.endpoint ?? process.env.SLIP2GO_API_URL;
  if(!secret || !rawUrl) return {state:'MANUAL_PENDING',code:'NOT_CONFIGURED'};
  const endpoint=validatedEndpoint(rawUrl);
  if(!endpoint) return {state:'MANUAL_PENDING',code:'INVALID_ENDPOINT'};
  let requestBody;
  try {requestBody=buildRequestBody(image,expectedBaht,recipient.id);}
  catch{return {state:'MANUAL_PENDING',code:'INVALID_PAYMENT_CONFIG'};}
  try{
    const response=await transport(endpoint,{
      method:'POST',redirect:'error',signal:AbortSignal.timeout(12000),
      headers:{Authorization:'Bearer '+secret,'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify(requestBody)
    });
    const data=await response.json().catch(()=>null);
    if (!data || typeof data !== 'object') return {state:'RETRY_NEEDED',code:'INVALID_RESPONSE'};
    return classifySlip2Go(data,expectedBaht);
  }catch{
    return {state:'RETRY_NEEDED',code:'API_UNAVAILABLE'};
  }
}
