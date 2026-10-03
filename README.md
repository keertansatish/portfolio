# Keertan Satish — Portfolio

A cinematic 3D personal portfolio website built with HTML, CSS, vanilla JavaScript, and Three.js.

## Visual Identity

Dark cinematic command center aesthetic with crimson accent lighting, inspired by a mysterious hooded character protagonist.

## Structure

```
/
├── index.html              # Main HTML (semantic, SEO-optimized)
├── css/
│   ├── style.css           # Core design system & components
│   ├── animations.css      # Keyframes & scroll-driven animations
│   └── responsive.css      # Mobile, tablet, reduced-motion
├── js/
│   ├── data.js             # All portfolio content (edit here)
│   ├── main.js             # Application orchestrator
│   ├── scene.js            # Three.js scene, camera, renderer
│   ├── character.js        # GLTF character loader + fallback
│   ├── particles.js        # Particle systems (ambient + energy)
│   ├── lighting.js         # Cinematic lighting setup
│   ├── cursor.js           # Custom cursor system
│   ├── animations.js       # Scroll reveal & interaction animations
│   ├── navigation.js       # Nav, scroll tracking, mobile menu
│   └── projects.js         # Project cards & detail modal
├── assets/
│   ├── models/
│   │   └── cloaked-shadow.glb  # Place your GLTF/GLB model here
│   ├── images/
│   ├── textures/
│   └── icons/
└── README.md
```

## Character Model

Place your GLTF/GLB character model at:

```
/assets/models/cloaked-shadow.glb
```

The website includes a graceful fallback silhouette if the model is not found.

## Editing Content

All portfolio content is in `js/data.js`. Edit projects, skills, experience, education, and contact info there — no need to touch HTML or 3D code.

## Running Locally

Serve with any static server:

```bash
npx serve .
# or
python -m http.server 8000
```

**Note:** The site must be served via HTTP (not file://) for Three.js GLTF loading to work.

## Tech Stack

- HTML5 (semantic, accessible)
- CSS3 (custom properties, animations, responsive)
- Vanilla JavaScript (modular, no frameworks)
- Three.js r128 (3D rendering, GLTF loading)
