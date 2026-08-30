export const PROFILE = {
  name: 'Rifan Muhamad Fauzi',
  title: 'Senior Software Engineer · Frontend Craftsman · AI Enthusiast',
  location: 'Bandung, Indonesia',
  github: 'rifaniponk',
  githubUrl: 'https://github.com/rifaniponk',
  x: 'rifaniponk',
  xUrl: 'https://x.com/rifaniponk',
  upworkUrl: 'https://www.upwork.com/freelancers/rifanfauzi',
}

export const SUMMARY: string[] = [
  'Senior software engineer with 15+ years of experience building web applications, specializing in Angular, TypeScript, RxJS, and frontend architecture. I help startups and enterprises turn product requirements into scalable, maintainable software, contributing from system design and technical decisions through implementation and delivery. My work spans healthcare, logistics, fintech, and enterprise platforms, and includes leading teams and improving engineering practices.',
  'Alongside web development, I have experience building cross-platform mobile applications with Ionic and Flutter, developing backend services with Go and PHP, and integrating APIs, databases, and cloud infrastructure. This end-to-end perspective helps me design systems that are practical, performant, and reliable. I also use AI-assisted development workflows to improve engineering productivity, code quality, debugging, refactoring, and prototyping.',
  'AI is currently a major area of interest for me. I am actively exploring its capabilities, studying how these systems work, and building practical workflows and experiments to understand how AI can improve software development and everyday operations.',
]

export interface ExpertiseGroup {
  domain: string
  skills: string[]
}

export const EXPERTISE: ExpertiseGroup[] = [
  {
    domain: 'Web & Frontend Engineering',
    skills: [
      'Angular',
      'TypeScript',
      'RxJS',
      'Frontend Architecture',
      'Real-time Communication',
      'React',
      'Ionic Framework',
      'State Management',
      'Performance Optimization',
      'Responsive UI',
      'Firebase',
      'Firestore',
    ],
  },
  {
    domain: 'Mobile Development',
    skills: [
      'Ionic Capacitor / Cordova',
      'Flutter',
      'Android & iOS Deployment',
      'Push Notifications',
      'Google Fit Integration',
      'HealthKit Integration',
      'Garmin SDK Integration',
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

// Overview only · company names included, no start/end dates.
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
  'End-to-end software development',
  'AI-assisted engineering workflows',
  'Mobile-first product development',
  'Developer productivity tooling',
  'Cross-platform application development',
  'Application performance tuning',
]
