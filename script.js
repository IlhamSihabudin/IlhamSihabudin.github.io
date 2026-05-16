// DevCV AI - Interactions Script

const SECTION_IDS = ['about', 'work-experience', 'education', 'skills', 'portfolio', 'awards', 'settings'];
const THEME_STORAGE_KEY = 'devcv-theme-preference';

const SECTION_ALIASES = [
  { sectionId: 'work-experience', aliases: ['/work-experience', '/experience', 'work experience', 'experience'] },
  { sectionId: 'portfolio', aliases: ['/portfolio', 'portfolio'] },
  { sectionId: 'education', aliases: ['/education', 'education'] },
  { sectionId: 'skills', aliases: ['/skills', '/tech-stack', 'tech stack', 'skills'] },
  { sectionId: 'awards', aliases: ['/awards', 'awards'] },
  { sectionId: 'settings', aliases: ['/settings', 'settings'] },
  { sectionId: 'about', aliases: ['/about'] }
];

function findSectionInMessage(message) {
  const normalizedMessage = message.toLowerCase();
  return SECTION_ALIASES.find(({ aliases }) =>
    aliases.some(alias => normalizedMessage.includes(alias))
  )?.sectionId || null;
}

// Auto-resize textarea based on content
function setupTextareaAutosize() {
  const textarea = document.querySelector('textarea[placeholder]');
  if (!textarea) return;

  const autoResize = () => {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = newHeight + 'px';
  };

  textarea.addEventListener('input', autoResize);
  textarea.addEventListener('paste', () => {
    setTimeout(autoResize, 0);
  });
}

// Setup chip navigation and click handlers
function setupChips() {
  const chips = document.querySelectorAll('.chip');
  
  chips.forEach((chip, index) => {
    // Make chips focusable via Tab
    chip.setAttribute('tabindex', '0');
    
    // Handle Enter/Space to activate chip
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        chip.click();
      }
    });

    // Click handler: populate textarea with chip command
    chip.addEventListener('click', () => {
      const textarea = document.querySelector('textarea[placeholder]');
      if (textarea) {
        textarea.value = chip.textContent.trim();
        textarea.focus();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        // Auto-resize after input
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    });
  });
}

function showSection(sectionId) {
  if (!SECTION_IDS.includes(sectionId)) return false;

  const selectedSection = document.getElementById(sectionId + '-section');
  if (!selectedSection) return false;

  const currentSection = document.querySelector('section[id$="-section"][style*="display: block"]');

  if (currentSection && currentSection.id === sectionId + '-section') {
    updateActiveNavLink(sectionId);
    updateGreeting(sectionId);
    updateActiveSuggestionChip(sectionId);
    updateChatInputVisibility(sectionId);
    return true;
  }

  if (currentSection) {
    currentSection.classList.add('fade-out');
    currentSection.classList.remove('fade-in');

    setTimeout(() => {
      currentSection.style.display = 'none';
      currentSection.classList.remove('fade-out');
    }, 300);
  }

  selectedSection.style.display = 'block';
  selectedSection.classList.remove('fade-out');
  selectedSection.classList.add('fade-in');

  setTimeout(() => {
    selectedSection.classList.remove('fade-in');
  }, 300);

  updateActiveNavLink(sectionId);
  updateGreeting(sectionId);
  updateActiveSuggestionChip(sectionId);
  updateChatInputVisibility(sectionId);
  closeMobileNav();
  return true;
}

function updateActiveNavLink(sectionId) {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.classList.remove('active');
    link.removeAttribute('aria-current');

    const icon = link.querySelector('.material-symbols-outlined');
    if (icon) icon.removeAttribute('data-weight');
  });

  if (sectionId === 'settings') return;

  const activeLinks = document.querySelectorAll(`a[href="#${sectionId}"]`);
  activeLinks.forEach((activeLink) => {
    activeLink.classList.add('active');
    activeLink.setAttribute('aria-current', 'page');

    const activeIcon = activeLink.querySelector('.material-symbols-outlined');
    if (activeIcon) activeIcon.setAttribute('data-weight', 'fill');
  });
}

// Setup navigation with section switching
function setupNavigation() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const sectionId = href.substring(1); // Remove # prefix
      showSection(sectionId);
    });
  });
}

function updateChatInputVisibility(sectionId) {
  const chatInputArea = document.getElementById('chat-input-area');
  if (!chatInputArea) return;

  chatInputArea.classList.toggle('hidden', sectionId === 'settings');
}

function openMobileNav() {
  const overlay = document.getElementById('mobile-nav-overlay');
  const button = document.getElementById('mobile-menu-button');
  if (!overlay) return;

  overlay.classList.remove('hidden');
  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
  });
  overlay.setAttribute('aria-hidden', 'false');
  if (button) button.setAttribute('aria-expanded', 'true');
}

function closeMobileNav() {
  const overlay = document.getElementById('mobile-nav-overlay');
  const button = document.getElementById('mobile-menu-button');
  if (!overlay) return;

  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  if (button) button.setAttribute('aria-expanded', 'false');

  setTimeout(() => {
    if (!overlay.classList.contains('is-open')) {
      overlay.classList.add('hidden');
    }
  }, 200);
}

function setupMobileNavigation() {
  const overlay = document.getElementById('mobile-nav-overlay');
  const menuButton = document.getElementById('mobile-menu-button');
  const closeButton = document.getElementById('mobile-nav-close');
  const settingsButton = document.getElementById('mobile-settings-button');

  if (menuButton) {
    menuButton.addEventListener('click', openMobileNav);
  }

  if (closeButton) {
    closeButton.addEventListener('click', closeMobileNav);
  }

  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      showSection('settings');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMobileNav();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });
}

// Update greeting based on section
function updateGreeting(sectionId) {
  const greetingEl = document.getElementById('greeting-dynamic');
  if (!greetingEl) return;
  
  const messages = {
    about: 'You selected <strong>About</strong>. Here is a concise professional profile summary.',
    'work-experience': 'You selected <strong>Work Experience</strong>. Here is a chronological breakdown of my roles from the CV.',
    portfolio: 'You selected <strong>Portfolio</strong>. Here are some of my recent projects and professional work.',
    awards: 'You selected <strong>Awards</strong>. Here are the awards listed in my CV.',
    skills: 'You selected <strong>Skills</strong>. Here is an overview of my technical skills, organized by domain.',
    education: 'You selected <strong>Education</strong>. Here is my education history from the CV.',
    settings: 'You selected <strong>Settings</strong>. Configure the interface theme and preferences.'
  };
  
  greetingEl.innerHTML = messages[sectionId] || messages.skills;
}

// Update active suggestion chip
function updateActiveSuggestionChip(sectionId) {
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.classList.remove('bg-primary/10', 'border-primary/30', 'text-primary', 'shadow-sm', 'ring-1', 'ring-primary/20');
    chip.classList.add('bg-surface-container', 'border-border-subtle', 'text-secondary');
    chip.removeAttribute('aria-pressed');
  });
  
  // Find and highlight the active chip
  const activeChip = Array.from(chips).find(chip => 
    chip.textContent.trim() === `/${sectionId}`
  );
  
  if (activeChip) {
    activeChip.classList.remove('bg-surface-container', 'border-border-subtle', 'text-secondary');
    activeChip.classList.add('bg-primary/10', 'border-primary/30', 'text-primary', 'shadow-sm', 'ring-1', 'ring-primary/20');
    activeChip.setAttribute('aria-pressed', 'true');
  }
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getSavedThemePreference() {
  return localStorage.getItem(THEME_STORAGE_KEY) || 'system';
}

function applyThemePreference(preference) {
  const resolvedTheme = preference === 'system' ? getSystemTheme() : preference;

  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  document.documentElement.classList.toggle('light', resolvedTheme === 'light');
  document.documentElement.dataset.themePreference = preference;

  updateThemeControls(preference);
}

function updateThemeControls(preference) {
  const themeButtons = document.querySelectorAll('[data-theme-option]');
  const themeStatus = document.getElementById('theme-status');

  themeButtons.forEach((button) => {
    const isActive = button.dataset.themeOption === preference;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  if (!themeStatus) return;

  const messages = {
    light: 'Currently using the light theme.',
    dark: 'Currently using the dark theme.',
    system: "Currently using the system's theme settings."
  };

  themeStatus.textContent = messages[preference] || messages.system;
}

function setupThemeSettings() {
  let pendingTheme = getSavedThemePreference();
  applyThemePreference(pendingTheme);

  const themeButtons = document.querySelectorAll('[data-theme-option]');
  const saveButton = document.getElementById('settings-save');
  const cancelButton = document.getElementById('settings-cancel');
  const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      pendingTheme = button.dataset.themeOption || 'system';
      applyThemePreference(pendingTheme);
    });
  });

  if (saveButton) {
    saveButton.addEventListener('click', () => {
      localStorage.setItem(THEME_STORAGE_KEY, pendingTheme);
      applyThemePreference(pendingTheme);
      showSection('about');
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      pendingTheme = getSavedThemePreference();
      applyThemePreference(pendingTheme);
      showSection('about');
    });
  }

  systemThemeQuery.addEventListener('change', () => {
    if (getSavedThemePreference() === 'system') {
      applyThemePreference('system');
    }
  });
}

function showChatLimitModal() {
  const modal = document.getElementById('chat-limit-modal');
  if (!modal) return;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function hideChatLimitModal() {
  const modal = document.getElementById('chat-limit-modal');
  if (!modal) return;

  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function setupChatLimitModal() {
  const modal = document.getElementById('chat-limit-modal');
  const laterButton = document.getElementById('chat-limit-later');

  if (laterButton) {
    laterButton.addEventListener('click', hideChatLimitModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideChatLimitModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideChatLimitModal();
  });
}

// Setup send button
function setupSendButton() {
  const textarea = document.querySelector('textarea[placeholder]');
  const sendBtn = document.querySelector('button[aria-label="Send message"]');
  
  if (!textarea || !sendBtn) return;

  const updateSendBtn = () => {
    if (textarea.value.trim().length > 0) {
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
    } else {
      sendBtn.disabled = true;
      sendBtn.style.opacity = '0.5';
    }
  };

  textarea.addEventListener('input', updateSendBtn);
  
  sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const message = textarea.value.trim();
    if (!message) return;

    const targetSection = findSectionInMessage(message);
    if (targetSection) {
      showSection(targetSection);
      textarea.value = '';
      textarea.style.height = 'auto';
      updateSendBtn();
      textarea.focus();
      return;
    }

    showChatLimitModal();
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // Initial state
  updateSendBtn();
}

// Prevent console errors for missing elements
function safeInit() {
  try {
    setupTextareaAutosize();
  } catch (e) {
    console.warn('Textarea autosize setup failed:', e.message);
  }

  try {
    setupChips();
  } catch (e) {
    console.warn('Chips setup failed:', e.message);
  }

  try {
    setupNavigation();
  } catch (e) {
    console.warn('Navigation setup failed:', e.message);
  }

  try {
    setupMobileNavigation();
  } catch (e) {
    console.warn('Mobile navigation setup failed:', e.message);
  }

  try {
    setupSendButton();
  } catch (e) {
    console.warn('Send button setup failed:', e.message);
  }

  try {
    setupChatLimitModal();
  } catch (e) {
    console.warn('Chat limit modal setup failed:', e.message);
  }

  try {
    setupThemeSettings();
  } catch (e) {
    console.warn('Theme settings setup failed:', e.message);
  }

  try {
    // Initialize with About section visible by default
    showSection('about');
  } catch (e) {
    console.warn('Initial section setup failed:', e.message);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInit);
} else {
  safeInit();
}
