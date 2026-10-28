# L2BLITZ PVP — Lineage II High Five Instant PvP Portal (v1.0)

พอร์ทัลข้อมูลเกมแบบ Full-Stack สำหรับเซิร์ฟเวอร์ **L2BLITZ PVP — Lineage II High Five (CT 2.6) Instant PvP Server (Thailand)** พัฒนาตามสถาปัตยกรรม **Read-Only Game Information Portal** ที่แยกส่วน Static Content ออกจาก Live Game Data และพร้อมเชื่อมต่อฐานข้อมูล **L2J Mobius CT 2.6 High Five** ทันที

---

## 1. โครงสร้างเทคโนโลยี (Technology Stack)

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Lucide Icons, React Router v7 (รองรับ 2 ภาษา ไทย/อังกฤษ เริ่มต้นด้วยภาษาไทย)
- **Backend API**: Node.js LTS, Express.js + TypeScript, `mysql2/promise`, Zod Schema Validation
- **Caching & Performance**: In-Memory TTL Cache พร้อมระบบ Stale-While-Error และ IP Rate Limiter (ไม่ต้องพึ่งพา Redis หรือบริการที่กิน RAM เพิ่ม)
- **Deployment Target**:
  - Frontend: **Cloudflare Pages Free** (`dist/`)
  - Backend API: **Ubuntu VPS** (`systemd` + `Nginx` Reverse Proxy) ร่วมกับ MySQL/MariaDB ของ L2J Mobius

---

## 2. วิธีติดตั้งและเปิดใช้งานโหมด Preview (Development / Demo Mode)

ปัจจุบันสามารถรันเว็บไซต์และ API ในโหมด **Preview / Demo Mode** ได้ทันทีโดยไม่ต้องเชื่อมต่อเครื่อง GameServer:

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. คัดลอกไฟล์ตั้งค่าสภาพแวดล้อม (ค่าเริ่มต้นเปิด DEMO_MODE=true สำหรับทดสอบ)
cp .env.example .env

# 3. รันทั้ง Backend API (พอร์ต 3001) และ Frontend Vite Dev Server (พอร์ต 5173) พร้อมกัน
npm run dev
```

- **Frontend Preview URL**: `http://localhost:5173`
- **Backend API Base URL**: `http://127.0.0.1:3001/api`

### คำสั่งตรวจสอบคุณภาพโค้ดและสร้างไฟล์ Production

```bash
# ตรวจสอบ TypeScript ทั้งฝั่ง Frontend และ Backend
npm run typecheck

# รัน Automated Tests (Vitest + Supertest)
npm test

# สร้างไฟล์ Production Build (Frontend -> dist/, Backend -> dist-server/)
npm run build
```

---

## 3. การแก้ไขข้อมูลเซิร์ฟเวอร์ (Config-Driven Content)

- **การปรับเปลี่ยนอัตราเรท, การตีบวก, ชุดเริ่มต้น, โซนฟาร์ม และลิงก์ดาวน์โหลด**:
  แก้ไขได้ที่ไฟล์ [`src/config/siteConfig.ts`](src/config/siteConfig.ts) และ [`shared/staticGameContent.ts`](shared/staticGameContent.ts) หรือตั้งค่าผ่านตัวแปรใน `.env` สำหรับ API
- **นโยบายลิงก์ดาวน์โหลด**:
  ในไฟล์ [`src/config/siteConfig.ts`](src/config/siteConfig.ts) ค่า `url` ของ Launcher และ Client ถูกตั้งเป็น `null` เพื่อป้องกันลิงก์ปลอม เมื่อได้ลิงก์ CDN จริงแล้วให้นำ URL (`https://...`) และค่า `sha256` มาใส่ ปุ่มดาวน์โหลดจะเปิดใช้งานอัตโนมัติ

---

## 4. เอกสารเพิ่มเติมในโปรเจกต์

- [เอกสาร API และโครงสร้างตาราง SQL (`docs/API.md`)](docs/API.md)
- [คู่มือการติดตั้งใช้งานจริงบน Cloudflare Pages และ Ubuntu VPS (`docs/DEPLOYMENT.md`)](docs/DEPLOYMENT.md)
- [รายงานสิ่งที่ยังรอตรวจสอบจากเครื่อง GameServer จริง (`docs/PENDING_GAMESERVER_VERIFICATION.md`)](docs/PENDING_GAMESERVER_VERIFICATION.md)
