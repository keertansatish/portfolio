// ============================================================
// PARTICLES.JS — Performant Particle System
// THREE.BufferGeometry-based with adaptive count
// ============================================================

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = null;
    this.positions = null;
    this.velocities = [];
    this.colors = null;
    this.count = this._getAdaptiveCount();
    this.time = 0;
    this.mouseInfluence = { x: 0, y: 0 };
  }

  _getAdaptiveCount() {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

    if (isMobile || isLowPower) return 200;
    if (isTablet) return 500;
    return 1000;
  }

  init() {
    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.count * 3);
    this.colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);

    const spread = 30;
    const heightSpread = 20;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Distribute particles in a large volume
      this.positions[i3] = (Math.random() - 0.5) * spread;
      this.positions[i3 + 1] = (Math.random() - 0.5) * heightSpread;
      this.positions[i3 + 2] = (Math.random() - 0.5) * spread;

      // Store velocities for animation
      this.velocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.002,
        z: (Math.random() - 0.5) * 0.003,
        phase: Math.random() * Math.PI * 2
      });

      // Colors: mix of dark gray and subtle crimson
      const isRed = Math.random() < 0.15; // 15% crimson particles
      if (isRed) {
        this.colors[i3] = 0.5 + Math.random() * 0.3;     // R
        this.colors[i3 + 1] = 0.02 + Math.random() * 0.05; // G
        this.colors[i3 + 2] = 0.02 + Math.random() * 0.05; // B
      } else {
        const gray = 0.15 + Math.random() * 0.2;
        this.colors[i3] = gray;
        this.colors[i3 + 1] = gray;
        this.colors[i3 + 2] = gray;
      }

      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader material for soft particles
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (80.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 0.5);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Soft circular particle
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          alpha *= 0.6;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update(deltaTime, mouseNorm) {
    if (!this.particles) return;

    this.time += deltaTime;

    // Smooth mouse influence
    if (mouseNorm) {
      this.mouseInfluence.x += (mouseNorm.x * 0.3 - this.mouseInfluence.x) * 0.02;
      this.mouseInfluence.y += (mouseNorm.y * 0.3 - this.mouseInfluence.y) * 0.02;
    }

    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const vel = this.velocities[i];

      // Slow drift + sinusoidal movement
      positions[i3] += vel.x + Math.sin(this.time * 0.5 + vel.phase) * 0.001;
      positions[i3 + 1] += vel.y + Math.cos(this.time * 0.3 + vel.phase) * 0.001;
      positions[i3 + 2] += vel.z;

      // Subtle mouse influence
      positions[i3] += this.mouseInfluence.x * 0.001;
      positions[i3 + 1] += this.mouseInfluence.y * 0.001;

      // Wrap around boundaries
      const bound = 15;
      const hBound = 10;
      if (positions[i3] > bound) positions[i3] = -bound;
      if (positions[i3] < -bound) positions[i3] = bound;
      if (positions[i3 + 1] > hBound) positions[i3 + 1] = -hBound;
      if (positions[i3 + 1] < -hBound) positions[i3 + 1] = hBound;
      if (positions[i3 + 2] > bound) positions[i3 + 2] = -bound;
      if (positions[i3 + 2] < -bound) positions[i3 + 2] = bound;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.material.uniforms.uTime.value = this.time;
  }

  dispose() {
    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
      this.scene.remove(this.particles);
      this.particles = null;
    }
  }
}

// Energy particles — small red embers near character
class EnergyParticles {
  constructor(scene) {
    this.scene = scene;
    this.particles = null;
    this.count = 50;
    this.positions = null;
    this.time = 0;
    this.basePositions = [];
  }

  init(characterPosition) {
    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.count * 3);

    const cx = characterPosition?.x || 1.5;
    const cy = characterPosition?.y || 0;
    const cz = characterPosition?.z || 0;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 1.5;
      const height = (Math.random() - 0.3) * 3;

      this.positions[i3] = cx + Math.cos(angle) * radius;
      this.positions[i3 + 1] = cy + height;
      this.positions[i3 + 2] = cz + Math.sin(angle) * radius;

      this.basePositions.push({
        x: this.positions[i3],
        y: this.positions[i3 + 1],
        z: this.positions[i3 + 2],
        speed: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        radius: radius
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xcc2222,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update(deltaTime) {
    if (!this.particles) return;
    this.time += deltaTime;

    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const base = this.basePositions[i];

      positions[i3] = base.x + Math.sin(this.time * base.speed + base.phase) * 0.3;
      positions[i3 + 1] = base.y + Math.sin(this.time * base.speed * 0.7 + base.phase) * 0.15 + Math.sin(this.time * 0.2) * 0.05;
      positions[i3 + 2] = base.z + Math.cos(this.time * base.speed + base.phase) * 0.3;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;

    // Subtle opacity pulsing
    this.particles.material.opacity = 0.4 + Math.sin(this.time * 0.8) * 0.2;
  }

  dispose() {
    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
      this.scene.remove(this.particles);
      this.particles = null;
    }
  }
}

window.ParticleSystem = ParticleSystem;
window.EnergyParticles = EnergyParticles;
