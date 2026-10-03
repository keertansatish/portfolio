(function () {
  'use strict';

  const iconArrow = '<span aria-hidden="true">→</span>';
  const iconGithub = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-.12-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>';
  const iconExternal = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>';

  const escapeHtml = (value) => {
    const node = document.createElement('div');
    node.textContent = value || '';
    return node.innerHTML;
  };

  class PostHeroSystem {
    constructor(data) {
      this.data = data;
      this.modal = document.getElementById('project-modal');
      this.modalBody = document.getElementById('modal-body');
      this.lastFocused = null;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    init() {
      this.renderAbout();
      this.renderSkills();
      this.renderProjects();
      this.renderTimeline();
      this.renderEducation();
      this.renderAchievements();
      this.renderContact();
      this.renderFooter();
      this.bindTilt(document.querySelectorAll('.identity-card, .timeline-item, .achievement-card, .education-layout'));
      this.bindModal();
      this.bindNavigation();
      this.bindReveals();
    }

    renderAbout() {
      const about = this.data.about;
      const intro = document.getElementById('about-intro-text');
      const focus = document.getElementById('about-focus');
      const statements = document.getElementById('about-statements');
      if (!about) return;
      if (intro) intro.textContent = about.intro;
      if (focus) focus.innerHTML = about.focus.map((item) => `<span class="focus-tag">${escapeHtml(item)}</span>`).join('');
      if (statements) statements.innerHTML = about.statements.map((word) => `<span class="statement-word">${escapeHtml(word)}</span>`).join('');
      const identity = document.getElementById('identity-grid');
      if (identity) {
        identity.innerHTML = ['COMPUTER SCIENCE', 'AI & DATA SCIENCE', 'FULL-STACK', 'AI SYSTEMS'].map((label, index) => `<div class="identity-card reveal-item"><span>0${index + 1}</span><strong>${label}</strong></div>`).join('');
      }
    }

    renderSkills() {
      const grid = document.getElementById('skills-grid');
      if (!grid || !this.data.skills) return;
      grid.innerHTML = this.data.skills.categories.map((category, index) => `
        <article class="skill-card reveal-item" tabindex="0" style="--card-index:${index}">
          <div class="skill-card-top"><span class="card-index">0${index + 1}</span><span class="skill-cat-title">${escapeHtml(category.name)}</span></div>
          <div class="skill-items-list">${category.items.map((item) => `<span class="skill-pill">${escapeHtml(item)}</span>`).join('')}</div>
          <span class="skill-card-hint">CAPABILITY SET ${iconArrow}</span>
        </article>
      `).join('');
      this.bindTilt(grid.querySelectorAll('.skill-card'));
    }

    renderProjects() {
      const grid = document.getElementById('projects-grid');
      if (!grid || !this.data.projects) return;
      grid.innerHTML = this.data.projects.map((project, index) => `
        <article class="project-card reveal-item" tabindex="0" data-project-index="${index}" style="--card-index:${index}">
          <div class="project-visual"><span>ARTIFACT // ${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(project.title.slice(0, 2).toUpperCase())}</strong></div>
          <div class="project-card-body"><div class="project-header-row"><div><p class="project-kicker">${escapeHtml(project.subtitle)}</p><h3 class="project-title">${escapeHtml(project.title)}</h3></div><span class="project-open" aria-hidden="true">↗</span></div>
          <p class="project-desc">${escapeHtml(project.description)}</p><div class="project-tech-pills">${project.technologies.map((tech) => `<span class="tech-tag">${escapeHtml(tech)}</span>`).join('')}</div>
          <div class="project-card-footer"><span>OPEN DOSSIER</span>${iconArrow}</div></div>
        </article>
      `).join('');
      grid.querySelectorAll('.project-card').forEach((card) => {
        const open = () => this.openProject(this.data.projects[Number(card.dataset.projectIndex)], card);
        card.addEventListener('click', (event) => { if (!event.target.closest('a')) open(); });
        card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
      });
      this.bindTilt(grid.querySelectorAll('.project-card'));
    }

    renderTimeline() {
      const timeline = document.getElementById('timeline-list');
      if (!timeline || !this.data.experience) return;
      timeline.insertAdjacentHTML('beforeend', this.data.experience.map((item, index) => `
        <article class="timeline-item reveal-item" style="--card-index:${index}"><span class="timeline-dot"></span><div class="timeline-meta"><span>${escapeHtml(item.period)}</span><span>${escapeHtml(item.type)}</span></div><h3>${escapeHtml(item.title)}</h3><p class="timeline-org">${escapeHtml(item.organization)}</p><p class="timeline-desc">${escapeHtml(item.description)}</p><div class="timeline-highlights">${item.highlights.map((highlight) => `<span>${escapeHtml(highlight)}</span>`).join('')}</div></article>
      `).join(''));
    }

    renderEducation() {
      const container = document.getElementById('education-content');
      const education = this.data.education;
      if (!container || !education) return;
      container.innerHTML = `<div class="education-layout reveal-item"><div class="education-main"><p class="eyebrow">ACADEMIC FOUNDATION</p><h3>${escapeHtml(education.university)}</h3><p class="education-degree">${escapeHtml(education.degree)}</p><p class="education-specialization">${escapeHtml(education.specialization)}</p><div class="education-meta"><span>${escapeHtml(education.period)}</span>${education.cgpa ? `<span>CGPA ${escapeHtml(education.cgpa)}</span>` : ''}</div></div><div class="education-coursework"><p class="eyebrow">KEY COURSEWORK</p><div>${education.coursework.map((course) => `<span>${escapeHtml(course)}</span>`).join('')}</div></div></div>`;
    }

    renderAchievements() {
      const grid = document.getElementById('achievements-grid');
      if (!grid || !this.data.achievements) return;
      grid.innerHTML = this.data.achievements.map((achievement, index) => `<article class="achievement-card reveal-item" style="--card-index:${index}"><span class="achievement-index">0${index + 1}</span><div class="achievement-metric">${escapeHtml(achievement.metric)}</div><h3>${escapeHtml(achievement.label)}</h3><p>${escapeHtml(achievement.detail)}</p></article>`).join('');
    }

    renderContact() {
      const contact = this.data.contact;
      const subtext = document.getElementById('contact-subtext');
      const links = document.getElementById('contact-links');
      if (!contact) return;
      if (subtext) subtext.textContent = contact.subtext;
      if (links) links.innerHTML = `<a href="mailto:${escapeHtml(contact.email)}" class="contact-link">EMAIL ${iconArrow}</a><a href="${escapeHtml(contact.github)}" class="contact-link" target="_blank" rel="noopener noreferrer">GITHUB ${iconGithub}</a><a href="${escapeHtml(contact.linkedin)}" class="contact-link" target="_blank" rel="noopener noreferrer">LINKEDIN ${iconExternal}</a>`;
      const contactButton = document.getElementById('btn-contact');
      if (contactButton) contactButton.href = `mailto:${contact.email}`;
      const resume = document.getElementById('btn-resume');
      if (resume) resume.href = this.data.personal.resumeUrl || '#';
    }

    renderFooter() {
      const footer = document.getElementById('footer-links');
      const contact = this.data.contact;
      if (footer && contact) footer.innerHTML = `<a href="${escapeHtml(contact.github)}" target="_blank" rel="noopener noreferrer">GITHUB</a><a href="${escapeHtml(contact.linkedin)}" target="_blank" rel="noopener noreferrer">LINKEDIN</a><a href="mailto:${escapeHtml(contact.email)}">EMAIL</a>`;
    }

    bindTilt(elements) {
      if (this.reducedMotion || window.matchMedia('(hover: none)').matches) return;
      elements.forEach((element) => {
        let frame = null;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let targetScale = 1;
        let currentScale = 1;
        const animate = () => {
          currentX += (targetX - currentX) * 0.12;
          currentY += (targetY - currentY) * 0.12;
          currentScale += (targetScale - currentScale) * 0.12;
          element.style.transform = `perspective(900px) rotateX(${currentY}deg) rotateY(${currentX}deg) translateY(-5px) scale(${currentScale})`;
          if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01 || Math.abs(targetScale - currentScale) > 0.001) frame = requestAnimationFrame(animate);
          else frame = null;
        };
        element.addEventListener('pointermove', (event) => {
          const rect = element.getBoundingClientRect();
          targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 4;
          targetY = ((event.clientY - rect.top) / rect.height - 0.5) * -4;
          targetScale = 1.015;
          if (!frame) frame = requestAnimationFrame(animate);
        });
        element.addEventListener('pointerleave', () => {
          targetX = 0;
          targetY = 0;
          targetScale = 1;
          if (!frame) frame = requestAnimationFrame(animate);
          element.addEventListener('transitionend', () => { element.style.transform = ''; }, { once: true });
        });
      });
    }

    bindReveals() {
      const revealItems = document.querySelectorAll('.reveal-item, .portfolio-section .section-header');
      if (this.reducedMotion || !('IntersectionObserver' in window)) {
        revealItems.forEach((item) => item.classList.add('is-visible'));
        return;
      }
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px' });
      revealItems.forEach((item) => observer.observe(item));
      const timeline = document.getElementById('experience');
      const progress = document.querySelector('.timeline-progress');
      if (timeline && progress) window.addEventListener('scroll', () => { const rect = timeline.getBoundingClientRect(); const amount = Math.min(100, Math.max(0, (window.innerHeight * 0.78 - rect.top) / rect.height * 100)); progress.style.height = `${amount}%`; }, { passive: true });
    }

    bindNavigation() {
      const nav = document.getElementById('main-nav');
      const links = Array.from(document.querySelectorAll('.nav-link'));
      const mobileToggle = document.getElementById('mobile-toggle');
      links.forEach((link) => link.addEventListener('click', (event) => { const target = document.querySelector(link.getAttribute('href')); if (target) { event.preventDefault(); target.scrollIntoView({ behavior: this.reducedMotion ? 'auto' : 'smooth' }); document.body.classList.remove('menu-open'); } }));
      if (mobileToggle) mobileToggle.addEventListener('click', () => document.body.classList.toggle('menu-open'));
      const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)); }), { rootMargin: '-35% 0px -55% 0px' });
      sections.forEach((section) => observer.observe(section));
      if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
    }

    bindModal() {
      const close = () => { this.modal.classList.remove('open'); document.body.classList.remove('modal-open'); if (this.lastFocused) this.lastFocused.focus(); };
      document.getElementById('modal-close')?.addEventListener('click', close);
      this.modal?.addEventListener('click', (event) => { if (event.target === this.modal) close(); });
      document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && this.modal?.classList.contains('open')) close(); });
      this.closeModal = close;
    }

    openProject(project, source) {
      if (!this.modal || !this.modalBody) return;
      this.lastFocused = source;
      this.modalBody.innerHTML = `<p class="eyebrow">ENGINEERED SYSTEM // TECHNICAL DOSSIER</p><h2 id="modal-title">${escapeHtml(project.title)}</h2><p class="modal-subtitle">${escapeHtml(project.subtitle)}</p><p class="modal-description">${escapeHtml(project.description)}</p><div class="modal-grid"><div><p class="eyebrow">THE PROBLEM</p><p>${escapeHtml(project.problem)}</p></div><div><p class="eyebrow">THE SOLUTION</p><p>${escapeHtml(project.solution)}</p></div></div><div class="modal-block"><p class="eyebrow">KEY ENGINEERING CHALLENGE</p><ul>${project.challenges.map((challenge) => `<li>${escapeHtml(challenge)}</li>`).join('')}</ul></div><div class="modal-tech">${project.technologies.map((tech) => `<span class="tech-tag">${escapeHtml(tech)}</span>`).join('')}</div><div class="modal-actions">${project.github ? `<a class="contact-primary" href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer">VIEW GITHUB ${iconGithub}</a>` : ''}${project.demo ? `<a class="contact-link" href="${escapeHtml(project.demo)}" target="_blank" rel="noopener noreferrer">LIVE DEMO ${iconExternal}</a>` : ''}</div>`;
      this.modal.classList.add('open');
      document.body.classList.add('modal-open');
      document.getElementById('modal-close')?.focus();
    }
  }

  window.PostHeroSystem = PostHeroSystem;
})();
