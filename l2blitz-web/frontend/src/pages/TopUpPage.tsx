import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, CreditCard, ImageUp, LockKeyhole, ReceiptText, RefreshCw, ShieldCheck, TriangleAlert, Wallet, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type Player = { account: string; character: string; characterId: number };
type Tier = { package_id: number; price_thb: string; coins: number; bonus_coins: number };
type Order = { order_id: string; price_thb: string; coins: number; status: string; verification: string | null };
type NewOrder = { orderId: string; amount: number; coins: number; promptpayId: string; recipientName: string };
type Health = { ok: boolean; mode: string; payments: string; integrations?: { slip2go: boolean; telegram: boolean } };

async function localApi<T>(path: string, payload?: object): Promise<T> {
  const response = await fetch('/api/local/' + path, {
    method: payload === undefined ? 'GET' : 'POST',
    credentials: 'same-origin', cache: 'no-store',
    headers: payload === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(data.error || 'Local payment service is unavailable');
  return data as T;
}

function imageData(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Cannot read image'));
    reader.readAsDataURL(file);
  });
}
const prices = [100, 300, 500, 1000, 1500] as const;
const format = (n: string | number) => Number(n).toLocaleString('th-TH');
const panel = 'surface-white border border-[#E8E3DB] px-6 py-7 sm:p-9';
const field = 'w-full min-w-0 border border-[#D9D3C9] bg-[#F7F5F0] text-[#1A1917] px-4 py-3 outline-none focus:border-[#E97540]';
const muted = 'small-note text-[#77736C]';

export function TopUpPage() {
  const { t } = useLanguage();
  const [health, setHealth] = useState<Health | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [otp, setOtp] = useState('');
  const [selected, setSelected] = useState(300);
  const [active, setActive] = useState<NewOrder | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const browserBootRef = useRef<Promise<boolean> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const h = await localApi<Health>('health');
      if (h.mode !== 'LOCAL_ONLY') throw new Error('Not local');
      setHealth(h);
      try {
        const person = await localApi<Player>('me');
        setPlayer(person);
        const [packs, orders] = await Promise.all([
          localApi<{ packages: Tier[] }>('packages'),
          localApi<{ orders: Order[] }>('orders'),
        ]);
        setTiers(packs.packages);
        setHistory(orders.orders);
      } catch { setPlayer(null); setHistory([]); }
    } catch { setHealth(null); setPlayer(null); }
  }, []);
  useEffect(() => {
    // Keep a single exchange across React StrictMode's effect replay.
    if (!browserBootRef.current) {
      const url = new URL(window.location.href);
      const ticket = url.searchParams.get('ticket');
      if (ticket) {
        url.searchParams.delete('ticket');
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
        browserBootRef.current = localApi<{ ok: boolean }>('redeem', { ticket }).then(() => true);
      } else {
        browserBootRef.current = Promise.resolve(false);
      }
    }
    let active = true;
    void browserBootRef.current.then(async (redeemed) => {
      if (!active) return;
      await refresh();
      if (active && redeemed) setSuccess(t('เชื่อมต่อจาก NPC สำเร็จ ไม่ต้องกรอกรหัส', 'Connected from NPC without entering a code'));
    }).catch((e) => {
      if (!active) return;
      setError(e instanceof Error ? e.message : 'Browser login failed');
      void refresh();
    });
    return () => { active = false; };
  }, [refresh, t]);

  async function linkGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(''); setSuccess('');
    try {
      await localApi('login', { code: otp });
      setOtp('');
      await refresh();
      setSuccess(t('เชื่อมต่อชื่อตัวละครแล้ว', 'Character linked to the website'));
    } catch (e) { setError(e instanceof Error ? e.message : 'Login failed'); }
    finally { setBusy(false); }
  }
  async function placeOrder() {
    setBusy(true); setError(''); setSuccess('');
    try {
      const result = await localApi<NewOrder>('orders', { amount: selected });
      setActive(result);
      setSuccess(t('สร้างรายการแล้ว กรุณาตรวจชื่อผู้รับก่อนโอนเงินจริง', 'Order created. Verify bank payee before transfer.'));
      await refresh();
    } catch(e) { setError(e instanceof Error ? e.message : 'Order could not be created'); }
    finally { setBusy(false); }
  }
  async function submitSlip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active || !file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) {
      setError(t('รองรับรูป JPG, PNG, WebP ขนาดไม่เกิน 4 MB', 'JPG, PNG or WebP only, maximum 4MB'));return;
    }
    setBusy(true); setError(''); setSuccess('');
    try {
      const result = await localApi<{ verification: string; telegram: string }>('orders/' + active.orderId + '/slip',{ imageBase64: await imageData(file) });
      setSuccess(t('ส่งหลักฐานสำเร็จ รอ GM ตรวจเงินเข้าบัญชี', 'Slip submitted. GM must confirm bank receipt') + ' · ' + result.verification + ' · Telegram: ' + result.telegram);
      setActive(null); setFile(null);
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Slip rejected'); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true);
    try {
      await localApi('logout', {});
      setPlayer(null);setHistory([]);setActive(null);setError('');setSuccess('');
    } catch(e) { setError(e instanceof Error ? e.message : 'Logout failed'); }
    finally {setBusy(false);}
  }

  return <div className="editorial-frame pt-10 pb-20">
    <header className="editorial-axis-grid items-end pb-12 lg:pb-16">
      <div className="col-span-12 lg:col-span-5">
        <p className="small-note text-[#C4531E] font-semibold m-0">L2BLITZ / PLAYER CENTER / LOCAL TEST</p>
        <p className="body-copy text-[#77736C] mt-5">{t('ระบบเติมเงินระหว่างพัฒนา ทดสอบกับเซิร์ฟเวอร์ในเครื่องเท่านั้น ยังไม่เปิดบน Cloudflare หรือ VPS', 'Local payment pilot in development; not available on Cloudflare or VPS.')}</p>
        <p className="small-note inline-block bg-[#F0EDE7] px-3 py-2 mt-5 text-[#524E48]">LOCAL ONLY · 127.0.0.1</p>
      </div>
      <div className="col-span-12 lg:col-span-7"><h1 className="display-title">{t('เติมเงิน', 'Top Up')}<br/>BLITZ COIN</h1></div>
    </header>

    {!health && <div role="alert" className="surface-white border-l-4 border-[#B95348] p-5 mb-6"><TriangleAlert size={20} className="inline-block text-[#B95348] mr-2"/>{t('บริการเติมเงิน Local ไม่พร้อม กรุณาเปิด API ในเครื่องก่อน', 'Local payment service is offline. Start the local API first.')}</div>}
    {health && <div className="surface-white border border-[#E8E3DB] p-4 mb-5 flex flex-wrap gap-5 small-note text-[#524E48]">
      <span>{t('Slip2Go','Slip2Go')}: {health.integrations?.slip2go ? t('ตั้งค่าแล้ว (รอตรวจสลิปจริง)', 'Configured (real slip not tested)') : t('รอ Secret Key — ตรวจด้วย GM เท่านั้น', 'Needs Secret Key — manual review only')}</span>
      <span>{t('Telegram','Telegram')}: {health.integrations?.telegram ? t('ตั้งค่าแล้ว', 'Configured') : t('ยังไม่ได้ตั้งค่า', 'Not configured')}</span>
    </div>}
    {error && <div role="alert" className="bg-[#FFF3EE] border border-[#E97540] p-4 mb-5 text-[#8F3A1D]">{error}</div>}
    {success && <div role="status" className="bg-[#E9F3EF] border border-[#32846B] p-4 mb-5 text-[#225A4B]">{success}</div>}

    {!player ? <section className={panel}>
      <p className="small-note text-[#C4531E] font-semibold mb-3">01 / GAME CONNECTION</p>
      <div className="flex items-center gap-3 mb-3"><LockKeyhole size={24} className="text-[#C4531E]"/><h2 className="section-heading">{t('เชื่อมตัวละคร', 'Link Character')}</h2></div>
      <p className="body-copy text-[#77736C] mb-7">{t('คุยกับ NPC 900108 → เติมเงิน → ขอรหัสเชื่อมต่อ จากนั้นนำรหัส 8 หลักมาใส่ที่นี่ รหัสมีอายุ 5 นาที', 'Talk to NPC 900108 and request a single-use 8-digit login code (valid for 5 minutes).')}</p>
      <form className="grid sm:grid-cols-[1fr_auto] gap-3 max-w-xl" onSubmit={linkGame}>
        <input className={field + ' text-center tracking-widest font-semibold'} aria-label={t('รหัสเชื่อม 8 หลัก', '8 digit code')} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" maxLength={8} placeholder="00000000" required value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,8))}/>
        <button type="submit" className="btn-primary justify-center" disabled={!health || busy || otp.length!==8}><ShieldCheck size={18}/>{t('เชื่อมต่อ', 'Connect')}</button>
      </form>
      <p className={muted+' mt-4'}>{t('ไม่ต้องกรอกรหัสผ่านเกมบนเว็บไซต์', 'Never enter your game password on this page.')}</p>
    </section> : <div className="space-y-5">
      <section className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="small-note text-[#C4531E] mb-1">CONNECTED CHARACTER</p><h2 className="section-heading">{player.character}</h2><p className={muted+' mt-2'}>{t('บัญชี', 'Account')}: {player.account}</p></div>
          <span className="inline-flex items-center gap-2 text-[#32846B] small-note font-semibold"><CheckCircle2 size={20}/>{t('เชื่อมต่อสำเร็จ', 'Verified')}</span>
        </div>
      </section>
      <section className={panel}>
        <p className="small-note text-[#C4531E] font-semibold mb-4">02 / PACKAGE</p>
        <h2 className="section-heading">{t('เลือกแพ็กเกจ', 'Select Package')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-7 mb-6">
          {prices.map(price=>{
            const pack=tiers.find(x=>Number(x.price_thb)===price);
            return <button key={price} disabled={busy||!pack||!!active} type="button" aria-pressed={selected===price} onClick={()=>setSelected(price)}
              className={'text-left border p-4 min-w-0 transition-colors disabled:opacity-40 '+(selected===price?'border-[#E97540] bg-[#FFF1E8]':'border-[#E8E3DB] bg-[#F7F5F0] hover:border-[#E97540]')}>
              <strong className="block text-[22px] tabular-nums">{format(price)}</strong>
              <span className="small-note text-[#77736C]">{pack?format(Number(pack.coins)+Number(pack.bonus_coins)):'—'} Coin</span>
            </button>;
          })}
        </div>
        <button className="btn-primary w-full sm:w-auto justify-center" type="button" onClick={placeOrder} disabled={!health||health.payments!=='LOCAL_OPERATOR_PILOT'||busy||!!active||!tiers.some(x=>Number(x.price_thb)===selected)}>
          <CreditCard size={18}/>{t('สร้างคำสั่งซื้อ Local', 'Create Local Order')}
        </button>
        <p className={muted+' mt-4'}>{t('การสร้างรายการยังไม่หักเงิน ต้องชำระเองในแอปธนาคารหลังตรวจชื่อผู้รับ', 'Creating an order does not charge your bank account.')}</p>
      </section>
      {active && <section className={panel}>
        <p className="small-note text-[#C4531E] font-semibold mb-4">03 / PROMPTPAY & RECEIPT</p>
        <h2 className="section-heading">{t('ชำระและแนบสลิป', 'Pay & Upload Slip')}</h2>
        <div className="grid md:grid-cols-[260px_1fr] gap-7 mt-7 items-start">
          <div className="bg-[#F0EDE7] p-4"><img alt={t('QR PromptPay ตามยอดที่เลือก', 'PromptPay QR for selected amount')} width={228} height={228} className="bg-white block w-full" src={'/api/local/qr/'+active.amount+'.png'}/></div>
          <div className="space-y-4 min-w-0">
            <div><p className={muted}>{t('ยอดที่ต้องชำระ', 'Amount')}</p><strong className="text-[32px] font-semibold text-[#C4531E] tabular-nums">฿{format(active.amount)}</strong></div>
            <div><p className={muted}>{t('ชื่อผู้รับ', 'Payee')}</p><strong className="body-copy">{active.recipientName}</strong></div>
            <div><p className={muted}>PromptPay</p><strong className="body-copy">{active.promptpayId}</strong></div>
            <div><p className={muted}>Order</p><span className="small-note break-all">{active.orderId}</span></div>
            <p className="small-note text-[#8F3A1D] bg-[#FFF1E8] p-3 border-l-4 border-[#E97540]">{t('ก่อนโอนเงินจริง ตรวจว่าชื่อผู้รับในแอปธนาคารตรงกัน หากไม่ตรง ห้ามโอน', 'Verify bank payee name before transferring. Do not pay if mismatched.')}</p>
          </div>
        </div>
        <form onSubmit={submitSlip} className="border-t border-[#E8E3DB] mt-8 pt-7 max-w-2xl">
          <label htmlFor="slip" className="font-semibold flex items-center gap-2 mb-3"><ImageUp size={20} className="text-[#C4531E]"/>{t('แนบรูปสลิป JPG / PNG / WebP', 'Upload payment receipt')}</label>
          <input id="slip" type="file" className={field} required accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/>
          <button className="btn-primary mt-5 justify-center" type="submit" disabled={busy||!file}>{t('ส่งหลักฐานให้ GM ตรวจ', 'Submit for GM Review')}</button>
          <p className={muted+' mt-4'}>{t('ไม่เกิน 4 MB ไม่มีการแจก Coin อัตโนมัติเมื่อส่งรูป', 'Maximum 4 MB. Coins are not automatically credited on submission.')}</p>
        </form>
      </section>}
      <section className={panel}>
        <div className="flex justify-between gap-3 items-center mb-5"><h2 className="flex gap-2 items-center text-[22px] font-semibold"><ReceiptText className="text-[#C4531E]" size={24}/>{t('ประวัติเติมเงิน', 'Payment History')}</h2>
          <button aria-label={t('โหลดรายการใหม่', 'Refresh')} className="text-[#C4531E] p-2 hover:bg-[#F0EDE7]" onClick={()=>void refresh()}><RefreshCw size={20}/></button></div>
        {history.length===0 ? <p className={muted}>{t('ยังไม่มีรายการ', 'No orders yet')}</p> : <div className="divide-y divide-[#E8E3DB]">{history.map(item=><div key={item.order_id} className="py-4 flex flex-wrap justify-between gap-3">
          <div><strong>{format(item.coins)} Coin · ฿{format(item.price_thb)}</strong><p className="small-note text-[#77736C] break-all mt-1">{item.order_id}</p></div>
          <div className="text-right"><strong className="small-note text-[#C4531E]">{item.status}</strong><p className={muted}>{item.verification||'—'}</p></div>
        </div>)}</div>}
      </section>
      <button onClick={()=>void logout()} type="button" disabled={busy} className="flex gap-2 items-center small-note text-[#77736C] hover:text-[#C4531E]"><LogOut size={16}/>{t('ออกจากระบบเว็บไซต์', 'Log Out')}</button>
    </div>}
    <p className="small-note text-[#77736C] mt-8 text-center">{t('เฉพาะการทดสอบใน Local — ยังไม่เชื่อมต่อระบบชำระเงินบนเว็บไซต์สาธารณะ', 'LOCAL ONLY. Public payment service remains disabled.')}</p>
  </div>;
}
