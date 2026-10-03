// ============================================================
// LIGHTING.JS — Cinematic Lighting System
// Dark silhouette + crimson rim + atmospheric setup
// ============================================================

class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.lights = {};
    this.time = 0;
    this.mouseTarget = { x: 0, y: 0 };
    this.mouseSmooth = { x: 0, y: 0 };
  }

  init() {
    // 1. Very subtle ambient light — prevents total blackout
    this.lights.ambient = new THREE.AmbientLight(0x111111, 0.3);
    this.scene.add(this.lights.ambient);

    // 2. Deep red point light behind character (back rim)
    this.lights.backRim = new THREE.PointLight(0x8b0000, 3.0, 15);
    this.lights.backRim.position.set(2.0, 1.5, -3.0);
    this.scene.add(this.lights.backRim);

    // 3. Strong crimson rim light (side)
    this.lights.sideRim = new THREE.PointLight(0xcc2222, 2.0, 12);
    this.lights.sideRim.position.set(-3.0, 2.0, -1.5);
    this.scene.add(this.lights.sideRim);

    // 4. Very subtle cool/neutral fill light
    this.lights.fill = new THREE.DirectionalLight(0x223344, 0.15);
    this.lights.fill.position.set(-2, 3, 4);
    this.scene.add(this.lights.fill);

    // 5. Mouse-reactive light (subtle)
    this.lights.mouseLight = new THREE.PointLight(0x991111, 0.8, 10);
    this.lights.mouseLight.position.set(0, 2, 3);
    this.scene.add(this.lights.mouseLight);

    // 6. Low ground light for floor visibility
    this.lights.ground = new THREE.PointLight(0x330000, 0.5, 8);
    this.lights.ground.position.set(0, -2, 2);
    this.scene.add(this.lights.ground);

    // 7. Top-down very subtle key light
    this.lights.key = new THREE.SpotLight(0x442222, 0.4, 20, Math.PI / 6, 0.8, 2);
    this.lights.key.position.set(1, 8, 2);
    this.lights.key.target.position.set(1.5, 0, 0);
    this.scene.add(this.lights.key);
    this.scene.add(this.lights.key.target);

    // Fog for atmospheric depth
    this.scene.fog = new THREE.FogExp2(0x050505, 0.04);
  }

  update(deltaTime, mouseNorm) {
    this.time += deltaTime;

    // Smooth mouse interpolation
    if (mouseNorm) {
      this.mouseTarget.x = mouseNorm.x;
      this.mouseTarget.y = mouseNorm.y;
    }
    this.mouseSmooth.x += (this.mouseTarget.x - this.mouseSmooth.x) * 0.03;
    this.mouseSmooth.y += (this.mouseTarget.y - this.mouseSmooth.y) * 0.03;

    // Mouse-reactive light follows cursor subtly
    if (this.lights.mouseLight) {
      this.lights.mouseLight.position.x = this.mouseSmooth.x * 3;
      this.lights.mouseLight.position.y = 1.5 + this.mouseSmooth.y * 1.5;
    }

    // Subtle rim light pulsing (breathing)
    if (this.lights.backRim) {
      this.lights.backRim.intensity = 3.0 + Math.sin(this.time * 0.5) * 0.3;
    }

    // Subtle side rim variation
    if (this.lights.sideRim) {
      this.lights.sideRim.intensity = 2.0 + Math.sin(this.time * 0.7 + 1) * 0.2;
    }
  }

  // Adjust for scroll — gradually shift lighting mood
  updateForScroll(scrollProgress) {
    // As user scrolls deeper, slightly warm the ambient
    if (this.lights.ambient) {
      const intensity = 0.3 + scrollProgress * 0.1;
      this.lights.ambient.intensity = intensity;
    }
  }

  dispose() {
    Object.values(this.lights).forEach(light => {
      this.scene.remove(light);
      if (light.dispose) light.dispose();
    });
    this.lights = {};
  }
}

window.LightingSystem = LightingSystem;
