/**
 * Mock data for Configuration (Configuración) module
 * Based on Document 008 specifications
 */

import type {
  CompanyInfo,
  Branch,
  RoleTemplate,
  ApprovalFlow,
  MasterCatalog,
  CatalogItem,
  NotificationConfig,
  AuditLogEntry,
  ActiveSession,
  SecurityPolicies,
  CommercialParams,
  DocumentNumbering,
  SystemInfo,
  Integration,
} from '@/lib/types/configuration';

// ============================================================================
// COMPANY INFO
// ============================================================================

export const MOCK_COMPANY_INFO: CompanyInfo = {
  legalName: 'Evolution Trading Corp.',
  tradeName: 'Evolution Zona Libre',
  taxId: '155678-1-789012',
  taxIdType: 'RUC',
  legalRepresentative: 'Javier Lange',
  address: 'Zona Libre de Colón, Edificio 2045, Local 3-A',
  city: 'Colón',
  country: 'Panamá',
  phone: '+507 441-8900',
  email: 'info@evolutionzl.com',
  website: 'www.evolutionzl.com',
  logo: 'https://res.cloudinary.com/db3espoei/image/upload/v1771993730/Logo_Evolution_ZL__1_-1_wgd1hg.svg',
  currency: 'USD',
  timezone: 'America/Panama',
  fiscalYearStart: 1,
  electronicInvoicing: false,
};

// ============================================================================
// BRANCHES
// ============================================================================

export const MOCK_BRANCHES: Branch[] = [
  { id: 'BR-001', name: 'Zona Libre de Colón', code: 'ZL', type: 'zona_libre', address: 'Zona Libre de Colón, Edificio 2045', city: 'Colón', country: 'Panamá', phone: '+507 441-8900', manager: 'Javier Lange', isActive: true, isHeadquarters: true },
  { id: 'BR-002', name: 'Tienda PTY', code: 'PTY-TIENDA', type: 'tienda', address: 'Vía España, Local 42', city: 'Ciudad de Panamá', country: 'Panamá', phone: '+507 263-4567', manager: 'Pedro Bodega', isActive: true, isHeadquarters: false },
  { id: 'BR-003', name: 'Bodega CFZ', code: 'CFZ', type: 'bodega', address: 'Colón Free Zone, Warehouse 15', city: 'Colón', country: 'Panamá', phone: '+507 441-2345', manager: 'Eduardo Almacén', isActive: true, isHeadquarters: false },
];

// ============================================================================
// ROLE TEMPLATES
// ============================================================================

export const MOCK_ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'RT-001', name: 'Administrador Supremo', description: 'Acceso total al sistema. No puede ser eliminado ni modificado.', baseRole: 'gerencia', isSystemRole: true, isActive: true, userCount: 1,
    permissions: [
      { module: 'all', moduleLabel: 'Todos los Módulos', icon: 'Shield', permissions: [{ key: 'ALL', label: 'Acceso Total', description: 'Acceso completo a todas las funciones del sistema', enabled: true }] },
    ],
  },
  {
    id: 'RT-002', name: 'Gerencia', description: 'Acceso a todos los módulos con capacidad de aprobación y supervisión.', baseRole: 'gerencia', isSystemRole: false, isActive: true, userCount: 1,
    permissions: [
      { module: 'ventas', moduleLabel: 'Ventas B2B', icon: 'Briefcase', permissions: [
        { key: 'canAccessVentas', label: 'Acceder a Ventas', description: 'Ver módulo de ventas B2B', enabled: true },
        { key: 'canApproveOrders', label: 'Aprobar Pedidos', description: 'Aprobar pedidos de venta', enabled: true },
        { key: 'canViewMargins', label: 'Ver Márgenes', description: 'Ver márgenes de ganancia', enabled: true },
      ]},
      { module: 'contabilidad', moduleLabel: 'Contabilidad', icon: 'Calculator', permissions: [
        { key: 'canAccessContabilidad', label: 'Acceder a Contabilidad', description: 'Ver módulo de contabilidad', enabled: true },
        { key: 'canApproveEntries', label: 'Aprobar Asientos', description: 'Aprobar asientos contables', enabled: true },
        { key: 'canCloseAnnualPeriod', label: 'Cierre Anual', description: 'Ejecutar cierre anual', enabled: true },
      ]},
    ],
  },
  {
    id: 'RT-003', name: 'Ventas', description: 'Gestión de cotizaciones, pedidos y clientes. Sin acceso a costos ni márgenes.', baseRole: 'vendedor', isSystemRole: false, isActive: true, userCount: 2,
    permissions: [
      { module: 'ventas', moduleLabel: 'Ventas B2B', icon: 'Briefcase', permissions: [
        { key: 'canAccessVentas', label: 'Acceder a Ventas', description: 'Ver módulo de ventas B2B', enabled: true },
        { key: 'canCreateQuotes', label: 'Crear Cotizaciones', description: 'Crear nuevas cotizaciones', enabled: true },
        { key: 'canViewMargins', label: 'Ver Márgenes', description: 'Ver márgenes de ganancia', enabled: false },
        { key: 'canViewCosts', label: 'Ver Costos', description: 'Ver costos de productos', enabled: false },
      ]},
    ],
  },
  {
    id: 'RT-004', name: 'Compras', description: 'Gestión de órdenes de compra, proveedores y precios.', baseRole: 'compras', isSystemRole: false, isActive: true, userCount: 1,
    permissions: [
      { module: 'compras', moduleLabel: 'Compras', icon: 'ShoppingCart', permissions: [
        { key: 'canAccessCompras', label: 'Acceder a Compras', description: 'Ver módulo de compras', enabled: true },
        { key: 'canCreatePurchaseOrders', label: 'Crear Órdenes', description: 'Crear órdenes de compra', enabled: true },
        { key: 'canViewCosts', label: 'Ver Costos', description: 'Ver costos de productos', enabled: true },
      ]},
    ],
  },
  {
    id: 'RT-005', name: 'Finanzas', description: 'Contabilidad, CxC, facturación y reportes financieros.', baseRole: 'contabilidad', isSystemRole: false, isActive: true, userCount: 1,
    permissions: [
      { module: 'contabilidad', moduleLabel: 'Contabilidad', icon: 'Calculator', permissions: [
        { key: 'canAccessContabilidad', label: 'Acceder a Contabilidad', description: 'Ver módulo de contabilidad', enabled: true },
        { key: 'canCreateManualEntries', label: 'Asientos Manuales', description: 'Crear asientos contables manuales', enabled: true },
        { key: 'canReconcileBank', label: 'Conciliación', description: 'Realizar conciliaciones bancarias', enabled: true },
        { key: 'canCloseMonthlyPeriod', label: 'Cierre Mensual', description: 'Ejecutar cierre mensual', enabled: true },
      ]},
    ],
  },
  {
    id: 'RT-006', name: 'Almacén', description: 'Inventario, transferencias, conteos físicos y empaque.', baseRole: 'bodega', isSystemRole: false, isActive: true, userCount: 2,
    permissions: [
      { module: 'inventario', moduleLabel: 'Inventario', icon: 'Warehouse', permissions: [
        { key: 'canAccessInventory', label: 'Acceder a Inventario', description: 'Ver módulo de inventario', enabled: true },
        { key: 'canCreateAdjustments', label: 'Crear Ajustes', description: 'Crear ajustes de inventario', enabled: true },
        { key: 'canCreateTransfers', label: 'Crear Transferencias', description: 'Crear transferencias entre bodegas', enabled: true },
        { key: 'canPackOrders', label: 'Empacar Pedidos', description: 'Gestionar empaque de pedidos', enabled: true },
      ]},
    ],
  },
  {
    id: 'RT-007', name: 'Solo Lectura', description: 'Acceso de solo lectura a todos los módulos visibles.', baseRole: 'vendedor', isSystemRole: false, isActive: true, userCount: 0,
    permissions: [
      { module: 'all', moduleLabel: 'Todos los Módulos', icon: 'Eye', permissions: [{ key: 'READ_ONLY', label: 'Solo Lectura', description: 'Puede ver pero no crear ni editar', enabled: true }] },
    ],
  },
];

// ============================================================================
// APPROVAL FLOWS
// ============================================================================

export const MOCK_APPROVAL_FLOWS: ApprovalFlow[] = [
  {
    id: 'AF-001', name: 'Ventas con Margen Bajo', description: 'Requiere aprobación cuando el margen de una venta es menor al 10%',
    triggerCondition: 'Margen de venta < 10%', isActive: true,
    steps: [
      { id: 'AS-001', order: 1, approverRole: 'gerencia', approverLabel: 'Gerencia', isRequired: true, canSkip: false, timeoutHours: 24 },
    ],
    escalationTimeout: 48, escalateTo: 'gerencia',
  },
  {
    id: 'AF-002', name: 'Devoluciones y Notas de Crédito', description: 'Aprobación de devoluciones y emisión de notas de crédito',
    triggerCondition: 'Solicitud de devolución creada', isActive: true,
    steps: [
      { id: 'AS-002', order: 1, approverRole: 'contabilidad', approverLabel: 'Contabilidad', isRequired: true, canSkip: false, timeoutHours: 12 },
      { id: 'AS-003', order: 2, approverRole: 'gerencia', approverLabel: 'Gerencia', isRequired: true, canSkip: false, timeoutHours: 24 },
    ],
    escalationTimeout: 72,
  },
  {
    id: 'AF-003', name: 'Ajustes de Inventario', description: 'Aprobación de ajustes de inventario (merma, rotura, etc.)',
    triggerCondition: 'Ajuste de inventario creado', isActive: true,
    steps: [
      { id: 'AS-004', order: 1, approverRole: 'compras', approverLabel: 'Compras', isRequired: true, canSkip: false, timeoutHours: 24 },
    ],
  },
  {
    id: 'AF-004', name: 'Órdenes de Compra Grandes', description: 'OC que excedan $50,000 requieren aprobación de gerencia',
    triggerCondition: 'Monto de OC > $50,000', isActive: true,
    steps: [
      { id: 'AS-005', order: 1, approverRole: 'gerencia', approverLabel: 'Gerencia', isRequired: true, canSkip: false, timeoutHours: 48 },
    ],
  },
  {
    id: 'AF-005', name: 'Anulaciones de Documentos', description: 'Toda anulación de factura, cobro o NC requiere aprobación',
    triggerCondition: 'Solicitud de anulación creada', isActive: true,
    steps: [
      { id: 'AS-006', order: 1, approverRole: 'gerencia', approverLabel: 'Gerencia', isRequired: true, canSkip: false, timeoutHours: 24 },
    ],
  },
  {
    id: 'AF-006', name: 'Modificaciones Post-Aprobación', description: 'Cambios a pedidos ya aprobados (amendments)',
    triggerCondition: 'Enmienda a pedido aprobado', isActive: true,
    steps: [
      { id: 'AS-007', order: 1, approverRole: 'gerencia', approverLabel: 'Gerencia', isRequired: true, canSkip: false, timeoutHours: 12 },
    ],
  },
];

// ============================================================================
// MASTER CATALOGS
// ============================================================================

export const MOCK_MASTER_CATALOGS: MasterCatalog[] = [
  { id: 'CAT-001', name: 'Países y Ciudades', description: 'Catálogo de países y ciudades (ISO 3166)', itemCount: 195, lastUpdated: '2026-01-15T10:00:00Z', icon: 'Globe' },
  { id: 'CAT-002', name: 'Áreas / Departamentos', description: 'Áreas organizacionales de la empresa', itemCount: 6, lastUpdated: '2026-02-01T10:00:00Z', icon: 'Building2' },
  { id: 'CAT-003', name: 'Marcas', description: 'Marcas de productos disponibles', itemCount: 45, lastUpdated: '2026-02-20T10:00:00Z', icon: 'Tag' },
  { id: 'CAT-004', name: 'Categorías de Producto', description: 'Categorías y subcategorías de productos', itemCount: 9, lastUpdated: '2026-01-10T10:00:00Z', icon: 'Package' },
  { id: 'CAT-005', name: 'Proveedores', description: 'Proveedores registrados', itemCount: 12, lastUpdated: '2026-02-15T10:00:00Z', icon: 'Truck' },
  { id: 'CAT-006', name: 'Códigos Arancelarios', description: 'Códigos del sistema armonizado (HS)', itemCount: 28, lastUpdated: '2025-12-01T10:00:00Z', icon: 'FileText' },
  { id: 'CAT-007', name: 'Bancos', description: 'Entidades bancarias registradas', itemCount: 11, lastUpdated: '2026-01-05T10:00:00Z', icon: 'Landmark' },
  { id: 'CAT-008', name: 'Tipos de Documento', description: 'Tipos de documentos del sistema', itemCount: 8, lastUpdated: '2025-11-20T10:00:00Z', icon: 'FileCheck' },
  { id: 'CAT-009', name: 'Métodos de Pago', description: 'Formas de pago aceptadas', itemCount: 5, lastUpdated: '2026-01-08T10:00:00Z', icon: 'CreditCard' },
  { id: 'CAT-010', name: 'Motivos de Anulación', description: 'Razones válidas para anular documentos', itemCount: 7, lastUpdated: '2026-02-10T10:00:00Z', icon: 'XCircle' },
];

// Sample catalog items for "Métodos de Pago"
export const MOCK_CATALOG_ITEMS_PAYMENT_METHODS: CatalogItem[] = [
  { id: 'CI-001', code: 'TRF', name: 'Transferencia Bancaria', description: 'Transferencia electrónica entre cuentas bancarias', isActive: true, sortOrder: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-002', code: 'CHQ', name: 'Cheque', description: 'Pago mediante cheque bancario', isActive: true, sortOrder: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-003', code: 'EFE', name: 'Efectivo', description: 'Pago en efectivo', isActive: true, sortOrder: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-004', code: 'TAR', name: 'Tarjeta de Crédito/Débito', description: 'Pago con tarjeta bancaria', isActive: true, sortOrder: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-005', code: 'DEP', name: 'Depósito Bancario', description: 'Depósito directo en cuenta bancaria', isActive: true, sortOrder: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
];

// Sample catalog items for "Bancos"
export const MOCK_CATALOG_ITEMS_BANKS: CatalogItem[] = [
  { id: 'CI-B01', code: 'BAN', name: 'Banesco', isActive: true, sortOrder: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-B02', code: 'BIS', name: 'Banistmo', isActive: true, sortOrder: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-B03', code: 'CRE', name: 'Credicorp Bank', isActive: true, sortOrder: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-B04', code: 'MUL', name: 'Multibank', isActive: true, sortOrder: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-B05', code: 'ALL', name: 'Allbank', isActive: true, sortOrder: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-B06', code: 'BG', name: 'Banco General', isActive: true, sortOrder: 6, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-B07', code: 'BAC', name: 'BAC Credomatic', isActive: true, sortOrder: 7, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-B08', code: 'STG', name: 'St. George Bank', isActive: true, sortOrder: 8, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-B09', code: 'MET', name: 'Metro Bank', isActive: true, sortOrder: 9, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-B10', code: 'MER', name: 'Mercantil Banco', isActive: false, sortOrder: 10, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'CI-B11', code: 'BOC', name: 'Bank of China', isActive: false, sortOrder: 11, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
];

// ============================================================================
// NOTIFICATION CONFIGS
// ============================================================================

export const MOCK_NOTIFICATION_CONFIGS: NotificationConfig[] = [
  { id: 'NC-001', event: 'order_requires_approval', eventLabel: 'Pedido Requiere Aprobación', description: 'Cuando un pedido de venta requiere aprobación por margen bajo', module: 'ventas', channels: [{ type: 'in_app', enabled: true }, { type: 'email', enabled: true }, { type: 'sms', enabled: false }], isActive: true, recipients: [{ type: 'role', value: 'gerencia', label: 'Gerencia' }] },
  { id: 'NC-002', event: 'payment_received', eventLabel: 'Cobro Registrado', description: 'Cuando se registra un cobro de un cliente', module: 'cxc', channels: [{ type: 'in_app', enabled: true }, { type: 'email', enabled: false }, { type: 'sms', enabled: false }], isActive: true, recipients: [{ type: 'role', value: 'gerencia', label: 'Gerencia' }, { type: 'role', value: 'vendedor', label: 'Vendedor Asignado' }] },
  { id: 'NC-003', event: 'invoice_overdue', eventLabel: 'Factura Vencida', description: 'Cuando una factura supera su fecha de vencimiento', module: 'cxc', channels: [{ type: 'in_app', enabled: true }, { type: 'email', enabled: true }, { type: 'sms', enabled: false }], isActive: true, recipients: [{ type: 'role', value: 'contabilidad', label: 'Contabilidad' }, { type: 'role', value: 'gerencia', label: 'Gerencia' }] },
  { id: 'NC-004', event: 'inventory_low_stock', eventLabel: 'Stock Bajo', description: 'Cuando un producto alcanza el nivel mínimo de stock', module: 'inventario', channels: [{ type: 'in_app', enabled: true }, { type: 'email', enabled: true }, { type: 'sms', enabled: false }], isActive: true, recipients: [{ type: 'role', value: 'compras', label: 'Compras' }, { type: 'role', value: 'bodega', label: 'Bodega' }] },
  { id: 'NC-005', event: 'annulment_requested', eventLabel: 'Anulación Solicitada', description: 'Cuando se solicita la anulación de un documento', module: 'cxc', channels: [{ type: 'in_app', enabled: true }, { type: 'email', enabled: true }, { type: 'sms', enabled: false }], isActive: true, recipients: [{ type: 'role', value: 'gerencia', label: 'Gerencia' }] },
  { id: 'NC-006', event: 'purchase_order_received', eventLabel: 'Mercancía Recibida', description: 'Cuando se completa la recepción de una orden de compra', module: 'compras', channels: [{ type: 'in_app', enabled: true }, { type: 'email', enabled: false }, { type: 'sms', enabled: false }], isActive: true, recipients: [{ type: 'role', value: 'compras', label: 'Compras' }, { type: 'role', value: 'contabilidad', label: 'Contabilidad' }] },
  { id: 'NC-007', event: 'monthly_close_pending', eventLabel: 'Cierre Mensual Pendiente', description: 'Recordatorio de cierre mensual pendiente', module: 'contabilidad', channels: [{ type: 'in_app', enabled: true }, { type: 'email', enabled: true }, { type: 'sms', enabled: false }], isActive: true, recipients: [{ type: 'role', value: 'contabilidad', label: 'Contabilidad' }] },
  { id: 'NC-008', event: 'credit_limit_exceeded', eventLabel: 'Límite de Crédito Excedido', description: 'Cuando un cliente excede su límite de crédito', module: 'clientes', channels: [{ type: 'in_app', enabled: true }, { type: 'email', enabled: true }, { type: 'sms', enabled: true }], isActive: true, recipients: [{ type: 'role', value: 'gerencia', label: 'Gerencia' }, { type: 'role', value: 'contabilidad', label: 'Contabilidad' }] },
];

// ============================================================================
// AUDIT LOG
// ============================================================================

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'AL-001', timestamp: '2026-02-26T09:15:00Z', userId: 'USR-001', userName: 'Javier Lange', userRole: 'gerencia', action: 'login', module: 'auth', moduleLabel: 'Autenticación', entityType: 'session', entityId: 'SES-001', description: 'Inicio de sesión exitoso', ipAddress: '190.218.45.123' },
  { id: 'AL-002', timestamp: '2026-02-26T09:20:00Z', userId: 'USR-001', userName: 'Javier Lange', userRole: 'gerencia', action: 'aprobar', module: 'ventas', moduleLabel: 'Ventas B2B', entityType: 'sales_order', entityId: 'PED-00089', description: 'Aprobó pedido PED-00089 de GIACOMO PAOLO LECCESE TURCONI', ipAddress: '190.218.45.123' },
  { id: 'AL-003', timestamp: '2026-02-26T08:45:00Z', userId: 'USR-006', userName: 'Jackie Chen', userRole: 'contabilidad', action: 'crear', module: 'contabilidad', moduleLabel: 'Contabilidad', entityType: 'journal_entry', entityId: 'JE-00014', description: 'Creó asiento contable JE-00014 (Comisiones de ventas)', ipAddress: '190.218.45.125' },
  { id: 'AL-004', timestamp: '2026-02-25T16:30:00Z', userId: 'USR-003', userName: 'Margarita Morelos', userRole: 'vendedor', action: 'crear', module: 'ventas', moduleLabel: 'Ventas B2B', entityType: 'sales_order', entityId: 'COT-00156', description: 'Creó cotización COT-00156 para BRAND DISTRIBUIDOR CURACAO', ipAddress: '190.218.45.130' },
  { id: 'AL-005', timestamp: '2026-02-25T15:00:00Z', userId: 'USR-006', userName: 'Jackie Chen', userRole: 'contabilidad', action: 'crear', module: 'cxc', moduleLabel: 'Cuentas por Cobrar', entityType: 'payment', entityId: 'COB-00007', description: 'Registró cobro COB-00007 de MARIA DEL MAR PEREZ SV por $12,000', ipAddress: '190.218.45.125' },
  { id: 'AL-006', timestamp: '2026-02-25T14:00:00Z', userId: 'USR-004', userName: 'Eduardo Almacén', userRole: 'bodega', action: 'crear', module: 'inventario', moduleLabel: 'Inventario', entityType: 'transfer', entityId: 'TR-00032', description: 'Creó transferencia TR-00032 de ZL a PTY-TIENDA', ipAddress: '190.218.45.128' },
  { id: 'AL-007', timestamp: '2026-02-25T11:00:00Z', userId: 'USR-001', userName: 'Javier Lange', userRole: 'gerencia', action: 'aprobar', module: 'cxc', moduleLabel: 'Cuentas por Cobrar', entityType: 'annulment', entityId: 'ANU-00002', description: 'Aprobó anulación ANU-00002 de cobro COB-00010', ipAddress: '190.218.45.123' },
  { id: 'AL-008', timestamp: '2026-02-24T10:00:00Z', userId: 'USR-002', userName: 'Ana Compradora', userRole: 'compras', action: 'crear', module: 'compras', moduleLabel: 'Compras', entityType: 'purchase_order', entityId: 'OC-03572', description: 'Creó orden de compra OC-03572 para Diageo', ipAddress: '190.218.45.126' },
  { id: 'AL-009', timestamp: '2026-02-24T09:30:00Z', userId: 'USR-006', userName: 'Jackie Chen', userRole: 'contabilidad', action: 'editar', module: 'clientes', moduleLabel: 'Clientes', entityType: 'client', entityId: 'CLI-00999', description: 'Actualizó estado de CLI-00999 a Bloqueado', ipAddress: '190.218.45.125', changes: [{ field: 'status', fieldLabel: 'Estado', oldValue: 'active', newValue: 'blocked' }] },
  { id: 'AL-010', timestamp: '2026-02-23T16:00:00Z', userId: 'USR-005', userName: 'Fernando Tráfico', userRole: 'trafico', action: 'editar', module: 'trafico', moduleLabel: 'Tráfico', entityType: 'shipment', entityId: 'SHP-00045', description: 'Actualizó tracking de embarque SHP-00045', ipAddress: '190.218.45.129' },
  { id: 'AL-011', timestamp: '2026-02-23T14:00:00Z', userId: 'USR-001', userName: 'Javier Lange', userRole: 'gerencia', action: 'exportar', module: 'reportes', moduleLabel: 'Reportes', entityType: 'report', entityId: 'RPT-SALES-FEB', description: 'Exportó reporte de ventas de febrero 2026', ipAddress: '190.218.45.123' },
  { id: 'AL-012', timestamp: '2026-02-22T10:00:00Z', userId: 'USR-001', userName: 'Javier Lange', userRole: 'gerencia', action: 'rechazar', module: 'cxc', moduleLabel: 'Cuentas por Cobrar', entityType: 'annulment', entityId: 'ANU-00003', description: 'Rechazó anulación ANU-00003 de NC-00003', ipAddress: '190.218.45.123' },
];

// ============================================================================
// ACTIVE SESSIONS
// ============================================================================

export const MOCK_ACTIVE_SESSIONS: ActiveSession[] = [
  { id: 'SES-001', userId: 'USR-001', userName: 'Javier Lange', userRole: 'gerencia', loginAt: '2026-02-26T09:15:00Z', lastActivity: '2026-02-26T10:30:00Z', ipAddress: '190.218.45.123', browser: 'Chrome 122 / Windows 11', isCurrent: true },
  { id: 'SES-002', userId: 'USR-006', userName: 'Jackie Chen', userRole: 'contabilidad', loginAt: '2026-02-26T08:30:00Z', lastActivity: '2026-02-26T10:25:00Z', ipAddress: '190.218.45.125', browser: 'Firefox 123 / macOS', isCurrent: false },
  { id: 'SES-003', userId: 'USR-003', userName: 'Margarita Morelos', userRole: 'vendedor', loginAt: '2026-02-26T09:00:00Z', lastActivity: '2026-02-26T10:20:00Z', ipAddress: '190.218.45.130', browser: 'Chrome 122 / Windows 10', isCurrent: false },
  { id: 'SES-004', userId: 'USR-004', userName: 'Eduardo Almacén', userRole: 'bodega', loginAt: '2026-02-26T07:00:00Z', lastActivity: '2026-02-26T10:15:00Z', ipAddress: '190.218.45.128', browser: 'Safari 17 / iPad', isCurrent: false },
];

// ============================================================================
// SECURITY POLICIES
// ============================================================================

export const MOCK_SECURITY_POLICIES: SecurityPolicies = {
  minPasswordLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  sessionTimeoutMinutes: 480,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 30,
  twoFactorEnabled: false,
  passwordExpirationDays: 90,
};

// ============================================================================
// COMMERCIAL PARAMETERS
// ============================================================================

export const MOCK_COMMERCIAL_PARAMS: CommercialParams = {
  priceLevels: [
    { level: 'A', name: 'Mayorista', description: 'Grandes distribuidores con volumen alto', isActive: true },
    { level: 'B', name: 'Distribuidor', description: 'Distribuidores medianos', isActive: true },
    { level: 'C', name: 'Detallista', description: 'Comercios minoristas', isActive: true },
    { level: 'D', name: 'Especial', description: 'Precios especiales negociados', isActive: true },
    { level: 'E', name: 'Público', description: 'Precio al público general', isActive: true },
  ],
  defaultPriceLevel: 'C',
  commissionThreshold: 10,
  commissionRates: [
    { userId: 'USR-001', userName: 'Javier Lange', rate: 3, isActive: true },
    { userId: 'USR-003', userName: 'Margarita Morelos', rate: 2.5, isActive: true },
    { userId: 'USR-007', userName: 'Carlos Vendedor', rate: 2, isActive: true },
  ],
  taxRate: 7,
  taxExemptZones: ['Zona Libre de Colón'],
  paymentTermsOptions: [
    { id: 'PT-001', code: 'contado', label: 'Contado', days: 0, isActive: true },
    { id: 'PT-002', code: 'credito_15', label: 'Crédito 15 días', days: 15, isActive: true },
    { id: 'PT-003', code: 'credito_30', label: 'Crédito 30 días', days: 30, isActive: true },
    { id: 'PT-004', code: 'credito_45', label: 'Crédito 45 días', days: 45, isActive: true },
    { id: 'PT-005', code: 'credito_60', label: 'Crédito 60 días', days: 60, isActive: true },
  ],
};

// ============================================================================
// DOCUMENT NUMBERING
// ============================================================================

export const MOCK_DOCUMENT_NUMBERING: DocumentNumbering[] = [
  { id: 'DN-001', documentType: 'cotizacion', documentLabel: 'Cotización', prefix: 'COT-', currentNumber: 156, paddingLength: 5, example: 'COT-00156' },
  { id: 'DN-002', documentType: 'pedido', documentLabel: 'Pedido', prefix: 'PED-', currentNumber: 89, paddingLength: 5, example: 'PED-00089' },
  { id: 'DN-003', documentType: 'factura', documentLabel: 'Factura', prefix: 'FAC-', currentNumber: 42, paddingLength: 5, example: 'FAC-00042' },
  { id: 'DN-004', documentType: 'orden_compra', documentLabel: 'Orden de Compra', prefix: 'OC-', currentNumber: 3572, paddingLength: 5, example: 'OC-03572' },
  { id: 'DN-005', documentType: 'ajuste', documentLabel: 'Ajuste de Inventario', prefix: 'AJ-', currentNumber: 15, paddingLength: 5, example: 'AJ-00015' },
  { id: 'DN-006', documentType: 'transferencia', documentLabel: 'Transferencia', prefix: 'TR-', currentNumber: 32, paddingLength: 5, example: 'TR-00032' },
  { id: 'DN-007', documentType: 'conteo', documentLabel: 'Conteo Físico', prefix: 'CF-', currentNumber: 8, paddingLength: 5, example: 'CF-00008' },
  { id: 'DN-008', documentType: 'cobro', documentLabel: 'Cobro', prefix: 'COB-', currentNumber: 7, paddingLength: 5, example: 'COB-00007' },
  { id: 'DN-009', documentType: 'nota_credito', documentLabel: 'Nota de Crédito', prefix: 'NC-', currentNumber: 3, paddingLength: 5, example: 'NC-00003' },
];

// ============================================================================
// SYSTEM INFO
// ============================================================================

export const MOCK_SYSTEM_INFO: SystemInfo = {
  version: '0.1.0',
  buildNumber: 'build-2026.02.26-001',
  environment: 'development',
  lastDeploy: '2026-02-26T08:00:00Z',
  nextjsVersion: '16.1.6',
  nodeVersion: '22.x',
  database: 'Mock Data (Frontend Only)',
  uptime: '15 días, 3 horas',
};

// ============================================================================
// INTEGRATIONS
// ============================================================================

export const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'INT-001', name: 'Facturación Electrónica (FE)', description: 'Integración con DGI para emisión de facturas electrónicas', status: 'pendiente', icon: 'FileCheck', config: { provider: 'DGI Panamá', apiUrl: 'Pendiente de configurar' } },
  { id: 'INT-002', name: 'DMC (Despacho de Mercancía)', description: 'Sistema de despacho y control aduanero de Zona Libre', status: 'pendiente', icon: 'Ship', config: { provider: 'Zona Libre de Colón', apiUrl: 'Pendiente' } },
  { id: 'INT-003', name: 'Banca en Línea', description: 'Importación de extractos bancarios', status: 'inactivo', icon: 'Landmark', config: { banks: 'Banco General, Banistmo' } },
  { id: 'INT-004', name: 'Correo Electrónico', description: 'Envío de estados de cuenta y notificaciones por email', status: 'pendiente', icon: 'Mail' },
  { id: 'INT-005', name: 'OpenAI (Chat Evo)', description: 'Asistente virtual con inteligencia artificial', status: 'activo', icon: 'Bot', lastSync: '2026-02-26T10:00:00Z', config: { model: 'gpt-4o-mini', maxTokens: '500' } },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAuditLog(filters?: { userId?: string; module?: string; action?: string; dateFrom?: string; dateTo?: string }): AuditLogEntry[] {
  let entries = [...MOCK_AUDIT_LOG];

  if (!filters) return entries;

  if (filters.userId) entries = entries.filter(e => e.userId === filters.userId);
  if (filters.module) entries = entries.filter(e => e.module === filters.module);
  if (filters.action) entries = entries.filter(e => e.action === filters.action);
  if (filters.dateFrom) entries = entries.filter(e => e.timestamp >= filters.dateFrom!);
  if (filters.dateTo) entries = entries.filter(e => e.timestamp <= filters.dateTo!);

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getCatalogItems(catalogId: string): CatalogItem[] {
  switch (catalogId) {
    case 'CAT-009': return MOCK_CATALOG_ITEMS_PAYMENT_METHODS;
    case 'CAT-007': return MOCK_CATALOG_ITEMS_BANKS;
    default: return [];
  }
}
