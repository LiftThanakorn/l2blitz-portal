# รายงานสิ่งที่ยังรอข้อมูลและตรวจสอบจากเครื่อง GameServer จริง (Pending GameServer Verification Report)

เนื่องจากปัจจุบันพัฒนาแยกเป็นอิสระโดยยังไม่ได้เชื่อมต่อเครื่องพัฒนา GameServer จริงของ **L2BLITZ PVP** รายการต่อไปนี้คือจุดที่ได้เตรียมโครงสร้างรองรับไว้เรียบร้อยแล้ว และต้องตรวจสอบ/ใส่ค่าจริงก่อนเปิดให้บริการ Production:

---

## 1. พิกัดจุดวาร์ปและกติกาการเข้าห้องบอส Queen Ant (`29001`) และ Baium (`29020`)
- **สถานะปัจจุบัน**: ระบบแสดงป้ายกำกับ `Custom Warp` และข้อความแจ้งเตือนผู้เล่นในหน้า Raid Boss ([`shared/staticGameContent.ts`](../shared/staticGameContent.ts))
- **สิ่งที่ต้องตรวจสอบจาก GameServer จริง**:
  1. พิกัด `X, Y, Z` ของ Gatekeeper / Community Board Teleport ที่วาร์ปไปหน้าห้อง Queen Ant และ Baium
  2. การจำกัดเลเวลตัวละครในโซน The Ant Nest (บอส Lv.40 แต่ผู้เล่น High Five Lv.85 — ตรวจสอบว่าปรับเลเวล Queen Ant เป็น Lv.80–85 หรือปิดคำสาป Raid Curse หรือไม่)
  3. เงื่อนไขไอเทมเข้าห้อง Baium (ต้องใช้ `Blooded Fabric` หรือเปิดวาร์ปตรงเข้าห้องบอสผ่าน Community Board)

## 2. ค่าเวลาเกิดใหม่ของบอส (2–3 Days Respawn Policy)
- **สถานะปัจจุบัน**: API อ่านค่า `respawn_time` และ `status` จากตาราง `grandboss_data` และ `raidboss_spawnlist` โดยตรง และ **ไม่คาดเดาเวลาเกิดเด็ดขาด** หากค่าในฐานข้อมูลไม่ปรากฏ
- **สิ่งที่ต้องตรวจสอบจาก GameServer จริง**:
  1. ตรวจสอบไฟล์ `GrandBoss.ini` ใน `L2J_Mobius_CT_2.6_HighFive/dist/game/config/` เพื่อยืนยันชั่วโมง `IntervalOf...Spawn` (เช่น 48 ชั่วโมง หรือ 72 ชั่วโมง) และ `RandomOf...Spawn` (ช่วงเวลาสุ่มบวกลบกี่ชั่วโมง)
  2. ตรวจสอบว่ามีตารางเสริมหรือ Custom Script ที่บันทึก `last_kill_time` แยกต่างหากหรือไม่ (เนื่องจากตารางมาตรฐานของ L2J Mobius เก็บเฉพาะ `respawn_time`)

## 3. การซิงก์ข้อมูลมอนสเตอร์และอัตราดรอปจากไฟล์ XML ของโซนฟาร์ม
- **สถานะปัจจุบัน**: หน้า Farm Zone แสดงโครงสร้างโซนเริ่มต้น, Dragon Valley และ Lair of Antharas (LOA) พร้อมป้ายกำกับ `รอซิงก์อัตราจริงจาก XML`
- **สิ่งที่ต้องตรวจสอบจาก GameServer จริง**:
  1. ไฟล์ XML ใน `dist/game/data/stats/npcs/custom/` และ `dist/game/data/spawns/`
  2. รหัสไอเทมเหรียญฟาร์มพิเศษ (Custom Farm Coin / PvP Craft Token Item ID) และเปอร์เซ็นต์การดรอปจริง

## 4. ตารางบันทึกสถิติกิจกรรม Team vs Team (TvT)
- **สถานะปัจจุบัน**: ใน `L2J_Mobius_CT_2.6_HighFive` มาตรฐาน กิจกรรม TvT (`TeamVersusTeam.ini`) จะทำงานในหน่วยความจำ (In-Memory) โดยไม่มีตาราง SQL เก็บประวัติผู้ชนะระยะยาว
- **สิ่งที่ต้องตรวจสอบจาก GameServer จริง**:
  1. รอบเวลาจริงใน `TvTEventInterval` และไอเทมรางวัลใน `TvTEventReward`
  2. หากเซิร์ฟเวอร์ L2Blitz มีการเขียน Java Script เสริมเพื่อบันทึกยอดสังหาร TvT ลงใน `character_variables` หรือตารางเฉพาะ ให้เปิด `ENABLE_TVT_RANKINGS=true` และผูกชื่อคอลัมน์ใน [`backend/src/dal/mobiusRepository.ts`](../backend/src/dal/mobiusRepository.ts)

## 5. ลิงก์ดาวน์โหลดจริงและค่า SHA-256 Checksum
- **สถานะปัจจุบัน**: ปุ่มดาวน์โหลดในหน้า `/downloads` ถูกตั้งค่า `url: null` (แสดงสถานะ `รออัปเดตลิงก์ดาวน์โหลดจริง`) ตามกฎห้ามสร้างลิงก์ปลอม
- **สิ่งที่ต้องดำเนินการก่อนเปิดดาวน์โหลด**:
  - อัปเดต `url` และ `sha256` ของ **L2Blitz Launcher**, **Full Client** และ **System Patch** ในไฟล์ [`src/config/siteConfig.ts`](../src/config/siteConfig.ts)

## 6. รายชื่อบัญชีและตัวละครของทีมงาน (GM / Test Accounts)
- **สถานะปัจจุบัน**: กรองด้วย `accesslevel = 0`, `deletetime = 0` และรายการชื่อใน `.env` (`EXCLUDED_ACCOUNT_NAMES`, `EXCLUDED_CHAR_NAMES`)
- **สิ่งที่ต้องดำเนินการ**:
  - ระบุชื่อบัญชีทดสอบของทีมงานทั้งหมดลงในตัวแปร `EXCLUDED_ACCOUNT_NAMES` และ `EXCLUDED_CHAR_NAMES` บนเครื่อง Production VPS เพื่อไม่ให้ตัวละครทดสอบติดอันดับ PvP/PK แม้จะตั้ง `accesslevel = 0`
