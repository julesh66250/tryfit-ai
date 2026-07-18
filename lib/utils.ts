import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const GARMENT_TYPES = [
  { value: 'tops', label: 'T-shirt' },
  { value: 'tops', label: 'Pull' },
  { value: 'tops', label: 'Veste' },
  { value: 'tops', label: 'Manteau' },
  { value: 'bottoms', label: 'Pantalon' },
  { value: 'bottoms', label: 'Short' },
  { value: 'one-pieces', label: 'Robe' },
  { value: 'one-pieces', label: 'Jupe' },
] as const

export const GARMENT_CATEGORIES = [
  { id: 'tops', label: 'Haut', emoji: '👕', items: ['T-shirt', 'Pull', 'Veste', 'Manteau', 'Chemise', 'Hoodie'] },
  { id: 'bottoms', label: 'Bas', emoji: '👖', items: ['Pantalon', 'Short', 'Jupe'] },
  { id: 'one-pieces', label: 'Robe / Combinaison', emoji: '👗', items: ['Robe', 'Combinaison'] },
] as const

export type GarmentCategory = 'tops' | 'bottoms' | 'one-pieces'

export const FREE_CREDITS = 3
export const PREMIUM_MONTHLY_CREDITS = 100
