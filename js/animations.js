// ============================================================
// ANIMATIONS.JS — Scroll-Driven Reveal & Interaction Animations
// IntersectionObserver-based reveals with staggering
// ============================================================

class AnimationSystem {
  constructor() {
    this.observers = [];
    this.revealElements = [];
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    if (this.isReducedMotion) {
      // Immediately show everything
      document.querySelectorAll('.anim-reveal, .section-header, .scroll-reveal, .section, .timeline-item, .statement-word').forEach(el => {
        el.classList.add('revealed', 'visible', 'in-view');
      });
      return;
    }

    this._initHeroReveal();
    this._initSectionObserver();
    this._initScrollRevealObserver();
    this._initTimelineObserver();
    this._initStatementObserver();
    this._initCounterAnimation();
  }

  _initHeroReveal() {
    // Triggered after loading screen hides
    // Reveal hero elements with stagger
    setTimeout(() => {
      document.querySelectorAll('.section-hero .anim-reveal').forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('revealed');
        }, i * 100);
      });
    }, 300);
  }

  triggerHeroReveal() {
    document.querySelectorAll('.section-hero .anim-reveal').forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('revealed');
      }, 200 + i * 150);
    });
  }

  _initSectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(section => {
      observer.observe(section);
    });

    this.observers.push(observer);
  }

  _initScrollRevealObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger children if they have data-stagger-delay
          const delay = entry.target.dataset.staggerDelay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, parseInt(delay));
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.section-header, .scroll-reveal').forEach(el => {
      observer.observe(el);
    });

    this.observers.push(observer);
  }

  _initTimelineObserver() {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;

    const progressBar = timeline.querySelector('.timeline-progress');
    const items = timeline.querySelectorAll('.timeline-item');

    // Observer for individual items
    const itemObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.3 });

    items.forEach(item => itemObserver.observe(item));
    this.observers.push(itemObserver);

    // Scroll-based progress line
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const rect = timeline.getBoundingClientRect();
        const viewHeight = window.innerHeight;

        if (rect.top < viewHeight && rect.bottom > 0) {
          const progress = Math.min(
            Math.max((viewHeight - rect.top) / (rect.height + viewHeight) * 100, 0),
            100
          );
          progressBar.style.height = progress + '%';
        }
      });
    }
  }

  _initStatementObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const words = entry.target.querySelectorAll('.statement-word');
          words.forEach((word, i) => {
            setTimeout(() => {
              word.classList.add('visible');
            }, i * 200);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    const statementsContainer = document.getElementById('about-statements');
    if (statementsContainer) {
      observer.observe(statementsContainer);
    }

    this.observers.push(observer);
  }

  _initCounterAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const metric = entry.target.querySelector('.achievement-metric');
          if (metric && !metric.dataset.animated) {
            metric.dataset.animated = 'true';
            this._animateMetric(metric);
          }
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.achievement-card').forEach(card => {
      observer.observe(card);
    });

    this.observers.push(observer);
  }

  _animateMetric(element) {
    const text = element.textContent;
    // Extract number from text like "TOP 15", "6+", etc.
    const match = text.match(/(\d+)/);
    if (!match) return;

    const targetNum = parseInt(match[1]);
    const prefix = text.substring(0, text.indexOf(match[1]));
    const suffix = text.substring(text.indexOf(match[1]) + match[1].length);

    let current = 0;
    const duration = 1500;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      current = Math.round(eased * targetNum);

      element.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = text; // Restore original text exactly
      }
    };

    requestAnimationFrame(animate);
  }

  // Card tilt effect
  initCardTilt(cards) {
    if (this.isReducedMotion) return;
    if (window.matchMedia('(hover: none)').matches) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / centerY * -3;
        const rotateY = (x - centerX) / centerX * 3;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  dispose() {
    this.observers.forEach(obs => obs.disconnect());
    this.observers = [];
  }
}

window.AnimationSystem = AnimationSystem;
