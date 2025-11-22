import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getInitials(nom: string, prenoms: string): string {
  return `${nom.charAt(0)}${prenoms.charAt(0)}`.toUpperCase()
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export function generateReference(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  return `REF-${timestamp}-${random}`.toUpperCase()
}

export function calculateMonthlyPrice(totalPrice: number, duree: number): number {
  return totalPrice / duree
}

export const CATEGORIES = [
  { value: 'FILMS_SERIES', label: 'Films & Séries', icon: '🎬' },
  { value: 'MUSIQUE', label: 'Musique', icon: '🎵' },
  { value: 'GAMING', label: 'Gaming', icon: '🎮' },
  { value: 'EBOOKS', label: 'E-books', icon: '📚' },
  { value: 'SPORT', label: 'Sport', icon: '⚽' },
]

export const DUREES = [1, 3, 6, 12]

export const STATUT_PAIEMENT = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-yellow-500' },
  PAYE: { label: 'Payé', color: 'bg-green-500' },
  ECHEC: { label: 'Échoué', color: 'bg-red-500' },
  REMBOURSE: { label: 'Remboursé', color: 'bg-gray-500' },
}

export const STATUT_SOUSCRIPTION = {
  ACTIVE: { label: 'Active', color: 'bg-green-500' },
  EXPIREE: { label: 'Expirée', color: 'bg-red-500' },
  SUSPENDUE: { label: 'Suspendue', color: 'bg-orange-500' },
  ANNULEE: { label: 'Annulée', color: 'bg-gray-500' },
}

export const MODE_PAIEMENT = [
  { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: '📱' },
  { value: 'CARTE_BANCAIRE', label: 'Carte Bancaire', icon: '💳' },
]
