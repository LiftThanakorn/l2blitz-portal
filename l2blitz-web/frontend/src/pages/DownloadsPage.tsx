import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export function DownloadsPage() {
  const { t } = useLanguage();

  return (
    <div className="editorial-frame pt-10 pb-16">
      {/* Masthead */}
      <div className="editorial-axis-grid items-end pb-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">
            {t('ไคลเอนต์และลอนเชอร์ (Lineage II High Five CT 2.6)', 'Client Distribution & Patch Guide')}
          </p>
          <p className="body-copy text-[#77736C] mt-3">
            {t(
              'หน้าสำหรับดาวน์โหลดลอนเชอร์อัปเดตอัตโนมัติ ตัวเกมเต็มรูปแบบ ขั้นตอนการติดตั้ง การซ่อมแซมไฟล์ ความต้องการของระบบ และวิธีแก้ไขปัญหาเบื้องต้น (ไม่มีการวางลิงก์ดาวน์โหลดปลอม)',
              'Distribution portal for the L2BLITZ auto-updater launcher, full High Five CT 2.6 client archive, installation instructions, system requirements, and troubleshooting. No fake download links are provided.'
            )}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">
            {t('ดาวน์โหลดตัวเกม', 'Client & Patch')}
            <br />
            {t('และคู่มือติดตั้ง', 'Distribution')}
          </h1>
        </div>
      </div>

      {/* Distribution Packages · Honest Pending Verification Status (Zero Fake Links) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-20">
        {/* Card 1: L2BLITZ Auto-Updater Launcher */}
        <article className="surface-ink p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="small-note text-[#E97540] font-semibold">
                {t('แนะนำสำหรับผู้ที่มีตัวเกม High Five อยู่แล้ว', 'RECOMMENDED FOR EXISTING H5 CLIENTS')}
              </span>
              <span className="small-note text-[#E8E3DB] tabular-nums">v1.0 (CT 2.6)</span>
            </div>

            <h2 className="section-heading text-[#F7F5F0] mt-4">
              {t('ลอนเชอร์อัปเดตอัตโนมัติ (L2BLITZ Launcher)', 'L2BLITZ Auto-Updater Launcher')}
            </h2>

            <p className="body-copy text-[#E8E3DB] mt-4">
              {t(
                'ตรวจสอบและซ่อมแซมโฟลเดอร์ system, systextures และ animations ให้ตรงกับเซิร์ฟเวอร์ L2BLITZ PVP โดยอัตโนมัติ พร้อมระบบป้องกันไฟล์แปลกปลอม',
                'Automatically verifies and synchronizes your system, systextures, and animations directories with the latest L2BLITZ PVP configuration.'
              )}
            </p>
          </div>

          <div className="pt-8 mt-8">
            <div className="bg-[#252320] p-4 mb-4">
              <p className="small-note text-[#E8E3DB] m-0">
                {t(
                  'สถานะไฟล์: รอการอัปโหลดและยืนยันค่าแฮช SHA-256 ของลอนเชอร์จากเซิร์ฟเวอร์จริง (ไม่เปิดลิงก์จำลอง)',
                  'Release Status: Pending official L2Blitz launcher binary upload & SHA-256 checksum verification.'
                )}
              </p>
            </div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="btn-primary w-full opacity-60 cursor-not-allowed"
            >
              {t('ลอนเชอร์อยู่ระหว่างรอเชื่อมโยงไฟล์จริง (Pending Release)', 'Launcher Binary Pending Release')}
            </button>
          </div>
        </article>

        {/* Card 2: Full Lineage II High Five Client */}
        <article className="surface-stone p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="small-note text-[#77736C] font-semibold">
                {t('ตัวเกมเต็มรูปแบบพร้อมใช้งาน', 'STANDALONE FULL CLIENT ARCHIVE')}
              </span>
              <span className="small-note text-[#1A1917] tabular-nums">~6.2 GB (ZIP)</span>
            </div>

            <h2 className="section-heading text-[#1A1917] mt-4">
              {t('ตัวเกมเต็มรูปแบบ (Full Client High Five)', 'Full Client · Lineage II High Five')}
            </h2>

            <p className="body-copy text-[#1A1917] mt-4">
              {t(
                'ตัวเกม Lineage II Chronicle 2.6: High Five ฉบับสมบูรณ์ ไม่ต้องติดตั้งแพตช์อื่นทับ เพียงแตกไฟล์ลงในไดรฟ์ SSD แล้วรันผ่านลอนเชอร์เพื่อเข้าเล่นได้ทันที',
                'Complete standalone Lineage II High Five (CT 2.6) client package. Extract directly to an SSD directory and launch via the L2BLITZ updater.'
              )}
            </p>
          </div>

          <div className="pt-8 mt-8">
            <div className="surface-white p-4 mb-4">
              <p className="small-note text-[#77736C] m-0">
                {t(
                  'สถานะมิเรอร์: รอระบุ URL ดาวน์โหลดตรง (Cloudflare R2 / Google Drive) จากผู้ดูแลระบบ',
                  'Mirror Status: Pending official CDN / mirror URL configuration by server administration.'
                )}
              </p>
            </div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="btn-ink w-full opacity-60 cursor-not-allowed"
            >
              {t('ไฟล์ตัวเกมเต็มอยู่ระหว่างรอระบุมิเรอร์จริง (Pending Mirror)', 'Full Client Mirror Pending Configuration')}
            </button>
          </div>
        </article>
      </section>

      {/* Installation & Patch/Repair Guide */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20" data-reveal>
        <div className="lg:col-span-6 surface-white p-8">
          <h2 className="text-[24px] font-semibold text-[#1A1917]">
            {t('ขั้นตอนการติดตั้งตัวเกม (Installation Guide)', 'Clean Installation Guide')}
          </h2>
          <ol className="mt-5 pl-5 flex flex-col gap-4 text-[#1A1917]">
            <li>
              <strong>{t('เตรียมพื้นที่จัดเก็บ:', 'Prepare Storage:')}</strong>{' '}
              {t(
                'สร้างโฟลเดอร์ชื่อภาษาอังกฤษ เช่น C:\\Games\\L2BlitzH5 (หลีกเลี่ยงการใช้ชื่อโฟลเดอร์ภาษาไทยเพื่อป้องกันข้อผิดพลาดของเอนจิน)',
                'Create an ASCII path such as C:\\Games\\L2BlitzH5 (avoid non-ASCII folder names to prevent Unreal Engine path errors).'
              )}
            </li>
            <li>
              <strong>{t('แตกไฟล์ตัวเกม:', 'Extract Client Archive:')}</strong>{' '}
              {t(
                'แตกไฟล์ Full Client High Five ลงในโฟลเดอร์ที่สร้างไว้ด้วยโปรแกรม 7-Zip หรือ WinRAR',
                'Extract the High Five Full Client archive into your target directory using 7-Zip or WinRAR.'
              )}
            </li>
            <li>
              <strong>{t('วางและรันลอนเชอร์:', 'Run L2BLITZ Launcher:')}</strong>{' '}
              {t(
                'วางไฟล์ L2BlitzLauncher.exe ลงในโฟลเดอร์หลักของเกม คลิกขวาเลือก Run as Administrator และกดปุ่ม Start',
                'Place L2BlitzLauncher.exe in the client root, run as Administrator, allow file verification to finish, and press Start.'
              )}
            </li>
          </ol>
        </div>

        <div className="lg:col-span-6 surface-white p-8">
          <h2 className="text-[24px] font-semibold text-[#1A1917]">
            {t('การอัปเดตแพตช์และซ่อมแซมไฟล์ (Patch & Repair Guide)', 'Patch & File Repair Procedure')}
          </h2>
          <ol className="mt-5 pl-5 flex flex-col gap-4 text-[#1A1917]">
            <li>
              <strong>{t('ลบโฟลเดอร์ system เก่า:', 'Clean Legacy System Folder:')}</strong>{' '}
              {t(
                'หากท่านนำตัวเกม High Five จากเซิร์ฟเวอร์อื่นมาใช้งาน ให้ลบโฟลเดอร์ system เดิมออกทั้งหมดก่อนรันลอนเชอร์',
                'If reusing an existing High Five client from another server, delete its existing /system folder completely before patching.'
              )}
            </li>
            <li>
              <strong>{t('สั่งตรวจสอบไฟล์ (Full Check):', 'Execute Full Check:')}</strong>{' '}
              {t(
                'เปิดลอนเชอร์แล้วกดปุ่ม Full Check เพื่อให้ระบบเปรียบเทียบขนาดและค่าแฮชของไฟล์ текстурและอินเทอร์เฟซใหม่ทั้งหมด',
                'Click "Full Check" in the launcher to verify checksums across /system, /systextures, and /animations.'
              )}
            </li>
            <li>
              <strong>{t('ตั้งค่ายกเว้นใน Windows Defender:', 'Windows Security Exclusion:')}</strong>{' '}
              {t(
                'เพิ่มโฟลเดอร์เกมเข้าในรายการ Exclusion ของโปรแกรมสแกนไวรัส เพื่อป้องกันการบล็อกไฟล์ L2.exe หรือระบบป้องกันบอท',
                'Add your client directory to Windows Defender Exclusions so L2.exe and anti-cheat modules are not quarantined.'
              )}
            </li>
          </ol>
        </div>
      </section>

      {/* System Requirements Table */}
      <section className="mb-20" data-reveal>
        <h2 className="section-heading mb-6">
          {t('ความต้องการของระบบ (System Requirements)', 'Hardware & OS Requirements')}
        </h2>
        <div className="surface-white overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('อุปกรณ์', 'Component')}</th>
                <th>{t('สเปกขั้นต่ำ (การฟาร์มทั่วไป)', 'Minimum (Standard Play)')}</th>
                <th>{t('สเปกแนะนำ (สงครามปราสาท & บอสใหญ่)', 'Recommended (Mass Siege & Grand Boss)')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold">CPU</td>
                <td>Intel Core i3 / AMD Ryzen 3 (High Single-Core Clock)</td>
                <td className="font-semibold text-[#E97540]">Intel Core i5 / AMD Ryzen 5 (3.8 GHz+)</td>
              </tr>
              <tr>
                <td className="font-semibold">RAM</td>
                <td>8 GB DDR4</td>
                <td>16 GB DDR4 / DDR5</td>
              </tr>
              <tr>
                <td className="font-semibold">GPU</td>
                <td>NVIDIA GTX 750 Ti / Radeon RX 560</td>
                <td>NVIDIA GTX 1650 / RTX Series (DirectX 9/11 Runtime)</td>
              </tr>
              <tr>
                <td className="font-semibold">Storage</td>
                <td>20 GB Free Space (HDD/SSD)</td>
                <td className="font-semibold text-[#E97540]">NVMe SSD (ลดอาการหน่วงขณะโหลดตัวละครจำนวนมาก)</td>
              </tr>
              <tr>
                <td className="font-semibold">OS</td>
                <td>Windows 10 (64-bit)</td>
                <td>Windows 10 / Windows 11 (64-bit) + DirectX End-User Runtimes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Troubleshooting Section */}
      <section className="surface-stone p-8 sm:p-12" data-reveal>
        <h2 className="section-heading mb-8">
          {t('การแก้ไขปัญหาที่พบบ่อย (Troubleshooting)', 'Common Client Troubleshooting')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="surface-white p-6">
            <h3 className="text-[18px] font-semibold text-[#1A1917]">
              {t('1. Critical Error ตั้งแต่เริ่มเข้าเกม', '1. Startup Critical Error / Option.ini')}
            </h3>
            <p className="body-copy text-[#77736C] mt-2">
              {t(
                'เกิดจากความละเอียดหน้าจอไม่ตรงกับมอนิเตอร์ ให้ลบไฟล์ Option.ini ในโฟลเดอร์ system แล้วเข้าเกมใหม่ ระบบจะสร้างค่าหน้าจอเริ่มต้นให้อัตโนมัติ',
                'Delete system/Option.ini to reset resolution and refresh-rate parameters if the client crashes immediately upon launch.'
              )}
            </p>
          </div>
          <div className="surface-white p-6">
            <h3 className="text-[18px] font-semibold text-[#1A1917]">
              {t('2. แจ้งเตือนขาดไฟล์ d3dx9_43.dll', '2. Missing DirectX 9 (d3dx9_43.dll)')}
            </h3>
            <p className="body-copy text-[#77736C] mt-2">
              {t(
                'Windows 10/11 บางเครื่องไม่มีไลบรารี DirectX 9 รุ่นเก่า ให้ติดตั้งแพ็กเกจ Microsoft DirectX End-User Runtimes (June 2010) และ Visual C++ Redistributable',
                'Install the official Microsoft DirectX End-User Runtimes (June 2010) and Visual C++ 2015–2022 Redistributable packages.'
              )}
            </p>
          </div>
          <div className="surface-white p-6">
            <h3 className="text-[18px] font-semibold text-[#1A1917]">
              {t('3. กดปุ่ม Start แล้วไม่มีหน้าต่างเกมขึ้น', '3. L2.exe Blocked After Pressing Start')}
            </h3>
            <p className="body-copy text-[#77736C] mt-2">
              {t(
                'ตรวจสอบ Windows Security > Protection History ว่าไฟล์ L2.exe ถูกกักกันหรือไม่ ให้กด Restore และตั้งค่า Run as Administrator ที่ตัวลอนเชอร์',
                'Check Windows Security Protection History to restore any quarantined client binary and run the launcher as Administrator.'
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
