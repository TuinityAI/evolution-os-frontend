import type { PermissionKey, UserRole } from '@/lib/types/user';

/**
 * Permission matrix by role.
 * Each permission key lists the roles that have access to it.
 */
export const PERMISSIONS: Record<PermissionKey, UserRole[]> = {
  canViewCosts: ['gerencia', 'contabilidad', 'compras'],
  canViewSuppliers: ['gerencia', 'contabilidad', 'compras'],
  canViewMargins: ['gerencia', 'contabilidad', 'compras'],
  canViewPriceLevels: ['gerencia', 'contabilidad', 'compras'],
  canEditProducts: ['gerencia', 'compras'],
  canEditPrices: ['gerencia', 'compras'],
  canCreatePurchaseOrders: ['gerencia', 'compras'],
  canApproveSales: ['gerencia'],
  canViewReports: ['gerencia', 'contabilidad'],
  canManageUsers: ['gerencia'],
  canAccessPOS: ['gerencia', 'vendedor', 'bodega'],
  canAccessTrafico: ['gerencia', 'contabilidad', 'trafico'],
  canAccessInventory: ['gerencia', 'compras', 'bodega'],
  canAccessCompras: ['gerencia', 'contabilidad', 'compras'],
  // Inventory module permissions
  canCreateAdjustments: ['gerencia', 'compras', 'bodega', 'trafico'],
  canApproveAdjustments: ['gerencia', 'compras'],
  canCreateTransfers: ['gerencia', 'compras', 'bodega'],
  canConfirmTransfers: ['gerencia', 'bodega'],
  canCreateCountSessions: ['gerencia', 'compras', 'bodega'],
  // Sales (Ventas B2B) module permissions
  canAccessVentas: ['gerencia', 'contabilidad', 'vendedor'],
  canCreateQuotes: ['gerencia', 'vendedor'],
  canConvertToOrder: ['gerencia', 'vendedor'],
  canApproveOrders: ['gerencia'],
  canPackOrders: ['gerencia', 'bodega'],
  canCreateInvoices: ['gerencia', 'contabilidad'],
  canProcessReturns: ['gerencia', 'contabilidad', 'bodega'],
  canApplyDiscounts: ['gerencia', 'compras'],
  canOverridePriceLevel: ['gerencia'],
  canManageClients: ['gerencia', 'contabilidad'],
};

/**
 * Role display names in Spanish
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  gerencia: 'Gerencia',
  contabilidad: 'Contabilidad',
  compras: 'Compras',
  vendedor: 'Vendedor B2B',
  trafico: 'Tráfico',
  bodega: 'Bodega',
};

/**
 * Role colors for badges and UI
 */
export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  gerencia: { bg: 'bg-brand-100', text: 'text-brand-800' },
  contabilidad: { bg: 'bg-info-bg', text: 'text-info' },
  compras: { bg: 'bg-success-bg', text: 'text-success' },
  vendedor: { bg: 'bg-warning-bg', text: 'text-warning' },
  trafico: { bg: 'bg-brand-50', text: 'text-brand-600' },
  bodega: { bg: 'bg-surface-tertiary', text: 'text-text-secondary' },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return PERMISSIONS[permission].includes(role);
}
