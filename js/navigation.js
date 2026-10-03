// ============================================================
// NAVIGATION.JS — Navigation, Scroll Tracking, Mobile Menu
// Active section tracking + smooth scrolling + mobile overlay
// ============================================================

class NavigationSystem {
  constructor() {
    this.nav = document.getElementById('main-nav');
    this.navLinks = document.getElementById('nav-links');
    this.navToggle = document.getElementById('nav-toggle');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mobileMenuLinks = document.getElementById('mobile-menu-links');
    this.sections = [];
    this.activeLink = null;
    this.isMenuOpen = false;
  }

  init() {
    this._generateNavLinks();
    this._bindEvents();
    this._initScrollTracking();
  }

  _generateNavLinks() {
    const data = window.portfolioData;
    if (!data || !data.navigation) return;

    // Desktop nav
    data.navigation.forEach(item => {
      const link = document.createElement('a');
      link.href = item.target;
      link.textContent = item.label;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this._scrollToSection(item.target);
      });
      this.navLinks.appendChild(link);
    });

    // Mobile nav
    data.navigation.forEach(item => {
      const link = document.createElement('a');
      link.href = item.target;
      link.textContent = item.label;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this._closeMenu();
        setTimeout(() => this._scrollToSection(item.target), 300);
      });
      this.mobileMenuLinks.appendChild(link);
    });
  }

  _bindEvents() {
    // Scroll for nav background
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        this.nav.classList.add('scrolled');
      } else {
        this.nav.classList.remove('scrolled');
      }
    });

    // Mobile toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => {
        this.isMenuOpen ? this._closeMenu() : this._openMenu();
      });
    }

    // Escape key closes menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this._closeMenu();
      }
    });

    // Nav logo click
    const navLogo = document.getElementById('nav-logo');
    if (navLogo) {
      navLogo.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  _openMenu() {
    this.isMenuOpen = true;
    this.navToggle.classList.add('active');
    this.mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  _closeMenu() {
    this.isMenuOpen = false;
    this.navToggle.classList.remove('active');
    this.mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  _scrollToSection(selector) {
    const section = document.querySelector(selector);
    if (section) {
      const navHeight = this.nav.offsetHeight;
      const top = section.offsetTop - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  _initScrollTracking() {
    const links = this.navLinks.querySelectorAll('a');
    const sectionIds = Array.from(links).map(link => link.getAttribute('href'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          links.forEach(link => {
            if (link.getAttribute('href') === id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '-80px 0px -50% 0px'
    });

    sectionIds.forEach(id => {
      const section = document.querySelector(id);
      if (section) observer.observe(section);
    });
  }
}

window.NavigationSystem = NavigationSystem;
