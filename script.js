// DevCV AI - Interactions Script

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
        // Auto-resize after input
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    });
  });
}

// Setup navigation with section switching
function setupNavigation() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    
    // Skip settings and other non-section links
    if (href === '#settings') return;
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const sectionId = href.substring(1); // Remove # prefix
      const sectionName = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
      
      // Only handle portfolio, awards, skills, and education sections
      if (sectionId !== 'portfolio' && sectionId !== 'awards' && sectionId !== 'skills' && sectionId !== 'education') return;
      
      // Find currently visible section
      const currentSection = document.querySelector('section[id$="-section"][style*="display: block"]');
      
      // If switching to already active section, skip
      if (currentSection && currentSection.id === sectionId + '-section') {
        return;
      }
      
      // Fade out current section
      if (currentSection) {
        currentSection.classList.add('fade-out');
        currentSection.classList.remove('fade-in');
        
        // Wait for fade-out animation to complete
        setTimeout(() => {
          currentSection.style.display = 'none';
          currentSection.classList.remove('fade-out');
        }, 300);
      }
      
      // Show and fade in new section
      const selectedSection = document.getElementById(sectionId + '-section');
      if (selectedSection) {
        selectedSection.style.display = 'block';
        selectedSection.classList.remove('fade-out');
        selectedSection.classList.add('fade-in');
        
        // Remove fade-in class after animation completes
        setTimeout(() => {
          selectedSection.classList.remove('fade-in');
        }, 300);
      }
      
      // Update active nav state - remove from all, add to current
      navLinks.forEach((l) => {
        if (l.getAttribute('href') !== '#settings') {
          l.classList.remove('active');
          l.removeAttribute('aria-current');
        }
      });
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
      
      // Update greeting message
      updateGreeting(sectionId);
      
      // Update active suggestion chip
      updateActiveSuggestionChip(sectionId);
    });
  });
}

// Update greeting based on section
function updateGreeting(sectionId) {
  const greetingEl = document.getElementById('greeting-dynamic');
  if (!greetingEl) return;
  
  const messages = {
    portfolio: 'You selected <strong>Portfolio</strong>. Here are some of my recent projects and professional work.',
    awards: 'You selected <strong>Awards</strong>. Here is a curated selection of professional recognitions and certifications.',
    skills: 'You selected <strong>Skills</strong>. Here is an overview of my technical capabilities, organized by domain.',
    education: 'You selected <strong>Education</strong>. Here is a summary of my educational background, focusing on Computer Science and relevant achievements.'
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

// Setup send button
function setupSendButton() {
  const textarea = document.querySelector('textarea[placeholder]');
  const sendBtn = document.querySelector('button[title]') || 
                  document.querySelector('button:last-of-type');
  
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
    if (textarea.value.trim()) {
      console.log('Message sent:', textarea.value);
      textarea.value = '';
      updateSendBtn();
      textarea.focus();
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
    setupSendButton();
  } catch (e) {
    console.warn('Send button setup failed:', e.message);
  }

  try {
    // Initialize with Skills section visible by default
    const skillsSection = document.getElementById('skills-section');
    const portfolioSection = document.getElementById('portfolio-section');
    const awardsSection = document.getElementById('awards-section');
    
    // Show Skills, hide Portfolio & Awards
    if (skillsSection) skillsSection.style.display = 'block';
    if (portfolioSection) portfolioSection.style.display = 'none';
    if (awardsSection) awardsSection.style.display = 'none';
    
    // Set Skills nav link as active (use proper selector loop to avoid invalid compound selectors)
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === '#settings') return;
      link.removeAttribute('aria-current');
    });
    const skillsNavLink = document.querySelector('a[href="#skills"]');
    if (skillsNavLink) skillsNavLink.setAttribute('aria-current', 'page');
    
    updateGreeting('skills');
    updateActiveSuggestionChip('skills');
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
