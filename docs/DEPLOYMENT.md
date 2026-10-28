# คู่มือการติดตั้งใช้งานจริง (Deployment Guide) — งบประหยัดไม่เกิน 500 บาท/เดือน

สถาปัตยกรรมของ L2Blitz ออกแบบมาเพื่อประหยัด RAM และ CPU สูงสุด โดยแยก **Static Frontend** ไปรันฟรีบน **Cloudflare Pages** และรันเฉพาะ **Lightweight Read-Only API** บน Ubuntu VPS เครื่องเดียวกับฐานข้อมูล L2J Mobius

---

## ส่วนที่ 1: การเตรียมฐานข้อมูล MySQL / MariaDB (Read-Only User)

1. ห้ามเปิดพอร์ต MySQL (`3306`) ออกสู่ Public Internet โดยเด็ดขาด ให้ตั้งค่าใน `/etc/mysql/mariadb.conf.d/50-server.cnf`:
   ```ini
   bind-address = 127.0.0.1
   ```
2. สร้างบัญชีผู้ใช้แบบอ่านอย่างเดียว (`SELECT` เท่านั้น) โดยรันสคริปต์ [`deploy/mysql/create-readonly-user.sql`](../deploy/mysql/create-readonly-user.sql):
   ```bash
   mysql -u root -p < deploy/mysql/create-readonly-user.sql
   ```

---

## ส่วนที่ 2: การติดตั้ง Backend API บน Ubuntu VPS

1. คัดลอกโปรเจกต์ไปยัง `/opt/l2blitz-portal` และสร้างไฟล์ Production Build:
   ```bash
   cd /opt/l2blitz-portal
   npm ci
   npm run build:api
   ```
2. สร้างไฟล์ `/opt/l2blitz-portal/.env` สำหรับ Production:
   ```ini
   NODE_ENV=production
   PORT=3001
   DEMO_MODE=false
   DB_ENABLED=true
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=l2blitz_readonly
   DB_PASSWORD=รหัสผ่านที่ตั้งไว้
   DB_GAME_NAME=l2jmobius_h5
   DB_LOGIN_NAME=l2jmobius_login
   DB_POOL_LIMIT=4
   GAMESERVER_HOST=127.0.0.1
   GAMESERVER_PORT=7777
   LOGINSERVER_HOST=127.0.0.1
   LOGINSERVER_PORT=2106
   CORS_ORIGIN=https://l2blitz.in.th
   ```
3. ติดตั้งบริการ `systemd` (จำกัดการใช้ RAM ไม่เกิน `180MB` อัตโนมัติ):
   ```bash
   sudo cp deploy/systemd/l2blitz-api.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now l2blitz-api.service
   sudo systemctl status l2blitz-api.service
   ```
4. ตั้งค่า Nginx Reverse Proxy พร้อม Rate Limiting:
   ```bash
   sudo cp deploy/nginx/l2blitz-api.conf /etc/nginx/sites-available/l2blitz-api.conf
   sudo ln -s /etc/nginx/sites-available/l2blitz-api.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

---

## ส่วนที่ 3: การติดตั้ง Frontend บน Cloudflare Pages (ฟรี)

1. เชื่อมต่อ Repository เข้ากับ **Cloudflare Pages**
2. ตั้งค่า Build Configuration:
   - **Build command**: `npm run build:web`
   - **Build output directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_BASE_URL`: `https://api.l2blitz.in.th/api`
     - `VITE_DEMO_FALLBACK`: `false`
3. ไฟล์ `public/_redirects` ที่เตรียมไว้ในโปรเจกต์จะจัดการ Client-side Routing ของ React Router ให้ทำงานได้ครบทุก URL โดยไม่ต้องใช้ SSR Runtime
