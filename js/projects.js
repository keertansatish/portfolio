// ============================================================
// PROJECTS.JS — Project Card Generation, Modal, Interactions
// Data-driven project rendering with detail modal
// ============================================================

class ProjectSystem {
  constructor() {
    this.grid = document.getElementById('projects-grid');
    this.modal = document.getElementById('project-modal');
    this.modalBody = document.getElementById('modal-body');
    this.modalClose = document.getElementById('modal-close');
    this.currentProject = null;
  }

  init() {
    this._renderProjects();
    this._bindModalEvents();
  }

  _renderProjects() {
    const data = window.portfolioData;
    if (!data || !data.projects) return;

    data.projects.forEach((project, index) => {
      const card = this._createCard(project, index);
      this.grid.appendChild(card);
    });
  }

  _createCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card scroll-reveal';
    card.dataset.staggerDelay = (index * 100).toString();
    card.dataset.projectIndex = index;

    let html = '';

    if (project.featured) {
      html += '<div class="project-card-featured"></div>';
    }

    html += `
      <h3 class="project-card-title">${this._escape(project.title)}</h3>
      <p class="project-card-subtitle">${this._escape(project.subtitle)}</p>
      <p class="project-card-desc">${this._escape(project.description)}</p>
      <div class="project-card-tech">
        ${project.technologies.map(t => `<span class="tech-tag">${this._escape(t)}</span>`).join('')}
      </div>
      <div class="project-card-links">
    `;

    if (project.github) {
      html += `
        <a href="${this._escape(project.github)}" class="project-link" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GITHUB
        </a>
      `;
    }

    if (project.demo) {
      html += `
        <a href="${this._escape(project.demo)}" class="project-link" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
          LIVE DEMO
        </a>
      `;
    }

    html += `</div>`;
    html += `<span class="project-card-view">CLICK FOR DETAILS →</span>`;

    card.innerHTML = html;

    // Click to open modal
    card.addEventListener('click', (e) => {
      // Don't open modal if clicking a link
      if (e.target.closest('a')) return;
      this._openModal(project);
    });

    return card;
  }

  _openModal(project) {
    this.currentProject = project;

    let html = `
      <h2 class="modal-title">${this._escape(project.title)}</h2>
      <p class="modal-subtitle">${this._escape(project.subtitle)}</p>
    `;

    if (project.problem) {
      html += `
        <div class="modal-section">
          <div class="modal-section-label">THE PROBLEM</div>
          <p>${this._escape(project.problem)}</p>
        </div>
      `;
    }

    if (project.solution) {
      html += `
        <div class="modal-section">
          <div class="modal-section-label">THE SOLUTION</div>
          <p>${this._escape(project.solution)}</p>
        </div>
      `;
    }

    if (project.challenges && project.challenges.length > 0) {
      html += `
        <div class="modal-section">
          <div class="modal-section-label">KEY ENGINEERING CHALLENGES</div>
          <ul class="modal-challenges">
            ${project.challenges.map(c => `<li>${this._escape(c)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    html += `
      <div class="modal-section">
        <div class="modal-section-label">TECHNOLOGIES</div>
        <div class="modal-tech-tags">
          ${project.technologies.map(t => `<span class="tech-tag">${this._escape(t)}</span>`).join('')}
        </div>
      </div>
    `;

    html += `<div class="modal-links">`;
    if (project.github) {
      html += `
        <a href="${this._escape(project.github)}" class="modal-link-btn" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          VIEW ON GITHUB
        </a>
      `;
    }
    if (project.demo) {
      html += `
        <a href="${this._escape(project.demo)}" class="modal-link-btn" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
          LIVE DEMO
        </a>
      `;
    }
    html += `</div>`;

    this.modalBody.innerHTML = html;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  _closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.currentProject = null;
  }

  _bindModalEvents() {
    // Close button
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this._closeModal());
    }

    // Backdrop click
    const backdrop = this.modal?.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this._closeModal());
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
        this._closeModal();
      }
    });
  }

  _escape(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
}

window.ProjectSystem = ProjectSystem;
