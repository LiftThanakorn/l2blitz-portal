# เอกสาร REST API — L2Blitz High Five Portal

API ทั้งหมดของ L2Blitz เป็นแบบ **Read-Only (`GET` เท่านั้น)** หากส่งคำขอ `POST`, `PUT`, `DELETE` หรือ `PATCH` ระบบจะปฏิเสธด้วย `405 Method Not Allowed` ทันที และในระดับ Data Access Layer ([`backend/src/dal/database.ts`](../backend/src/dal/database.ts)) จะอนุญาตเฉพาะคำสั่ง `SELECT` เท่านั้น

---

## 1. โครงสร้าง Metadata มาตรฐาน (`meta`)

ทุก Endpoint จะส่งอ็อบเจกต์ `meta` กลับมาด้วยเสมอ เพื่อให้ Frontend แยกแยะระหว่างข้อมูลสด ข้อมูลแคช ข้อมูลจำลอง (Demo) และสถานะเซิร์ฟเวอร์ไม่พร้อมใช้งานได้อย่างแม่นยำ:

```json
{
  "meta": {
    "mode": "live | stale | demo | unavailable",
    "isDemo": false,
    "updatedAt": "2026-10-28T05:10:00.000Z",
    "serverTime": "2026-10-28T05:10:12.000Z",
    "cached": true,
    "cacheTtlSeconds": 60,
    "warning": "Optional diagnostic message"
  }
}
```

- `updatedAt`: เวลาที่ดึงข้อมูลจากฐานข้อมูลล่าสุด (แยกออกจาก `serverTime` ซึ่งเป็นเวลาปัจจุบัน)
- ในโหมด **Production (`NODE_ENV=production`)**: `DEMO_MODE` จะถูกบังคับปิดเสมอ หากติดต่อฐานข้อมูลหรือ GameServer ไม่ได้ ระบบจะคืนค่า `mode: "unavailable"` และค่าตัวเลขเป็น `null` (ไม่สร้างตัวเลขสมมติเด็ดขาด)

---

## 2. รายการ Endpoints ทั้งหมด

### 2.1 `GET /api/health`
ตรวจสอบสถานะของ API, ฐานข้อมูล MySQL, GameServer (TCP Port 7777) และ LoginServer (TCP Port 2106)
- **Cache TTL**: 15 วินาที

### 2.2 `GET /api/server/status`
คืนค่าสถานะการเชื่อมต่อแยกกันอย่างชัดเจนระหว่าง `gameServer`, `loginServer` และ `database` พร้อมจำนวนผู้เล่นออนไลน์ (`playersOnline`)
- **กฎความถูกต้อง**: หาก `database` ออนไลน์แต่ `gameServer` ออฟไลน์ ค่า `playersOnline` จะคืนเป็น `null` เพื่อไม่ให้นับตัวละครที่ค้าง `online = 1` ในฐานข้อมูล

### 2.3 `GET /api/server/stats`
คืนค่าสถิติรวมของเซิร์ฟเวอร์:
- `playersOnline`, `totalAccounts`, `totalCharacters`, `totalClans`, `maxLevelCount` (นับตัวละครเลเวล 85 ตามเพดาน High Five), `noblesseCount`, `activeHeroesCount`, `nextSiege`
- **Cache TTL**: 60 วินาที

### 2.4 `GET /api/server/rates`
คืนค่าอัตราเรทเซิร์ฟเวอร์ (EXP, SP, Adena, Drop, Spoil) และขีดจำกัดการตีบวก/ธาตุจากไฟล์ตั้งค่า `.env`

### 2.5 `GET /api/rankings/pvp` และ `GET /api/rankings/pk`
คืนค่าตารางอันดับสังหาร PvP (`characters.pvpkills`) และ PK (`characters.pkkills`)
- **Query Parameters**:
  - `page` (ค่าเริ่มต้น `1`)
  - `limit` (ค่าเริ่มต้น `15`, สูงสุด `50`)
  - `classId` (กรองตามรหัสอาชีพ High Five `0–136` รองรับอาชีพเผ่า Kamael `123–136` ครบถ้วน)
  - `q` (ค้นหาชื่อตัวละคร)
- **เงื่อนไขการกรอง SQL**:
  - `c.accesslevel = 0` (ตัด GM ออกทั้งหมด)
  - `(c.deletetime = 0 OR c.deletetime IS NULL)` (ตัดตัวละครที่ลบแล้ว)
  - `LOWER(c.account_name) NOT IN (...)` และ `c.char_name NOT IN (...)` (ตัดบัญชีและตัวละครทดสอบตามที่ระบุใน `.env`)

### 2.6 `GET /api/rankings/clans`
คืนค่าอันดับแคลนจากตาราง `clan_data` ร่วมกับชื่อหัวหน้าแคลน (`characters.charId = clan_data.leader_id`), จำนวนสมาชิก และชื่อปราสาทที่ครอบครอง (`castle.id = clan_data.hasCastle`)

### 2.7 `GET /api/olympiad/heroes`
คืนค่ารายชื่อฮีโร่ปัจจุบันจากตาราง `heroes` (`played = 1`) เชื่อมกับ `characters` และ `clan_data` พร้อมรอบ Olympiad จาก `olympiad_data.current_cycle`

### 2.8 `GET /api/castles`
คืนค่าสถานะปราสาททั้ง 9 แห่งใน High Five (`Gludio`, `Dion`, `Giran`, `Oren`, `Aden`, `Innadril`, `Goddard`, `Rune`, `Schuttgart`) จากตาราง `castle` และ `clan_data`

### 2.9 `GET /api/raidbosses`
คืนค่าสถานะบอสจากตาราง `grandboss_data` และ `raidboss_spawnlist`:
- สถานะ: `alive`, `dead`, หรือ `unknown`
- **ห้ามคาดเดาเวลาเกิด**: แสดงเวลา `nextSpawnWindowStart` เฉพาะเมื่อ `respawn_time` ในฐานข้อมูลมีค่ามากกว่าเวลาปัจจุบันเท่านั้น

### 2.10 `GET /api/events/tvt`
คืนค่าตารางเวลากิจกรรม Team vs Team (TvT), กติกา และอันดับผู้เล่นเมื่อเปิดใช้งาน `ENABLE_TVT_RANKINGS=true`
