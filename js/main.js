// ============================================================
// MAIN.JS — Application Orchestrator
// Initializes all systems, manages loading, populates content
// ============================================================

(function () {
  'use strict';

  // ── State ─────────────────────────────────────────────
  const app = {
    scene: null,
    cursor: null,
    navigation: null,
    projects: null,
    animations: null,
    initialized: false,
  };

  // ── Loading Screen ────────────────────────────────────
  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar');
  const loadingStatus = document.getElementById('loading-status');
  const checkEnv = document.getElementById('check-env');
  const checkChar = document.getElementById('check-char');
  const checkSys = document.getElementById('check-sys');

  function updateLoading(progress, status) {
    if (loadingBar) loadingBar.style.width = progress + '%';
    if (loadingStatus) loadingStatus.textContent = status;
  }

  function setCheckOnline(el) {
    if (el) el.classList.add('online');
  }

  function hideLoading() {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      // Remove from DOM after transition
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 1000);
    }
  }

  // ── Content Population ────────────────────────────────
  function populateContent() {
    const data = window.portfolioData;
    if (!data) return;

    // Hero
    const heroDesc = document.getElementById('hero-description');
    if (heroDesc) heroDesc.textContent = data.personal.description;

    // Resume button
    const ctaResume = document.getElementById('cta-resume');
    if (ctaResume && data.personal.resumeUrl) {
      ctaResume.href = data.personal.resumeUrl;
    }

    // About
    const aboutIntro = document.getElementById('about-intro-text');
    if (aboutIntro) aboutIntro.textContent = data.about.intro;

    // About focus tags
    const aboutFocus = document.getElementById('about-focus');
    if (aboutFocus && data.about.focus) {
      data.about.focus.forEach(item => {
        const tag = document.createElement('span');
        tag.className = 'focus-tag';
        tag.textContent = item;
        aboutFocus.appendChild(tag);
      });
    }

    // About statements
    const aboutStatements = document.getElementById('about-statements');
    if (aboutStatements && data.about.statements) {
      data.about.statements.forEach(word => {
        const span = document.createElement('span');
        span.className = 'statement-word';
        span.textContent = word;
        aboutStatements.appendChild(span);
      });
    }

    // Skills
    const skillsGrid = document.getElementById('skills-grid');
    if (skillsGrid && data.skills.categories) {
      data.skills.categories.forEach((cat, i) => {
        const card = document.createElement('div');
        card.className = 'skill-card scroll-reveal';
        card.dataset.staggerDelay = (i * 80).toString();
        card.innerHTML = `
          <div class="skill-card-name">${escapeHtml(cat.name)}</div>
          <div class="skill-card-items">
            ${cat.items.map(item => `<span class="skill-item">${escapeHtml(item)}</span>`).join('')}
          </div>
        `;
        skillsGrid.appendChild(card);
      });
    }

    // Experience timeline
    const timeline = document.getElementById('timeline');
    if (timeline && data.experience) {
      // Add progress bar
      const progress = document.createElement('div');
      progress.className = 'timeline-progress';
      timeline.appendChild(progress);

      data.experience.forEach(item => {
        const el = document.createElement('div');
        el.className = 'timeline-item';
        el.innerHTML = `
          <div class="timeline-dot"></div>
          <div class="timeline-type">${escapeHtml(item.type)}</div>
          <h3 class="timeline-title">${escapeHtml(item.title)}</h3>
          <p class="timeline-org">${escapeHtml(item.organization)}</p>
          <p class="timeline-period">${escapeHtml(item.period)}</p>
          <p class="timeline-desc">${escapeHtml(item.description)}</p>
          <div class="timeline-highlights">
            ${item.highlights.map(h => `<span class="timeline-highlight">${escapeHtml(h)}</span>`).join('')}
          </div>
        `;
        timeline.appendChild(el);
      });
    }

    // Education
    const eduContent = document.getElementById('education-content');
    if (eduContent && data.education) {
      const edu = data.education;
      eduContent.innerHTML = `
        <div class="education-main">
          <h3 class="education-university">${escapeHtml(edu.university)}</h3>
          <p class="education-degree">${escapeHtml(edu.degree)}</p>
          <p class="education-spec">${escapeHtml(edu.specialization)}</p>
          <p class="education-period">${escapeHtml(edu.period)}</p>
          ${edu.cgpa ? `<p class="education-cgpa">CGPA: ${escapeHtml(edu.cgpa)}</p>` : ''}
        </div>
        <div class="education-coursework">
          <div class="coursework-title">KEY COURSEWORK</div>
          <div class="coursework-list">
            ${edu.coursework.map(c => `<span class="coursework-item">${escapeHtml(c)}</span>`).join('')}
          </div>
        </div>
      `;
    }

    // Achievements
    const achievementsGrid = document.getElementById('achievements-grid');
    if (achievementsGrid && data.achievements) {
      data.achievements.forEach((ach, i) => {
        const card = document.createElement('div');
        card.className = 'achievement-card scroll-reveal';
        card.dataset.staggerDelay = (i * 100).toString();
        card.innerHTML = `
          <div class="achievement-metric">${escapeHtml(ach.metric)}</div>
          <div class="achievement-label">${escapeHtml(ach.label)}</div>
          <div class="achievement-detail">${escapeHtml(ach.detail)}</div>
        `;
        achievementsGrid.appendChild(card);
      });
    }

    // Resume button (footer area)
    const btnResume = document.getElementById('btn-resume');
    if (btnResume && data.personal.resumeUrl) {
      btnResume.href = data.personal.resumeUrl;
    }

    // Contact
    const contactHeading = document.getElementById('contact-heading');
    if (contactHeading) contactHeading.textContent = data.contact.heading;

    const contactSubtext = document.getElementById('contact-subtext');
    if (contactSubtext) contactSubtext.textContent = data.contact.subtext;

    const contactLinks = document.getElementById('contact-links');
    if (contactLinks) {
      contactLinks.innerHTML = `
        <a href="mailto:${escapeHtml(data.contact.email)}" class="contact-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          EMAIL
        </a>
        <a href="${escapeHtml(data.contact.github)}" class="contact-link" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GITHUB
        </a>
        <a href="${escapeHtml(data.contact.linkedin)}" class="contact-link" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          LINKEDIN
        </a>
      `;
    }

    // Contact CTA
    const btnContact = document.getElementById('btn-contact');
    if (btnContact && data.contact.email) {
      btnContact.href = `mailto:${data.contact.email}`;
    }

    // Footer links
    const footerLinks = document.getElementById('footer-links');
    if (footerLinks) {
      footerLinks.innerHTML = `
        <a href="${escapeHtml(data.contact.github)}" target="_blank" rel="noopener noreferrer">GITHUB</a>
        <a href="${escapeHtml(data.contact.linkedin)}" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
        <a href="mailto:${escapeHtml(data.contact.email)}">EMAIL</a>
      `;
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // ── Initialization ────────────────────────────────────
  async function initApp() {
    try {
      // Phase 1: Populate content
      updateLoading(10, 'LOADING CONTENT...');
      populateContent();

      // Phase 2: Initialize 3D scene
      updateLoading(25, 'INITIALIZING ENVIRONMENT...');
      app.scene = new SceneManager();
      const sceneReady = app.scene.init();

      if (sceneReady) {
        setCheckOnline(checkEnv);
        updateLoading(45, 'LOADING CHARACTER...');

        // Phase 3: Load character
        await app.scene.loadCharacter();
        setCheckOnline(checkChar);
        updateLoading(70, 'STARTING SYSTEMS...');

        // Start render loop
        app.scene.startLoop();
      } else {
        // WebGL not available — fallback already shown
        setCheckOnline(checkEnv);
        setCheckOnline(checkChar);
        updateLoading(70, 'STATIC MODE...');
      }

      // Phase 4: Initialize UI systems
      updateLoading(80, 'INITIALIZING INTERFACE...');

      // Custom cursor
      app.cursor = new CustomCursor();
      app.cursor.init();

      // Navigation
      app.navigation = new NavigationSystem();
      app.navigation.init();

      // Projects
      app.projects = new ProjectSystem();
      app.projects.init();

      // Animations
      app.animations = new AnimationSystem();

      updateLoading(95, 'SYSTEM READY');
      setCheckOnline(checkSys);

      // Phase 5: Complete
      updateLoading(100, 'SYSTEM ONLINE');

      setTimeout(() => {
        hideLoading();
        // Trigger hero reveal animations
        app.animations.init();
        app.animations.triggerHeroReveal();

        // Init card tilt on project cards
        setTimeout(() => {
          const cards = document.querySelectorAll('.project-card, .skill-card');
          app.animations.initCardTilt(cards);
        }, 500);
      }, 600);

      app.initialized = true;

    } catch (error) {
      console.error('Portfolio initialization error:', error);
      // Ensure loading screen hides even on error
      updateLoading(100, 'LOADED WITH WARNINGS');
      setCheckOnline(checkSys);
      setTimeout(() => {
        hideLoading();
        if (app.animations) {
          app.animations.init();
          app.animations.triggerHeroReveal();
        }
      }, 400);
    }
  }

  // ── Cleanup ───────────────────────────────────────────
  window.addEventListener('beforeunload', () => {
    if (app.scene) app.scene.dispose();
    if (app.cursor) app.cursor.dispose();
    if (app.animations) app.animations.dispose();
  });

  // ── Start ─────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
