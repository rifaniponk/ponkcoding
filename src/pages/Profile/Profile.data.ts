export const PROFILE = {
  name: 'Rifan Muhamad Fauzi',
  title: 'Senior Software Engineer · Frontend Architect · Cross-platform Developer · AI',
  location: 'Bandung, Indonesia',
  email: 'rifan.refun@gmail.com',
  github: 'rifaniponk',
  githubUrl: 'https://github.com/rifaniponk',
  x: 'rifaniponk',
  xUrl: 'https://x.com/rifaniponk',
  upworkUrl: 'https://www.upwork.com/freelancers/rifanfauzi',
}

export const SUMMARY: string[] = [
  'Senior Software Engineer with 15+ years of experience building scalable web and mobile applications across healthcare, logistics, payment systems, and enterprise platforms. Specialized in modern frontend engineering with strong expertise in Angular, reactive architectures, performance optimization, and scalable application design. Experienced in leading frontend teams, driving engineering standards, and delivering production-grade applications used by thousands of daily users.',
  'Strong cross-platform mobile development background using Ionic, with growing expertise in Flutter. Experienced in native mobile integrations including biometric authentication, HealthKit, Google Fit, and Garmin wearable SDK integrations. Backend experience includes Go and PHP microservices, REST APIs, message queues, PostgreSQL, and cloud infrastructure (AWS, Azure), allowing full understanding of end-to-end system architecture. Actively leveraging AI-assisted development workflows for engineering productivity, code quality, debugging, refactoring, and rapid prototyping.',
]

export interface ExpertiseGroup {
  domain: string
  skills: string[]
}

export const EXPERTISE: ExpertiseGroup[] = [
  {
    domain: 'Frontend Engineering',
    skills: [
      'Angular',
      'TypeScript',
      'RxJS',
      'React',
      'Ionic Framework',
      'State Management',
      'PWA Development',
      'Performance Optimization',
      'Responsive UI',
    ],
  },
  {
    domain: 'Mobile Development',
    skills: [
      'Ionic Capacitor / Cordova',
      'Flutter',
      'Android & iOS Deployment',
      'Native Plugin Integration (HealthKit, Google Fit, Garmin SDK)',
      'Biometric Authentication',
    ],
  },
  {
    domain: 'Backend & Infrastructure',
    skills: [
      'Go (Golang)',
      'PHP',
      'Microservices',
      'REST APIs',
      'GraphQL',
      'PostgreSQL',
      'Firebase / Firestore',
      'Docker',
      'Kubernetes',
      'AWS',
      'Azure',
    ],
  },
  {
    domain: 'DevOps & Engineering',
    skills: [
      'CI/CD Pipelines (CircleCI, Azure Pipelines, GitHub Actions)',
      'Technical Leadership',
      'Software Architecture',
      'AI-assisted Development Workflow',
    ],
  },
]

export interface Experience {
  role: string
  domain: string
  points: string[]
}

// High-level overview only — no employers or dates (kept intentionally private).
export const EXPERIENCE: Experience[] = [
  {
    role: 'Frontend Tech Lead',
    domain: 'Healthcare · cross-platform',
    points: [
      'Led and mentored a frontend team, establishing engineering standards and development workflows for a regulatory-approved patient management platform across web and mobile.',
      'Delivered cross-platform healthcare apps in Angular and Ionic, including Garmin wearable SDK, Apple HealthKit, and Google Fit integrations.',
      'Drove major framework upgrades, large-scale refactors, and performance optimization; maintained CI/CD pipelines and internal developer tooling.',
    ],
  },
  {
    role: 'Senior Frontend Engineer',
    domain: 'Healthcare · cross-platform',
    points: [
      'Built scalable frontend architecture for PWA, iOS, and Android using Angular and Ionic.',
      'Implemented reusable UI systems and reactive data flows, and optimized mobile performance.',
    ],
  },
  {
    role: 'Full Stack Developer',
    domain: 'Fintech · payments',
    points: [
      'Built payment platform applications with React and GraphQL and integrated payment gateway services.',
      'Contributed to product architecture and rapid feature delivery across frontend, backend, and payment layers.',
    ],
  },
  {
    role: 'Senior Software Engineer',
    domain: 'Enterprise logistics',
    points: [
      'Built and maintained enterprise logistics applications using Go, PHP, and Angular.',
      'Worked on microservices and API integrations, and on cloud infrastructure with PostgreSQL, AWS, Azure, Docker, and Kubernetes.',
    ],
  },
  {
    role: 'Analyst Programmer → Senior',
    domain: 'Enterprise · medical & logistics',
    points: [
      'Delivered enterprise software projects for international clients using .NET, PHP, Angular, and enterprise backend systems.',
      'Participated across software design, implementation, and maintenance.',
    ],
  },
  {
    role: 'Software Engineer',
    domain: 'Startups · web systems',
    points: [
      'Built product features and backend services across early-stage startups (POS, web applications) using PHP, MySQL, and JavaScript.',
      'Started professional career maintaining and extending web applications at a large enterprise.',
    ],
  },
]

export const EDUCATION = {
  degree: 'Bachelor of Computer Science',
  school: 'Telkom University',
}

export const INTERESTS: string[] = [
  'AI-assisted engineering workflows',
  'Flutter application development',
  'Mobile-first product development',
  'Developer productivity tooling',
  'Cross-platform architecture patterns',
]
