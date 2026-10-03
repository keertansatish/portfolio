/**
 * SCRIPT.JS — Cinematic 3D Character Hero & Portfolio Orchestrator
 * Three.js 0.170 (ES Module), Draco-compressed GLTF, OrbitControls (horizontal-only)
 * Crimson/Gold Rim Lighting, Fallback management, Light/Dark Theme, Performance Culling
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function () {
  'use strict';

  // ── Application State ─────────────────────────────────────
  const state = {
    theme: localStorage.getItem('portfolio-theme') || 'dark',
    isHeroVisible: true,
    isTabVisible: true,
    isTurntable: false,
    lightPresetIndex: 0, // 0: Crimson/Gold, 1: Cyberpunk Cyan/Pink, 2: Studio White
    fps: 120,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };

  // ── DOM Elements ──────────────────────────────────────────
  const canvas = document.getElementById('hero-3d-canvas');
  const fallbackOverlay = document.getElementById('hero-fallback');
  const loaderIndicator = document.getElementById('fallback-loader');
  const connectedStatus = document.getElementById('agent-connected-status');
  const fpsDisplay = document.getElementById('telemetry-fps');
  const heroStage = document.getElementById('hero-character-stage');
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const turntableBtn = document.getElementById('btn-turntable');
  const lightingPresetBtn = document.getElementById('vp-lighting-toggle');
  const resetCamBtn = document.getElementById('btn-reset-cam');

  // ── Theme Management ──────────────────────────────────────
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    if (sceneManager) {
      sceneManager.updateThemeLighting(theme);
    }
  }

  function initTheme() {
    applyTheme(state.theme);
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
      });
    }
  }

  // ── WebGL 3D Scene Manager ────────────────────────────────
  class HeroSceneManager {
    constructor() {
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.controls = null;
      this.mixer = null;
      this.character = null;
      this.clock = new THREE.Clock();
      this.animationFrameId = null;

      // Walk entrance state
      this.walkState = {
        active: false,
        scrollProgress: 0,
        targetScrollProgress: 0,
        scrollGateCompleted: false,
        loadingLocked: true,
        startZ: -14.0,
        targetZ: 0.05,
        targetY: 0.18,
        scale: 2.1,
        complete: false
      };

      // Idle breathing
      this.idleElapsed = 0;

      // Lighting references
      this.lights = {};

      // FPS tracking
      this.frameCount = 0;
      this.lastFpsUpdate = performance.now();
    }

    init() {
      // 1. WebGL Support Check
      if (!this._isWebGLAvailable()) {
        console.warn('[3D Hero] WebGL not available. Showing fallback image.');
        this._showFallback();
        this._releaseLoadingLockAfterDelay();
        return false;
      }

      // If user prefers reduced motion, show fallback image as required
      if (state.reducedMotion) {
        console.log('[3D Hero] prefers-reduced-motion active: displaying cloaked_shadow.png fallback.');
        this._showFallback();
        this._releaseLoadingLockAfterDelay();
        return false;
      }

      try {
        if (canvas) canvas.style.opacity = '0';

        // 2. Scene
        this.scene = new THREE.Scene();

        // 3. Camera
        const width = canvas.clientWidth || 600;
        const height = canvas.clientHeight || 750;
        this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
        this.camera.position.set(0, 0.02, 3.25);

        // 4. Transparent Renderer
        this.renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          alpha: true, // Transparent canvas as required!
          antialias: true,
          powerPreference: 'high-performance'
        });
        this.renderer.setClearColor(0x000000, 0); // Fully transparent
        this.renderer.setSize(width, height, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        // 5. OrbitControls (Horizontal-only rotation, NO zoom, NO pan, NO flipping)
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableZoom = false;     // NO ZOOM
        this.controls.enablePan = false;      // NO PAN
        // Lock polar angle strictly to horizontal eye-level (NO FLIPPING OR VERTICAL PITCH)
        this.controls.minPolarAngle = Math.PI / 2;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.target.set(0, 0.02, 0);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.rotateSpeed = 0.85;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 2.0;

        // 6. Setup Crimson & Gold Rim Lighting
        this._setupLighting();

        // 7. Bind resize
        window.addEventListener('resize', () => this._onResize());

        // 8. Load 3D Character Model with Draco
        this._loadCharacter();

        // Start render loop immediately
        this._startLoop();

        return true;
      } catch (err) {
        console.error('[3D Hero] Failed to initialize Three.js Hero Scene:', err);
        this._showFallback();
        return false;
      }
    }

    _isWebGLAvailable() {
      try {
        const testCanvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
          (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    }

    _showFallback() {
      if (canvas) canvas.style.display = 'none';
      if (fallbackOverlay) {
        fallbackOverlay.classList.remove('faded');
        fallbackOverlay.classList.add('active-fallback');
      }
      if (loaderIndicator) {
        loaderIndicator.style.display = 'none';
      }
    }

    _setupLighting() {
      // 1. Ambient Light (base visibility)
      this.lights.ambient = new THREE.AmbientLight(0x181a24, 0.65);
      this.scene.add(this.lights.ambient);

      // 2. Left Crimson Rim Light (rich deep crimson back-edge)
      this.lights.crimsonRim = new THREE.DirectionalLight(0xff1438, 4.8);
      this.lights.crimsonRim.position.set(-3.5, 2.2, -3.0);
      this.scene.add(this.lights.crimsonRim);

      this.lights.crimsonPoint = new THREE.PointLight(0xff002b, 2.8, 8);
      this.lights.crimsonPoint.position.set(-2.0, 0.6, -1.2);
      this.scene.add(this.lights.crimsonPoint);

      // 3. Right Gold Rim Light (brilliant warm golden contour)
      this.lights.goldRim = new THREE.DirectionalLight(0xffa600, 4.4);
      this.lights.goldRim.position.set(3.5, 2.2, -3.0);
      this.scene.add(this.lights.goldRim);

      this.lights.goldPoint = new THREE.PointLight(0xffb800, 2.4, 8);
      this.lights.goldPoint.position.set(2.0, 0.6, -1.2);
      this.scene.add(this.lights.goldPoint);

      // 4. Soft Neutral/Warm Key Light (front-right)
      this.lights.frontKey = new THREE.DirectionalLight(0xfff1e6, 0.85);
      this.lights.frontKey.position.set(1.2, 2.5, 3.2);
      this.scene.add(this.lights.frontKey);

      // 5. Cool Fill Light (front-left)
      this.lights.frontFill = new THREE.DirectionalLight(0x384a65, 0.5);
      this.lights.frontFill.position.set(-1.8, 1.2, 3.0);
      this.scene.add(this.lights.frontFill);

      // 6. Low subtle bounce light
      this.lights.groundBounce = new THREE.PointLight(0x400008, 0.8, 6);
      this.lights.groundBounce.position.set(0, -2.0, 1.0);
      this.scene.add(this.lights.groundBounce);

      // Adjust for current theme
      this.updateThemeLighting(state.theme);
    }

    updateThemeLighting(theme) {
      if (!this.lights.ambient) return;
      if (theme === 'light') {
        this.lights.ambient.intensity = 1.35;
        this.lights.frontKey.intensity = 1.1;
        this.lights.crimsonRim.intensity = 4.2;
        this.lights.goldRim.intensity = 3.8;
      } else {
        this.lights.ambient.intensity = 0.65;
        this.lights.frontKey.intensity = 0.85;
        this.lights.crimsonRim.intensity = 4.8;
        this.lights.goldRim.intensity = 4.4;
      }
    }

    setLightingPreset(index) {
      state.lightPresetIndex = index % 3;
      if (state.lightPresetIndex === 0) {
        // Crimson & Gold
        this.lights.crimsonRim.color.setHex(0xff1438);
        this.lights.crimsonPoint.color.setHex(0xff002b);
        this.lights.goldRim.color.setHex(0xffa600);
        this.lights.goldPoint.color.setHex(0xffb800);
      } else if (state.lightPresetIndex === 1) {
        // Cyberpunk Cyan & Magenta
        this.lights.crimsonRim.color.setHex(0xff0077);
        this.lights.crimsonPoint.color.setHex(0xff00aa);
        this.lights.goldRim.color.setHex(0x00f0ff);
        this.lights.goldPoint.color.setHex(0x00c8ff);
      } else {
        // Monochrome Studio High-Key
        this.lights.crimsonRim.color.setHex(0xffffff);
        this.lights.crimsonPoint.color.setHex(0xcccccc);
        this.lights.goldRim.color.setHex(0xffffff);
        this.lights.goldPoint.color.setHex(0xcccccc);
      }
    }

    _loadCharacter() {
      console.log('[3D Hero] Initializing DRACOLoader & GLTFLoader...');
      // Setup DRACOLoader
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

      // Setup GLTFLoader
      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);

      const modelPath = 'assets/models/cloaked_shadow.glb';

      gltfLoader.load(
        modelPath,
        (gltf) => {
          console.log('[3D Hero] Character model parsed successfully!', gltf);
          this.character = gltf.scene;

          // Scale and initial far-back position for walk entrance
          this.character.scale.setScalar(this.walkState.scale);
          this.character.position.set(0, this.walkState.targetY, this.walkState.startZ);

          // Enhance materials
          this.character.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.roughness = Math.max(child.material.roughness ?? 0.65, 0.4);
                child.material.metalness = Math.min((child.material.metalness ?? 0) + 0.1, 0.6);
              }
            }
          });

          // Animation Mixer (if Mixamo walk clip exists)
          if (gltf.animations && gltf.animations.length > 0) {
            console.log('[3D Hero] Playing Mixamo walk animation clip...');
            this.mixer = new THREE.AnimationMixer(this.character);
            const walkAction = this.mixer.clipAction(gltf.animations[0]);
            walkAction.setLoop(THREE.LoopRepeat);
            walkAction.play();
          }

          this.scene.add(this.character);

          // Fade out the fallback image; depth is controlled by page scroll.
          setTimeout(() => {
            if (fallbackOverlay) fallbackOverlay.classList.add('faded');
            if (canvas) canvas.style.opacity = '1';
            if (loaderIndicator) loaderIndicator.style.display = 'none';
            if (connectedStatus) connectedStatus.classList.add('visible');
            setTimeout(() => {
              if (connectedStatus) connectedStatus.classList.remove('visible');
            }, 1800);
            this.walkState.active = true;
            console.log('[3D Hero] Character depth is now controlled by page scroll.');
            this.walkState.loadingLocked = false;
          }, 1500);
        },
        (progressEvent) => {
          if (progressEvent.lengthComputable && loaderIndicator) {
            const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            const txt = loaderIndicator.querySelector('.loader-text');
            if (txt) txt.textContent = `AGENT LOADING ${pct}%...`;
          }
        },
        (error) => {
          console.warn('[3D Hero] Error loading cloaked_shadow.glb:', error);
          this._showFallback();
          this._releaseLoadingLockAfterDelay();
        }
      );
    }

    _onResize() {
      if (!this.camera || !this.renderer || !canvas) return;
      const width = canvas.clientWidth || 500;
      const height = canvas.clientHeight || 600;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
    }

    _releaseLoadingLockAfterDelay() {
      setTimeout(() => {
        this.walkState.loadingLocked = false;
        if (!this.character) this.walkState.scrollGateCompleted = true;
      }, 1500);
    }

    toggleTurntable() {
      state.isTurntable = !state.isTurntable;
      if (this.controls) {
        this.controls.autoRotate = state.isTurntable;
      }
      if (turntableBtn) {
        turntableBtn.classList.toggle('active', state.isTurntable);
      }
    }

    resetCamera() {
      if (!this.controls || !this.camera) return;
      this.controls.reset();
      this.camera.position.set(0, 0.1, 3.8);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }

    _update(deltaTime) {
      // 1. Animation Mixer (if Mixamo walk clip is playing)
      if (this.mixer) {
        this.mixer.update(deltaTime);
      }

      // 2. Move the character toward the camera as the user scrolls through the hero.
      if (this.character && this.walkState.active) {
        const smoothing = Math.min(deltaTime * 5, 1);
        this.walkState.scrollProgress += (this.walkState.targetScrollProgress - this.walkState.scrollProgress) * smoothing;
        if (this.walkState.targetScrollProgress >= 1 && this.walkState.scrollProgress > 0.999) {
          this.walkState.scrollProgress = 1;
          this.walkState.scrollGateCompleted = true;
        }
        const progress = 1 - Math.pow(1 - this.walkState.scrollProgress, 3);
        const currentZ = this.walkState.startZ + (this.walkState.targetZ - this.walkState.startZ) * progress;
        this.character.position.z = currentZ;

        // Keep the settled character subtly alive without an automatic entrance.
        this.idleElapsed += deltaTime;
        const floatMotion = Math.sin(this.idleElapsed * 1.8) * 0.025 + Math.sin(this.idleElapsed * 3.4) * 0.006;
        this.character.position.y = this.walkState.targetY + floatMotion;
      }

      // 4. Update OrbitControls (horizontal damping)
      if (this.controls) {
        this.controls.update();
      }

      // 5. Render Scene
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      // 6. Live FPS Telemetry calculation
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFpsUpdate >= 500) {
        const measuredFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
        this.frameCount = 0;
        this.lastFpsUpdate = now;
        if (fpsDisplay) {
          fpsDisplay.textContent = `⚡ ${Math.min(measuredFps, 120)} FPS`;
        }
      }
    }

    _startLoop() {
      const render = () => {
        // Performance requirement: Pause rendering when hero is off-screen or tab hidden!
        const isHidden = document.hidden && !navigator.webdriver;
        if (!state.isHeroVisible || isHidden) {
          this.animationFrameId = null;
          return;
        }

        this.animationFrameId = requestAnimationFrame(render);
        const dt = Math.min(this.clock.getDelta(), 0.06);
        this._update(dt);
      };

      if (!this.animationFrameId) {
        this.clock.getDelta(); // reset delta
        this.animationFrameId = requestAnimationFrame(render);
      }
    }

    resumeRendering() {
      if (!this.animationFrameId && state.isHeroVisible) {
        this._startLoop();
      }
    }
  }

  // ── Global Scene Manager Instance ─────────────────────────
  let sceneManager = null;

  // ── Performance: Off-Screen IntersectionObserver ──────────
  function setupVisibilityObserver() {
    // 1. Observer for Hero Stage
    const targetElement = heroStage || document.getElementById('hero');
    if ('IntersectionObserver' in window && targetElement) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          state.isHeroVisible = entry.isIntersecting;
          if (state.isHeroVisible) {
            if (sceneManager) sceneManager.resumeRendering();
          }
        });
      }, { threshold: 0.02 });

      observer.observe(targetElement);
    }

    const updateCharacterScroll = () => {
      if (sceneManager?.walkState.loadingLocked || sceneManager?.walkState.scrollGateCompleted) return;
      const hero = document.getElementById('hero');
      const scrollRange = Math.max((hero?.offsetHeight || window.innerHeight) * 0.8, 1);
      const progress = Math.min(Math.max(window.scrollY / scrollRange, 0), 1);
      if (sceneManager) sceneManager.walkState.targetScrollProgress = progress;
    };
    window.addEventListener('scroll', updateCharacterScroll, { passive: true });
    updateCharacterScroll();

    const scrollRange = () => Math.max((document.getElementById('hero')?.offsetHeight || window.innerHeight) * 0.8, 1);
    const advanceCharacter = (distance) => {
      if (!sceneManager) return false;
      if (sceneManager.walkState.loadingLocked) return true;
      if (sceneManager.walkState.scrollGateCompleted) return false;
      sceneManager.walkState.targetScrollProgress = Math.min(
        1,
        sceneManager.walkState.targetScrollProgress + distance / scrollRange()
      );
      return true;
    };

    window.addEventListener('wheel', (event) => {
      if (window.scrollY <= 2 && event.deltaY > 0 && advanceCharacter(event.deltaY)) {
        event.preventDefault();
      }
    }, { passive: false });

    let touchStartY = 0;
    window.addEventListener('touchstart', (event) => {
      touchStartY = event.touches[0]?.clientY || 0;
    }, { passive: true });
    window.addEventListener('touchmove', (event) => {
      const currentY = event.touches[0]?.clientY || touchStartY;
      const upwardDistance = touchStartY - currentY;
      if (window.scrollY <= 2 && upwardDistance > 0 && advanceCharacter(upwardDistance)) {
        event.preventDefault();
        touchStartY = currentY;
      }
    }, { passive: false });

    // 2. Tab Visibility (Page Visibility API)
    document.addEventListener('visibilitychange', () => {
      state.isTabVisible = document.visibilityState === 'visible';
      if (state.isTabVisible && state.isHeroVisible) {
        if (sceneManager) sceneManager.resumeRendering();
      }
    });

    // 3. Prefers-Reduced-Motion listener
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      state.reducedMotion = e.matches;
      if (e.matches && sceneManager) {
        sceneManager._showFallback();
      }
    });
  }

  // ── Viewport HUD & Button Controls ────────────────────────
  function setupHeroControls() {
    // Turntable button
    if (turntableBtn) {
      turntableBtn.addEventListener('click', () => {
        if (sceneManager) sceneManager.toggleTurntable();
      });
    }

    // Lighting preset toggle
    if (lightingPresetBtn) {
      lightingPresetBtn.addEventListener('click', () => {
        if (sceneManager) {
          sceneManager.setLightingPreset(state.lightPresetIndex + 1);
        }
      });
    }

    // Reset camera button
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        if (sceneManager) sceneManager.resetCamera();
      });
    }

    // Inspect artifacts smooth scroll
    const inspectBtn = document.getElementById('btn-inspect-artifacts');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('projects');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  // ── Portfolio Dynamic Content & Modals ────────────────────
  function populatePortfolio() {
    if (window.PostHeroSystem) {
      window.postHeroSystem = new window.PostHeroSystem(window.portfolioData);
      window.postHeroSystem.init();
      return;
    }

    const data = window.portfolioData;
    if (!data) return;

    // Skills
    const skillsGrid = document.getElementById('skills-grid');
    if (skillsGrid && data.skills && data.skills.categories) {
      skillsGrid.innerHTML = data.skills.categories.map(cat => `
        <div class="skill-card">
          <div class="skill-cat-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            ${escapeHtml(cat.name)}
          </div>
          <div class="skill-items-list">
            ${cat.items.map(item => `<span class="skill-pill">${escapeHtml(item)}</span>`).join('')}
          </div>
        </div>
      `).join('');
    }

    // Projects
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid && data.projects) {
      projectsGrid.innerHTML = data.projects.map((proj, idx) => `
        <div class="project-card" data-project-idx="${idx}">
          <div>
            <div class="project-header-row">
              <h3 class="project-title">${escapeHtml(proj.title)}</h3>
              <span class="tech-tag">UE5 // RIG</span>
            </div>
            <div class="project-subtitle">${escapeHtml(proj.subtitle)}</div>
            <p class="project-desc" style="margin-top:12px;">${escapeHtml(proj.description)}</p>
          </div>
          <div>
            <div class="project-tech-pills">
              ${proj.technologies.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
            <div class="project-links">
              <span class="btn-card-link">VIEW SPECIFICATIONS →</span>
            </div>
          </div>
        </div>
      `).join('');

      // Project card click opens modal
      projectsGrid.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
          const idx = parseInt(card.dataset.projectIdx, 10);
          openProjectModal(data.projects[idx]);
        });
      });
    }

    // Experience
    const timeline = document.getElementById('timeline-list');
    if (timeline && data.experience) {
      timeline.innerHTML = data.experience.map(exp => `
        <div class="timeline-card">
          <div class="timeline-dot"></div>
          <div style="font-family:var(--font-mono); font-size:11px; color:var(--crimson-primary); font-weight:700;">${escapeHtml(exp.type)} // ${escapeHtml(exp.period)}</div>
          <h3 style="font-family:var(--font-display); font-size:18px; margin: 6px 0 2px;">${escapeHtml(exp.title)}</h3>
          <p style="font-size:13px; color:var(--gold-primary); margin-bottom:8px;">${escapeHtml(exp.organization)}</p>
          <p style="font-size:14px; color:var(--text-dim); line-height:1.6;">${escapeHtml(exp.description)}</p>
        </div>
      `).join('');
    }

    // Achievements
    const achievementsGrid = document.getElementById('achievements-grid');
    if (achievementsGrid && data.achievements) {
      achievementsGrid.innerHTML = data.achievements.map(ach => `
        <div class="achieve-card">
          <div class="achieve-metric">${escapeHtml(ach.metric)}</div>
          <div style="font-family:var(--font-display); font-weight:700; margin-top:6px;">${escapeHtml(ach.label)}</div>
          <div style="font-family:var(--font-mono); font-size:11px; color:var(--text-subtle); margin-top:4px;">${escapeHtml(ach.detail)}</div>
        </div>
      `).join('');
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Modal setup
  const modalBackdrop = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close');

  function openProjectModal(project) {
    if (!modalBackdrop || !modalBody) return;
    modalBody.innerHTML = `
      <div style="font-family:var(--font-mono); font-size:11px; color:var(--crimson-primary); font-weight:700; letter-spacing:0.1em; margin-bottom:6px;">ENGINEERED SYSTEM ARTIFACT</div>
      <h2 style="font-family:var(--font-display); font-size:26px; font-weight:800; color:var(--text-bright);">${escapeHtml(project.title)}</h2>
      <p style="font-family:var(--font-mono); font-size:13px; color:var(--gold-primary); margin-bottom:18px;">${escapeHtml(project.subtitle)}</p>
      
      <p style="font-size:15px; color:var(--text-dim); line-height:1.7; margin-bottom:20px;">${escapeHtml(project.description)}</p>

      <div style="background:var(--bg-surface-elev); border-radius:10px; padding:16px; margin-bottom:18px;">
        <h4 style="font-family:var(--font-mono); font-size:12px; color:var(--crimson-primary); margin-bottom:6px;">CHALLENGE & SOLUTION</h4>
        <p style="font-size:13.5px; color:var(--text-main); margin-bottom:8px;"><strong>Problem:</strong> ${escapeHtml(project.problem)}</p>
        <p style="font-size:13.5px; color:var(--text-main);"><strong>Implementation:</strong> ${escapeHtml(project.solution)}</p>
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-family:var(--font-mono); font-size:11px; color:var(--text-subtle); margin-bottom:8px;">PIPELINE TECH STACK:</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${project.technologies.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>

      ${project.github ? `
        <a href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer" class="btn-primary-glow" style="display:inline-flex;">
          EXPLORE REPOSITORY (GITHUB) ↗
        </a>
      ` : ''}
    `;
    modalBackdrop.classList.add('open');
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => modalBackdrop.classList.remove('open'));
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) modalBackdrop.classList.remove('open');
    });
  }

  // ── Initialization Entry Point ────────────────────────────
  function init() {
    initTheme();
    setupHeroControls();
    populatePortfolio();
    setupVisibilityObserver();

    // Start 3D Character Hero
    sceneManager = new HeroSceneManager();
    sceneManager.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
