import type { User } from '@/lib/types/user';
import { loadCollection, saveCollection, createSubscribers } from '@/lib/store/local-store';

/**
 * Seed users for Evolution OS prototype.
 * These are real team members from Evolution Zona Libre.
 */
const SEED_USERS: User[] = [
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

// ============================================================================
// STORE INFRASTRUCTURE
// ============================================================================

let _users: User[] = SEED_USERS;
let _initialized = false;
const { subscribe: subscribeUsers, notify: _notifyUsers } = createSubscribers();

function ensureInitialized(): void {
  if (typeof window === 'undefined' || _initialized) return;
  _users = loadCollection<User>('users', SEED_USERS);
  _initialized = true;
}

export function getUsersData(): User[] {
  ensureInitialized();
  return _users;
}

export { subscribeUsers };

// Backward-compatible export
export const MOCK_USERS: User[] = new Proxy(SEED_USERS as User[], {
  get(_target, prop, receiver) {
    ensureInitialized();
    return Reflect.get(_users, prop, receiver);
  },
});

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export function addUser(user: User): void {
  ensureInitialized();
  _users = [..._users, user];
  saveCollection('users', _users);
  _notifyUsers();
}

export function updateUser(id: string, updates: Partial<User>): void {
  ensureInitialized();
  _users = _users.map((u) =>
    u.id === id ? { ...u, ...updates } : u
  );
  saveCollection('users', _users);
  _notifyUsers();
}

export function removeUser(id: string): void {
  ensureInitialized();
  _users = _users.filter((u) => u.id !== id);
  saveCollection('users', _users);
  _notifyUsers();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user by email (for mock login)
 */
export function getUserByEmail(email: string): User | undefined {
  ensureInitialized();
  return _users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * Get user by ID
 */
export function getUserById(id: string): User | undefined {
  ensureInitialized();
  return _users.find((user) => user.id === id);
}
