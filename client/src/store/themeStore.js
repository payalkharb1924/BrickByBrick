import { create } from 'zustand';

const stored = localStorage.getItem('bbb_theme') || 'dark';

function applyTheme(theme) {
  document.body.classList.remove('theme-cool');
  if (theme === 'cool') document.body.classList.add('theme-cool');
}

// Apply on load
applyTheme(stored);

const useThemeStore = create((set) => ({
  theme: stored,
  setTheme: (theme) => {
    localStorage.setItem('bbb_theme', theme);
    applyTheme(theme);
    set({ theme });
  },
}));

export default useThemeStore;
