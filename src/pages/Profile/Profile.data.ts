export const PROFILE = {
  name: 'Rifan Muhamad Fauzi',
  title: 'Senior Software Engineer · Frontend Architect · Cross-platform Developer · AI',
  location: 'Bandung, Indonesia',
  email: 'rifan.refun@gmail.com',
  github: 'rifaniponk',
  githubUrl: 'https://github.com/rifaniponk',
  upworkUrl: 'https://www.upwork.com/freelancers/rifanmuhamadfauzi',
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
  period: string
  blurb?: string
  points: string[]
}

export const EXPERIENCE: Experience[] = [
  {
    role: 'Frontend Tech Lead',
    company: 'WeGuide Health',
    period: 'Aug 2023 – Mar 2026',
    blurb:
      'Led the frontend engineering team for a regulatory-approved patient management platform serving clinical and patient engagement use cases across web and mobile. WeGuide facilitates diverse study types and integrates with external systems like Garmin wearables and Health Connect / Apple Health.',
    points: [
      'Led and mentored frontend engineers while establishing engineering standards and development workflows.',
      'Delivered cross-platform healthcare applications using Angular and Ionic.',
      'Implemented Garmin wearable SDK integration and Apple HealthKit / Google Fit synchronization for health and wellness tracking.',
      'Performed major Angular and Ionic upgrades and led large-scale refactors and performance optimization initiatives.',
      'Built internal engineering tools to improve developer productivity; maintained and improved CircleCI pipelines and deployment workflows.',
      'Worked closely with product, design, and backend teams in agile delivery environments.',
    ],
  },
  {
    role: 'Senior Frontend Engineer',
    company: 'WeGuide Health',
    period: 'Aug 2021 – Aug 2023',
    points: [
      'Developed scalable frontend architecture for cross-platform applications (PWA, iOS, Android) using Angular and Ionic.',
      'Implemented reusable UI systems and reactive data flows.',
      'Optimized application performance and mobile experience.',
      'Collaborated closely with backend and product teams on healthcare workflows.',
    ],
  },
  {
    role: 'Full Stack Developer',
    company: 'Mayar.id',
    period: 'Jun 2020 – Sept 2021',
    blurb:
      'Indonesian fintech startup building digital payment solutions on a no-code payment and commerce platform focused on frictionless checkout.',
    points: [
      'Built payment platform applications using React and GraphQL.',
      'Integrated Xendit payment gateway services.',
      'Contributed to startup product architecture and rapid feature delivery across frontend, backend, and payment integration layers.',
    ],
  },
  {
    role: 'Senior Software Engineer',
    company: 'Software Integrators',
    period: 'Jan 2017 – Jun 2020',
    blurb: 'Enterprise logistics systems and operational platforms for CitySprint UK.',
    points: [
      'Built and maintained enterprise applications using Go, PHP, and Angular.',
      'Worked on microservices and API integrations for logistics operations.',
      'Contributed to cloud infrastructure and deployment workflows using PostgreSQL, AWS, Azure, Docker, and Kubernetes.',
      'Delivered features for high-scale operational systems.',
    ],
  },
  {
    role: 'Analyst Programmer',
    company: 'Mitrais',
    period: 'Mar 2014 – Dec 2016',
    blurb:
      'Promoted from mid-level to senior at a leading software company serving the Australian market across medical systems and logistics.',
    points: [
      'Delivered multiple enterprise software projects for Australian clients.',
      'Worked with .NET, PHP, Angular, and enterprise backend systems.',
      'Participated in software design, implementation, and maintenance.',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'e-resto',
    period: 'Feb 2013 – Feb 2014',
    blurb: 'Restaurant POS systems startup.',
    points: [
      'Participated in requirement analysis and system design using PHP, MySQL, HTML, JavaScript, and jQuery.',
      'Built product features and backend services.',
      'Worked closely with stakeholders in fast-moving startup environments.',
    ],
  },
  {
    role: 'PHP Programmer',
    company: 'Torche Indonesia',
    period: 'Jul 2013 – Nov 2013',
    points: [
      'Developed short-term PHP projects using the Yii Framework and MySQL.',
      'Delivered custom web application features and integrations.',
    ],
  },
  {
    role: 'Web Developer',
    company: 'Telkom Indonesia',
    period: 'Aug 2012 – Jan 2013',
    blurb: "Started professional career at Indonesia's leading digital transformation company.",
    points: [
      'Maintained legacy PHP applications.',
      'Developed new features and fixed production issues on existing internal apps.',
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
