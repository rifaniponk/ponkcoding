export interface Swatch {
  chip: string
  name: string
  hex: string
  border?: boolean
}

export const SWATCHES: Swatch[] = [
  { chip: '#F7F8FA', name: 'Soft canvas', hex: '#F7F8FA · background', border: true },
  { chip: '#FFFFFF', name: 'Fresh sheet', hex: '#FFFFFF · cards, reading', border: true },
  { chip: '#172033', name: 'Night ink', hex: '#172033 · text, dark fields' },
  { chip: '#5D6170', name: 'Soft ink', hex: '#5D6170 · secondary text' },
  { chip: '#858894', name: 'Faint ink', hex: '#858894 · meta, indices' },
  { chip: '#E2E5EA', name: 'Hairline', hex: '#E2E5EA · borders' },
  { chip: '#5F6FBA', name: 'Soft cobalt', hex: '#5F6FBA · primary accent' },
  { chip: '#D9826E', name: 'Clay coral', hex: '#D9826E · contrast accent' },
  { chip: '#EADFA8', name: 'Signal sand', hex: '#EADFA8 · live signals' },
]

export const PRINCIPLES: { m: string; t: string }[] = [
  { m: 'a', t: 'Dark signal fields and warm reading surfaces create rhythm' },
  { m: 'b', t: 'The offset P block is the recurring identity marker' },
  { m: 'c', t: 'Soft elevation separates working notes without visual weight' },
  { m: 'd', t: 'Mono labels orient; editorial serif carries the voice' },
]
