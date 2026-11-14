import React from 'react';
import { ArrowDownToLine, ExternalLink, FolderOpen, HardDrive, RefreshCw, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DOWNLOAD_RELEASE, googleDriveUrl } from '../config/downloads';

const installSteps = [
  {
    titleTh: 'เปิดโฟลเดอร์ Google Drive', titleEn: 'Open the Google Drive folder',
    detailTh: 'กดปุ่มดาวน์โหลดด้านบน แล้วเลือกไฟล์ตัวเกมที่เผยแพร่ในโฟลเดอร์',
    detailEn: 'Use the download button above and choose the game files in the folder.',
  },
  {
    titleTh: 'ดาวน์โหลดไฟล์ให้ครบ', titleEn: 'Download all required files',
    detailTh: 'ตรวจสอบว่าไฟล์เกมดาวน์โหลดครบก่อนเริ่มติดตั้ง',
    detailEn: 'Make sure the required game files finish downloading before installation.',
  },
  {
    titleTh: 'แตกไฟล์หรือติดตั้งเกม', titleEn: 'Extract or install the game',
    detailTh: 'ทำตามรูปแบบไฟล์ที่ดาวน์โหลด หากเป็น .7z ให้ใช้ 7-Zip แตกไฟล์',
    detailEn: 'Follow the downloaded file format; use 7-Zip if it is a .7z archive.',
  },
  {
    titleTh: 'เปิด Launcher และอัปเดต', titleEn: 'Launch and update',
    detailTh: 'เปิด Launcher จากไฟล์เกม แล้วตรวจสอบและอัปเดตแพตช์ก่อนเข้าเล่น',
    detailEn: 'Run the included launcher, verify the game files, and apply updates before playing.',
  },
] as const;

export function DownloadsPage() {
  const { t } = useLanguage();
  const downloadHref = googleDriveUrl(DOWNLOAD_RELEASE.folderUrl);

  return (
    <div className="editorial-frame pt-10 pb-20">
      <header className="editorial-axis-grid items-end pb-12 lg:pb-16">
        <div className="col-span-12 lg:col-span-5">
          <p className="small-note text-[#E97540] font-semibold m-0">L2BLITZ / HIGH FIVE / DOWNLOAD</p>
          <p className="body-copy text-[#77736C] mt-4">
            {t('ดาวน์โหลดตัวเกม L2BLITZ ผ่าน Google Drive เพียงช่องทางเดียว พร้อมวิธีติดตั้งในหน้านี้',
              'Download L2BLITZ from one Google Drive folder, with installation instructions below.')}
          </p>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <h1 className="display-title">{t('ดาวน์โหลด', 'Download')}<br />L2BLITZ</h1>
        </div>
      </header>
      <section className="surface-white p-7 sm:p-12 mb-8" aria-labelledby="download-client">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="small-note text-[#E97540] font-semibold m-0">01 / OFFICIAL DOWNLOAD</p>
          <span className="small-note bg-[#F0EDE7] px-3 py-1.5">
            {t('ลิงก์ดาวน์โหลดเดียว', 'Single download link')}
          </span>
        </div>
        <div className="mt-9 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/assets/icons/google-drive.webp" alt="Google Drive" width={42} height={40}
                loading="lazy" className="w-[42px] h-10 object-contain" />
              <span className="small-note text-[#77736C]">GOOGLE DRIVE</span>
            </div>
            <h2 id="download-client" className="section-heading">
              {t('ดาวน์โหลดไฟล์เกม', 'Download game files')}
            </h2>
            <p className="body-copy text-[#77736C] mt-4 mb-0 max-w-[620px]">
              {t('เปิดโฟลเดอร์ Google Drive เพื่อดาวน์โหลดตัวเกมและไฟล์ที่เกี่ยวข้องจากแหล่งเดียว',
                'Open the Google Drive folder for game files and related downloads in one place.')}
            </p>
          </div>
          {downloadHref ? (
            <a href={downloadHref} target="_blank" rel="noopener noreferrer"
              className="btn-primary min-w-[240px] justify-between shrink-0"
              aria-label={t('เปิดโฟลเดอร์ดาวน์โหลด L2BLITZ บน Google Drive', 'Open L2BLITZ Google Drive download folder')}>
              {t('ดาวน์โหลด L2BLITZ', 'Download L2BLITZ')}
              <ExternalLink size={19} aria-hidden="true" />
            </a>
          ) : (
            <div className="small-note text-[#77736C]" role="status">
              {t('ลิงก์ดาวน์โหลดไม่พร้อมใช้งาน', 'Download link unavailable')}
            </div>
          )}
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-8 surface-stone p-7 sm:p-10" aria-labelledby="install-guide">
          <p className="small-note text-[#E97540] font-semibold mb-3">02 / INSTALLATION GUIDE</p>
          <h2 id="install-guide" className="section-heading">
            {t('วิธีดาวน์โหลดและติดตั้ง', 'Download and installation guide')}
          </h2>
          <ol className="list-none m-0 mt-7 p-0 divide-y divide-[#DDD7CD]">
            {installSteps.map((step, index) => (
              <li key={step.titleEn} className="flex gap-5 py-5 first:pt-0">
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
        <aside className="lg:col-span-4 surface-white p-7 sm:p-9" aria-labelledby="before-play">
          <p className="small-note text-[#E97540] font-semibold mb-3">BEFORE YOU PLAY</p>
          <h2 id="before-play" className="text-[24px] font-semibold">{t('เตรียมให้พร้อม', 'Before you begin')}</h2>
          <div className="mt-7 space-y-6">
            {[
              { Icon: FolderOpen, th: 'เก็บไฟล์เกมไว้ในโฟลเดอร์ที่หาเจอง่าย', en: 'Keep game files in an accessible folder' },
              { Icon: HardDrive, th: 'เตรียมพื้นที่ว่างให้เพียงพอสำหรับไฟล์เกม', en: 'Allow enough disk space for the game files' },
              { Icon: RefreshCw, th: 'อัปเดตแพตช์ผ่าน Launcher ก่อนเล่น', en: 'Update the game through the launcher before playing' },
              { Icon: ShieldCheck, th: 'ตรวจสอบไฟล์จากโฟลเดอร์ที่ประกาศไว้', en: 'Use the published download folder' },
            ].map(({ Icon, th, en }) => (
              <div key={en} className="flex items-start gap-3">
                <Icon size={20} className="text-[#C4531E] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="small-note text-[#524E48] m-0">{t(th, en)}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
