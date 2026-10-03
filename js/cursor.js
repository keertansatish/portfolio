// ============================================================
// CURSOR.JS — Custom Cursor System
// Crimson glowing cursor with hover/magnetic effects
// ============================================================

class CustomCursor {
  constructor() {
    this.cursor = document.getElementById('custom-cursor');
    this.dot = this.cursor?.querySelector('.cursor-dot');
    this.ring = this.cursor?.querySelector('.cursor-ring');
    this.label = this.cursor?.querySelector('.cursor-label');

    this.pos = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.visible = false;
    this.hovering = false;
    this.enabled = false;

    this._rafId = null;
  }

  init() {
    // Disable on touch devices or reduced motion
    if (this._isTouchDevice() || this._prefersReducedMotion()) {
      if (this.cursor) this.cursor.style.display = 'none';
      document.body.style.cursor = 'auto';
      return;
    }

    this.enabled = true;
    this._bindEvents();
    this._animate();
  }

  _isTouchDevice() {
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }

  _prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  _bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;

      if (!this.visible) {
        this.visible = true;
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;
        this.cursor.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
      this.visible = false;
    });

    document.addEventListener('mouseenter', () => {
      this.cursor.style.opacity = '1';
      this.visible = true;
    });

    // Set up interactive element detection
    this._setupHoverTargets();
  }

  _setupHoverTargets() {
    const interactiveSelectors = 'a, button, .btn, .project-card, .skill-card, .achievement-card, .nav-toggle, input, textarea';

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(interactiveSelectors);
      if (target) {
        this.hovering = true;
        this.cursor.classList.add('hovering');

        // Check for project cards
        if (target.classList.contains('project-card')) {
          this.cursor.classList.add('has-label');
          this.label.textContent = 'VIEW';
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(interactiveSelectors);
      if (target) {
        this.hovering = false;
        this.cursor.classList.remove('hovering', 'has-label');
        this.label.textContent = '';
      }
    });
  }

  _animate() {
    // Smooth lerp for cursor position
    const ease = 0.15;
    this.pos.x += (this.target.x - this.pos.x) * ease;
    this.pos.y += (this.target.y - this.pos.y) * ease;

    if (this.cursor) {
      this.cursor.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
    }

    this._rafId = requestAnimationFrame(() => this._animate());
  }

  // Expose cursor position for other systems
  getPosition() {
    return { x: this.target.x, y: this.target.y };
  }

  getNormalizedPosition() {
    return {
      x: (this.target.x / window.innerWidth) * 2 - 1,
      y: -(this.target.y / window.innerHeight) * 2 + 1
    };
  }

  dispose() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }
}

// Export globally
window.CustomCursor = CustomCursor;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.customCursor = new CustomCursor();
    window.customCursor.init();
  });
} else {
  window.customCursor = new CustomCursor();
  window.customCursor.init();
}
