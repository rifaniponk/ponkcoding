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

export const NOW_PERIOD = 'July 2026'

export const NOW: { label: string; value: string | string[] }[] = [
  { label: 'Role', value: 'Senior engineer · enterprise logistics system' },
  { label: 'Building', value: ['Ayatura', 'An IHSG trading-signal bot'] },
  { label: 'Exploring', value: 'AI automation & workflows for development' },
  { label: 'Writing', value: 'Field notes, right here on this site' },
]
