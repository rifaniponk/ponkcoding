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
  'AI is currently a major area of interest for me. I am actively exploring its capabilities, studying how these systems work, and building practical workflows and experiments to understand how AI can improve software development and everyday operations. I am especially interested in local LLMs because increasingly capable, optimized, and fine-tuned models can run directly on a laptop, opening up practical and private ways to support everyday workloads.',
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
      'Built and maintained enterprise logistics systems using Go microservices, Angular, PHP 5, and PostgreSQL.',
      'Implemented scheduling, route planning, and collection and delivery time-slot capabilities for logistics operations.',
      'Integrated payment services with the logistics platform.',
      'Improved SQL queries and database performance for high-volume logistics workflows.',
      'Modernized legacy applications while maintaining critical PHP 5 systems.',
      'Managed CI/CD pipelines with Azure Pipelines and Jenkins.',
      'Worked with AWS, Azure, and Docker infrastructure.',
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
    role: 'Founding Product Engineer',
    company: 'Blink',
    domain: 'Startup · transport management',
    points: [
      'Joined Blink during its early startup phase and worked closely with the CTO to shape the platform and its technical direction.',
      'Helped build the transport management platform’s microservice architecture from scratch using Go and go-micro.',
      'Built a PDF parser service that extracts booking data from documents generated by external systems, reducing manual booking entry.',
      'Developed the web application and operational dashboard using Angular.',
    ],
  },
  {
    role: 'Full Stack Developer',
    company: 'Mayar.id',
    domain: 'Early-stage fintech · payments',
    points: [
      'Joined Mayar.id at its earliest stage as one of the first three team members, working closely with the CEO and CTO.',
      'Built the payment platform frontend using React.',
      'Developed GraphQL APIs and contributed to the backend architecture.',
      'Integrated payment gateway services into the platform.',
      'Contributed to product architecture and rapid delivery in a fast-moving startup environment.',
    ],
  },
  {
    role: 'Analyst Programmer',
    company: 'Mitrais',
    domain: 'Software development · medical & payroll systems',
    points: [
      'Worked at Mitrais, an Indonesia-based software development company for international clients.',
      'Contributed to Mitrais’s medical product using .NET technologies.',
      'Developed and maintained features for the Talent2 payroll system using .NET.',
      'Built frontend interactions and user interface features with jQuery.',
      'Participated across software design, implementation, testing, and maintenance.',
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
  'Software development factory (AI)',
  'AI-assisted engineering workflows',
  'Local LLMs & private AI workflows',
  'Developer productivity tooling',
  'Cross-platform application development',
  'Application performance tuning',
]
