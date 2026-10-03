// ============================================================
// SCENE.JS — Three.js Scene, Camera, Renderer, Environment
// Core 3D world with dark environment objects
// ============================================================

class SceneManager {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = null;
    this.isWebGLAvailable = true;

    // Systems
    this.lighting = null;
    this.character = null;
    this.particles = null;
    this.energyParticles = null;

    // State
    this.mouseNorm = { x: 0, y: 0 };
    this.scrollProgress = 0;
    this.cameraTarget = { x: 0, y: 0.5, z: 6 };
    this.cameraSmooth = { x: 0, y: 0.5, z: 6 };
    this.running = false;

    // Environment objects
    this.envObjects = [];
  }

  init() {
    // Check WebGL
    if (!this._checkWebGL()) {
      this.isWebGLAvailable = false;
      this._showFallback();
      return false;
    }

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030303);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0.5, 6);

    // Renderer
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: pixelRatio <= 1.5,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // Clock
    this.clock = new THREE.Clock();

    // Initialize subsystems
    this._initLighting();
    this._initEnvironment();
    this._initParticles();

    // Events
    this._bindEvents();

    // Canvas visible
    this.canvas.style.display = 'block';

    this.running = true;
    return true;
  }

  async loadCharacter() {
    this.character = new CharacterSystem(this.scene);
    const loaded = await this.character.load();

    // Init energy particles near character
    const charPos = this.character.config.position;
    this.energyParticles = new EnergyParticles(this.scene);
    this.energyParticles.init(charPos);

    return loaded;
  }

  _checkWebGL() {
    try {
      const testCanvas = document.createElement('canvas');
      return !!(
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('experimental-webgl')
      );
    } catch (e) {
      return false;
    }
  }

  _showFallback() {
    if (this.canvas) this.canvas.style.display = 'none';
    const fallback = document.getElementById('webgl-fallback');
    if (fallback) fallback.style.display = 'block';
  }

  _initLighting() {
    this.lighting = new LightingSystem(this.scene);
    this.lighting.init();
  }

  _initEnvironment() {
    // Dark floor plane with subtle reflectivity
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.85,
      metalness: 0.15,
      transparent: true,
      opacity: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.envObjects.push(floor);

    // Subtle vertical panels (distant architectural depth)
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x080808,
      roughness: 0.7,
      metalness: 0.3,
      emissive: 0x050000,
      emissiveIntensity: 0.05
    });

    // Left panel
    const leftPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 8, 4),
      panelMat
    );
    leftPanel.position.set(-8, 1, -5);
    this.scene.add(leftPanel);
    this.envObjects.push(leftPanel);

    // Right panel
    const rightPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 8, 4),
      panelMat
    );
    rightPanel.position.set(8, 1, -6);
    this.scene.add(rightPanel);
    this.envObjects.push(rightPanel);

    // Back wall (distant, barely visible)
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 12),
      new THREE.MeshStandardMaterial({
        color: 0x040404,
        roughness: 0.9,
        metalness: 0.1
      })
    );
    backWall.position.set(0, 2, -10);
    this.scene.add(backWall);
    this.envObjects.push(backWall);

    // Subtle red light emitter (glowing box in the distance)
    const emitterGeo = new THREE.BoxGeometry(0.3, 0.05, 2);
    const emitterMat = new THREE.MeshStandardMaterial({
      color: 0x220000,
      emissive: 0x660000,
      emissiveIntensity: 0.5,
      roughness: 0.3
    });
    const emitter1 = new THREE.Mesh(emitterGeo, emitterMat);
    emitter1.position.set(-6, 3, -7);
    this.scene.add(emitter1);
    this.envObjects.push(emitter1);

    const emitter2 = new THREE.Mesh(emitterGeo, emitterMat);
    emitter2.position.set(6, 4, -8);
    this.scene.add(emitter2);
    this.envObjects.push(emitter2);
  }

  _initParticles() {
    this.particles = new ParticleSystem(this.scene);
    this.particles.init();
  }

  _bindEvents() {
    // Resize
    window.addEventListener('resize', () => this._onResize());

    // Mouse
    window.addEventListener('mousemove', (e) => {
      this.mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Scroll
    window.addEventListener('scroll', () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      this.scrollProgress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
    });
  }

  _onResize() {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    if (!this.running || !this.renderer) return;

    const delta = this.clock.getDelta();
    // Cap delta to avoid huge jumps on tab switch
    const dt = Math.min(delta, 0.05);

    // Camera parallax from mouse (opposite direction)
    this.cameraTarget.x = -this.mouseNorm.x * 0.3;
    this.cameraTarget.y = 0.5 + this.mouseNorm.y * 0.15;

    // Smooth camera movement
    this.cameraSmooth.x += (this.cameraTarget.x - this.cameraSmooth.x) * 0.03;
    this.cameraSmooth.y += (this.cameraTarget.y - this.cameraSmooth.y) * 0.03;

    this.camera.position.x = this.cameraSmooth.x;
    this.camera.position.y = this.cameraSmooth.y;
    this.camera.lookAt(0.8, 0, 0);

    // Update subsystems
    if (this.lighting) this.lighting.update(dt, this.mouseNorm);
    if (this.character) this.character.update(dt, this.mouseNorm);
    if (this.particles) this.particles.update(dt, this.mouseNorm);
    if (this.energyParticles) this.energyParticles.update(dt);

    // Scroll-based updates
    if (this.character) this.character.updateForScroll(this.scrollProgress);
    if (this.lighting) this.lighting.updateForScroll(this.scrollProgress);

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  startLoop() {
    const animate = () => {
      if (!this.running) return;
      requestAnimationFrame(animate);
      this.update();
    };
    animate();
  }

  dispose() {
    this.running = false;

    if (this.character) this.character.dispose();
    if (this.particles) this.particles.dispose();
    if (this.energyParticles) this.energyParticles.dispose();
    if (this.lighting) this.lighting.dispose();

    this.envObjects.forEach(obj => {
      obj.geometry?.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
      this.scene.remove(obj);
    });

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }
}

window.SceneManager = SceneManager;
