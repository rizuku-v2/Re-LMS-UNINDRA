/**
 * LMS Ultra Reborn v5.0 — popup.js
 * FIX: Default tema sekarang LIGHT MODE
 */
document.addEventListener('DOMContentLoaded', () => {
  const toggleDark = document.getElementById('toggleDark');
  const applyBtn   = document.getElementById('applyBtn');
  const modeLabel  = document.getElementById('modeLabel');
  const modeDesc   = document.getElementById('modeDesc');
  const statusDot  = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  // FIX: Default LIGHT MODE — isDark harus benar-benar `true` untuk aktif dark
  chrome.storage.sync.get(['isDark'], (data) => {
    // isDark === true → dark; undefined/false → light (default)
    const dark = data.isDark === true;
    toggleDark.checked = dark;
    updateModeUI(dark);
  });

  // Check tab status
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url || '';
    const isLMS = url.includes('lms.unindra.ac.id');
    statusDot.className  = 'dot' + (isLMS ? '' : ' inactive');
    statusText.textContent = isLMS
      ? 'Ekstensi aktif di LMS Unindra'
      : 'Buka lms.unindra.ac.id dulu';
    applyBtn.disabled = !isLMS;
    if (!isLMS) {
      applyBtn.style.opacity = '0.5';
      applyBtn.style.cursor  = 'not-allowed';
    }
  });

  // Sync label saat toggle berubah
  toggleDark.addEventListener('change', () => {
    updateModeUI(toggleDark.checked);
  });

  function updateModeUI(dark) {
    modeLabel.textContent = dark ? 'Mode Gelap' : 'Mode Terang';
    modeDesc.textContent  = dark
      ? 'Tampilan gelap, cocok malam hari'
      : 'Default: tampilan terang & bersih';
  }

  // Apply & reload
  applyBtn.addEventListener('click', () => {
    if (applyBtn.disabled) return;
    applyBtn.textContent = 'Menerapkan...';
    applyBtn.disabled    = true;

    chrome.storage.sync.set({ isDark: toggleDark.checked }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.reload(tabs[0].id, {}, () => {
            setTimeout(() => window.close(), 300);
          });
        }
      });
    });
  });
});