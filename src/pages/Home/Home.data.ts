export interface LabEntry {
  no: string
  status: string
  name: string
  desc: string
  stack: string
}

export const LAB: LabEntry[] = [
  {
    no: 'L—01',
    status: 'Live',
    name: 'Personal AI router',
    desc: 'One quiet endpoint for the models and workflows I use every day.',
    stack: 'Node / LLM APIs / SQLite',
  },
  {
    no: 'L—02',
    status: 'Shipped',
    name: 'Ayatura',
    desc: 'A focused reading companion, designed and built in public.',
    stack: 'Flutter / Dart / Drift',
  },
  {
    no: 'L—03',
    status: 'Ongoing',
    name: 'Useful automations',
    desc: 'Small pipelines that remove repeated work without becoming another system to manage.',
    stack: 'Shell / Cron / APIs',
  },
]

export const PROFILE_FACTS: { label: string; value: string }[] = [
  { label: 'Experience', value: '15+ years' },
  { label: 'Scope', value: 'End-to-end product engineering' },
  { label: 'AI systems', value: 'Workflows · Automation · Orchestration' },
  { label: 'Domains', value: 'Health · Fintech · Logistics' },
]
