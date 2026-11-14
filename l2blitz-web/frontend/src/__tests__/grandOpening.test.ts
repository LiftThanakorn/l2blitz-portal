import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LaunchCountdown } from '../pages/HomePage';
import { LanguageProvider } from '../context/LanguageContext';

const renderNotice = (online: boolean) =>
  renderToStaticMarkup(React.createElement(MemoryRouter, null,
    React.createElement(LanguageProvider, null,
      React.createElement(LaunchCountdown, { online }))));

describe('Grand Opening status banner', () => {
  afterEach(() => vi.useRealTimers());

  it('announces online status after opening when the API confirms it', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-14T11:25:00Z'));
    const html = renderNotice(true);
    expect(html).toContain('GRAND OPENING · ONLINE');
    expect(html).toContain('เปิดให้บริการแล้ว');
    expect(html).not.toContain('LAUNCH TIME REACHED');
  });

  it('does not falsely claim online when the game status is unconfirmed', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-14T11:25:00Z'));
    const html = renderNotice(false);
    expect(html).toContain('CHECKING STATUS');
    expect(html).not.toContain('GRAND OPENING · ONLINE');
  });
});
