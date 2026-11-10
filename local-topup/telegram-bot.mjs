import fs from 'node:fs/promises';
import path from 'node:path';
import { db } from './common.mjs';

let pollerActive = false;
let pollerAbort = null;

export async function getTelegramConfig() {
  const cfgPath = process.env.LOCAL_TOPUP_TELEGRAM_CONFIG ||
    (process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'L2Blitz', 'telegram-worker.json') : null);
  if (!cfgPath) return null;
  try {
    const text = await fs.readFile(cfgPath, 'utf8');
    const cfg = JSON.parse(text);
    if (!cfg.telegramToken || !cfg.telegramChatId || cfg.enabled === false) return null;
    return cfg;
  } catch {
    return null;
  }
}

export async function sendTelegramReview(image, caption, options = {}) {
  const cfg = await getTelegramConfig();
  if (!cfg) return 'DISABLED';
  try {
    const textPayload = {
      chat_id: String(cfg.telegramChatId),
      text: caption
    };

    if (options.isPendingReview && options.orderId) {
      textPayload.reply_markup = {
        inline_keyboard: [
          [
            { text: '✅ อนุมัติ (Approve)', callback_data: `A:${options.orderId}` },
            { text: '❌ ปฏิเสธ (Reject)', callback_data: `R:${options.orderId}` }
          ]
        ]
      };
    }

    // 1. Send instant text alert FIRST (completes in ~1-2 seconds)
    const textRes = await fetch(`https://api.telegram.org/bot${cfg.telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(textPayload),
      signal: AbortSignal.timeout(8000)
    });
    const reply = await textRes.json().catch(() => ({}));
    const sent = textRes.ok && reply.ok ? 'SENT' : 'FAILED';

    // 2. Upload slip photo in background concurrently (does not block HTTP response)
    if (image && image.data) {
      (async () => {
        try {
          const form = new FormData();
          form.set('chat_id', String(cfg.telegramChatId));
          form.set('caption', `📷 รูปสลิปสำหรับคำสั่งซื้อ: ${options.orderId || ''}`);
          form.set('photo', new Blob([image.data], { type: image.mime }), 'slip.' + image.ext);
          await fetch(`https://api.telegram.org/bot${cfg.telegramToken}/sendPhoto`, {
            method: 'POST',
            body: form,
            signal: AbortSignal.timeout(120000)
          });
        } catch (photoErr) {
          console.error('Background sendPhoto error:', photoErr.message);
        }
      })();
    }

    return sent;
  } catch (err) {
    console.error('sendTelegram error:', err.message);
    return 'FAILED';
  }
}

export function startTelegramBotListener() {
  if (pollerActive) return;
  pollerActive = true;
  const abortController = new AbortController();
  pollerAbort = abortController;

  (async () => {
    const cfg = await getTelegramConfig();
    if (!cfg) {
      console.log('Telegram bot listener disabled (not configured or enabled=false)');
      return;
    }

    const token = cfg.telegramToken;
    const targetChatId = String(cfg.telegramChatId);
    const adminSet = new Set((cfg.telegramAdminIds || []).map(String));

    console.log(`Telegram bot listener started (Chat: ${targetChatId}, Admins: ${[...adminSet].join(', ') || 'Any in chat'})`);

    let offset = 0;
    while (!abortController.signal.aborted) {
      try {
        const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=20&allowed_updates=["callback_query"]`;
        const res = await fetch(url, { signal: AbortSignal.timeout(28000) });
        if (!res.ok) {
          await new Promise(r => setTimeout(r, 4000));
          continue;
        }
        const data = await res.json();
        if (!data.ok || !Array.isArray(data.result)) {
          await new Promise(r => setTimeout(r, 4000));
          continue;
        }

        for (const update of data.result) {
          offset = Math.max(offset, update.update_id + 1);
          if (update.callback_query) {
            await handleCallbackQuery(update.callback_query, { token, targetChatId, adminSet });
          }
        }
      } catch (err) {
        if (abortController.signal.aborted) break;
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  })().catch(err => console.error('Telegram bot listener fatal error:', err));
}

async function answerCallbackQuery(token, queryId, text, showAlert = false) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: queryId, text, show_alert: showAlert }),
      signal: AbortSignal.timeout(5000)
    });
  } catch {}
}

async function updateMessageAfterDecision(token, query, textBadge) {
  try {
    const message = query.message;
    if (!message || !message.chat?.id || !message.message_id) return;
    const isCaption = typeof message.caption === 'string';
    const oldText = isCaption ? message.caption : (message.text || '');
    const newText = `${oldText}\n\n${textBadge}`.slice(0, 1024);

    const method = isCaption ? 'editMessageCaption' : 'editMessageText';
    const body = {
      chat_id: message.chat.id,
      message_id: message.message_id,
      reply_markup: { inline_keyboard: [] }
    };
    if (isCaption) {
      body.caption = newText;
    } else {
      body.text = newText;
    }

    await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000)
    });
  } catch (err) {
    console.error('updateMessageAfterDecision error:', err.message);
  }
}

export async function handleCallbackQuery(query, { token, targetChatId, adminSet }) {
  const fromId = String(query.from?.id || '');
  const chatId = String(query.message?.chat?.id || '');
  const callbackData = String(query.data || '');

  const isAuthorizedChat = chatId === targetChatId;
  const isAuthorizedAdmin = adminSet.size === 0 || adminSet.has(fromId);

  if (!isAuthorizedChat || !isAuthorizedAdmin) {
    return answerCallbackQuery(token, query.id, '⛔ คุณไม่มีสิทธิ์อนุมัติ/ปฏิเสธรายการนี้', true);
  }

  const match = /^(?:APPROVE|A|REJECT|R):([0-9a-f-]{36})$/i.exec(callbackData);
  if (!match) {
    return answerCallbackQuery(token, query.id, 'คำสั่งไม่ถูกต้อง');
  }

  const isApprove = callbackData.startsWith('A') || callbackData.startsWith('APPROVE');
  const orderId = match[1];
  const operatorName = query.from?.username ? `@${query.from.username}` : (query.from?.first_name || fromId);
  const adminNumericId = Number(fromId) || 101;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      "SELECT o.order_id, o.account_name, o.character_id, o.price_thb, o.coins, o.bonus_coins, o.status, c.char_name FROM blitz_topup_order o LEFT JOIN characters c ON c.charId=o.character_id WHERE o.order_id=? FOR UPDATE",
      [orderId]
    );

    if (!rows.length) {
      await conn.rollback();
      return answerCallbackQuery(token, query.id, '❌ ไม่พบคำสั่งซื้อในระบบ', true);
    }

    const order = rows[0];

    if (order.status !== 'PENDING_REVIEW') {
      await conn.rollback();
      return answerCallbackQuery(
        token,
        query.id,
        `⚠️ คำสั่งซื้อนี้ไม่อยู่ในสถานะรอตรวจสอบ (สถานะปัจจุบัน: ${order.status})`,
        true
      );
    }

    const recipient = order.char_name || `ID:${order.character_id}`;
    const totalCoins = Number(order.coins) + Number(order.bonus_coins);

    if (isApprove) {
      const bankRef = `TG:${fromId}:${Date.now()}`;
      await conn.execute(
        "INSERT INTO blitz_local_bank_transfers(bank_reference, order_id, verified_amount, verified_by) VALUES(?,?,?,?)",
        [bankRef, orderId, order.price_thb, `TG:${fromId}`]
      );
      await conn.execute(
        "UPDATE blitz_local_slips SET verification='MANUAL_VERIFIED', reviewed_at=NOW(6) WHERE order_id=?",
        [orderId]
      );
      await conn.execute(
        "INSERT INTO blitz_topup_admin_action(order_id, admin_id, decision, reason) VALUES(?,?,'APPROVED',?)",
        [orderId, adminNumericId, `Approved via Telegram by ${operatorName}`]
      );
      const [upd] = await conn.execute(
        "UPDATE blitz_topup_order SET status='APPROVED', status_changed_at=NOW(6) WHERE order_id=? AND status='PENDING_REVIEW'",
        [orderId]
      );
      if (upd.affectedRows !== 1) throw new Error('Order status update failed');
      await conn.commit();

      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      await answerCallbackQuery(token, query.id, `✅ อนุมัติแล้ว! กำลังส่ง ${totalCoins.toLocaleString()} Coin ให้ ${recipient}`);
      await updateMessageAfterDecision(
        token,
        query,
        `✅ อนุมัติโดย ${operatorName} (${timeStr})\nสถานะ: APPROVED (ส่งมอบเหรียญ ${totalCoins.toLocaleString()} Blitz Coin เข้าตัวละคร ${recipient} สำเร็จ)`
      );
      console.log(`[TELEGRAM ADMIN] Order ${orderId} APPROVED by ${operatorName} for character ${recipient} (${totalCoins} coins)`);
    } else {
      await conn.execute(
        "UPDATE blitz_topup_order SET status='REJECTED', status_changed_at=NOW(6) WHERE order_id=?",
        [orderId]
      );
      await conn.execute(
        "UPDATE blitz_local_slips SET verification='MANUAL_REJECTED', reviewed_at=NOW(6) WHERE order_id=?",
        [orderId]
      );
      await conn.execute(
        "INSERT INTO blitz_topup_admin_action(order_id, admin_id, decision, reason) VALUES(?,?,'REJECTED',?)",
        [orderId, adminNumericId, `Rejected via Telegram by ${operatorName}`]
      );
      await conn.commit();

      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      await answerCallbackQuery(token, query.id, `❌ ปฏิเสธคำสั่งซื้อ ${orderId.slice(0, 8)} เรียบร้อย`);
      await updateMessageAfterDecision(
        token,
        query,
        `❌ ปฏิเสธโดย ${operatorName} (${timeStr})\nสถานะ: REJECTED (สลิปไม่ผ่านการตรวจสอบ)`
      );
      console.log(`[TELEGRAM ADMIN] Order ${orderId} REJECTED by ${operatorName}`);
    }
  } catch (err) {
    await conn.rollback();
    console.error('Error handling Telegram callback query:', err);
    await answerCallbackQuery(token, query.id, `เกิดข้อผิดพลาด: ${err.message || 'database error'}`, true);
  } finally {
    conn.release();
  }
}

export function stopTelegramBotListener() {
  if (pollerAbort) {
    pollerAbort.abort();
    pollerAbort = null;
  }
  pollerActive = false;
}
