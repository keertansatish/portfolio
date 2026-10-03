// ============================================================
// PORTFOLIO DATA — Edit this file to update all portfolio content
// No need to modify visual/3D implementation files
// ============================================================

const portfolioData = {

  personal: {
    name: "Keertan Satish",
    firstName: "KEERTAN",
    lastName: "SATISH",
    title: "Computer Science Engineer",
    tagline: "BUILDING\nREAL-WORLD\nPRODUCTION-GRADE\nSYSTEMS.",
    highlightWord: "PRODUCTION-GRADE",
    description: "Computer Science Engineer focused on building intelligent systems, full-stack applications, and AI-driven products.",
    resumeUrl: "assets/resume/Keertan-Satish-Resume.pdf",
    email: "keertansatish@gmail.com",
    github: "https://github.com/keertansatish",
    linkedin: "https://linkedin.com/in/keertansatish",
  },

  about: {
    heading: "BEHIND THE SYSTEM",
    intro: "I'm Keertan Satish — a Computer Science & AI/Data Science student at SASTRA University, building production-grade systems that solve real problems.",
    focus: [
      "Artificial Intelligence & Machine Learning",
      "Full-Stack Engineering",
      "Intelligent Systems & Agents",
      "Backend Architecture",
      "Production Engineering"
    ],
    statements: ["BUILD.", "DEBUG.", "LEARN.", "ITERATE.", "SHIP."],
  },

  skills: {
    heading: "SYSTEM CAPABILITIES",
    categories: [
      {
        name: "LANGUAGES",
        items: ["Python", "JavaScript", "SQL", "Java", "C++"]
      },
      {
        name: "AI / MACHINE LEARNING",
        items: ["Machine Learning", "Deep Learning", "NLP", "RAG", "Agentic AI", "Computer Vision"]
      },
      {
        name: "WEB / BACKEND",
        items: ["Next.js", "React", "Node.js", "FastAPI", "REST APIs", "Express.js"]
      },
      {
        name: "DATABASE / SYSTEMS",
        items: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Firebase"]
      },
      {
        name: "TOOLS & PLATFORMS",
        items: ["Git", "Docker", "Linux", "AWS", "Vercel", "VS Code"]
      }
    ]
  },

  projects: [
    {
      title: "CampusRAG",
      subtitle: "AI-Powered Campus Intelligence",
      description: "A Retrieval-Augmented Generation system that enables students to query campus information through natural language. Built with advanced RAG pipelines, vector databases, and LLM orchestration for accurate, context-aware responses.",
      problem: "Students struggle to find scattered campus information across multiple portals and documents.",
      solution: "Built an intelligent RAG pipeline that ingests campus documents, creates vector embeddings, and serves accurate answers through a conversational interface.",
      technologies: ["Python", "LangChain", "FastAPI", "ChromaDB", "OpenAI", "React"],
      challenges: [
        "Optimizing chunk sizes for accurate retrieval",
        "Handling ambiguous queries with context-aware prompting",
        "Building efficient vector indexing for large document sets"
      ],
      github: "https://github.com/keertansatish/campusrag",
      demo: "",
      featured: true
    },
    {
      title: "MobileForge",
      subtitle: "Cross-Platform App Builder",
      description: "A full-stack platform that streamlines mobile application development with automated code generation, component libraries, and deployment pipelines.",
      problem: "Mobile app development involves repetitive boilerplate and fragmented tooling.",
      solution: "Created an integrated platform with reusable component libraries and automated build pipelines to accelerate mobile development.",
      technologies: ["React Native", "Node.js", "Express", "MongoDB", "Docker"],
      challenges: [
        "Cross-platform component consistency",
        "Automated build pipeline orchestration",
        "Real-time preview synchronization"
      ],
      github: "https://github.com/keertansatish/mobileforge",
      demo: "",
      featured: true
    },
    {
      title: "Show Ticket Booking System",
      subtitle: "Real-Time Event Booking",
      description: "A production-grade ticket booking platform with real-time seat availability, concurrent booking management, and secure payment integration.",
      problem: "Traditional booking systems fail under concurrent load and lack real-time seat visualization.",
      solution: "Engineered a system with optimistic locking, WebSocket-based real-time updates, and interactive seat selection.",
      technologies: ["Node.js", "React", "PostgreSQL", "Redis", "WebSocket", "Stripe"],
      challenges: [
        "Handling race conditions in concurrent bookings",
        "Real-time seat map synchronization",
        "Distributed session management with Redis"
      ],
      github: "https://github.com/keertansatish/ticket-booking",
      demo: "",
      featured: true
    },
    {
      title: "Auction Application",
      subtitle: "Real-Time Bidding Platform",
      description: "A live auction platform with real-time bidding, automated bid escalation, countdown timers, and comprehensive auction management.",
      problem: "Online auctions need millisecond-accurate real-time synchronization across all participants.",
      solution: "Built a WebSocket-powered bidding engine with server-authoritative time synchronization and optimistic UI updates.",
      technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Express"],
      challenges: [
        "Sub-second bid synchronization across clients",
        "Preventing bid sniping with anti-snipe extensions",
        "Scalable real-time event broadcasting"
      ],
      github: "https://github.com/keertansatish/auction-app",
      demo: "",
      featured: false
    },
    {
      title: "Flood Segmentation",
      subtitle: "AISE Hackathon — Computer Vision",
      description: "A deep learning computer vision system for identifying and segmenting flood-affected regions from satellite imagery, developed during the AISE Hackathon.",
      problem: "Manual identification of flood zones from satellite data is slow and error-prone during disaster response.",
      solution: "Developed a U-Net based segmentation model trained on satellite imagery to automatically identify flood-affected areas.",
      technologies: ["Python", "PyTorch", "OpenCV", "U-Net", "NumPy", "GDAL"],
      challenges: [
        "Handling class imbalance in flood vs non-flood pixels",
        "Processing large satellite image tiles efficiently",
        "Achieving real-time inference for disaster response"
      ],
      github: "https://github.com/keertansatish/flood-segmentation",
      demo: "",
      featured: true
    },
    {
      title: "Churn Analysis",
      subtitle: "Predictive Customer Analytics",
      description: "A machine learning pipeline for predicting customer churn with feature engineering, model comparison, and actionable business insights.",
      problem: "Businesses lose revenue by failing to identify at-risk customers before they churn.",
      solution: "Built an end-to-end ML pipeline with automated feature engineering and ensemble models to predict churn probability.",
      technologies: ["Python", "Scikit-learn", "Pandas", "XGBoost", "Matplotlib", "Streamlit"],
      challenges: [
        "Feature engineering from raw transaction data",
        "Handling highly imbalanced churn datasets",
        "Translating model outputs to business recommendations"
      ],
      github: "https://github.com/keertansatish/churn-analysis",
      demo: "",
      featured: false
    }
  ],

  experience: [
    {
      type: "project",
      title: "CampusRAG Development",
      organization: "Personal Project",
      period: "2026",
      description: "Architected and built a RAG-powered campus intelligence system from scratch.",
      highlights: ["LLM Integration", "Vector Search", "Production Deployment"]
    },
    {
      type: "hackathon",
      title: "AISE Hackathon",
      organization: "Flood Segmentation Challenge",
      period: "2026",
      description: "Developed a computer vision solution for flood zone identification using satellite imagery.",
      highlights: ["Deep Learning", "Computer Vision", "Satellite Data"]
    },
    {
      type: "project",
      title: "Full-Stack Development",
      organization: "Multiple Production Systems",
      period: "2025 — Present",
      description: "Built and deployed multiple full-stack applications including booking systems, auction platforms, and AI-powered tools.",
      highlights: ["React", "Node.js", "PostgreSQL", "Real-time Systems"]
    }
  ],

  education: {
    heading: "ORIGIN",
    university: "SASTRA University",
    degree: "B.Tech in Computer Science",
    specialization: "AI & Data Science",
    period: "2023 — 2027",
    cgpa: "",
    coursework: [
      "Data Structures & Algorithms",
      "Machine Learning",
      "Deep Learning",
      "Natural Language Processing",
      "Database Systems",
      "Computer Networks",
      "Operating Systems",
      "Software Engineering"
    ]
  },

  achievements: [
    {
      metric: "TOP 15",
      label: "AISE Hackathon — Flood Segmentation",
      detail: "Among 120+ participants"
    },
    {
      metric: "6+",
      label: "Production Systems Built",
      detail: "Full-stack & AI applications"
    },
    {
      metric: "5+",
      label: "AI/ML Projects",
      detail: "NLP, CV, RAG, Agentic AI"
    }
  ],

  contact: {
    heading: "LET'S BUILD\nSOMETHING REAL.",
    subtext: "If you're building something ambitious, let's talk.",
    email: "keertansatish@gmail.com",
    github: "https://github.com/keertansatish",
    linkedin: "https://linkedin.com/in/keertansatish",
    cta: "START A CONVERSATION"
  },

  // Character model configuration
  character: {
    modelPath: '/assets/models/cloaked-shadow.glb',
    fallbackEnabled: true,
    scale: 3.0,
    position: { x: 1.5, y: -2.2, z: 0 },
    rotation: { x: 0, y: -0.3, z: 0 },
  },

  // Navigation items
  navigation: [
    { label: "ABOUT", target: "#about" },
    { label: "SKILLS", target: "#skills" },
    { label: "PROJECTS", target: "#projects" },
    { label: "EXPERIENCE", target: "#experience" },
    { label: "EDUCATION", target: "#education" },
    { label: "CONTACT", target: "#contact" }
  ]
};

// Make available globally
if (typeof window !== 'undefined') {
  window.portfolioData = portfolioData;
}
