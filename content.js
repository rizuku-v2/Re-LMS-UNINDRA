/**
 * ╔══════════════════════════════════════════════════════╗
 * ║       LMS ULTRA REBORN v5.0 — Content Script        ║
 * ║       by RizukiDesz | rizuku.my.id                  ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * CHANGELOG v5.0:
 * - FIX UTAMA: Default tema sekarang LIGHT MODE
 * - FIX: Dark/light mode tidak bertabrakan dengan AdminLTE
 *   → Gunakan [class*="skin-"] di CSS + setInterval defense
 * - FIX: Dashboard & Presensi redesign (lebih robust, retry)
 * - FIX: Breadcrumbs di semua halaman (guard + retry)
 * - FIX: Profile page redesign (initProfilePage baru)
 * - FIX: Assignment dihilangkan dari halaman pertemuan
 * - FIX: Sidebar state via cookie (sinkron session)
 * - FIX: isApp detection lebih akurat
 * - FIX: injectDynamicThemeStyle → append to head end (always wins)
 * - NEW: activateBugFixes memakai setInterval 3 detik pertama
 * - NEW: Profile page redesign card layout
 * - CLEAN: Semua fungsi lebih terorganisir & bersih
 */

'use strict';

// ═══════════════════════════════════════════════════════
// §0 — KONFIGURASI
// ═══════════════════════════════════════════════════════
const RB = {
  version : '5.0',
  font    : 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
  base    : 'https://lms.unindra.ac.id',
  keys    : {
    sidebar  : 'rb_sb',
    autologin: 'rb_autologin_creds',
    theme    : 'isDark',
  },
};

// ═══════════════════════════════════════════════════════
// §1 — IKON SVG LIBRARY
// ═══════════════════════════════════════════════════════
const ICON = {
  menu      : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  dashboard : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
  courses   : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  attend    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>`,
  profile   : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  inbox     : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  help      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  logout    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  sun       : `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon      : `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  eye       : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  chevDown  : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevRight : `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  home      : `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  key       : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  settings  : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  refresh   : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  mail      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  forum     : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  task      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  fallback  : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  pdf       : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  download  : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  upload    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  clock     : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  check     : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  user      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  edit      : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
};

const MENU_ICON_MAP = {
  'dashboard': ICON.dashboard, 'beranda': ICON.dashboard, 'home': ICON.dashboard,
  'kuliah'   : ICON.courses,   'kelas'  : ICON.courses,
  'presensi' : ICON.attend,    'absensi': ICON.attend,
  'profil'   : ICON.profile,   'profile': ICON.profile,
  'pesan'    : ICON.inbox,     'masuk'  : ICON.inbox,
  'bantuan'  : ICON.help,      'help'   : ICON.help,
  'setting'  : ICON.settings,  'pengaturan': ICON.settings,
  'forum'    : ICON.forum,
  'tugas'    : ICON.task,
};

// ═══════════════════════════════════════════════════════
// §2 — UTILITAS
// ═══════════════════════════════════════════════════════
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const isDark = () => document.documentElement.classList.contains('dark');

function getMenuIcon(text = '') {
  const t = text.toLowerCase();
  for (const [key, ico] of Object.entries(MENU_ICON_MAP)) {
    if (t.includes(key)) return ico;
  }
  return ICON.fallback;
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function swalAlert(opts) {
  if (typeof Swal === 'undefined') {
    alert((opts.title || '') + (opts.text ? ': ' + opts.text : ''));
    return Promise.resolve({ isConfirmed: true });
  }
  return Swal.fire({
    background        : isDark() ? '#1e293b' : '#ffffff',
    color             : isDark() ? '#f8fafc' : '#0f172a',
    confirmButtonColor: '#3b82f6',
    customClass       : { popup: 'rb-swal-popup' },
    ...opts,
  });
}

function swalToast(message, type = 'success') {
  if (typeof Swal === 'undefined') return;
  Swal.mixin({
    toast: true, position: 'top-end',
    showConfirmButton: false, timer: 2800, timerProgressBar: true,
    background: isDark() ? '#1e293b' : '#ffffff',
    color     : isDark() ? '#f8fafc' : '#0f172a',
    customClass: { popup: 'rb-swal-toast' },
  }).fire({ icon: type, title: message });
}

// ═══════════════════════════════════════════════════════
// §3 — TEMA ENGINE (FIX: default LIGHT, aggressive AdminLTE defeat)
// ═══════════════════════════════════════════════════════

// List semua AdminLTE skin classes yang mungkin ada
const SKIN_CLASSES = [
  'skin-blue','skin-blue-light','skin-black','skin-black-light',
  'skin-purple','skin-purple-light','skin-yellow','skin-red','skin-green',
  'skin-orange','skin-teal',
];

/**
 * Inject/replace dynamic theme <style> tag.
 * Selalu di-append ke akhir <head> agar PASTI menang atas semua stylesheet lain.
 */
function injectDynamicThemeStyle(dark) {
  let el = document.getElementById('rb-dynamic-theme');
  if (!el) {
    el    = document.createElement('style');
    el.id = 'rb-dynamic-theme';
  }
  // KRITIS: Selalu pindah ke akhir <head> agar last-wins
  document.head.appendChild(el);

  const dark_css = dark ? `
    /* ── RB v5 DARK MODE OVERRIDE ── */
    html.rizuki-reborn-active body,
    html.rizuki-reborn-active body.rb-dark-body {
      background: #0f172a !important;
      color: #f1f5f9 !important;
    }
    /* Paksa kalahkan SEMUA skin variant */
    html.rizuki-reborn-active body.skin-blue,
    html.rizuki-reborn-active body.skin-blue-light,
    html.rizuki-reborn-active body.skin-black,
    html.rizuki-reborn-active body.skin-black-light,
    html.rizuki-reborn-active body.skin-purple,
    html.rizuki-reborn-active body.skin-purple-light,
    html.rizuki-reborn-active body.skin-yellow,
    html.rizuki-reborn-active body.skin-red,
    html.rizuki-reborn-active body.skin-green {
      background: #0f172a !important;
      color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active .wrapper,
    html.rizuki-reborn-active .content-wrapper,
    html.rizuki-reborn-active .right-side,
    html.rizuki-reborn-active .main-content {
      background: #0f172a !important;
      color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active .main-header,
    html.rizuki-reborn-active .main-header .navbar,
    html.rizuki-reborn-active .main-header .logo,
    html.rizuki-reborn-active .main-header .navbar-custom-menu,
    html.rizuki-reborn-active .main-header .navbar-left {
      background: #1e293b !important;
      border-color: #334155 !important;
      color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active .main-sidebar,
    html.rizuki-reborn-active .left-side,
    html.rizuki-reborn-active .sidebar {
      background: #1e293b !important;
      border-right-color: #334155 !important;
    }
    html.rizuki-reborn-active .sidebar-menu > li > a,
    html.rizuki-reborn-active .sidebar-menu li > a {
      color: #94a3b8 !important;
      border-color: transparent !important;
    }
    html.rizuki-reborn-active .sidebar-menu > li.active > a,
    html.rizuki-reborn-active .sidebar-menu > li:hover > a {
      background: rgba(96,165,250,.12) !important;
      color: #60a5fa !important;
    }
    html.rizuki-reborn-active .sidebar-menu li.header {
      color: #475569 !important;
      background: transparent !important;
    }
    html.rizuki-reborn-active .user-panel {
      background: transparent !important;
      border-color: #334155 !important;
    }
    html.rizuki-reborn-active .box,
    html.rizuki-reborn-active .card,
    html.rizuki-reborn-active .panel,
    html.rizuki-reborn-active .box.box-primary,
    html.rizuki-reborn-active .box.box-success,
    html.rizuki-reborn-active .box.box-info,
    html.rizuki-reborn-active .box.box-warning,
    html.rizuki-reborn-active .box.box-danger {
      background: #1e293b !important;
      border-color: #334155 !important;
      color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active .box-header,
    html.rizuki-reborn-active .box-body,
    html.rizuki-reborn-active .box-footer {
      background: transparent !important;
      color: #f1f5f9 !important;
      border-color: #334155 !important;
    }
    html.rizuki-reborn-active table,
    html.rizuki-reborn-active table.table {
      background: transparent !important;
      color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active table.table th {
      background: #162032 !important;
      color: #94a3b8 !important;
      border-color: #334155 !important;
    }
    html.rizuki-reborn-active table.table td {
      background: #1e293b !important;
      color: #f1f5f9 !important;
      border-color: #2d3f55 !important;
    }
    html.rizuki-reborn-active table.table-striped > tbody > tr:nth-of-type(odd) td {
      background: #162032 !important;
    }
    html.rizuki-reborn-active table.table-hover > tbody > tr:hover td {
      background: rgba(96,165,250,.08) !important;
    }
    html.rizuki-reborn-active .form-control,
    html.rizuki-reborn-active select,
    html.rizuki-reborn-active input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]),
    html.rizuki-reborn-active textarea {
      background: #0f172a !important;
      border-color: #334155 !important;
      color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active .form-control:focus,
    html.rizuki-reborn-active input:focus {
      border-color: #60a5fa !important;
      box-shadow: 0 0 0 3px rgba(96,165,250,0.2) !important;
    }
    html.rizuki-reborn-active select option {
      background: #1e293b !important;
      color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active .modal-content {
      background: #1e293b !important;
      border-color: #334155 !important;
      color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active .modal-header {
      border-bottom-color: #334155 !important;
    }
    html.rizuki-reborn-active .modal-body {
      background: #1e293b !important;
      color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active .modal-footer {
      background: #162032 !important;
      border-top-color: #334155 !important;
    }
    html.rizuki-reborn-active .main-footer,
    html.rizuki-reborn-active footer {
      background: #1e293b !important;
      border-top-color: #334155 !important;
      color: #94a3b8 !important;
    }
    html.rizuki-reborn-active h1, html.rizuki-reborn-active h2,
    html.rizuki-reborn-active h3, html.rizuki-reborn-active h4,
    html.rizuki-reborn-active h5, html.rizuki-reborn-active h6 {
      color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active p,
    html.rizuki-reborn-active td, html.rizuki-reborn-active th,
    html.rizuki-reborn-active li, html.rizuki-reborn-active label,
    html.rizuki-reborn-active small { color: #f1f5f9 !important; }
    html.rizuki-reborn-active a:not(.rb-btn-submit):not(.rb-btn-back):not(.rb-al-use) {
      color: #60a5fa !important;
    }
    html.rizuki-reborn-active hr { border-color: #334155 !important; }
    html.rizuki-reborn-active .progress { background: #334155 !important; }
    html.rizuki-reborn-active .info-box { background: #1e293b !important; border-color: #334155 !important; }
    html.rizuki-reborn-active .info-box-content { color: #f1f5f9 !important; }
    html.rizuki-reborn-active .nav-tabs { border-color: #334155 !important; }
    html.rizuki-reborn-active .nav-tabs > li > a {
      color: #94a3b8 !important; border-color: #334155 !important; background: transparent !important;
    }
    html.rizuki-reborn-active .nav-tabs > li.active > a {
      background: #1e293b !important; color: #60a5fa !important;
      border-color: #334155 #334155 #1e293b !important;
    }
    html.rizuki-reborn-active .tab-content {
      background: #1e293b !important; border-color: #334155 !important;
    }
    html.rizuki-reborn-active .alert { background: #1e293b !important; border-color: #334155 !important; }
    html.rizuki-reborn-active .well  { background: #162032 !important; border-color: #334155 !important; }
    html.rizuki-reborn-active .btn-default {
      background: #334155 !important; border-color: #475569 !important; color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active .btn-default:hover { background: #475569 !important; }
    html.rizuki-reborn-active .pagination > li > a,
    html.rizuki-reborn-active .pagination > li > span {
      background: #1e293b !important; border-color: #334155 !important; color: #f1f5f9 !important;
    }
    html.rizuki-reborn-active .breadcrumb { background: transparent !important; }
    html.rizuki-reborn-active .breadcrumb > li + li::before { color: #475569 !important; }
    html.rizuki-reborn-active .direct-chat-text {
      background: #1e293b !important; border-color: #334155 !important; color: #f1f5f9 !important;
    }
  ` : `
    /* ── RB v5 LIGHT MODE OVERRIDE ── */
    html.rizuki-reborn-active body,
    html.rizuki-reborn-active body.rb-light-body {
      background: #f1f5f9 !important;
      color: #0f172a !important;
    }
    html.rizuki-reborn-active body.skin-blue,
    html.rizuki-reborn-active body.skin-blue-light,
    html.rizuki-reborn-active body.skin-black,
    html.rizuki-reborn-active body.skin-black-light,
    html.rizuki-reborn-active body.skin-purple,
    html.rizuki-reborn-active body.skin-yellow,
    html.rizuki-reborn-active body.skin-red,
    html.rizuki-reborn-active body.skin-green {
      background: #f1f5f9 !important;
      color: #0f172a !important;
    }
    html.rizuki-reborn-active .wrapper,
    html.rizuki-reborn-active .content-wrapper,
    html.rizuki-reborn-active .right-side {
      background: #f1f5f9 !important;
      color: #0f172a !important;
    }
    html.rizuki-reborn-active .main-header,
    html.rizuki-reborn-active .main-header .navbar,
    html.rizuki-reborn-active .main-header .logo {
      background: #ffffff !important;
      border-color: #e2e8f0 !important;
      color: #0f172a !important;
    }
    html.rizuki-reborn-active .main-sidebar,
    html.rizuki-reborn-active .left-side {
      background: #ffffff !important;
      border-right-color: #e2e8f0 !important;
    }
    html.rizuki-reborn-active .sidebar-menu > li > a,
    html.rizuki-reborn-active .sidebar-menu li > a { color: #64748b !important; }
    html.rizuki-reborn-active .sidebar-menu > li.active > a,
    html.rizuki-reborn-active .sidebar-menu > li:hover > a {
      background: rgba(59,130,246,.08) !important;
      color: #3b82f6 !important;
    }
    html.rizuki-reborn-active .box,
    html.rizuki-reborn-active .card,
    html.rizuki-reborn-active .panel,
    html.rizuki-reborn-active .box.box-primary,
    html.rizuki-reborn-active .box.box-success,
    html.rizuki-reborn-active .box.box-info,
    html.rizuki-reborn-active .box.box-warning,
    html.rizuki-reborn-active .box.box-danger {
      background: #ffffff !important;
      border-color: #e2e8f0 !important;
      color: #0f172a !important;
    }
    html.rizuki-reborn-active .box-header,
    html.rizuki-reborn-active .box-body { background: transparent !important; color: #0f172a !important; }
    html.rizuki-reborn-active table.table th {
      background: #f8fafc !important; color: #64748b !important; border-color: #e2e8f0 !important;
    }
    html.rizuki-reborn-active table.table td {
      background: #ffffff !important; color: #0f172a !important; border-color: #e2e8f0 !important;
    }
    html.rizuki-reborn-active .form-control,
    html.rizuki-reborn-active select,
    html.rizuki-reborn-active input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]),
    html.rizuki-reborn-active textarea {
      background: #f8fafc !important; border-color: #e2e8f0 !important; color: #0f172a !important;
    }
    html.rizuki-reborn-active .modal-content { background: #ffffff !important; border-color: #e2e8f0 !important; }
    html.rizuki-reborn-active .modal-footer  { background: #f8fafc !important; }
    html.rizuki-reborn-active .main-footer, html.rizuki-reborn-active footer {
      background: #ffffff !important; border-top-color: #e2e8f0 !important;
    }
    html.rizuki-reborn-active h1, html.rizuki-reborn-active h2,
    html.rizuki-reborn-active h3, html.rizuki-reborn-active h4,
    html.rizuki-reborn-active h5, html.rizuki-reborn-active h6,
    html.rizuki-reborn-active p, html.rizuki-reborn-active td,
    html.rizuki-reborn-active th, html.rizuki-reborn-active li,
    html.rizuki-reborn-active label, html.rizuki-reborn-active small {
      color: #0f172a !important;
    }
    html.rizuki-reborn-active a:not(.rb-btn-submit):not(.rb-btn-back) { color: #3b82f6 !important; }
    html.rizuki-reborn-active .nav-tabs > li > a { color: #64748b !important; background: transparent !important; }
    html.rizuki-reborn-active .nav-tabs > li.active > a {
      background: #ffffff !important; color: #3b82f6 !important;
    }
    html.rizuki-reborn-active .breadcrumb { background: transparent !important; }
  `;

  el.textContent = dark ? dark_css : dark_css; // Use the variable
}

function applyTheme(dark) {
  const html = document.documentElement;
  html.classList.toggle('dark', dark);
  html.setAttribute('data-theme', dark ? 'dark' : 'light');

  // Buang semua skin AdminLTE dari body
  document.body.classList.remove(...SKIN_CLASSES);

  document.body.classList.toggle('rb-dark-body',  dark);
  document.body.classList.toggle('rb-light-body', !dark);

  injectDynamicThemeStyle(dark);

  // Update ikon toggle di header
  const iconEl = document.getElementById('rb-theme-icon-dd');
  const textEl = document.getElementById('rb-theme-text-dd');
  if (iconEl) iconEl.innerHTML = dark ? ICON.sun  : ICON.moon;
  if (textEl) textEl.textContent = dark ? 'Mode Terang' : 'Mode Gelap';
}

/**
 * FIX UTAMA: Default LIGHT MODE
 * isDark === true → dark; undefined/false/null → light (default)
 */
function initTheme(cb) {
  try {
    chrome.storage.sync.get([RB.keys.theme], (data) => {
      applyTheme(data[RB.keys.theme] === true); // FIX: harus benar-benar true
      if (cb) cb();
    });
  } catch {
    applyTheme(false); // error fallback = light
    if (cb) cb();
  }
}

function toggleTheme() {
  const dark = !isDark();
  applyTheme(dark);
  try { chrome.storage.sync.set({ [RB.keys.theme]: dark }); } catch {}
  swalToast(dark ? 'Mode Gelap aktif 🌙' : 'Mode Terang aktif ☀️', 'success');
}

// ═══════════════════════════════════════════════════════
// §4 — AUTO-LOGIN MANAGER
// ═══════════════════════════════════════════════════════
const AutoLogin = {
  save(user, pass) {
    try {
      chrome.storage.local.set({
        [RB.keys.autologin]: {
          u: btoa(unescape(encodeURIComponent(user))),
          p: btoa(unescape(encodeURIComponent(pass))),
          t: Date.now(),
        },
      });
    } catch (e) { console.warn('[RB] AutoLogin.save error:', e); }
  },
  clear() {
    try { chrome.storage.local.remove(RB.keys.autologin); } catch {}
  },
  load(cb) {
    try {
      chrome.storage.local.get([RB.keys.autologin], (data) => {
        const c = data[RB.keys.autologin];
        if (!c || !c.u || !c.p) { cb(null); return; }
        try {
          cb({
            username: decodeURIComponent(escape(atob(c.u))),
            password: decodeURIComponent(escape(atob(c.p))),
          });
        } catch { cb(null); }
      });
    } catch { cb(null); }
  },
};

// ═══════════════════════════════════════════════════════
// §5 — SIDEBAR STATE (localStorage + session cookie)
// ═══════════════════════════════════════════════════════
const Sidebar = {
  // Baca dari cookie (sinkron session) atau localStorage
  getCookie() {
    const m = document.cookie.match(new RegExp('(?:^|; )' + RB.keys.sidebar + '=([^;]*)'));
    return m ? m[1] : null;
  },
  setCookie(val) {
    // Session cookie: no expires → dihapus saat browser/session berakhir
    document.cookie = `${RB.keys.sidebar}=${val}; path=/; SameSite=Lax`;
  },
  isOpen() {
    const cookie = this.getCookie();
    if (cookie !== null) return cookie !== '0';
    return localStorage.getItem(RB.keys.sidebar) !== '0';
  },
  save(open) {
    const v = open ? '1' : '0';
    this.setCookie(v);
    localStorage.setItem(RB.keys.sidebar, v);
    try { chrome.storage.local.set({ [RB.keys.sidebar]: open }); } catch {}
  },
  toggle() {
    const o = !this.isOpen();
    this.save(o);
    return o;
  },
  apply() {
    const open = this.isOpen();
    document.body.classList.toggle('sidebar-collapse',    !open);
    document.body.classList.toggle('rb-sidebar-open',     open);
    document.body.classList.toggle('rb-sidebar-collapsed', !open);
  },
};

// ═══════════════════════════════════════════════════════
// §6 — DETEKSI HALAMAN
// ═══════════════════════════════════════════════════════
function detectPage() {
  const raw = window.location.pathname;
  const p   = raw.toLowerCase().replace(/\/$/, '') || '/';

  const isLoginOld  = p === '/' || p === '/login' || p === '/index.php' || p === '/login/';
  const isLoginNew  = p === '/new' || p === '/login_new';
  const isForgot    = (p === '/lupa_password' || p.startsWith('/lupa_password')) && !p.includes('reset');
  const isReset     = p.includes('/reset_password') || (p.includes('lupa_password') && p.includes('reset'));
  const isInbox     = p.includes('/pesanmasuk');
  const isDashboard = p === '/member' || p === '/member/home' || p.endsWith('/home') || p.includes('/dashboard');
  const isPresensi  = p.includes('/presensi');
  const isPertemuan = p.includes('/pertemuan/');
  const isForum     = p.includes('/member_forum/');
  const isTugas     = p.includes('/member_tugas/');
  const isProfil    = p.includes('/profil') || p.includes('/profile');
  const isLoginPage = isLoginOld || isLoginNew;
  const isAuthPage  = isLoginPage || isForgot || isReset;
  const isApp       = !isAuthPage;

  return {
    isLoginOld, isLoginNew, isForgot, isReset,
    isInbox, isDashboard, isPresensi, isPertemuan,
    isForum, isTugas, isProfil, isApp, isLoginPage, isAuthPage,
  };
}

// ═══════════════════════════════════════════════════════
// §7 — CLEANUP UMUM
// ═══════════════════════════════════════════════════════
function globalCleanup() {
  $$('#preloader, #status, .preloader, .page-loader').forEach(el => el.remove());

  if (!$('link[href*="fonts.googleapis.com"]')) {
    const link = Object.assign(document.createElement('link'), {
      rel : 'stylesheet',
      href: RB.font,
    });
    document.head.appendChild(link);
  }

  document.documentElement.classList.add('rizuki-reborn-active');
}

// ═══════════════════════════════════════════════════════
// §8 — REDIRECT HANDLER
// ═══════════════════════════════════════════════════════
function handleRedirects() {
  const p = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';

  // /home (bare, bukan /member/home) → / (satu pintu)
  if (p === '/home') {
    window.location.replace('/');
    return true;
  }

  // /login_new → / (satu pintu login)
  if (p === '/login_new') {
    window.location.replace('/');
    return true;
  }

  return false;
}

// ═══════════════════════════════════════════════════════
// §9 — CANVAS CAPTCHA GENERATOR
// ═══════════════════════════════════════════════════════
function generateCanvasCaptcha() {
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += CHARS[~~(Math.random() * CHARS.length)];

  const canvas = document.createElement('canvas');
  canvas.width = 160; canvas.height = 52;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 160, 52);
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(1, '#162032');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 160, 52);

  // Noise lines
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 160, Math.random() * 52);
    ctx.lineTo(Math.random() * 160, Math.random() * 52);
    ctx.strokeStyle = `rgba(${~~(Math.random()*200)},${~~(Math.random()*200)},${~~(Math.random()*255)},0.35)`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Characters
  const colors = ['#93c5fd','#67e8f9','#86efac','#fca5a5','#c4b5fd','#fcd34d'];
  ctx.font = 'bold 26px "Courier New", monospace';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < code.length; i++) {
    ctx.save();
    ctx.translate(18 + i * 28, 26);
    ctx.rotate((Math.random() - 0.5) * 0.45);
    ctx.fillStyle = colors[i % colors.length];
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur  = 2;
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }

  // Dot noise
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 160, Math.random() * 52, 1.2, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`;
    ctx.fill();
  }

  return { canvas, code };
}

// ═══════════════════════════════════════════════════════
// §10 — CAPTCHA HELPER (dari form asli)
// ═══════════════════════════════════════════════════════
function extractCaptcha(form) {
  if (!form) return null;
  const captchaImg = form.querySelector(
    'img[src*="captcha"], img[id*="captcha"], img[name*="captcha"]'
  ) || $$('img', form).find(img =>
    img.src &&
    !img.src.includes('/users/') &&
    !img.src.includes('avatar') &&
    !img.src.includes('logo')
  );
  const captchaInput = form.querySelector(
    'input[name*="captcha"], input[id*="captcha"], input[placeholder*="captcha" i], input[placeholder*="kode" i]'
  );
  if (!captchaImg && !captchaInput) return null;
  return { img: captchaImg, input: captchaInput, imgSrc: captchaImg?.src || '' };
}

function buildCaptchaHTML(captcha) {
  if (!captcha?.imgSrc) return '';
  return `
    <div class="rb-field">
      <label class="rb-label">Kode Keamanan (Captcha)</label>
      <div class="rb-captcha-wrap">
        <img id="rb-captcha-img" src="${captcha.imgSrc}" class="rb-captcha-img" alt="Captcha">
        <button type="button" id="rb-captcha-refresh" class="rb-captcha-refresh" title="Refresh captcha">
          ${ICON.refresh}
        </button>
      </div>
      <div class="rb-input-wrap" style="margin-top:8px">
        <input id="rb-captcha-input" type="text" class="rb-input"
          placeholder="Masukkan kode di atas" autocomplete="off" required spellcheck="false" />
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════
// §11 — BUILD LOGIN HTML
// ═══════════════════════════════════════════════════════
function buildLoginHTML({ title, subtitle, showForgot = true, forgotUrl = '/lupa_password', captchaHTML = '' }) {
  return `
    <div class="rb-login-bg">
      <div class="rb-blobs">
        <div class="rb-blob rb-blob-1"></div>
        <div class="rb-blob rb-blob-2"></div>
        <div class="rb-blob rb-blob-3"></div>
      </div>
      <div class="rb-login-card">
        <div class="rb-login-brand">
          <div class="rb-login-logo-circle">U</div>
          <div>
            <h1 class="rb-login-title">${title}</h1>
            <p class="rb-login-sub">${subtitle}</p>
          </div>
        </div>
        <div id="rb-autologin-banner" class="rb-autologin-banner" style="display:none">
          <span>${ICON.key} Kredensial tersimpan ditemukan</span>
          <div class="rb-autologin-actions">
            <button type="button" id="rb-al-use"   class="rb-al-btn rb-al-use">Gunakan</button>
            <button type="button" id="rb-al-clear" class="rb-al-btn rb-al-clear">Hapus</button>
          </div>
        </div>
        <form id="rb-form" class="rb-form" autocomplete="on" novalidate>
          <div class="rb-field">
            <label class="rb-label" for="rb-user">Username / NIM</label>
            <div class="rb-input-wrap">
              <input id="rb-user" type="text" class="rb-input"
                placeholder="Masukkan username atau NIM"
                autocomplete="username" required />
            </div>
          </div>
          <div class="rb-field">
            <label class="rb-label" for="rb-pass">Password</label>
            <div class="rb-input-wrap rb-input-has-icon">
              <input id="rb-pass" type="password" class="rb-input"
                placeholder="Masukkan password"
                autocomplete="current-password" required />
              <button type="button" id="rb-eye" class="rb-eye-btn" tabindex="-1">${ICON.eye}</button>
            </div>
          </div>
          ${captchaHTML}
          <div class="rb-form-row">
            <label class="rb-check-label">
              <input type="checkbox" id="rb-remember" class="rb-check" />
              <span>Ingat Login</span>
            </label>
            ${showForgot ? `<a href="${forgotUrl}" class="rb-forgot">Lupa Password?</a>` : ''}
          </div>
          <button type="submit" id="rb-submit-btn" class="rb-btn-submit">
            <span id="rb-btn-label">Masuk</span>
            <span id="rb-btn-spinner" class="rb-spinner" style="display:none"></span>
          </button>
        </form>
        <p class="rb-login-footer-text">
          LMS Ultra Reborn v${RB.version} &bull;
          <a href="https://rizuku.my.id" target="_blank" rel="noopener">RizukiDesz</a>
        </p>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════
// §12 — WIRE LOGIN FORM
// ═══════════════════════════════════════════════════════
function wireLoginForm(wrapper, { origUserField, origPassField, origForm, origCaptchaInput }) {
  const rbUser    = $('#rb-user',         wrapper);
  const rbPass    = $('#rb-pass',         wrapper);
  const rbEye     = $('#rb-eye',          wrapper);
  const rbRmb     = $('#rb-remember',     wrapper);
  const rbForm    = $('#rb-form',         wrapper);
  const rbSubmit  = $('#rb-submit-btn',   wrapper);
  const rbLabel   = $('#rb-btn-label',    wrapper);
  const rbSpinner = $('#rb-btn-spinner',  wrapper);
  const rbCaptcha = $('#rb-captcha-input',      wrapper);
  const rbCaptchaImg    = $('#rb-captcha-img',    wrapper);
  const rbCaptchaRefresh = $('#rb-captcha-refresh', wrapper);

  rbEye?.addEventListener('click', () => {
    const isPass = rbPass.type === 'password';
    rbPass.type     = isPass ? 'text' : 'password';
    rbEye.innerHTML = isPass ? ICON.eyeOff : ICON.eye;
  });

  rbCaptchaRefresh?.addEventListener('click', () => {
    if (rbCaptchaImg) {
      try {
        const url = new URL(rbCaptchaImg.src);
        url.searchParams.set('_rb', Date.now());
        rbCaptchaImg.src = url.toString();
      } catch { rbCaptchaImg.src += '?_rb=' + Date.now(); }
      if (rbCaptcha) rbCaptcha.value = '';
    }
  });

  const banner   = $('#rb-autologin-banner', wrapper);
  const alUseBtn = $('#rb-al-use',           wrapper);
  const alClrBtn = $('#rb-al-clear',         wrapper);

  AutoLogin.load((creds) => {
    if (!creds || !banner) return;
    banner.style.display = 'flex';
    alUseBtn?.addEventListener('click', () => {
      rbUser.value = creds.username;
      rbPass.value = creds.password;
      if (rbRmb) rbRmb.checked = true;
      banner.style.display = 'none';
      swalToast('Kredensial terisi — klik Masuk!', 'success');
      (rbCaptcha || rbSubmit)?.focus();
    });
    alClrBtn?.addEventListener('click', () => {
      AutoLogin.clear();
      banner.style.display = 'none';
      swalToast('Data login dihapus.', 'info');
    });
  });

  rbForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = rbUser.value.trim();
    const pass = rbPass.value;

    if (!user || !pass) {
      swalAlert({ title: 'Form Tidak Lengkap', text: 'Harap isi username dan password!', icon: 'warning' });
      return;
    }
    if (rbCaptcha && origCaptchaInput && !rbCaptcha.value.trim()) {
      swalAlert({ title: 'Captcha Kosong', text: 'Harap masukkan kode captcha!', icon: 'warning' });
      rbCaptcha.focus();
      return;
    }

    rbLabel.style.display   = 'none';
    rbSpinner.style.display = 'inline-block';
    rbSubmit.disabled       = true;

    if (rbRmb?.checked) AutoLogin.save(user, pass);

    if (origUserField)    origUserField.value    = user;
    if (origPassField)    origPassField.value    = pass;
    if (origCaptchaInput && rbCaptcha) origCaptchaInput.value = rbCaptcha.value.trim();

    if (origForm) {
      origForm.style.display = 'none';
      document.body.appendChild(origForm);
      try { origForm.submit(); } catch {
        origForm.querySelector('[type=submit], button')?.click();
      }
    }
  });
}

// ═══════════════════════════════════════════════════════
// §13 — LOGIN PAGE INIT
// ═══════════════════════════════════════════════════════
function initLoginPage(isNew = false) {
  document.documentElement.classList.add('reborn-login-active');

  const origForm      = $('form');
  const origUserField = origForm?.querySelector('input[name="username"], input[type="text"]:not([name="search"])');
  const origPassField = origForm?.querySelector('input[name="password"], input[type="password"]');
  const captcha       = extractCaptcha(origForm);

  if (!origForm) return;

  $$('body > *:not(script):not(link):not(style)').forEach(el => { el.style.display = 'none'; });

  const wrapper = document.createElement('div');
  wrapper.id    = 'rb-login-wrapper';
  wrapper.innerHTML = buildLoginHTML({
    title   : isNew ? 'LMS Unindra' : 'Masuk ke SIAKAD',
    subtitle: isNew
      ? 'Portal Pembelajaran Digital Universitas Indraprasta PGRI'
      : 'Selamat datang kembali, Civitas Akademika Unindra!',
    captchaHTML: buildCaptchaHTML(captcha),
  });
  document.body.appendChild(wrapper);

  wireLoginForm(wrapper, {
    origUserField, origPassField, origForm,
    origCaptchaInput: captcha?.input,
  });
}

// ═══════════════════════════════════════════════════════
// §14 — LUPA PASSWORD PAGE
// ═══════════════════════════════════════════════════════
function initForgotPage() {
  document.documentElement.classList.add('reborn-login-active');

  const origForm = $('form');
  const emailFld = origForm?.querySelector('input[type="email"], input[name="email"], input[type="text"]');
  const captcha  = extractCaptcha(origForm);

  $$('body > *:not(script):not(link):not(style)').forEach(el => el.style.display = 'none');

  const wrapper = document.createElement('div');
  wrapper.id    = 'rb-login-wrapper';
  wrapper.innerHTML = `
    <div class="rb-login-bg">
      <div class="rb-blobs">
        <div class="rb-blob rb-blob-1"></div>
        <div class="rb-blob rb-blob-2"></div>
      </div>
      <div class="rb-login-card">
        <div class="rb-reset-breadcrumb">
          <a href="/" class="rb-reset-bc-link">${ICON.home} Login</a>
          <span class="rb-reset-bc-sep">${ICON.chevRight}</span>
          <span class="rb-reset-bc-current">Lupa Password</span>
        </div>
        <div class="rb-login-brand">
          <div class="rb-login-logo-circle" style="font-size:22px">🔑</div>
          <div>
            <h1 class="rb-login-title">Lupa Password</h1>
            <p class="rb-login-sub">Masukkan email terdaftar untuk menerima link reset</p>
          </div>
        </div>
        <form id="rb-forgot-form" class="rb-form" novalidate>
          <div class="rb-field">
            <label class="rb-label" for="rb-email">Email Terdaftar</label>
            <div class="rb-input-wrap">
              <input id="rb-email" type="email" class="rb-input"
                placeholder="contoh@email.com" autocomplete="email" required />
            </div>
          </div>
          ${buildCaptchaHTML(captcha)}
          <button type="submit" id="rb-submit-btn" class="rb-btn-submit">
            <span id="rb-btn-label">Kirim Link Reset</span>
            <span id="rb-btn-spinner" class="rb-spinner" style="display:none"></span>
          </button>
          <a href="/" class="rb-btn-back">← Kembali ke Login</a>
        </form>
        <p class="rb-login-footer-text">
          LMS Ultra Reborn v${RB.version} &bull;
          <a href="https://rizuku.my.id" target="_blank" rel="noopener">RizukiDesz</a>
        </p>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const form      = $('#rb-forgot-form',   wrapper);
  const emailIn   = $('#rb-email',         wrapper);
  const submitB   = $('#rb-submit-btn',    wrapper);
  const btnLbl    = $('#rb-btn-label',     wrapper);
  const spinner   = $('#rb-btn-spinner',   wrapper);
  const captchaIn = $('#rb-captcha-input', wrapper);
  const captchaIm = $('#rb-captcha-img',   wrapper);
  const captchaRf = $('#rb-captcha-refresh',wrapper);

  captchaRf?.addEventListener('click', () => {
    if (captchaIm) {
      try {
        const url = new URL(captchaIm.src);
        url.searchParams.set('_rb', Date.now());
        captchaIm.src = url.toString();
      } catch { captchaIm.src += '?_rb=' + Date.now(); }
      if (captchaIn) captchaIn.value = '';
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailIn.value.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      swalAlert({ title: 'Email Tidak Valid', text: 'Harap masukkan email yang benar!', icon: 'warning' });
      return;
    }
    if (captcha && captchaIn && !captchaIn.value.trim()) {
      swalAlert({ title: 'Captcha Kosong', text: 'Harap masukkan kode captcha!', icon: 'warning' });
      captchaIn.focus();
      return;
    }
    btnLbl.style.display  = 'none';
    spinner.style.display = 'inline-block';
    submitB.disabled      = true;
    if (emailFld) emailFld.value = email;
    if (captcha?.input && captchaIn) captcha.input.value = captchaIn.value.trim();
    if (origForm) {
      origForm.style.display = 'none';
      document.body.appendChild(origForm);
      try { origForm.submit(); } catch { $('[type=submit]', origForm)?.click(); }
    }
  });
}

// ═══════════════════════════════════════════════════════
// §15 — RESET PASSWORD (canvas captcha + breadcrumb fix)
// ═══════════════════════════════════════════════════════
function initResetPage() {
  document.documentElement.classList.add('reborn-login-active');

  const origForm    = $('form');
  const origNewPass = origForm?.querySelector('input[name="new_password"], input[type="password"]');
  const origConPass = origForm?.querySelectorAll('input[type="password"]')[1];
  const origCaptcha = extractCaptcha(origForm);

  $$('body > *:not(script):not(link):not(style)').forEach(el => el.style.display = 'none');

  const wrapper = document.createElement('div');
  wrapper.id    = 'rb-login-wrapper';
  wrapper.innerHTML = `
    <div class="rb-login-bg">
      <div class="rb-blobs">
        <div class="rb-blob rb-blob-1"></div>
        <div class="rb-blob rb-blob-2"></div>
      </div>
      <div class="rb-login-card">
        <div class="rb-reset-breadcrumb">
          <a href="/" class="rb-reset-bc-link">${ICON.home} Login</a>
          <span class="rb-reset-bc-sep">${ICON.chevRight}</span>
          <a href="/lupa_password" class="rb-reset-bc-link">Lupa Password</a>
          <span class="rb-reset-bc-sep">${ICON.chevRight}</span>
          <span class="rb-reset-bc-current">Reset Password</span>
        </div>
        <div class="rb-login-brand">
          <div class="rb-login-logo-circle" style="font-size:22px">🛡️</div>
          <div>
            <h1 class="rb-login-title">Reset Password</h1>
            <p class="rb-login-sub">Buat password baru yang kuat untuk akunmu</p>
          </div>
        </div>
        <form id="rb-reset-form" class="rb-form" novalidate>
          <div class="rb-field">
            <label class="rb-label" for="rb-np">Password Baru</label>
            <div class="rb-input-wrap rb-input-has-icon">
              <input id="rb-np" type="password" class="rb-input" placeholder="Minimal 8 karakter" required />
              <button type="button" class="rb-eye-btn rb-eye-toggle">${ICON.eye}</button>
            </div>
          </div>
          <div class="rb-strength-wrap">
            <div class="rb-strength-track">
              <div class="rb-strength-bar" id="rb-strength-bar"></div>
            </div>
            <span class="rb-strength-label" id="rb-strength-label"></span>
          </div>
          <div class="rb-field">
            <label class="rb-label" for="rb-cp">Konfirmasi Password</label>
            <div class="rb-input-wrap rb-input-has-icon">
              <input id="rb-cp" type="password" class="rb-input" placeholder="Ulangi password baru" required />
              <button type="button" class="rb-eye-btn rb-eye-toggle">${ICON.eye}</button>
            </div>
          </div>
          <div class="rb-field" id="rb-canvas-captcha-field">
            <label class="rb-label">Kode Keamanan</label>
            <div class="rb-captcha-wrap">
              <div id="rb-canvas-wrap" style="line-height:0;border-radius:6px;overflow:hidden;"></div>
              <button type="button" id="rb-canvas-captcha-refresh" class="rb-captcha-refresh" title="Refresh">
                ${ICON.refresh}
              </button>
            </div>
            <div class="rb-input-wrap" style="margin-top:8px">
              <input id="rb-canvas-captcha-input" type="text" class="rb-input"
                placeholder="Ketik 5 karakter di atas" autocomplete="off" required maxlength="5"
                style="text-transform:uppercase;letter-spacing:3px;font-weight:700;font-size:18px" />
            </div>
          </div>
          <button type="submit" id="rb-submit-btn" class="rb-btn-submit">
            <span id="rb-btn-label">Simpan Password Baru</span>
            <span id="rb-btn-spinner" class="rb-spinner" style="display:none"></span>
          </button>
          <a href="/" class="rb-btn-back">← Kembali ke Login</a>
        </form>
        <p class="rb-login-footer-text">
          LMS Ultra Reborn v${RB.version} &bull;
          <a href="https://rizuku.my.id" target="_blank" rel="noopener">RizukiDesz</a>
        </p>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // Eye toggles
  wrapper.querySelectorAll('.rb-eye-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = btn.previousElementSibling;
      const isP = inp.type === 'password';
      inp.type      = isP ? 'text' : 'password';
      btn.innerHTML = isP ? ICON.eyeOff : ICON.eye;
    });
  });

  // Canvas captcha
  const canvasWrap    = document.getElementById('rb-canvas-wrap');
  const captchaInput  = document.getElementById('rb-canvas-captcha-input');
  const captchaRef    = document.getElementById('rb-canvas-captcha-refresh');
  let captchaCode     = '';

  function refreshCanvasCaptcha() {
    const { canvas, code } = generateCanvasCaptcha();
    captchaCode            = code;
    canvas.style.borderRadius = '6px';
    canvasWrap.innerHTML   = '';
    canvasWrap.appendChild(canvas);
    if (captchaInput) captchaInput.value = '';
  }
  refreshCanvasCaptcha();
  captchaRef?.addEventListener('click',  refreshCanvasCaptcha);
  canvasWrap?.addEventListener('click',  refreshCanvasCaptcha);

  // Tambahkan server captcha juga jika ada
  if (origCaptcha) {
    const target = document.getElementById('rb-canvas-captcha-field');
    if (target) {
      target.insertAdjacentHTML('afterend', buildCaptchaHTML(origCaptcha));
      const ri  = wrapper.querySelector('#rb-captcha-img');
      const rr  = wrapper.querySelector('#rb-captcha-refresh');
      const rin = wrapper.querySelector('#rb-captcha-input');
      rr?.addEventListener('click', () => {
        if (ri) {
          try {
            const u = new URL(ri.src);
            u.searchParams.set('_rb', Date.now());
            ri.src = u.toString();
          } catch { ri.src += '?_rb=' + Date.now(); }
        }
        if (rin) rin.value = '';
      });
    }
  }

  // Password strength
  const npInput     = $('#rb-np',             wrapper);
  const strengthBar = $('#rb-strength-bar',   wrapper);
  const strengthLbl = $('#rb-strength-label', wrapper);
  const STRENGTH    = [
    { label: '',            color: 'transparent', width: '0%'   },
    { label: 'Lemah',       color: '#ef4444',     width: '25%'  },
    { label: 'Cukup',       color: '#f97316',     width: '50%'  },
    { label: 'Kuat',        color: '#eab308',     width: '75%'  },
    { label: 'Sangat Kuat', color: '#22c55e',     width: '100%' },
  ];
  npInput?.addEventListener('input', () => {
    const v = npInput.value;
    let s   = 0;
    if (v.length >= 8)            s++;
    if (/[A-Z]/.test(v))          s++;
    if (/[0-9]/.test(v))          s++;
    if (/[^A-Za-z0-9]/.test(v))  s++;
    const { label, color, width } = STRENGTH[s];
    strengthBar.style.width      = width;
    strengthBar.style.background = color;
    strengthLbl.textContent      = label;
    strengthLbl.style.color      = color;
  });

  // Submit
  const resetForm = $('#rb-reset-form', wrapper);
  resetForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const np     = $('#rb-np', wrapper).value;
    const cp     = $('#rb-cp', wrapper).value;
    const captV  = captchaInput?.value.trim().toUpperCase();
    const origCV = wrapper.querySelector('#rb-captcha-input')?.value.trim();

    if (np.length < 8) {
      swalAlert({ title: 'Password Terlalu Pendek', text: 'Minimal 8 karakter!', icon: 'warning' }); return;
    }
    if (np !== cp) {
      swalAlert({ title: 'Password Tidak Cocok', text: 'Password baru dan konfirmasi berbeda!', icon: 'error' }); return;
    }
    if (captV !== captchaCode) {
      swalAlert({ title: 'Captcha Salah', text: 'Kode yang dimasukkan tidak sesuai!', icon: 'error' });
      refreshCanvasCaptcha();
      return;
    }
    if (origCaptcha && !origCV) {
      swalAlert({ title: 'Captcha Kosong', text: 'Harap isi captcha dari server!', icon: 'warning' }); return;
    }

    $('#rb-btn-label',   wrapper).style.display = 'none';
    $('#rb-btn-spinner', wrapper).style.display = 'inline-block';
    $('#rb-submit-btn',  wrapper).disabled      = true;

    if (origNewPass) origNewPass.value = np;
    if (origConPass) origConPass.value = cp;
    if (origCaptcha?.input && origCV) origCaptcha.input.value = origCV;

    if (origForm) {
      origForm.style.display = 'none';
      document.body.appendChild(origForm);
      try { origForm.submit(); } catch { $('[type=submit]', origForm)?.click(); }
    }
  });
}

// ═══════════════════════════════════════════════════════
// §16 — HEADER REBUILD
// ═══════════════════════════════════════════════════════
function rebuildHeader() {
  const mainHeader = $('.main-header');
  if (!mainHeader) return;

  // Extract user info
  let userImg  = `${RB.base}/lms_publik/images/users/thumbs/default.png`;
  let userName = 'Mahasiswa';
  let userRole = 'Mahasiswa';

  const imgSels = ['.user-image','.img-circle','.sidebar .user-panel img','.user-header img','.navbar img'];
  for (const sel of imgSels) {
    const el = $(sel);
    if (el?.src && !el.src.includes('default') && !el.src.endsWith('/')) { userImg = el.src; break; }
  }

  const nameSels = [
    '.sidebar .user-panel .info p a', '.sidebar .info p a',
    '.sidebar .info a', '.user-header p b', '.user-header .username',
    '.navbar .user-name',
  ];
  for (const sel of nameSels) {
    const el = $(sel);
    if (el) { const raw = el.textContent.trim(); if (raw) { userName = raw; break; } }
  }

  const roleEl = $('.sidebar .user-panel .info p small, .sidebar .info small, .user-header p small');
  if (roleEl) userRole = roleEl.textContent.trim() || userRole;

  const initials = (userName.match(/\b\w/g) || ['M']).slice(0, 2).join('').toUpperCase();

  mainHeader.className = 'rb-header';
  mainHeader.innerHTML = `
    <div class="rb-header-inner">
      <div class="rb-header-left">
        <button id="rb-hamburger" class="rb-icon-btn" title="Buka/Tutup Sidebar" aria-label="Toggle sidebar">
          ${ICON.menu}
        </button>
        <a href="/member" class="rb-brand" aria-label="Beranda LMS">
          <div class="rb-brand-circle">U</div>
          <span class="rb-brand-text">UNINDRA<span class="rb-brand-lms">LMS</span></span>
        </a>
      </div>
      <div class="rb-header-right">
        <div class="rb-profile-wrap" id="rb-profile-wrap">
          <button class="rb-profile-btn" id="rb-profile-btn" aria-haspopup="true" aria-expanded="false">
            <img src="${userImg}" class="rb-avatar" alt="Foto"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div class="rb-avatar-fallback" style="display:none">${initials}</div>
            <div class="rb-profile-info">
              <span class="rb-profile-name">${toTitleCase(userName.slice(0, 22))}</span>
              <span class="rb-profile-role">${userRole}</span>
            </div>
            <span class="rb-chevron">${ICON.chevDown}</span>
          </button>
          <div class="rb-dropdown" id="rb-dropdown" role="menu">
            <a href="/member/profil" class="rb-drop-item" role="menuitem">
              ${ICON.profile}<span>Profil Saya</span>
            </a>
            <a href="/member/pesanmasuk" class="rb-drop-item" role="menuitem">
              ${ICON.inbox}<span>Pesan Masuk</span>
              <span class="rb-drop-badge" id="rb-inbox-badge" style="display:none">!</span>
            </a>
            <button id="rb-help-btn" class="rb-drop-item" role="menuitem">
              ${ICON.help}<span>Bantuan</span>
            </button>
            <button id="rb-theme-btn" class="rb-drop-item" role="menuitem">
              <span id="rb-theme-icon-dd">${isDark() ? ICON.sun : ICON.moon}</span>
              <span id="rb-theme-text-dd">${isDark() ? 'Mode Terang' : 'Mode Gelap'}</span>
            </button>
            <div class="rb-drop-divider" role="separator"></div>
            <button id="rb-logout-btn" class="rb-drop-item rb-drop-danger" role="menuitem">
              ${ICON.logout}<span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Hamburger
  $('#rb-hamburger')?.addEventListener('click', () => {
    Sidebar.toggle();
    Sidebar.apply();
  });

  // Dropdown
  const profileWrap = $('#rb-profile-wrap');
  const profileBtn  = $('#rb-profile-btn');
  const dropdown    = $('#rb-dropdown');

  profileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('rb-dropdown-open');
    profileBtn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', (e) => {
    if (!profileWrap?.contains(e.target)) {
      dropdown?.classList.remove('rb-dropdown-open');
      profileBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  // Help
  $('#rb-help-btn')?.addEventListener('click', () => {
    dropdown?.classList.remove('rb-dropdown-open');
    swalAlert({
      title: '📚 Pusat Bantuan LMS',
      html : `
        <div style="text-align:left;font-size:14px;line-height:1.9">
          <p style="margin-bottom:10px">Jika mengalami kendala pada sistem LMS Unindra, silakan hubungi:</p>
          <ul style="padding-left:20px;margin-bottom:14px">
            <li><strong>Dosen Pengampu</strong> — kendala presensi &amp; tugas</li>
            <li><strong>Admin Program Studi</strong> — masalah akun &amp; data</li>
            <li><strong>BAAK</strong> — urusan akademik umum</li>
          </ul>
          <div style="padding:10px 14px;background:rgba(59,130,246,.12);border-radius:10px;border-left:3px solid #3b82f6;font-size:13px">
            🎨 LMS Ultra Reborn v${RB.version} by <strong>RizukiDesz</strong>
          </div>
        </div>`,
      icon: 'info',
      confirmButtonText: 'Tutup',
    });
  });

  // Theme toggle
  $('#rb-theme-btn')?.addEventListener('click', () => {
    toggleTheme();
    dropdown?.classList.remove('rb-dropdown-open');
  });

  // Logout
  $('#rb-logout-btn')?.addEventListener('click', () => {
    dropdown?.classList.remove('rb-dropdown-open');
    swalAlert({
      title            : 'Akhiri Sesi?',
      text             : 'Pastikan presensi dan tugas sudah aman sebelum keluar!',
      icon             : 'warning',
      showCancelButton : true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor : '#64748b',
      confirmButtonText : 'Ya, Sign Out',
      cancelButtonText  : 'Batal',
    }).then(r => {
      if (r?.isConfirmed) window.location.href = '/login/logout';
    });
  });
}

// ═══════════════════════════════════════════════════════
// §17 — SIDEBAR REBUILD (FIX: hapus logout, sinkron state)
// ═══════════════════════════════════════════════════════
function rebuildSidebar() {
  const sidebar     = $('.main-sidebar');
  const sidebarMenu = $('.sidebar-menu');
  if (!sidebar) return;

  sidebar.classList.add('rb-sidebar');

  // Sembunyikan elemen user panel lama
  $$('.sidebar .user-panel, .sidebar .sidebar-user-panel').forEach(el => {
    el.style.display = 'none';
  });

  if (!sidebarMenu) return;

  // HAPUS logout dari sidebar
  $$('a[href*="logout"], a[href*="keluar"]', sidebar).forEach(a => a.closest('li')?.remove());

  // HAPUS Assignment dari sidebar juga
  $$('a', sidebarMenu).forEach(a => {
    if (/assignment/i.test(a.textContent)) {
      a.closest('li')?.remove();
    }
  });

  // Tambahkan ikon
  $$('li > a', sidebarMenu).forEach(link => {
    const text = link.innerText || link.textContent || '';
    $$('i.fa:not(.fa-angle-left):not(.pull-right), i.glyphicon', link).forEach(i => i.remove());
    if (!link.querySelector('.rb-menu-icon')) {
      link.insertAdjacentHTML('afterbegin',
        `<span class="rb-menu-icon" aria-hidden="true">${getMenuIcon(text)}</span>`
      );
    }
    link.classList.add('rb-menu-link');
  });

  $$('li.header', sidebarMenu).forEach(el => el.classList.add('rb-menu-label'));

  Sidebar.apply();
}

// ═══════════════════════════════════════════════════════
// §18 — FOOTER
// ═══════════════════════════════════════════════════════
function rebuildFooter() {
  const footer = $('.main-footer');
  if (!footer) return;
  footer.className = 'rb-footer';
  footer.innerHTML = `
    <div class="rb-footer-inner">
      <span>© 2026 <strong>LMS Ultra Reborn v${RB.version}</strong>
        — by <a href="https://rizuku.my.id" target="_blank" rel="noopener">RizukiDesz</a>
      </span>
      <span class="rb-footer-right">Universitas Indraprasta PGRI</span>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════
// §19 — BREADCRUMBS (FIX: guard + retry + semua halaman)
// ═══════════════════════════════════════════════════════
function redesignBreadcrumbs() {
  // Panggil segera dan dengan retry
  _processBreadcrumbs();
  setTimeout(_processBreadcrumbs, 400);
  setTimeout(_processBreadcrumbs, 1000);
}

function _processBreadcrumbs() {
  const contentHeader = $('.content-header');
  if (!contentHeader) return;

  contentHeader.classList.add('rb-content-header');

  const h1 = contentHeader.querySelector('h1');
  if (h1 && !h1.classList.contains('rb-page-title')) {
    h1.classList.add('rb-page-title');
  }

  const bc = contentHeader.querySelector('.breadcrumb, ol.breadcrumb, ul.breadcrumb');
  if (!bc) return;

  // Guard: sudah diproses
  if (bc.classList.contains('rb-breadcrumb')) return;
  bc.classList.add('rb-breadcrumb');

  const items = [...bc.querySelectorAll('li')];
  items.forEach((li, i) => {
    li.classList.add('rb-crumb-item');
    li.classList.remove('active');

    const link = li.querySelector('a');
    if (i === 0 && link && /home|beranda/i.test(link.textContent)) {
      if (!link.querySelector('svg')) {
        link.insertAdjacentHTML('afterbegin', `${ICON.home} `);
      }
    }

    if (i === items.length - 1) {
      li.classList.add('rb-crumb-active');
    }

    // Hapus separator lama, tambah yang baru
    li.querySelectorAll('.rb-crumb-sep').forEach(s => s.remove());
    if (i < items.length - 1) {
      const sep     = document.createElement('span');
      sep.className = 'rb-crumb-sep';
      sep.innerHTML = ICON.chevRight;
      sep.setAttribute('aria-hidden', 'true');
      li.appendChild(sep);
    }
  });
}

// ═══════════════════════════════════════════════════════
// §20 — DASHBOARD REDESIGN (FIX: more robust + more retries)
// ═══════════════════════════════════════════════════════
function redesignDashboardCards() {
  const PASTELS = [
    { cls: 'reborn-pastel-blue',   txt: 'var(--pastel-blue-txt)'   },
    { cls: 'reborn-pastel-green',  txt: 'var(--pastel-green-txt)'  },
    { cls: 'reborn-pastel-orange', txt: 'var(--pastel-orange-txt)' },
    { cls: 'reborn-pastel-teal',   txt: 'var(--pastel-teal-txt)'   },
  ];

  $$('.small-box').forEach((box, i) => {
    if (box.classList.contains('rb-dash-done')) return;
    box.classList.add('rb-dash-done');

    const p = PASTELS[i % PASTELS.length];
    [...box.classList].filter(c => /^bg-|^callout/.test(c)).forEach(c => box.classList.remove(c));
    box.classList.add('reborn-pastel-card', p.cls);
    box.querySelectorAll('.inner h3, .inner p').forEach(el => { el.style.color = p.txt; });
    const ico  = box.querySelector('.icon');
    if (ico) ico.style.opacity = '0.12';
    const more = box.querySelector('.small-box-footer');
    if (more) { more.style.background = 'rgba(0,0,0,0.06)'; more.style.color = p.txt; }
  });

  $$('.info-box').forEach(box => {
    if (!box.classList.contains('rb-info-box-done')) {
      box.classList.add('rb-info-box', 'rb-info-box-done');
    }
  });

  // Redesign table & boxes di dashboard
  redesignBoxes();
  redesignTables();
}

// ═══════════════════════════════════════════════════════
// §21 — PRESENSI REDESIGN (FIX: robust + progress bar colors)
// ═══════════════════════════════════════════════════════
function redesignPresensiPage() {
  $$('.progress').forEach(prog => {
    if (prog.classList.contains('rb-prog-done')) return;
    prog.classList.add('rb-prog-done');
    Object.assign(prog.style, {
      borderRadius: '99px',
      height      : '6px',
      background  : 'var(--rb-border)',
      overflow    : 'hidden',
      boxShadow   : 'none',
      margin      : '4px 0 0',
    });
  });

  $$('.progress-bar').forEach(bar => {
    const val = parseInt(bar.style.width || bar.getAttribute('aria-valuenow') || '0', 10);
    Object.assign(bar.style, {
      borderRadius: '99px',
      transition  : 'width .6s ease',
      boxShadow   : 'none',
      background  : val >= 75 ? '#22c55e' : val >= 50 ? '#f59e0b' : '#ef4444',
    });
  });

  $$('.label, .badge').forEach(badge => {
    Object.assign(badge.style, {
      borderRadius: '6px',
      padding     : '3px 8px',
      fontSize    : '11px',
      fontWeight  : '700',
    });
  });

  redesignBoxes();
  redesignTables();
}

// ═══════════════════════════════════════════════════════
// §22 — KELAS / PERTEMUAN / FORUM / TUGAS
// FIX: Hapus Assignment + redesign semua elemen
// ═══════════════════════════════════════════════════════
function redesignKelasPage() {
  const contentWrapper = $('.content-wrapper');
  if (!contentWrapper) return;

  // ── HAPUS ASSIGNMENT dari halaman pertemuan ──
  // Semua nav-tab yang mengandung teks "assignment"
  $$('.nav-tabs li, .nav-pills li', contentWrapper).forEach(li => {
    if (/assignment/i.test(li.textContent)) {
      li.style.display = 'none';
    }
  });
  // Semua box/panel dengan judul assignment
  $$('.box, .panel', contentWrapper).forEach(box => {
    const title = box.querySelector('.box-title, .box-header h3, .box-header h4, .panel-heading h3');
    if (title && /assignment/i.test(title.textContent)) {
      box.style.display = 'none';
    }
  });
  // Semua link berteks assignment
  $$('a, button', contentWrapper).forEach(el => {
    if (/\bassignment\b/i.test(el.textContent.trim())) {
      el.closest('li, .btn-group, .action-item')?.style.setProperty('display', 'none');
    }
  });

  // ── STYLE MATERIAL ITEMS ──
  $$('.list-group-item, .mailbox-attachments li, .attachment-block').forEach(item => {
    Object.assign(item.style, {
      borderRadius: 'var(--rb-r-md)',
      marginBottom: '8px',
      border      : '1px solid var(--rb-border)',
      background  : 'var(--rb-surface)',
      padding     : '12px 16px',
    });
  });

  // ── STYLE TABS ──
  $$('.nav-tabs > li > a').forEach(tab => {
    Object.assign(tab.style, {
      borderRadius: 'var(--rb-r-md) var(--rb-r-md) 0 0',
      fontWeight  : '600',
      fontSize    : '13px',
    });
  });

  // ── UPLOAD ZONES ──
  $$('.dropzone, [class*="upload"], .filepond--root').forEach(zone => {
    Object.assign(zone.style, {
      borderRadius: 'var(--rb-r-lg)',
      border      : '2px dashed var(--rb-border)',
      background  : 'var(--rb-surface-2)',
      padding     : '20px',
    });
  });

  // ── FILE LINKS ──
  $$('a[href*=".pdf"], a[href*=".docx"], a[href*=".pptx"], a[href*=".xlsx"]').forEach(link => {
    if (link.classList.contains('rb-file-link')) return;
    link.classList.add('rb-file-link');
    const ext = link.href.split('.').pop().toLowerCase();
    const ico = ext === 'pdf' ? ICON.pdf : ICON.download;
    link.insertAdjacentHTML('afterbegin',
      `<span style="display:inline-flex;align-items:center;gap:5px;vertical-align:middle">${ico}</span> `
    );
  });

  redesignBoxes();
  redesignTables();
  redesignForms();
  redesignModals();
}

// ═══════════════════════════════════════════════════════
// §22b — PROFILE PAGE REDESIGN (NEW)
// ═══════════════════════════════════════════════════════
function redesignProfilePage() {
  const contentWrapper = $('.content-wrapper');
  if (!contentWrapper || contentWrapper.classList.contains('rb-profile-done')) return;
  contentWrapper.classList.add('rb-profile-done');

  // Ambil info user dari sidebar (jika ada)
  let userName = 'Mahasiswa';
  let userRole = 'Mahasiswa';
  let userImg  = '';

  const nameSels = ['.sidebar .user-panel .info p a', '.sidebar .info p a', '.sidebar .info a'];
  for (const sel of nameSels) {
    const el = $(sel);
    if (el) { const t = el.textContent.trim(); if (t) { userName = t; break; } }
  }
  const roleEl = $('.sidebar .user-panel .info p small, .sidebar .info small');
  if (roleEl) userRole = roleEl.textContent.trim() || userRole;
  const imgEl = document.querySelector('.user-image, .img-circle, .sidebar .user-panel img');
  if (imgEl?.src && !imgEl.src.includes('default')) userImg = imgEl.src;

  const initials = (userName.match(/\b\w/g) || ['M']).slice(0, 2).join('').toUpperCase();

  // Inject profile hero di atas konten
  const content = $('.content', contentWrapper);
  if (content && !content.querySelector('.rb-profile-hero')) {
    const hero     = document.createElement('div');
    hero.className = 'rb-profile-hero';
    hero.innerHTML = `
      <div class="rb-profile-hero-inner">
        <div class="rb-profile-hero-avatar">
          ${userImg
            ? `<img src="${userImg}" alt="Avatar" class="rb-ph-img">`
            : `<div class="rb-ph-initials">${initials}</div>`
          }
        </div>
        <div class="rb-profile-hero-info">
          <h2 class="rb-ph-name">${toTitleCase(userName)}</h2>
          <p class="rb-ph-role">${userRole}</p>
          <div class="rb-ph-badge">
            ${ICON.check} Akun Aktif
          </div>
        </div>
        <a href="/member/profil/edit" class="rb-ph-edit-btn">
          ${ICON.edit} Edit Profil
        </a>
      </div>
    `;
    content.insertBefore(hero, content.firstChild);
  }

  // Redesign semua form fields di halaman profil
  redesignBoxes();
  redesignForms();
  redesignTables();
}

// ═══════════════════════════════════════════════════════
// §23 — INBOX (Pesan Masuk)
// ═══════════════════════════════════════════════════════
function initInboxPage() {
  setTimeout(() => {
    const contentWrapper = $('.content-wrapper');
    if (!contentWrapper || contentWrapper.querySelector('#rb-inbox-container')) return;

    const origRows = $$('table tbody tr');
    const messages = [];

    origRows.forEach(row => {
      const cells = $$('td', row);
      if (cells.length < 2) return;
      messages.push({
        isRead : !row.classList.contains('unread') && !row.classList.contains('font-bold'),
        sender : cells[0]?.textContent?.trim() || 'Pengirim',
        subject: cells[1]?.textContent?.trim() || cells[0]?.textContent?.trim() || 'Tanpa Subjek',
        date   : cells[cells.length - 1]?.textContent?.trim() || '',
        link   : row.querySelector('a')?.href || '#',
      });
    });

    const unreadCount = messages.filter(m => !m.isRead).length;
    const pageTitle   = $('.content-header h1')?.textContent?.trim() || 'Pesan Masuk';

    const inboxWrap     = document.createElement('div');
    inboxWrap.id        = 'rb-inbox-container';
    inboxWrap.className = 'rb-inbox-wrap';
    inboxWrap.innerHTML = `
      <div class="rb-inbox-header">
        <div class="rb-inbox-header-left">
          <div class="rb-inbox-icon">${ICON.mail}</div>
          <div>
            <h2 class="rb-inbox-title">${pageTitle}</h2>
            <p class="rb-inbox-subtitle">${messages.length} pesan${unreadCount
              ? ` • <span class="rb-inbox-unread-count">${unreadCount} belum dibaca</span>`
              : ''}</p>
          </div>
        </div>
        <div class="rb-inbox-search-wrap">
          <input type="text" id="rb-inbox-search" class="rb-inbox-search" placeholder="Cari pesan..." />
        </div>
      </div>
      <div class="rb-inbox-list" id="rb-inbox-list">
        ${messages.length === 0
          ? `<div class="rb-inbox-empty">
               <div class="rb-inbox-empty-icon">${ICON.mail}</div>
               <p class="rb-inbox-empty-text">Tidak ada pesan masuk</p>
             </div>`
          : messages.map(msg => `
              <a href="${msg.link}" class="rb-inbox-item ${msg.isRead ? '' : 'rb-inbox-unread'}"
                 data-search="${(msg.sender + ' ' + msg.subject).toLowerCase()}">
                <div class="rb-inbox-avatar">${msg.sender.charAt(0).toUpperCase()}</div>
                <div class="rb-inbox-content">
                  <div class="rb-inbox-row-top">
                    <span class="rb-inbox-sender">${msg.sender}</span>
                    <span class="rb-inbox-date">${msg.date}</span>
                  </div>
                  <div class="rb-inbox-subject">${msg.subject}</div>
                </div>
                ${!msg.isRead ? '<div class="rb-inbox-dot"></div>' : ''}
              </a>`).join('')
        }
      </div>
    `;

    $$('.box, .box-body', contentWrapper).forEach(el => {
      if (!el.closest('#rb-inbox-container')) el.style.display = 'none';
    });

    const mainContent = $('.content');
    if (mainContent) mainContent.insertBefore(inboxWrap, mainContent.firstChild);
    else contentWrapper.prepend(inboxWrap);

    document.getElementById('rb-inbox-search')?.addEventListener('input', function () {
      const q = this.value.toLowerCase();
      $$('.rb-inbox-item').forEach(item => {
        item.style.display = (item.getAttribute('data-search') || '').includes(q) ? '' : 'none';
      });
    });
  }, 400);
}

// ═══════════════════════════════════════════════════════
// §24 — BOXES / TABLES / FORMS / MODALS
// ═══════════════════════════════════════════════════════
function redesignBoxes() {
  $$('.box').forEach(b => {
    if (b.classList.contains('rb-box')) return;
    b.classList.add('rb-box');
    b.style.removeProperty('border-top');
    b.style.removeProperty('border-top-color');
    b.style.removeProperty('border-top-width');
    // Hilangkan warna solid AdminLTE (biru, merah, dll)
    ['blue','green','red','yellow','orange','teal','purple','navy','warning','info','danger','success','primary']
      .forEach(c => b.classList.remove('box-' + c));
  });
  $$('.box-header').forEach(h => {
    if (h.classList.contains('rb-box-header')) return;
    h.classList.add('rb-box-header');
    h.classList.remove('with-border', 'header_primary', 'bg-blue', 'bg-primary');
  });
  $$('.box-body').forEach(b  => { if (!b.classList.contains('rb-box-body'))   b.classList.add('rb-box-body'); });
  $$('.box-title').forEach(t => { if (!t.classList.contains('rb-box-title'))  t.classList.add('rb-box-title'); });
  $$('.box-footer').forEach(f => { if (!f.classList.contains('rb-box-footer')) f.classList.add('rb-box-footer'); });
}

function redesignTables() {
  $$('table.table').forEach(table => {
    if (table.classList.contains('rb-table')) return;
    table.classList.add('rb-table');
    if (!table.closest('.rb-table-wrap') && !table.closest('.table-responsive')) {
      const wrap     = document.createElement('div');
      wrap.className = 'rb-table-wrap';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    }
  });
}

function redesignForms() {
  $$('.form-control').forEach(el => {
    if (!el.classList.contains('rb-form-control')) el.classList.add('rb-form-control');
  });
  $$('.form-group').forEach(el => {
    if (!el.classList.contains('rb-form-group')) el.classList.add('rb-form-group');
  });
  $$('.input-group').forEach(el => {
    if (!el.classList.contains('rb-input-group')) el.classList.add('rb-input-group');
  });
}

function redesignModals() {
  $$('.modal-content').forEach(modal => {
    if (modal.classList.contains('rb-modal-done')) return;
    modal.classList.add('rb-modal', 'rb-modal-done');

    const hdr = modal.querySelector('.modal-header');
    if (hdr) {
      hdr.classList.add('rb-modal-header');
      hdr.classList.remove('header_primary', 'bg-blue', 'bg-primary', 'bg-info');
      const title = hdr.querySelector('.modal-title');
      if (title) {
        title.classList.remove('text-info', 'text-primary', 'text-white');
        title.classList.add('rb-modal-title');
      }
      const close = hdr.querySelector('.close');
      if (close) close.classList.add('rb-modal-close');
    }

    modal.querySelector('.modal-body')?.classList.add('rb-modal-body');
    modal.querySelector('.modal-footer')?.classList.add('rb-modal-footer');
  });
}

// ═══════════════════════════════════════════════════════
// §25 — BUG FIXES (FIX: setInterval defense + smarter observer)
// ═══════════════════════════════════════════════════════
function activateBugFixes() {
  const skinClasses = [...SKIN_CLASSES];

  function defeatAdminLTE() {
    document.body.classList.remove(...skinClasses);
    if (document.body.style.paddingRight) document.body.style.paddingRight = '';
    // Pastikan dynamic theme selalu inject ulang setelah AdminLTE coba balik
    injectDynamicThemeStyle(isDark());
  }

  defeatAdminLTE();

  // setInterval: fight back aggressively untuk 5 detik pertama
  let counter = 0;
  const interval = setInterval(() => {
    defeatAdminLTE();
    if (++counter >= 10) clearInterval(interval); // 10 × 500ms = 5 detik
  }, 500);

  // MutationObserver: deteksi jika skin class di-add kembali
  const obs = new MutationObserver((mutations) => {
    mutations.forEach(({ type, attributeName }) => {
      if (type === 'attributes' && attributeName === 'class') {
        const hasSkin = skinClasses.some(c => document.body.classList.contains(c));
        if (hasSkin) defeatAdminLTE();
      }
      if (type === 'attributes' && attributeName === 'style') {
        if (document.body.style.paddingRight) document.body.style.paddingRight = '';
      }
    });

    // Fix modal overflow
    if (document.body.classList.contains('modal-open')) {
      document.body.style.overflowY = 'scroll';
    }
  });
  obs.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
}

// ═══════════════════════════════════════════════════════
// §26 — MUTATION WATCHER (dynamic AJAX content)
// ═══════════════════════════════════════════════════════
function watchDynamicContent() {
  const target = $('.content-wrapper') || document.body;
  let   timer  = null;

  const obs = new MutationObserver(() => {
    // Debounce untuk performa
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      redesignBoxes();
      redesignTables();
      redesignForms();
      redesignModals();
    }, 300);
  });

  obs.observe(target, { childList: true, subtree: true });
}

// ═══════════════════════════════════════════════════════
// §27 — INIT APP PAGE
// ═══════════════════════════════════════════════════════
function initAppPage(page) {
  // 1. Bangun chrome (header, sidebar, footer)
  rebuildHeader();
  rebuildSidebar();
  rebuildFooter();
  redesignBreadcrumbs();

  // 2. Redesign umum
  redesignBoxes();
  redesignTables();
  redesignForms();
  redesignModals();

  // 3. Bug fixes & watchers
  activateBugFixes();
  watchDynamicContent();

  // 4. Page-specific redesign
  if (page.isInbox) {
    initInboxPage();

  } else if (page.isDashboard) {
    redesignDashboardCards();
    setTimeout(redesignDashboardCards, 400);
    setTimeout(redesignDashboardCards, 900);
    setTimeout(redesignDashboardCards, 1800);

  } else if (page.isPresensi) {
    redesignPresensiPage();
    setTimeout(redesignPresensiPage, 400);
    setTimeout(redesignPresensiPage, 900);
    setTimeout(redesignPresensiPage, 1800);

  } else if (page.isPertemuan || page.isForum || page.isTugas) {
    redesignKelasPage();
    setTimeout(redesignKelasPage, 400);
    setTimeout(redesignKelasPage, 1000);

  } else if (page.isProfil) {
    redesignProfilePage();
    setTimeout(redesignProfilePage, 400);

  } else {
    // Generic: retry boxes/tables/forms
    setTimeout(() => {
      redesignBoxes();
      redesignTables();
      redesignForms();
    }, 500);
  }
}

// ═══════════════════════════════════════════════════════
// §28 — MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════
function main() {
  if (handleRedirects()) return;

  globalCleanup();

  const page = detectPage();

  if      (page.isLoginOld)  initLoginPage(false);
  else if (page.isLoginNew)  initLoginPage(true);
  else if (page.isForgot)    initForgotPage();
  else if (page.isReset)     initResetPage();
  else if (page.isApp)       initAppPage(page);
}

// ── BOOTSTRAP: tema dulu (default LIGHT), lalu main ──
initTheme(() => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
});