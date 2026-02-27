export type UserRole =
  | 'gerencia'
  | 'contabilidad'
  | 'compras'
  | 'vendedor'
  | 'trafico'
  | 'bodega';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Permission keys for role-based access control
export type PermissionKey =
  | 'canViewCosts'
  | 'canViewSuppliers'
  | 'canViewMargins'
  | 'canViewPriceLevels'
  | 'canEditProducts'
  | 'canEditPrices'
  | 'canCreatePurchaseOrders'
  | 'canApproveSales'
  | 'canViewReports'
  | 'canManageUsers'
  | 'canAccessPOS'
  | 'canAccessTrafico'
  | 'canAccessInventory'
  | 'canAccessCompras'
  // Inventory module permissions
  | 'canCreateAdjustments'
  | 'canApproveAdjustments'
  | 'canCreateTransfers'
  | 'canConfirmTransfers'
  | 'canCreateCountSessions'
  // Sales (Ventas B2B) module permissions
  | 'canAccessVentas'
  | 'canCreateQuotes'
  | 'canConvertToOrder'
  | 'canApproveOrders'
  | 'canPackOrders'
  | 'canCreateInvoices'
  | 'canProcessReturns'
  | 'canApplyDiscounts'
  | 'canOverridePriceLevel'
  | 'canManageClients'
  // Clientes & Cuentas por Cobrar
  | 'canAccessCxC'
  | 'canRegisterPayments'
  | 'canApproveAnnulments'
  | 'canViewAging'
  | 'canSendStatements'
  // Contabilidad
  | 'canAccessContabilidad'
  | 'canCreateManualEntries'
  | 'canApproveEntries'
  | 'canViewFinancialStatements'
  | 'canReconcileBank'
  | 'canCloseMonthlyPeriod'
  | 'canCloseAnnualPeriod'
  | 'canAccessTreasury'
  | 'canViewBankBalances'
  // Configuración
  | 'canAccessConfiguracion'
  | 'canManageRoles'
  | 'canManageCatalogs'
  | 'canViewAuditLog'
  // Historial
  | 'canViewHistorial';
