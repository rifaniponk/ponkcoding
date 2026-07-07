export const PROFILE = {
  name: 'Rifan Muhamad Fauzi',
  title: 'Senior Software Engineer · Frontend Architect · Cross-platform Developer · AI',
  location: 'Bandung, Indonesia',
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
  company: string
  domain: string
  points: string[]
}

// Overview only — company names included, no start/end dates.
export const EXPERIENCE: Experience[] = [
  {
    role: 'Senior Software Engineer',
    company: 'Software Integrators',
    domain: 'Enterprise logistics',
    points: [
      'Built and maintained enterprise logistics applications using Go, PHP, and Angular.',
      'Worked on microservices and API integrations, and on cloud infrastructure with PostgreSQL, AWS, Azure, Docker, and Kubernetes.',
    ],
  },
  {
    role: 'Senior Frontend Engineer → Frontend Tech Lead',
    company: 'WeGuide Health',
    domain: 'Healthcare · cross-platform',
    points: [
      'Led and mentored the frontend team, establishing engineering standards and development workflows for a regulatory-approved patient management platform across web and mobile.',
      'Built scalable cross-platform architecture (PWA, iOS, Android) in Angular and Ionic, with reusable UI systems and reactive data flows.',
      'Integrated Garmin wearable SDK, Apple HealthKit, and Google Fit for health and wellness tracking.',
      'Drove major framework upgrades, large-scale refactors, and performance optimization; maintained CI/CD pipelines and internal developer tooling.',
    ],
  },
  {
    role: 'Full Stack Engineer',
    company: 'Blink',
    domain: 'Logistics · booking automation',
    points: [
      'Built Go microservices powering the platform backend.',
      'Developed the frontend dashboard.',
      'Built a PDF parser that automates booking creation.',
    ],
  },
  {
    role: 'Full Stack Developer',
    company: 'Mayar.id',
    domain: 'Fintech · payments',
    points: [
      'Built payment platform applications with React and GraphQL and integrated payment gateway services.',
      'Contributed to product architecture and rapid feature delivery across frontend, backend, and payment layers.',
    ],
  },
  {
    role: 'Analyst Programmer → Senior',
    company: 'Mitrais',
    domain: 'Enterprise · medical & logistics',
    points: [
      'Delivered enterprise software projects for international clients using .NET, PHP, Angular, and enterprise backend systems.',
      'Participated across software design, implementation, and maintenance.',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'e-resto (Newbee Corp)',
    domain: 'Startup · restaurant POS & discovery',
    points: [
      'Participated in requirement analysis and system design for a restaurant POS and discovery startup using PHP, MySQL, HTML, JavaScript, and jQuery.',
      'Built product features and backend services, working closely with stakeholders in a fast-moving startup environment.',
      'Won the Indonesia ICT Award (INAICTA) 2013 in the SME Application category.',
    ],
  },
  {
    role: 'PHP Programmer',
    company: 'Torche Indonesia',
    domain: 'Web · short-term projects',
    points: [
      'Developed short-term PHP projects using the Yii Framework and MySQL.',
      'Delivered custom web application features and integrations.',
    ],
  },
  {
    role: 'Web Developer',
    company: 'Telkom Indonesia',
    domain: 'Enterprise · web',
    points: [
      "Started professional career at Indonesia's leading digital transformation company.",
      'Maintained legacy PHP applications; developed new features and fixed production issues on internal apps.',
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
