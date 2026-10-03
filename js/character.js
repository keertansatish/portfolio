// ============================================================
// CHARACTER.JS — Character Loading & Fallback System
// GLTF/GLB loader with graceful fallback silhouette
// ============================================================

class CharacterSystem {
  constructor(scene) {
    this.scene = scene;
    this.model = null;
    this.mixer = null;
    this.group = new THREE.Group();
    this.loaded = false;
    this.isFallback = false;
    this.time = 0;

    // Mouse interaction state
    this.mouseTarget = { x: 0, y: 0 };
    this.mouseSmooth = { x: 0, y: 0 };

    // Base configuration (from data.js if available)
    const config = window.portfolioData?.character || {};
    this.config = {
      modelPath: config.modelPath || '/assets/models/cloaked-shadow.glb',
      scale: config.scale || 2.5,
      position: config.position || { x: 1.8, y: -2.2, z: 0 },
      rotation: config.rotation || { x: 0, y: -0.3, z: 0 },
      fallbackEnabled: config.fallbackEnabled !== false,
    };

    this.scene.add(this.group);
  }

  async load() {
    try {
      await this._loadGLTF();
    } catch (err) {
      console.warn('Character model not found, using fallback:', err.message);
      if (this.config.fallbackEnabled) {
        this._createFallback();
      }
    }
    return this.loaded || this.isFallback;
  }

  _loadGLTF() {
    return new Promise((resolve, reject) => {
      if (typeof THREE.GLTFLoader === 'undefined') {
        reject(new Error('GLTFLoader not available'));
        return;
      }

      const loader = new THREE.GLTFLoader();

      loader.load(
        this.config.modelPath,
        (gltf) => {
          this.model = gltf.scene;

          // Apply scale
          this.model.scale.setScalar(this.config.scale);

          // Apply position
          this.model.position.set(
            this.config.position.x,
            this.config.position.y,
            this.config.position.z
          );

          // Apply rotation (three-quarter view)
          this.model.rotation.set(
            this.config.rotation.x,
            this.config.rotation.y,
            this.config.rotation.z
          );

          // Enhance materials
          this.model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              // Make materials slightly reflective/metallic
              if (child.material) {
                child.material.roughness = Math.max(child.material.roughness || 0.7, 0.4);
                child.material.metalness = Math.min((child.material.metalness || 0) + 0.1, 0.6);
                child.material.envMapIntensity = 0.3;
              }
            }
          });

          this.group.add(this.model);

          // Handle animations
          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
            // Play the first available animation (idle)
            const clip = gltf.animations[0];
            const action = this.mixer.clipAction(clip);
            action.play();
          }

          this.loaded = true;
          resolve();
        },
        undefined, // progress callback
        (err) => {
          reject(err);
        }
      );
    });
  }

  _createFallback() {
    // Create a mysterious dark silhouette from geometry
    this.isFallback = true;

    const silhouetteGroup = new THREE.Group();

    // Dark material
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.8,
      metalness: 0.3,
      emissive: 0x050505,
    });

    // Slight red edge material
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.6,
      metalness: 0.4,
      emissive: 0x1a0000,
      emissiveIntensity: 0.3,
    });

    // Body (cylinder tapered)
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.25, 1.6, 12);
    const body = new THREE.Mesh(bodyGeo, darkMat);
    body.position.y = 0.8;
    silhouetteGroup.add(body);

    // Torso (wider cylinder)
    const torsoGeo = new THREE.CylinderGeometry(0.4, 0.35, 0.6, 12);
    const torso = new THREE.Mesh(torsoGeo, darkMat);
    torso.position.y = 1.5;
    silhouetteGroup.add(torso);

    // Head (sphere)
    const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const head = new THREE.Mesh(headGeo, darkMat);
    head.position.y = 2.05;
    silhouetteGroup.add(head);

    // Hood (cone)
    const hoodGeo = new THREE.ConeGeometry(0.4, 0.55, 12);
    const hood = new THREE.Mesh(hoodGeo, rimMat);
    hood.position.y = 2.2;
    silhouetteGroup.add(hood);

    // Shoulders
    const shoulderGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const leftShoulder = new THREE.Mesh(shoulderGeo, darkMat);
    leftShoulder.position.set(-0.45, 1.65, 0);
    silhouetteGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeo, darkMat);
    rightShoulder.position.set(0.45, 1.65, 0);
    silhouetteGroup.add(rightShoulder);

    // Arms (thin cylinders)
    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.7, 8);
    const leftArm = new THREE.Mesh(armGeo, darkMat);
    leftArm.position.set(-0.5, 1.25, 0.1);
    leftArm.rotation.z = 0.15;
    leftArm.rotation.x = -0.3;
    silhouetteGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, darkMat);
    rightArm.position.set(0.5, 1.25, 0.1);
    rightArm.rotation.z = -0.15;
    rightArm.rotation.x = -0.3;
    silhouetteGroup.add(rightArm);

    // Eyes (small emissive spheres)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xff2200,
      emissive: 0xff2200,
      emissiveIntensity: 2.0,
    });
    const eyeGeo = new THREE.SphereGeometry(0.03, 8, 8);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.07, 2.05, 0.2);
    silhouetteGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.07, 2.05, 0.2);
    silhouetteGroup.add(rightEye);

    // Cape / cloak (stretched box behind)
    const capeGeo = new THREE.BoxGeometry(0.7, 1.4, 0.05);
    const cape = new THREE.Mesh(capeGeo, rimMat);
    cape.position.set(0, 1.2, -0.3);
    silhouetteGroup.add(cape);

    // Apply character config
    silhouetteGroup.scale.setScalar(this.config.scale * 0.5);
    silhouetteGroup.position.set(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    );
    silhouetteGroup.rotation.set(
      this.config.rotation.x,
      this.config.rotation.y,
      this.config.rotation.z
    );

    this.model = silhouetteGroup;
    this.group.add(silhouetteGroup);

    console.log(
      '%c[Character] Fallback silhouette active. Place your GLTF/GLB model at: ' + this.config.modelPath,
      'color: #cc2222; font-weight: bold;'
    );
  }

  update(deltaTime, mouseNorm) {
    if (!this.model) return;

    this.time += deltaTime;

    // Update animation mixer if present
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    // Smooth mouse target
    if (mouseNorm) {
      this.mouseTarget.x = mouseNorm.x;
      this.mouseTarget.y = mouseNorm.y;
    }
    this.mouseSmooth.x += (this.mouseTarget.x - this.mouseSmooth.x) * 0.03;
    this.mouseSmooth.y += (this.mouseTarget.y - this.mouseSmooth.y) * 0.03;

    // Subtle mouse-driven rotation
    const baseRotY = this.config.rotation.y;
    this.group.rotation.y = baseRotY + this.mouseSmooth.x * 0.12;
    this.group.rotation.x = this.mouseSmooth.y * 0.04;

    // Subtle idle breathing / floating
    const breathe = Math.sin(this.time * 1.5) * 0.008;
    const sway = Math.sin(this.time * 0.8) * 0.003;
    this.group.position.y = (this.config.position.y || -2.2) + breathe;
    this.group.position.x = (this.config.position.x || 1.8) + sway;
  }

  // Update position for scroll-based parallax
  updateForScroll(scrollProgress) {
    if (!this.model) return;

    // Slightly recede as user scrolls past hero
    const fadeStart = 0.05;
    const fadeEnd = 0.15;

    if (scrollProgress > fadeStart) {
      const t = Math.min((scrollProgress - fadeStart) / (fadeEnd - fadeStart), 1);
      this.group.scale.setScalar(1 - t * 0.3);
      // Fade out the character group by moving it back
      this.group.position.z = -t * 3;
    } else {
      this.group.scale.setScalar(1);
      this.group.position.z = 0;
    }
  }

  dispose() {
    if (this.model) {
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      this.group.remove(this.model);
      this.model = null;
    }
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    this.scene.remove(this.group);
  }
}

window.CharacterSystem = CharacterSystem;
