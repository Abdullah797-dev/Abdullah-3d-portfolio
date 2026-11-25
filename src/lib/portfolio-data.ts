/**
 * Portfolio persona data + RAG knowledge base.
 *
 * Persona content is sourced from Hafiz Abdullah's resume. Edit this single
 * file to update bio, skills, projects, education — the RAG knowledge base
 * auto-regenerates from this content at runtime.
 */

export const persona = {
  name: "Hafiz Abdullah",
  arabicName: "حافظ عبدالله",
  initials: "HA",
  title: "Web Application Developer & CS Undergraduate",
  tagline:
    "Building dynamic, scalable, user-friendly web applications — with a side passion for 3D browser games and AI tooling.",
  location: "Karachi, Pakistan",
  email: "abdullah.ibrahim1314@gmail.com",
  phone: "+92 313 1125600",
  university: "NED University of Engineering and Technology",
  degree: "B.Sc. in Computer Science",
  year: "Fourth Year",
  graduation: "2027",
  availability: "Open to internships, junior web developer roles, and freelance projects.",
  resumeUrl: "/resume.pdf",
} as const;

/**
 * Social profiles. Leave a value empty ("") to hide that link everywhere.
 * TODO: paste your LinkedIn profile URL below to show the LinkedIn button.
 */
export const socials: { github: string; linkedin: string; email: string } = {
  github: "https://github.com/Abdullah797-dev",
  linkedin: "",
  email: `mailto:${persona.email}`,
};

export const about = {
  short:
    "I am a passionate Web Application Developer in my fourth year of B.Sc. Computer Science at NED University, Karachi. I focus on building dynamic, scalable, user-friendly web applications using the modern JavaScript stack, with a growing interest in AI tooling and 3D browser games.",
  long: [
    "I am a Web Application Developer and a fourth-year B.Sc. Computer Science student at NED University of Engineering and Technology, Karachi. My core focus is building dynamic, scalable, and user-friendly applications with modern web technologies — primarily React, Angular, and the Node.js / Express backend stack.",
    "I work comfortably across both MERN and PERN stacks and have shipped seven end-to-end projects: a multi-supermarket price comparison web app (PricePulse), an intelligent medical diagnosis expert system, an AI-powered adaptive learning platform (EduSage), Hack Pro, and three 3D browser games. Each project pushed me to learn something new — rule-based inference engines, LangChain integration, WebGL2, immersive learning, or real-time game physics.",
    "Beyond web work, I build 3D browser games as side projects — a Minecraft-style voxel sandbox, a racing game, and a multiplayer arena shooter. These projects let me explore WebGL, real-time networking, and game-state management, which sharpen my engineering instincts for the web.",
    "I am a fast learner with a passion for continuous improvement, a strong team player, and a curious problem solver. When I am not coding, I read technical documentation, explore new AI tools, attend developer webinars, and play football and cricket.",
  ],
  highlights: [
    "Fourth-year B.Sc. Computer Science student at NED University, Karachi",
    "7+ shipped projects across MERN, PERN, AI, and Web 3D",
    "Comfortable across JavaScript, Python, C, C++, MongoDB, PostgreSQL, Redis",
    "Hands-on with LangChain and LLM integration (EduSage, Medical Diagnosis)",
    "3D browser game side-projects: voxel sandbox, racing, arena shooter",
  ],
};

export type SkillCategory = {
  category: string;
  icon: string;
  skills: { name: string; level: number }[];
};

export const skillCategories: SkillCategory[] = [
  {
    category: "Languages",
    icon: "code",
    skills: [
      { name: "JavaScript", level: 90 },
      { name: "Python", level: 75 },
      { name: "C", level: 78 },
      { name: "C++", level: 75 },
      { name: "TypeScript", level: 70 },
    ],
  },
  {
    category: "Frontend",
    icon: "layout",
    skills: [
      { name: "React", level: 88 },
      { name: "Angular", level: 75 },
      { name: "HTML5", level: 92 },
      { name: "CSS3 / Tailwind", level: 85 },
      { name: "React Native", level: 65 },
    ],
  },
  {
    category: "Backend",
    icon: "server",
    skills: [
      { name: "Node.js", level: 86 },
      { name: "Express.js", level: 85 },
      { name: "REST APIs", level: 82 },
      { name: "Postman", level: 80 },
    ],
  },
  {
    category: "Databases",
    icon: "database",
    skills: [
      { name: "MongoDB", level: 85 },
      { name: "MySQL", level: 78 },
      { name: "PostgreSQL", level: 72 },
      { name: "Redis", level: 68 },
    ],
  },
  {
    category: "AI & Tools",
    icon: "brain",
    skills: [
      { name: "LangChain", level: 72 },
      { name: "LLMs / Prompt Engineering", level: 78 },
      { name: "Git / GitHub", level: 88 },
      { name: "VS Code", level: 95 },
    ],
  },
];

export type Project = {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  category: "Web" | "AI" | "Game" | "3D" | "Systems";
  year: string;
  role: string;
  highlights: string[];
  accent: string;
  poster?: string;
  /** Optional per-project links shown in the case-study modal. */
  links?: {
    live?: string;
    github?: string;
  };
  video?: {
    src: string;
    poster: string;
    duration: string;
  };
};

export const projects: Project[] = [
  {
    id: "pricepulse",
    title: "PricePulse — Supermarket Price Comparison",
    shortDescription:
      "A web app that compares product prices across multiple supermarkets and recommends the most cost-effective purchasing options.",
    longDescription:
      "PricePulse helps users reduce their daily shopping costs through real-time price comparisons across multiple supermarkets. The user enters a shopping list (or scans product barcodes), PricePulse aggregates prices from partnered supermarkets, computes the cheapest split-store basket, and shows a recommended purchasing plan with total savings. Built with React, Node.js, Express, and MongoDB with a scheduled price-scraper worker.",
    tags: ["React", "Node.js", "Express", "MongoDB", "MERN"],
    category: "Web",
    year: "2024",
    role: "Solo developer",
    highlights: [
      "Real-time price comparison across multiple supermarkets",
      "Recommends the cheapest split-store purchasing plan",
      "React + Node/Express + MongoDB stack with scraper worker",
    ],
    accent: "bg-sun",
    poster: "/projects/pricepulse-ui.png",
  },
  {
    id: "med-diagnosis",
    title: "Intelligent Medical Diagnosis Expert System",
    shortDescription:
      "An AI-powered medical symptom assessment and triage web app that diagnoses conditions, scores confidence, and recommends care urgency.",
    longDescription:
      "An intelligent medical diagnosis expert system that performs symptom-based triage and differential diagnosis. The user enters patient demographics (name, age, gender, fever duration), checks symptoms (body ache, headache, severe joint pain, pain behind the eyes, etc.), and optionally imports lab results. The rule-based inference engine evaluates weighted symptom scores against a disease knowledge base, outputs the most likely diagnosis with a confidence percentage (e.g. Malaria at 43.8%), assigns a triage level (Routine / Urgent / Emergency), and flags abnormal labs. Multilingual UI (English + Urdu) with dark mode support. Built with React, Node.js, Express, and PostgreSQL (PERN stack) with a rule-engine backend.",
    tags: ["React", "Node.js", "Express", "PostgreSQL", "PERN", "Rule Engine"],
    category: "AI",
    year: "2024",
    role: "Solo developer",
    highlights: [
      "Rule-based inference engine with weighted symptom scoring",
      "Confidence-scored differential diagnosis with triage levels",
      "Multilingual (EN + Urdu) PERN-stack app with lab-result import",
    ],
    accent: "bg-sea",
    poster: "/projects/medical-diagnosis.png",
  },
  {
    id: "edusage",
    title: "EduSage — AI-Powered Adaptive Learning",
    shortDescription:
      "An AI-powered educational platform providing personalised learning experiences with adaptive assessments and intelligent tutoring.",
    longDescription:
      "EduSage is an AI-powered educational platform designed to deliver personalised learning experiences. It implements adaptive assessments that adjust difficulty based on learner performance, and an intelligent tutoring layer that generates explanations, practice questions, and progress analytics using LangChain and LLMs. The platform tracks learner mastery across topics with visual progress bars, recommends the next-best lesson via the AI tutor, and maintains a learning streak system. Built with React, Node.js, Express, MongoDB, and LangChain.",
    tags: ["React", "Node.js", "LangChain", "LLMs", "MongoDB", "MERN"],
    category: "AI",
    year: "2024",
    role: "Solo developer",
    highlights: [
      "Adaptive assessments that tune difficulty to learner performance",
      "Intelligent AI tutor with next-best-lesson recommendations",
      "Mastery tracking with visual progress and streak system",
    ],
    accent: "bg-sea/70",
    poster: "/projects/edusage-ui.png",
  },
  {
    id: "voxelcraft",
    title: "VoxelCraft — Browser Minecraft Demo",
    shortDescription:
      "A browser-based voxel sandbox game — break and place blocks, explore procedurally generated terrain, all in pure WebGL.",
    longDescription:
      "VoxelCraft is a browser-based voxel sandbox game inspired by Minecraft, written from scratch in TypeScript and raw WebGL2. It features greedy meshing for efficient chunk rendering, procedural terrain generation via 3D Perlin noise, frustum culling, dynamic block breaking and placement, and a day-night cycle. The game renders over a million voxels at 60fps on a mid-range laptop, entirely in the browser with no plugins required.",
    tags: ["WebGL2", "TypeScript", "Web 3D", "Perlin Noise", "Greedy Meshing"],
    category: "3D",
    year: "2024",
    role: "Solo project",
    highlights: [
      "Pure WebGL2 voxel engine — no plugins, runs in any modern browser",
      "Greedy meshing for efficient chunk rendering",
      "Procedural terrain via 3D Perlin noise + day-night cycle",
    ],
    accent: "bg-sea/50",
    video: {
      src: "/videos/minecraft_V2.mp4",
      poster: "/projects/minecraft-v2.jpg",
      duration: "1:53",
    },
  },
  {
    id: "speed-force",
    title: "Speed Force — Browser Racing Game",
    shortDescription:
      "An arcade-style browser racing game with high-speed track racing, lap timing, and a HUD speedometer.",
    longDescription:
      "Speed Force is an arcade-style browser racing game built with Three.js. It features high-speed track racing with realistic car physics, lap timing, a HUD speedometer and minimap, multiple track layouts, and unlockable cars. Built as a side project to explore real-time 3D physics, camera rigging, and shader-based motion blur in the browser.",
    tags: ["Three.js", "JavaScript", "Web 3D", "Physics", "Shaders"],
    category: "Game",
    year: "2024",
    role: "Solo project",
    highlights: [
      "Arcade-style racing with custom car physics in Three.js",
      "Lap timing, HUD speedometer, and minimap",
      "Multiple tracks and unlockable cars",
    ],
    accent: "bg-sun/60",
    video: {
      src: "/videos/Speed_Force.mp4",
      poster: "/projects/speed-force.jpg",
      duration: "2:05",
    },
  },
  {
    id: "arena-clash",
    title: "Arena Clash — Multiplayer Browser Shooter",
    shortDescription:
      "A fast-paced multiplayer arena shooter demo built for the browser with real-time action combat.",
    longDescription:
      "Arena Clash is a fast-paced multiplayer arena shooter demo built for the browser. It demonstrates real-time action combat, enemy AI, projectile systems, particle effects, and a HUD with health and ammo. Built as a side project to learn game-loop architecture, real-time input handling, and browser-side particle systems. The demo showcases one full arena match against AI opponents.",
    tags: ["JavaScript", "Canvas", "Web 3D", "Game Loop", "Particle FX"],
    category: "Game",
    year: "2023",
    role: "Solo project",
    highlights: [
      "Real-time arena combat with projectile systems",
      "Enemy AI and particle effects",
      "Game-loop architecture with deterministic input handling",
    ],
    accent: "bg-foam/60",
    video: {
      src: "/videos/gameplay.mp4",
      poster: "/projects/arena-clash.jpg",
      duration: "0:53",
    },
  },
  {
    id: "hack-pro",
    title: "Hack Pro",
    shortDescription:
      "A risk-free learning platform that turns digital anxiety into confidence through immersive 3D learning, live scam simulations, and gamified detection skills.",
    longDescription:
      "Hack Pro is a risk-free learning platform designed to help users recognise and respond to digital threats with confidence. It combines 3D immersive learning environments, live scam simulations, and gamified detection exercises to turn digital anxiety into practical, repeatable skills.",
    tags: ["Web", "3D", "Cybersecurity", "Gamification", "Learning"],
    category: "Web",
    year: "2026",
    role: "Solo developer",
    highlights: [
      "Immersive 3D learning experiences for practical cybersecurity education",
      "Live scam simulations that teach users to identify digital threats",
      "Gamified detection skills designed to build confidence",
    ],
    accent: "bg-sea",
    video: {
      src: "/videos/hack_pro.mp4",
      poster: "/projects/hack-pro.jpg",
      duration: "2:08",
    },
  },
];

export type Experience = {
  role: string;
  org: string;
  period: string;
  location: string;
  description: string;
  bullets: string[];
};

export const experiences: Experience[] = [
  {
    role: "Independent Project Work",
    org: "Web Application Development",
    period: "2022 — present",
    location: "Karachi, Pakistan",
    description:
      "Designed, built, and shipped four production-style web applications and three browser-game side projects as part of self-directed learning alongside university coursework.",
    bullets: [
      "Built PricePulse, Medical Diagnosis, EduSage, VoxelCraft, Speed Force, and Arena Clash end-to-end.",
      "Shipped VoxelCraft, Speed Force, and Arena Clash as 3D/game side projects.",
      "Each project deliberately explored a new stack or technique (MERN, Socket.io, LangChain, WebGL2, Three.js).",
    ],
  },
  {
    role: "B.Sc. Computer Science — Coursework",
    org: "NED University of Engineering and Technology",
    period: "2022 — present",
    location: "Karachi, Pakistan",
    description:
      "Fourth year of B.Sc. Computer Science. Coursework spanning programming, data structures, databases, operating systems, and software engineering.",
    bullets: [
      "Programming Languages: C, C++, JavaScript, Python covered through core courses.",
      "Database Management Systems and Object-Oriented Programming coursework.",
      "Software engineering and web application development focus in current year.",
    ],
  },
];

export type Education = {
  institution: string;
  degree: string;
  period: string;
  location: string;
  details: string;
  /** Three short outcomes shown on the timeline (what this stage led to). */
  impacts: string[];
  coursework: string[];
};

export const education: Education[] = [
  {
    institution: "NED University of Engineering and Technology",
    degree: "Bachelor of Science in Computer Science — Currently Enrolled",
    period: "2022 — 2027",
    location: "Karachi, Pakistan",
    details: "Fourth Year. Specialisation in modern web technologies and software engineering.",
    impacts: [
      "Turned DBMS and OOP coursework into shipped MERN and PERN apps (PricePulse, Medical Diagnosis).",
      "Core C, C++, JavaScript, and Python courses underpin every project in this portfolio.",
      "Fourth-year focus on software engineering and web application development; graduating 2027.",
    ],
    coursework: [
      "Programming Fundamentals (C, C++)",
      "Object-Oriented Programming",
      "Data Structures & Algorithms",
      "Database Management Systems",
      "Operating Systems",
      "Software Engineering",
      "Web Application Development",
    ],
  },
  {
    institution: "Adamjee Government Science College",
    degree: "Intermediate (Pre-Engineering)",
    period: "2020 — 2022",
    location: "Karachi, Pakistan",
    details: "Completed Intermediate with Pre-Engineering group. Foundation in mathematics, physics, and chemistry.",
    impacts: [
      "Built the mathematics and physics base later used in 3D graphics and game physics.",
      "Completed the Pre-Engineering group: mathematics, physics, and chemistry.",
      "Moved on to B.Sc. Computer Science at NED University in 2022.",
    ],
    coursework: ["Mathematics", "Physics", "Chemistry", "English", "Urdu", "Pakistan Studies"],
  },
  {
    institution: "Smart City School",
    degree: "Matriculation (Science Group)",
    period: "2018 — 2020",
    location: "Karachi, Pakistan",
    details: "Completed Secondary School Certificate with Science group. Strong foundation in computer studies and general science.",
    impacts: [
      "Studied computer science alongside the core science subjects.",
      "Built a strong foundation in mathematics and general science.",
      "Completed the Secondary School Certificate in 2020.",
    ],
    coursework: ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "English"],
  },
];

export const achievements = [
  {
    title: "4 End-to-end Web Projects Shipped",
    detail: "Independently designed and built PricePulse, Medical Diagnosis, EduSage, and three browser games alongside university coursework.",
    date: "2023 — 2024",
  },
  {
    title: "3 Browser Game Demos",
    detail: "Self-taught WebGL2 and Three.js to ship VoxelCraft, Speed Force, and Arena Clash as playable side projects.",
    date: "2023 — 2024",
  },
  {
    title: "AI Integration with LangChain",
    detail: "Built EduSage using LangChain and LLMs to power adaptive assessments and intelligent tutoring.",
    date: "2024",
  },
  {
    title: "MERN Stack Fluency",
    detail: "Comfortable across MongoDB, Express, React, Node.js (MERN) and PostgreSQL (PERN) — demonstrated through PricePulse and the Medical Diagnosis system.",
    date: "Ongoing",
  },
];

/**
 * Knowledge base for the RAG chatbot.
 * Each chunk has an `id`, a `source` (used for citations), and the text body
 * that will be embedded and retrieved.
 */
export type KnowledgeChunk = {
  id: string;
  source: string;
  text: string;
};

function buildKnowledgeBase(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  chunks.push({
    id: "bio-short",
    source: "About > Short Bio",
    text: `${persona.name} is a ${persona.title.toLowerCase()} from ${persona.location}, currently in his ${persona.year.toLowerCase()} of ${persona.degree} at ${persona.university}. ${about.short} Contact: ${persona.email}, ${persona.phone}. ${persona.availability}`,
  });

  about.long.forEach((para, i) => {
    chunks.push({
      id: `bio-long-${i}`,
      source: `About > Bio paragraph ${i + 1}`,
      text: para,
    });
  });

  about.highlights.forEach((h, i) => {
    chunks.push({
      id: `bio-highlight-${i}`,
      source: "About > Highlights",
      text: `Highlight: ${h}`,
    });
  });

  skillCategories.forEach((cat) => {
    chunks.push({
      id: `skills-${cat.category.toLowerCase()}`,
      source: `Skills > ${cat.category}`,
      text: `${cat.category} skills: ${cat.skills.map((s) => `${s.name} (${s.level}%)`).join(", ")}.`,
    });
  });

  projects.forEach((p) => {
    chunks.push({
      id: `project-${p.id}`,
      source: `Projects > ${p.title}`,
      text: `${p.title} (${p.year}, ${p.category}, role: ${p.role}). ${p.longDescription} Tags: ${p.tags.join(", ")}.`,
    });
    p.highlights.forEach((h, i) => {
      chunks.push({
        id: `project-${p.id}-highlight-${i}`,
        source: `Projects > ${p.title} > Highlights`,
        text: `${p.title} highlight: ${h}`,
      });
    });
    if (p.video) {
      chunks.push({
        id: `project-${p.id}-video`,
        source: `Projects > ${p.title} > Demo video`,
        text: `${p.title} has a playable demo video of duration ${p.video.duration}, embedded on its project card.`,
      });
    }
  });

  experiences.forEach((e, i) => {
    chunks.push({
      id: `exp-${i}`,
      source: `Experience > ${e.role}`,
      text: `${e.role} — ${e.org} (${e.period}, ${e.location}). ${e.description} ${e.bullets.join(" ")}`,
    });
  });

  education.forEach((ed, i) => {
    chunks.push({
      id: `edu-${i}`,
      source: `Education > ${ed.institution}`,
      text: `${ed.institution}: ${ed.degree} (${ed.period}, ${ed.location}). ${ed.details} ${ed.impacts.join(" ")} Coursework: ${ed.coursework.join(", ")}.`,
    });
  });

  achievements.forEach((a, i) => {
    chunks.push({
      id: `achievement-${i}`,
      source: `Achievements > ${a.title}`,
      text: `Achievement: ${a.title} (${a.date}). ${a.detail}`,
    });
  });

  chunks.push({
    id: "contact",
    source: "Contact",
    text: `Contact ${persona.name}: email ${persona.email}, phone ${persona.phone}. Based in ${persona.location}. Availability: ${persona.availability}${socials.github ? ` GitHub: ${socials.github}.` : ""}${socials.linkedin ? ` LinkedIn: ${socials.linkedin}.` : ""}`,
  });

  return chunks;
}

export const knowledgeBase: KnowledgeChunk[] = buildKnowledgeBase();
