import type { User } from '@/lib/types/user';

/**
 * Mock users for Evolution OS prototype.
 * These are real team members from Evolution Zona Libre.
 */
export const MOCK_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Javier Ureña',
    email: 'javier@evolution.com',
    role: 'gerencia',
    avatar: '/images/avatars/javier.jpg',
  },
  {
    id: 'USR-002',
    name: 'Estelia Romero',
    email: 'estelia@evolution.com',
    role: 'contabilidad',
    avatar: '/images/avatars/estelia.jpg',
  },
  {
    id: 'USR-003',
    name: 'Jackie García',
    email: 'jackie@evolution.com',
    role: 'compras',
    avatar: '/images/avatars/jackie.jpg',
  },
  {
    id: 'USR-004',
    name: 'Celly Ortega',
    email: 'celly@evolution.com',
    role: 'vendedor',
    avatar: '/images/avatars/celly.jpg',
  },
  {
    id: 'USR-005',
    name: 'Jesús Medina',
    email: 'jesus@evolution.com',
    role: 'vendedor',
    avatar: '/images/avatars/jesus.jpg',
  },
  {
    id: 'USR-006',
    name: 'Margarita Díaz',
    email: 'margarita@evolution.com',
    role: 'trafico',
    avatar: '/images/avatars/margarita.jpg',
  },
  {
    id: 'USR-007',
    name: 'Arnold Torres',
    email: 'arnold@evolution.com',
    role: 'bodega',
    avatar: '/images/avatars/arnold.jpg',
  },
  {
    id: 'USR-008',
    name: 'Ariel Mendoza',
    email: 'ariel@evolution.com',
    role: 'bodega',
    avatar: '/images/avatars/ariel.jpg',
  },
];

/**
 * Get user by email (for mock login)
 */
export function getUserByEmail(email: string): User | undefined {
  return MOCK_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * Get user by ID
 */
export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find((user) => user.id === id);
}
