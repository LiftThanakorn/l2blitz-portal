import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getTelegramConfig, sendTelegramReview, handleCallbackQuery } from './telegram-bot.mjs';
import { db } from './common.mjs';

test('Telegram bot configuration and inline review behavior', async () => {
  const cfg = await getTelegramConfig();
  assert.ok(cfg, 'Telegram config should load from LOCALAPPDATA or env');
  assert.equal(typeof cfg.telegramToken, 'string', 'Token should be string');
  assert.equal(String(cfg.telegramChatId), '-5594368545', 'Chat ID matches operator group');
  assert.ok(Array.isArray(cfg.telegramAdminIds), 'Admin IDs should be an array');
  assert.ok(cfg.telegramAdminIds.includes('1132460154') || cfg.telegramAdminIds.includes(1132460154), 'Admin 1132460154 included');

  // Verify sendTelegramReview JSON payload formatting with a mock fetch
  const originalFetch = globalThis.fetch;
  let capturedBody = null;
  globalThis.fetch = async (url, opts) => {
    if (url.includes('api.telegram.org')) {
      if (url.includes('sendMessage')) {
        capturedBody = JSON.parse(opts.body);
      }
      return { ok: true, json: async () => ({ ok: true, result: { message_id: 12345 } }) };
    }
    return originalFetch(url, opts);
  };

  try {
    const fakeImage = { data: Buffer.from('test-image'), mime: 'image/png', ext: 'png' };
    
    // 1. When isPendingReview is true -> must include inline_keyboard with Approve and Reject
    const sentReview = await sendTelegramReview(fakeImage, 'Test Caption', {
      orderId: '11111111-2222-3333-4444-555555555555',
      isPendingReview: true
    });
    assert.equal(sentReview, 'SENT');
    assert.ok(capturedBody, 'Should capture sendMessage JSON');
    assert.equal(capturedBody.chat_id, '-5594368545');
    assert.equal(capturedBody.text, 'Test Caption');
    const markup = capturedBody.reply_markup;
    assert.ok(markup.inline_keyboard, 'Must have inline_keyboard');
    assert.equal(markup.inline_keyboard[0][0].text, '✅ อนุมัติ (Approve)');
    assert.equal(markup.inline_keyboard[0][0].callback_data, 'A:11111111-2222-3333-4444-555555555555');
    assert.equal(markup.inline_keyboard[0][1].text, '❌ ปฏิเสธ (Reject)');
    assert.equal(markup.inline_keyboard[0][1].callback_data, 'R:11111111-2222-3333-4444-555555555555');

    // 2. When isPendingReview is false -> must NOT include reply_markup
    capturedBody = null;
    const sentApproved = await sendTelegramReview(fakeImage, 'Test Auto-Approved', {
      orderId: '11111111-2222-3333-4444-555555555555',
      isPendingReview: false
    });
    assert.equal(sentApproved, 'SENT');
    assert.equal(capturedBody.reply_markup, undefined, 'Auto-approved orders should not have approval buttons');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Telegram bot callback query approval and rejection flows', async () => {
  const cfg = await getTelegramConfig();
  const token = cfg.telegramToken;
  const targetChatId = String(cfg.telegramChatId);
  const adminSet = new Set((cfg.telegramAdminIds || []).map(String));

  const originalFetch = globalThis.fetch;
  const answers = [];
  const editedCaptions = [];

  globalThis.fetch = async (url, opts) => {
    if (url.includes('answerCallbackQuery')) {
      answers.push(JSON.parse(opts.body));
      return { ok: true, json: async () => ({ ok: true }) };
    }
    if (url.includes('editMessageCaption')) {
      editedCaptions.push(JSON.parse(opts.body));
      return { ok: true, json: async () => ({ ok: true }) };
    }
    return originalFetch(url, opts);
  };

  try {
    // Create an order in PENDING_REVIEW in MySQL
    const orderId = crypto.randomUUID();
    const conn = await db.getConnection();
    try {
      await conn.execute(
        "INSERT INTO blitz_topup_order(order_id, account_name, character_id, package_id, package_name, price_thb, coins, bonus_coins, status, created_at, expires_at, status_changed_at) VALUES(?, 'test1', 268482486, 1, '100 Coin', 100, 100, 0, 'PENDING_REVIEW', NOW(6), DATE_ADD(NOW(6), INTERVAL 30 MINUTE), NOW(6))",
        [orderId]
      );
      await conn.execute(
        "INSERT INTO blitz_local_slips(order_id, image_sha, private_file, mime, verification) VALUES(?, ?, 'test.png', 'image/png', 'MANUAL_PENDING')",
        [orderId, crypto.randomBytes(32).toString('hex')]
      );
    } finally {
      conn.release();
    }

    // 1. Unauthorized user tries to approve -> must be rejected
    await handleCallbackQuery(
      {
        id: 'query-1',
        from: { id: 999999999, first_name: 'Hacker' },
        message: { message_id: 101, chat: { id: -5594368545 }, caption: 'Order: ' + orderId },
        data: `A:${orderId}`
      },
      { token, targetChatId, adminSet }
    );
    assert.equal(answers.length, 1);
    assert.match(answers[0].text, /ไม่มีสิทธิ์/);
    assert.equal(answers[0].show_alert, true);

    // Verify order is still PENDING_REVIEW
    const [check1] = await db.execute("SELECT status FROM blitz_topup_order WHERE order_id = ?", [orderId]);
    assert.equal(check1[0].status, 'PENDING_REVIEW');

    // 2. Authorized admin approves
    const adminId = [...adminSet][0] || '1132460154';
    await handleCallbackQuery(
      {
        id: 'query-2',
        from: { id: Number(adminId), first_name: 'AdminLift', username: 'lift' },
        message: { message_id: 101, chat: { id: -5594368545 }, caption: 'Order: ' + orderId },
        data: `A:${orderId}`
      },
      { token, targetChatId, adminSet }
    );

    assert.equal(answers.length, 2);
    assert.match(answers[1].text, /อนุมัติแล้ว/);

    assert.equal(editedCaptions.length, 1);
    assert.match(editedCaptions[0].caption, /APPROVED/);
    assert.deepEqual(editedCaptions[0].reply_markup, { inline_keyboard: [] }, 'Buttons removed');

    // Verify order in database is now APPROVED
    const [check2] = await db.execute("SELECT status FROM blitz_topup_order WHERE order_id = ?", [orderId]);
    assert.equal(check2[0].status, 'APPROVED');

    // Verify bank transfer and admin action
    const [transfers] = await db.execute("SELECT * FROM blitz_local_bank_transfers WHERE order_id = ?", [orderId]);
    assert.equal(transfers.length, 1);
    assert.match(transfers[0].bank_reference, /^TG:/);

    const [actions] = await db.execute("SELECT * FROM blitz_topup_admin_action WHERE order_id = ?", [orderId]);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].decision, 'APPROVED');

    // 3. Second click on already approved order -> rejected with status alert
    await handleCallbackQuery(
      {
        id: 'query-3',
        from: { id: Number(adminId), first_name: 'AdminLift', username: 'lift' },
        message: { message_id: 101, chat: { id: -5594368545 }, caption: 'Order: ' + orderId },
        data: `A:${orderId}`
      },
      { token, targetChatId, adminSet }
    );
    assert.equal(answers.length, 3);
    assert.match(answers[2].text, /ไม่อยู่ในสถานะรอตรวจสอบ/);

    // 4. Test Reject on a new order
    const orderId2 = crypto.randomUUID();
    const conn2 = await db.getConnection();
    try {
      await conn2.execute(
        "INSERT INTO blitz_topup_order(order_id, account_name, character_id, package_id, package_name, price_thb, coins, bonus_coins, status, created_at, expires_at, status_changed_at) VALUES(?, 'test1', 268482486, 1, '100 Coin', 100, 100, 0, 'PENDING_REVIEW', NOW(6), DATE_ADD(NOW(6), INTERVAL 30 MINUTE), NOW(6))",
        [orderId2]
      );
    } finally {
      conn2.release();
    }

    await handleCallbackQuery(
      {
        id: 'query-4',
        from: { id: Number(adminId), first_name: 'AdminLift', username: 'lift' },
        message: { message_id: 102, chat: { id: -5594368545 }, caption: 'Order: ' + orderId2 },
        data: `R:${orderId2}`
      },
      { token, targetChatId, adminSet }
    );

    assert.equal(answers.length, 4);
    assert.match(answers[3].text, /ปฏิเสธคำสั่งซื้อ/);

    const [check3] = await db.execute("SELECT status FROM blitz_topup_order WHERE order_id = ?", [orderId2]);
    assert.equal(check3[0].status, 'REJECTED');

    // Clean up test orders
    await db.execute("DELETE FROM blitz_local_bank_transfers WHERE order_id = ?", [orderId]);
    await db.execute("DELETE FROM blitz_topup_admin_action WHERE order_id IN (?, ?)", [orderId, orderId2]);
    await db.execute("DELETE FROM blitz_local_slips WHERE order_id IN (?, ?)", [orderId, orderId2]);
    await db.execute("DELETE FROM blitz_topup_order WHERE order_id IN (?, ?)", [orderId, orderId2]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
