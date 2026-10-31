import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownToLine, ArrowRight, ExternalLink, FileArchive,
  FolderOpen, HardDrive, Info, MonitorDown, RefreshCw, ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DOWNLOAD_RELEASE, googleDriveUrl, publicDownloadUrl } from '../config/downloads';

const installSteps = [
  {
    titleTh: 'ดาวน์โหลดไฟล์เกม', titleEn: 'Download the game',
    detailTh: 'เลือก Google Drive เพียงหนึ่งลิงก์และดาวน์โหลดไฟล์ L2Blitz-Installer.7z ให้ครบ',
    detailEn: 'Choose one Google Drive mirror and download the complete L2Blitz-Installer.7z archive.',
  },
  {
    titleTh: 'แตกไฟล์ด้วย 7-Zip', titleEn: 'Extract with 7-Zip',
    detailTh: 'แตกไฟล์ไปยังโฟลเดอร์ที่ต้องการ เช่น D:\\Games\\L2Blitz',
    detailEn: 'Extract the archive to a folder such as D:\\Games\\L2Blitz.',
  },
  {
    titleTh: 'เปิด L2Blitz Launcher', titleEn: 'Open the launcher',
    detailTh: 'เปิด Launcher ที่อยู่ในตัวเกม หรือดาวน์โหลดแยกเมื่อเปิดให้บริการ',
    detailEn: 'Use the launcher included with the client or download it separately when available.',
  },
  {
    titleTh: 'ตรวจสอบและอัปเดต', titleEn: 'Verify and update',
    detailTh: 'ตรวจสอบ/ซ่อมแซมไฟล์เกม และอัปเดตแพตช์ก่อนเข้าเล่น',
    detailEn: 'Verify or repair game files and apply the latest patch.',
  },
  {
    titleTh: 'เริ่มเล่น L2BLITZ', titleEn: 'Launch L2BLITZ',
    detailTh: 'เมื่ออัปเดตเสร็จ กดเริ่มเกมผ่าน Launcher',
    detailEn: 'Start the game from the launcher when the update finishes.',
  },
] as const;

function DriveMirror({ id, href }: { id: string; href: string | null }) {
  const { t } = useLanguage();
  const inner = (
    <>
      <div className="flex items-center justify-between gap-2 mb-7">
        <img
          src="/assets/icons/google-drive.webp" alt="Google Drive"
          width={48} height={45} loading="lazy"
          className="block w-12 h-[45px] object-contain shrink-0"
        />
        <span className="small-note tabular-nums text-[#77736C]">MIRROR {id}</span>
      </div>
      <h4 className="text-[19px] font-semibold m-0">Google Drive</h4>
      <p className="small-note text-[#77736C] mt-1 mb-7">
        {t('ลิงก์ดาวน์โหลดตัวเกม', 'Full client download mirror')}
      </p>
      <div className={`flex items-center justify-between gap-2 border-t border-[#E8E3DB] pt-4 text-[14px] font-semibold ${href ? 'text-[#C4531E]' : 'text-[#77736C]'}`}>
        <span>{href ? t('ดาวน์โหลดตัวเกม', 'Download client') : t('รอเพิ่มลิงก์', 'Link coming soon')}</span>
        {href ? <ExternalLink size={17} aria-hidden="true" /> : <span aria-hidden="true">—</span>}
      </div>
    </>
  );
  const style = 'block h-full min-w-0 p-5 bg-[#F7F5F0] border border-[#E8E3DB] no-underline';
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer"
      aria-label={t(`ดาวน์โหลดผ่าน Google Drive ลิงก์ ${id}`, `Download from Google Drive mirror ${id}`)}
      className={style + ' hover:border-[#E97540] hover:bg-white transition-colors'}>
      {inner}
    </a>
  ) : (
    <div className={style} aria-label={t(`Google Drive ลิงก์ ${id} ยังไม่พร้อมดาวน์โหลด`, `Google Drive mirror ${id} is not yet available`)}>
      {inner}
    </div>
  );
}

export function DownloadsPage() {
  const { t } = useLanguage();
  const mirrors = DOWNLOAD_RELEASE.mirrors.map(({ id, url }) => ({ id, href: googleDriveUrl(url) }));
  const availableMirrors = mirrors.filter(({ href }) => href !== null).length;
  const launcherHref = publicDownloadUrl(DOWNLOAD_RELEASE.launcherUrl);
  const launcherUpgradeHref = publicDownloadUrl(DOWNLOAD_RELEASE.launcherUpgradeUrl);
  const launcherFixHref = publicDownloadUrl(DOWNLOAD_RELEASE.launcherFixUrl);
  const checksum = /^[a-f0-9]{64}$/i.test(DOWNLOAD_RELEASE.sha256) ? DOWNLOAD_RELEASE.sha256 : null;

  return (
    <div className="editorial-frame pt-10 pb-20">
      <header className="editorial-axis-grid items-end pb-12 lg:pb-16">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">L2BLITZ / HIGH FIVE / DOWNLOAD CENTER</p>
          <p className="body-copy text-[#77736C] mt-4">
            {t('ตัวเกมและ Launcher สำหรับ L2BLITZ พร้อมช่องทาง Google Drive และคู่มือติดตั้งในหน้าเดียว', 'L2BLITZ client, launcher, Google Drive mirrors, and installation guide in one place.')}
          </p>
          <p className="inline-flex items-center gap-2 mt-6 bg-white border border-[#E8E3DB] px-3 py-2 small-note text-[#524E48]">
            <span className="w-2 h-2 bg-[#E97540]" aria-hidden="true" />
            {availableMirrors
              ? t(`พร้อมดาวน์โหลด ${availableMirrors} จาก ${mirrors.length} ลิงก์`, `${availableMirrors} of ${mirrors.length} mirrors available`)
              : t('กำลังเตรียมลิงก์ Close Beta', 'Preparing Close Beta download links')}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">{t('ดาวน์โหลด', 'Download')}<br />L2BLITZ</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-14">
        <section className="lg:col-span-8 surface-white p-6 sm:p-9" aria-labelledby="download-client">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-7">
            <p className="small-note text-[#E97540] font-semibold m-0">01 / FULL GAME CLIENT</p>
            <span className="small-note bg-[#F0EDE7] px-3 py-1.5">{t('ติดตั้งเกมครั้งแรก', 'First-time installation')}</span>
          </div>
          <h2 id="download-client" className="section-heading">{t('ตัวเกมหลัก', 'Full Client')}</h2>
          <p className="body-copy text-[#77736C] mt-4 mb-8">
            {t('ดาวน์โหลดไฟล์เกมทั้งหมดจาก Google Drive เพียงลิงก์เดียว ไม่จำเป็นต้องโหลดทั้ง 2 ลิงก์', 'Download the full client from just one Google Drive mirror. You do not need both.')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 border-y border-[#E8E3DB] py-5 gap-5 sm:gap-4 mb-8">
            <div className="min-w-0">
              <p className="small-note text-[#77736C] mb-1">{t('ชื่อไฟล์', 'Archive')}</p>
              <p className="font-semibold text-[15px] break-all m-0">{DOWNLOAD_RELEASE.fileName}</p>
            </div>
            <div>
              <p className="small-note text-[#77736C] mb-1">{t('ขนาดไฟล์', 'File size')}</p>
              <p className="font-semibold text-[21px] tabular-nums m-0">{DOWNLOAD_RELEASE.fileSize}</p>
            </div>
            <div>
              <p className="small-note text-[#77736C] mb-1">{t('รุ่นสำหรับ', 'Release')}</p>
              <p className="font-semibold text-[21px] m-0">{DOWNLOAD_RELEASE.version}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <p className="small-note text-[#E97540] font-semibold mb-1">GOOGLE DRIVE MIRRORS</p>
              <h3 className="text-[23px] font-semibold">{t('เลือกช่องทางดาวน์โหลด', 'Choose a download mirror')}</h3>
            </div>
            <span className="small-note text-[#77736C] tabular-nums">
              {availableMirrors} / {mirrors.length} {t('ลิงก์พร้อม', 'mirrors ready')}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mirrors.map(({ id, href }) => <DriveMirror key={id} id={id} href={href} />)}
          </div>
          <div className="flex items-start gap-3 border-t border-[#E8E3DB] mt-7 pt-5">
            <Info size={18} aria-hidden="true" className="text-[#C4531E] shrink-0 mt-0.5" />
            <p className="small-note text-[#524E48] m-0">
              {availableMirrors
                ? t('หากลิงก์หนึ่งดาวน์โหลดช้าหรือถูกจำกัด ให้เลือก Mirror อื่นที่พร้อมใช้งาน', 'If one link is slow or rate-limited, use another available mirror.')
                : t('ช่องดาวน์โหลดเตรียมไว้แล้ว และจะเปิดใช้งานเมื่อมีลิงก์ไฟล์จริง', 'Download slots are ready and will activate once the actual file links are published.')}
            </p>
          </div>
        </section>

        <aside className="lg:col-span-4 surface-ink p-7 sm:p-9 flex flex-col justify-between" aria-labelledby="download-launcher">
          <div>
            <div className="flex items-center justify-between mb-10">
              <p className="small-note text-[#E97540] font-semibold m-0">02 / LAUNCHER & PATCH</p>
              <MonitorDown size={28} className="text-[#E97540]" aria-hidden="true" />
            </div>
            <h2 id="download-launcher" className="section-heading text-[#F7F5F0]">L2BLITZ<br />Launcher</h2>
            <p className="body-copy text-[#E8E3DB] mt-5">
              {t('ใช้เปิดเกม ตรวจสอบไฟล์ ซ่อมแซม และอัปเดตแพตช์ โดยไม่ต้องดาวน์โหลดตัวเกมใหม่ทุกครั้ง', 'Launch the game, verify files, repair issues, and update patches without re-downloading the full client.')}
            </p>
            <div className="mt-9 border-t border-[#57534E] divide-y divide-[#57534E]">
              {[
                { Icon: FileArchive, th: 'ตรวจสอบไฟล์เกม', en: 'Verify game files' },
                { Icon: ShieldCheck, th: 'ซ่อมแซมไฟล์', en: 'Repair files' },
                { Icon: RefreshCw, th: 'อัปเดตแพตช์', en: 'Patch updates' },
              ].map(({ Icon, th, en }) => (
                <div key={en} className="flex items-center gap-3 py-3 small-note text-[#E8E3DB]">
                  <Icon size={17} className="text-[#E97540] shrink-0" aria-hidden="true" />
                  {t(th, en)}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10">
            {launcherHref ? (
              <a className="btn-primary w-full justify-between" href={launcherHref} target="_blank" rel="noopener noreferrer">
                {t('ดาวน์โหลด Launcher', 'Download Launcher')}<ArrowDownToLine size={19} aria-hidden="true" />
              </a>
            ) : (
              <div className="flex items-center justify-between gap-2 px-5 py-4 bg-[#3A3733] text-[#E8E3DB] small-note" aria-label={t('ยังไม่มีลิงก์ Launcher', 'Launcher link unavailable')}>
                {t('รอลิงก์ Launcher', 'Launcher link coming soon')}<span aria-hidden="true">—</span>
              </div>
            )}
            {launcherUpgradeHref && (
              <div className="mt-6 border-t border-[#57534E] pt-6" aria-labelledby="launcher-upgrade-title">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 id="launcher-upgrade-title" className="text-[18px] font-semibold text-[#F7F5F0] m-0">
                    {t('อัปเกรด Launcher สำหรับผู้เล่นเก่า', 'Launcher upgrade for existing players')}
                  </h3>
                  <span className="small-note text-[#E8E3DB] shrink-0">{DOWNLOAD_RELEASE.launcherUpgradeVersion} · {DOWNLOAD_RELEASE.launcherUpgradeSize}</span>
                </div>
                <p className="small-note text-[#E8E3DB] mt-3 mb-4">
                  {t('อัปเดต Launcher รุ่นเดิมให้ตรวจอัปเดตตัวเองและแพตช์เกมอัตโนมัติ ใช้ไฟล์เกมเดิมได้ ไม่ต้องดาวน์โหลดใหม่ 7.58 GB', 'Enable automatic Launcher and game patch updates on your existing installation. No need to re-download the 7.58 GB game.')}
                </p>
                <a href={launcherUpgradeHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-[#E97540] text-[#171717] no-underline font-semibold text-[14px] hover:bg-[#F58A58] transition-colors"
                  aria-label={t('ดาวน์โหลดตัวอัปเกรด Launcher v1.1', 'Download Launcher upgrade v1.1')}>
                  <span>{t('ดาวน์โหลดตัวอัปเกรด Launcher v1.1', 'Download Launcher Upgrade v1.1')}</span>
                  <ArrowDownToLine size={18} className="shrink-0" aria-hidden="true" />
                </a>
                <p className="small-note text-[#E8E3DB] mt-3 mb-1">
                  {t('วิธีติดตั้ง: ปิดเกมและ Launcher → เปิดไฟล์อัปเกรด → เลือกโฟลเดอร์เกมเดิมที่มี system\\l2.exe (ไม่ใช่โฟลเดอร์ Launcher) → ติดตั้ง แล้วเปิด Launcher ใหม่', 'How to install: Close the game and Launcher → run the upgrade → select your existing game folder containing system\\l2.exe (not its Launcher subfolder) → install, then reopen Launcher.')}
                </p>
                <p className="small-note text-[#AFA99F] mt-2 mb-0 break-all" title="SHA-256">
                  SHA-256: {DOWNLOAD_RELEASE.launcherUpgradeSha256}
                </p>
              </div>
            )}
            {launcherFixHref && (
              <div className="mt-6 border-t border-[#57534E] pt-6" aria-labelledby="launcher-fix-title">
                <div className="flex items-center justify-between gap-3">
                  <h3 id="launcher-fix-title" className="text-[17px] font-semibold text-[#F7F5F0] m-0">
                    {t('ตัวแก้ปัญหา Launcher (Error 740)', 'Launcher Repair (Error 740)')}
                  </h3>
                  <span className="small-note text-[#E8E3DB] shrink-0">{DOWNLOAD_RELEASE.launcherFixSize}</span>
                </div>
                <p className="small-note text-[#E8E3DB] mt-3 mb-4">
                  {t('สำหรับผู้ที่ติดตั้งเกมแล้ว แต่เปิด Launcher ไม่ได้เนื่องจากต้องใช้สิทธิ์ผู้ดูแลระบบ', 'For players who have installed the game but cannot open the Launcher because Windows requests administrator privileges.')}
                </p>
                <a href={launcherFixHref} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-3 border border-[#E97540] text-[#F7F5F0] no-underline font-semibold text-[14px] hover:bg-[#3A3733] transition-colors"
                  aria-label={t('ดาวน์โหลดตัวแก้ Error 740', 'Download Error 740 repair')}>
                  <span>{t('ดาวน์โหลดตัวแก้ Error 740', 'Download Error 740 Fix')}</span>
                  <ArrowDownToLine size={18} className="text-[#E97540] shrink-0" aria-hidden="true" />
                </a>
                <p className="small-note text-[#E8E3DB] mt-3 mb-0">
                  {t('ปิด Launcher ก่อนติดตั้งตัวแก้ลงโฟลเดอร์เกมเดิม ไม่ต้องดาวน์โหลดตัวเกมใหม่', 'Close the Launcher, install the fix into your existing game folder, and keep your current game files.')}
                </p>
              </div>
            )}
            <p className="small-note text-[#E8E3DB] mt-4 mb-0">
              {t('ติดตั้งตัวเกมก่อน แล้วใช้ Launcher สำหรับตรวจสอบและอัปเดต', 'Install the full client first, then verify and update it with the launcher.')}
            </p>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-14">
        <section className="lg:col-span-8 surface-stone p-6 sm:p-9" aria-labelledby="install-guide">
          <p className="small-note text-[#E97540] font-semibold mb-3">03 / INSTALLATION GUIDE</p>
          <h2 id="install-guide" className="section-heading">{t('วิธีติดตั้ง', 'Installation guide')}</h2>
          <p className="body-copy text-[#77736C] mt-4 mb-7">
            {t('ทำตามขั้นตอนเพื่อเตรียมตัวเกมให้พร้อมเล่น', 'Follow these steps to prepare your game client.')}
          </p>
          <ol className="list-none m-0 p-0 divide-y divide-[#DDD7CD]">
            {installSteps.map((step, index) => (
              <li key={step.titleEn} className="flex gap-5 sm:gap-6 py-5 first:pt-0">
                <span className="text-[23px] font-semibold text-[#C4531E] tabular-nums shrink-0 w-9">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-[18px] font-semibold mb-1">{t(step.titleTh, step.titleEn)}</h3>
                  <p className="small-note text-[#524E48] m-0">{t(step.detailTh, step.detailEn)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <aside className="lg:col-span-4 surface-white p-7 sm:p-9" aria-labelledby="prerequisites">
          <p className="small-note text-[#E97540] font-semibold mb-3">BEFORE YOU PLAY</p>
          <h2 id="prerequisites" className="text-[24px] font-semibold">{t('เตรียมให้พร้อม', 'Before you begin')}</h2>
          <div className="mt-7 space-y-7">
            <div className="flex items-start gap-3">
              <HardDrive size={22} className="text-[#C4531E] shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="font-semibold text-[16px] m-0">{t('พื้นที่ว่างในเครื่อง', 'Free disk space')}</p>
                <p className="small-note text-[#77736C] mt-1 mb-0">{t('เตรียมพื้นที่เพิ่มเติมสำหรับแตกไฟล์ นอกเหนือจากไฟล์บีบอัด 7.58 GB', 'Allow additional space for extraction beyond the 7.58 GB archive.')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FolderOpen size={22} className="text-[#C4531E] shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="font-semibold text-[16px] m-0">{t('โปรแกรมแตกไฟล์', 'Archive extractor')}</p>
                <p className="small-note text-[#77736C] mt-1 mb-0">{t('ใช้ 7-Zip หรือโปรแกรมที่รองรับ .7z', 'Use 7-Zip or another .7z-compatible application.')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck size={22} className="text-[#C4531E] shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="font-semibold text-[16px] m-0">SHA-256</p>
                <p className="small-note text-[#77736C] mt-1 mb-0 break-all">{checksum || t('รอยืนยันค่าตรวจสอบไฟล์ฉบับเผยแพร่', 'Published archive checksum pending verification')}</p>
              </div>
            </div>
          </div>
          <div className="mt-9 pt-6 border-t border-[#E8E3DB]">
            <Link to="/info" className="inline-flex items-center gap-2 text-[#C4531E] no-underline text-[14px] font-semibold hover:underline">
              {t('ข้อมูลเซิร์ฟเวอร์', 'Server information')}<ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>

      <section className="surface-white border-l-4 border-[#E97540] px-6 py-6 sm:px-8" aria-label={t('หมายเหตุ Close Beta', 'Close Beta notice')}>
        <h2 className="text-[19px] font-semibold">{t('เตรียมพร้อมสำหรับ Close Beta', 'Preparing for Close Beta')}</h2>
        <p className="small-note text-[#524E48] mt-2 mb-0">
          {t('เมื่อเผยแพร่ไฟล์เกมและ Launcher พร้อมลิงก์จริงแล้ว ปุ่มดาวน์โหลดจะเปิดใช้งาน ตรวจสอบแพตช์ผ่าน Launcher ก่อนเข้าเล่นทุกครั้ง', 'Download links will become active when the actual client and launcher are published. Always check for patches through the launcher before playing.')}
        </p>
      </section>
    </div>
  );
}
