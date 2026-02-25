'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
  Tabs,
  Tab,
} from '@heroui/react';
import {
  Search,
  Plus,
  Download,
  MoreVertical,
  FileText,
  Briefcase,
  DollarSign,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  X,
  Package,
  ClipboardList,
  Calendar,
  Building2,
  CheckCircle2,
  PackageCheck,
  FileCheck,
  Send,
  ThumbsUp,
  ChevronRight,
  User,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  MOCK_SALES_ORDERS,
  getSalesStats,
  formatCurrency,
  formatDate,
  getNextOrderNumber,
  getProductPrice,
  getProductCost,
  calculateCommissionEligible,
} from '@/lib/mock-data/sales-orders';
import { MOCK_CLIENTS, getCreditStatus } from '@/lib/mock-data/clients';
import { MOCK_PRODUCTS } from '@/lib/mock-data/products';
import type { SalesOrder, SalesOrderStatus, SalesOrderLine, DocumentType } from '@/lib/types/sales-order';
import type { Client, PriceLevel } from '@/lib/types/client';
import { STATUS_CONFIG, DOCUMENT_TYPE_LABELS } from '@/lib/types/sales-order';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/contexts/auth-context';

type StatusFilter = SalesOrderStatus | 'all';
type DocTypeFilter = DocumentType | 'all';

// Pipeline stages for visual representation
const PIPELINE_STAGES: { status: SalesOrderStatus; label: string }[] = [
  { status: 'borrador', label: 'Borrador' },
  { status: 'cotizado', label: 'Cotizado' },
  { status: 'pedido', label: 'Pedido' },
  { status: 'aprobado', label: 'Aprobado' },
  { status: 'empacado', label: 'Empacado' },
  { status: 'facturado', label: 'Facturado' },
];

// Initial form state for new quote
const initialQuoteForm = {
  customerId: '',
  notes: '',
  validUntil: '',
  requestedDeliveryDate: '',
};

export default function VentasPage() {
  const router = useRouter();
  const { checkPermission, user } = useAuth();
  const canViewMargins = checkPermission('canViewMargins');
  const canCreateQuotes = checkPermission('canCreateQuotes');
  const canApproveOrders = checkPermission('canApproveOrders');
  const isVendedor = user?.role === 'vendedor';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<DocTypeFilter>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [quoteFormData, setQuoteFormData] = useState(initialQuoteForm);
  const [quoteLines, setQuoteLines] = useState<Partial<SalesOrderLine>[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // New line state
  const [newLineProduct, setNewLineProduct] = useState('');
  const [newLineQty, setNewLineQty] = useState('');
  const [newLinePrice, setNewLinePrice] = useState('');
  const [newLineDiscount, setNewLineDiscount] = useState('0');

  // Modal states
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();

  // Stats
  const stats = getSalesStats();

  // Filter orders
  const filteredOrders = useMemo(() => {
    return MOCK_SALES_ORDERS.filter((order) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower) ||
        order.customerId.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesDocType = docTypeFilter === 'all' || order.documentType === docTypeFilter;
      const matchesCustomer = !selectedCustomer || order.customerId === selectedCustomer;

      return matchesSearch && matchesStatus && matchesDocType && matchesCustomer;
    });
  }, [searchQuery, statusFilter, docTypeFilter, selectedCustomer]);

  // Handlers
  const handleFormChange = (field: string, value: string) => {
    setQuoteFormData((prev) => ({ ...prev, [field]: value }));

    // When customer changes, update selected client
    if (field === 'customerId') {
      const client = MOCK_CLIENTS.find((c) => c.id === value);
      setSelectedClient(client || null);
      setQuoteLines([]); // Reset lines when customer changes
    }
  };

  const handleProductSelect = (productId: string) => {
    setNewLineProduct(productId);
    if (selectedClient && productId) {
      const price = getProductPrice(productId, selectedClient.priceLevel);
      setNewLinePrice(price.toString());
    }
  };

  const handleAddLine = () => {
    if (!newLineProduct || !newLineQty || !selectedClient) {
      toast.error('Datos incompletos', {
        description: 'Selecciona un producto y completa la cantidad.',
      });
      return;
    }

    const product = MOCK_PRODUCTS.find((p) => p.id === newLineProduct);
    if (!product) return;

    const qty = parseFloat(newLineQty);
    const price = parseFloat(newLinePrice) || getProductPrice(product.id, selectedClient.priceLevel);
    const discount = parseFloat(newLineDiscount) || 0;
    const subtotal = qty * price * (1 - discount / 100);
    const cost = getProductCost(product.id);
    const marginPercent = price > 0 ? ((price - cost) / price) * 100 : 0;

    const newLine: Partial<SalesOrderLine> = {
      id: `LINE-NEW-${Date.now()}`,
      productId: product.id,
      productReference: product.reference,
      productDescription: product.description,
      productGroup: product.group,
      productBrand: product.brand,
      quantity: qty,
      priceLevel: selectedClient.priceLevel,
      unitPrice: price,
      originalPrice: getProductPrice(product.id, selectedClient.priceLevel),
      discount,
      subtotal,
      unitCost: cost,
      totalCost: cost * qty,
      marginPercent,
      commissionEligible: calculateCommissionEligible(price, cost),
    };

    setQuoteLines((prev) => [...prev, newLine]);
    setNewLineProduct('');
    setNewLineQty('');
    setNewLinePrice('');
    setNewLineDiscount('0');
    toast.success('Producto agregado');
  };

  const handleRemoveLine = (lineId: string) => {
    setQuoteLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  const handleCreateQuote = () => {
    if (!quoteFormData.customerId) {
      toast.error('Cliente requerido', {
        description: 'Selecciona un cliente para la cotización.',
      });
      return;
    }

    if (quoteLines.length === 0) {
      toast.error('Sin productos', {
        description: 'Agrega al menos un producto a la cotización.',
      });
      return;
    }

    const orderNumber = getNextOrderNumber('cotizacion');
    toast.success('Cotización creada', {
      description: `La cotización ${orderNumber} ha sido creada exitosamente.`,
    });

    setQuoteFormData(initialQuoteForm);
    setQuoteLines([]);
    setSelectedClient(null);
    onCreateClose();
  };

  const handleViewOrder = (order: SalesOrder) => {
    router.push(`/ventas/${order.id}`);
  };

  const handleDeleteOrder = (order: SalesOrder) => {
    setSelectedOrder(order);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    if (selectedOrder) {
      toast.success('Documento cancelado', {
        description: `El documento ${selectedOrder.orderNumber} ha sido cancelado.`,
      });
      onDeleteClose();
      setSelectedOrder(null);
    }
  };

  const handleExportOrders = () => {
    toast.success('Exportando ventas', {
      description: 'El archivo Excel se descargará en breve.',
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDocTypeFilter('all');
    setSelectedCustomer(null);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || docTypeFilter !== 'all' || selectedCustomer;

  // Calculate quote totals
  const quoteSubtotal = quoteLines.reduce((sum, l) => sum + (l.subtotal || 0), 0);
  const quoteTotalCost = quoteLines.reduce((sum, l) => sum + (l.totalCost || 0), 0);
  const quoteMargin = quoteSubtotal - quoteTotalCost;
  const quoteMarginPercent = quoteSubtotal > 0 ? (quoteMargin / quoteSubtotal) * 100 : 0;
  const hasLowMarginLines = quoteLines.some((l) => !l.commissionEligible);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Ventas B2B</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportOrders}
            className="flex h-9 items-center gap-2 px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
          {canCreateQuotes && (
            <button
              onClick={onCreateOpen}
              className="flex h-9 items-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              <Plus className="h-4 w-4" />
              Nueva Cotización
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          {
            label: 'Cotizaciones',
            value: stats.pendingQuotes,
            icon: FileText,
            color: 'blue',
            filterStatus: 'cotizado' as StatusFilter,
            show: true,
          },
          {
            label: 'Por Aprobar',
            value: stats.pendingApproval,
            icon: ThumbsUp,
            color: 'purple',
            filterStatus: 'pedido' as StatusFilter,
            show: canApproveOrders,
          },
          {
            label: 'Por Empacar',
            value: stats.readyToPack,
            icon: PackageCheck,
            color: 'amber',
            filterStatus: 'aprobado' as StatusFilter,
            show: true,
          },
          {
            label: 'Por Facturar',
            value: stats.readyToInvoice,
            icon: FileCheck,
            color: 'emerald',
            filterStatus: 'empacado' as StatusFilter,
            show: true,
          },
          {
            label: 'Venta del Mes',
            value: formatCurrency(stats.salesValueThisMonth),
            icon: DollarSign,
            color: 'teal',
            filterStatus: 'facturado' as StatusFilter,
            isMonetary: true,
            show: canViewMargins,
          },
        ]
          .filter((stat) => stat.show)
          .map((stat, index) => (
            <motion.button
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setStatusFilter(statusFilter === stat.filterStatus ? 'all' : stat.filterStatus)}
              className={cn(
                'rounded-xl border bg-card p-3 text-left transition-all hover:shadow-md',
                statusFilter === stat.filterStatus
                  ? 'border-brand-500 ring-1 ring-brand-500'
                  : 'border-border hover:border-border'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    stat.color === 'blue' && 'bg-blue-500/10',
                    stat.color === 'purple' && 'bg-purple-500/10',
                    stat.color === 'amber' && 'bg-amber-500/10',
                    stat.color === 'emerald' && 'bg-emerald-500/10',
                    stat.color === 'teal' && 'bg-teal-500/10'
                  )}
                >
                  <stat.icon
                    className={cn(
                      'h-5 w-5',
                      stat.color === 'blue' && 'text-blue-500',
                      stat.color === 'purple' && 'text-purple-500',
                      stat.color === 'amber' && 'text-amber-500',
                      stat.color === 'emerald' && 'text-emerald-500',
                      stat.color === 'teal' && 'text-teal-500'
                    )}
                  />
                </div>
                <div>
                  <p className={cn('font-semibold text-foreground', stat.isMonetary ? 'text-lg' : 'text-xl')}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.button>
          ))}
      </div>

      {/* Pipeline Visual */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Pipeline de Ventas</h3>
          <span className="text-sm text-muted-foreground">
            Valor en pipeline: <span className="font-semibold text-foreground">{formatCurrency(stats.pipelineValue)}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {PIPELINE_STAGES.map((stage, index) => {
            const count = stats.byStatus[stage.status];
            const config = STATUS_CONFIG[stage.status];
            const isActive = statusFilter === stage.status;

            return (
              <div key={stage.status} className="flex flex-1 items-center">
                <button
                  onClick={() => setStatusFilter(isActive ? 'all' : stage.status)}
                  className={cn(
                    'flex flex-1 flex-col items-center rounded-lg p-3 transition-all',
                    isActive ? 'bg-brand-500/10 ring-1 ring-brand-500' : 'hover:bg-accent'
                  )}
                >
                  <span
                    className={cn(
                      'mb-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                      config.bg,
                      config.text
                    )}
                  >
                    {count}
                  </span>
                  <span className="text-xs text-muted-foreground">{stage.label}</span>
                </button>
                {index < PIPELINE_STAGES.length - 1 && (
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar documento o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Document Type Filter */}
          <Dropdown>
            <DropdownTrigger>
              <button
                className={cn(
                  'flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                  docTypeFilter !== 'all'
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {docTypeFilter !== 'all' ? DOCUMENT_TYPE_LABELS[docTypeFilter] : 'Tipo'}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode="single"
              selectedKeys={docTypeFilter !== 'all' ? [docTypeFilter] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setDocTypeFilter(selected === docTypeFilter ? 'all' : (selected as DocTypeFilter));
              }}
            >
              <DropdownItem key="cotizacion">Cotización</DropdownItem>
              <DropdownItem key="pedido">Pedido</DropdownItem>
              <DropdownItem key="factura">Factura</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Status Filter */}
          <Dropdown>
            <DropdownTrigger>
              <button
                className={cn(
                  'flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                  statusFilter !== 'all'
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {statusFilter !== 'all' ? STATUS_CONFIG[statusFilter].label : 'Estado'}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode="single"
              selectedKeys={statusFilter !== 'all' ? [statusFilter] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setStatusFilter(selected === statusFilter ? 'all' : (selected as StatusFilter));
              }}
            >
              <DropdownItem key="borrador">Borrador</DropdownItem>
              <DropdownItem key="cotizado">Cotizado</DropdownItem>
              <DropdownItem key="pedido">Pedido</DropdownItem>
              <DropdownItem key="aprobado">Aprobado</DropdownItem>
              <DropdownItem key="empacado">Empacado</DropdownItem>
              <DropdownItem key="facturado">Facturado</DropdownItem>
              <DropdownItem key="cancelado">Cancelado</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Customer Filter */}
          <Dropdown>
            <DropdownTrigger>
              <button
                className={cn(
                  'flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                  selectedCustomer
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {selectedCustomer
                  ? MOCK_CLIENTS.find((c) => c.id === selectedCustomer)?.name.slice(0, 15) + '...'
                  : 'Cliente'}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode="single"
              selectedKeys={selectedCustomer ? [selectedCustomer] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedCustomer(selected === selectedCustomer ? null : selected);
              }}
              className="max-h-64 overflow-auto"
            >
              {MOCK_CLIENTS.slice(0, 10).map((client) => (
                <DropdownItem key={client.id}>{client.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex h-9 items-center gap-1 px-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  No. Doc
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Fecha
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Líneas
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total
                </th>
                {/* Margin column - different display per role */}
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {canViewMargins ? 'Margen' : isVendedor ? 'Comisión' : ''}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order, index) => {
                const statusConfig = STATUS_CONFIG[order.status];
                const docTypeLabel = order.documentType === 'cotizacion' ? 'COT' : order.documentType === 'pedido' ? 'PED' : 'FAC';

                // Check if all lines are commission eligible
                const allLinesEligible = order.lines.every((l) => l.commissionEligible);

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="group transition-colors hover:bg-accent/50"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="font-mono text-sm font-medium text-brand-500 hover:text-brand-600 hover:underline"
                      >
                        {order.orderNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                          order.documentType === 'cotizacion' && 'bg-blue-500/10 text-blue-500',
                          order.documentType === 'pedido' && 'bg-purple-500/10 text-purple-500',
                          order.documentType === 'factura' && 'bg-teal-500/10 text-teal-500'
                        )}
                      >
                        {docTypeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="max-w-[200px] truncate text-sm text-foreground">{order.customerName}</span>
                        <p className="text-xs text-muted-foreground">{order.customerCountry}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground">
                        {order.lines.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    {/* Margin/Commission column */}
                    <td className="px-4 py-3 text-center">
                      {canViewMargins ? (
                        <span className="font-mono text-sm text-muted-foreground">
                          {order.marginPercent?.toFixed(1)}%
                        </span>
                      ) : isVendedor ? (
                        <span
                          className={cn(
                            'inline-flex h-4 w-4 rounded-full',
                            allLinesEligible ? 'bg-emerald-500' : 'bg-red-500'
                          )}
                          title={allLinesEligible ? 'Comisiona' : 'No comisiona'}
                        />
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                          statusConfig.bg,
                          statusConfig.text
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dot)} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Acciones"
                          items={[
                            { key: 'view', label: 'Ver detalle', icon: Eye, action: () => handleViewOrder(order), show: true },
                            { key: 'send', label: 'Enviar cotización', icon: Send, action: () => toast.info('Enviar por email'), show: order.status === 'borrador' },
                            { key: 'convert', label: 'Convertir a pedido', icon: CheckCircle2, action: () => toast.info('Convertir a pedido'), show: order.status === 'cotizado' },
                            { key: 'approve', label: 'Aprobar', icon: ThumbsUp, action: () => toast.success('Pedido aprobado'), show: order.status === 'pedido' && canApproveOrders },
                            { key: 'edit', label: 'Editar', icon: Edit, action: () => handleViewOrder(order), show: order.status === 'borrador' },
                            { key: 'delete', label: 'Cancelar', icon: Trash2, action: () => handleDeleteOrder(order), show: !['facturado', 'cancelado'].includes(order.status), danger: true },
                          ].filter(item => item.show)}
                        >
                          {(item) => (
                            <DropdownItem
                              key={item.key}
                              startContent={<item.icon className="h-4 w-4" />}
                              className={item.danger ? 'text-danger' : ''}
                              color={item.danger ? 'danger' : 'default'}
                              onPress={item.action}
                            >
                              {item.label}
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
          <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-1 text-lg font-medium text-foreground">No se encontraron documentos</h3>
          <p className="text-sm text-muted-foreground">Intenta ajustar los filtros o crea una nueva cotización</p>
        </div>
      )}

      {/* Results count */}
      {filteredOrders.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {filteredOrders.length} de {MOCK_SALES_ORDERS.length} documentos
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
        <ModalContent>
          <ModalHeader>Cancelar documento</ModalHeader>
          <ModalBody>
            <p className="text-muted-foreground">
              ¿Estás seguro de cancelar{' '}
              <span className="font-medium text-foreground">"{selectedOrder?.orderNumber}"</span>? Esta acción
              no se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              Volver
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              Cancelar Documento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Quote Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
              <ClipboardList className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Nueva Cotización</h2>
              <p className="text-sm text-muted-foreground">Completa la información de la cotización</p>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <Tabs aria-label="Secciones" color="primary" variant="underlined">
              {/* Tab 1: Cliente */}
              <Tab key="cliente" title="Cliente">
                <div className="mt-4 space-y-6">
                  <Select
                    label="Seleccionar Cliente *"
                    placeholder="Buscar cliente..."
                    selectedKeys={quoteFormData.customerId ? [quoteFormData.customerId] : []}
                    onChange={(e) => handleFormChange('customerId', e.target.value)}
                    variant="bordered"
                    startContent={<Building2 className="h-4 w-4 text-muted-foreground" />}
                  >
                    {MOCK_CLIENTS.filter((c) => c.status === 'active').map((client) => (
                      <SelectItem key={client.id} textValue={client.name}>
                        <div className="flex flex-col">
                          <span className="text-sm">{client.name}</span>
                          <span className="text-xs text-muted-foreground">{client.country} • Nivel {client.priceLevel}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Selected client info */}
                  {selectedClient && (
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                      <h4 className="mb-3 text-sm font-medium text-foreground">Información del Cliente</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">RUC/NIT:</span>
                          <span className="font-mono font-medium text-foreground">{selectedClient.taxId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Nivel de Precio:</span>
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            selectedClient.priceLevel === 'A' && 'bg-emerald-500/10 text-emerald-500',
                            selectedClient.priceLevel === 'B' && 'bg-blue-500/10 text-blue-500',
                            selectedClient.priceLevel === 'C' && 'bg-purple-500/10 text-purple-500',
                            selectedClient.priceLevel === 'D' && 'bg-amber-500/10 text-amber-500',
                            selectedClient.priceLevel === 'E' && 'bg-muted text-muted-foreground'
                          )}>
                            Nivel {selectedClient.priceLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Crédito Disponible:</span>
                          <span className={cn(
                            'font-mono font-medium',
                            selectedClient.creditAvailable > 0 ? 'text-emerald-500' : 'text-red-500'
                          )}>
                            {formatCurrency(selectedClient.creditAvailable)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Términos:</span>
                          <span className="font-medium text-foreground">
                            {selectedClient.paymentTerms === 'contado' ? 'Contado' :
                              selectedClient.paymentTerms.replace('credito_', 'Crédito ') + ' días'}
                          </span>
                        </div>
                      </div>
                      {selectedClient.creditAvailable <= 0 && (
                        <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-500/10 p-2 text-sm text-amber-500">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Este cliente no tiene crédito disponible</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Válido hasta"
                      type="date"
                      value={quoteFormData.validUntil}
                      onChange={(e) => handleFormChange('validUntil', e.target.value)}
                      variant="bordered"
                    />
                    <Input
                      label="Fecha entrega solicitada"
                      type="date"
                      value={quoteFormData.requestedDeliveryDate}
                      onChange={(e) => handleFormChange('requestedDeliveryDate', e.target.value)}
                      variant="bordered"
                    />
                  </div>

                  <Textarea
                    label="Notas para el cliente"
                    placeholder="Notas visibles en la cotización..."
                    value={quoteFormData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    variant="bordered"
                    minRows={2}
                  />
                </div>
              </Tab>

              {/* Tab 2: Productos */}
              <Tab key="productos" title="Productos" isDisabled={!selectedClient}>
                <div className="mt-4 space-y-6">
                  {/* Add Product Section */}
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h3 className="mb-3 text-sm font-medium text-foreground">Agregar producto</h3>
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="min-w-[250px] flex-1">
                        <Select
                          label="Producto"
                          placeholder="Buscar producto..."
                          selectedKeys={newLineProduct ? [newLineProduct] : []}
                          onChange={(e) => handleProductSelect(e.target.value)}
                          variant="bordered"
                        >
                          {MOCK_PRODUCTS.map((product) => (
                            <SelectItem key={product.id} textValue={product.description}>
                              <div className="flex flex-col">
                                <span className="text-sm">{product.description}</span>
                                <span className="text-xs text-muted-foreground">
                                  {product.reference} • Nivel {selectedClient?.priceLevel}: {formatCurrency(product.prices[selectedClient?.priceLevel || 'C'])}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input
                          label="Cantidad"
                          type="number"
                          placeholder="0"
                          value={newLineQty}
                          onChange={(e) => setNewLineQty(e.target.value)}
                          variant="bordered"
                        />
                      </div>
                      <div className="w-28">
                        <Input
                          label="Precio"
                          type="number"
                          placeholder="0.00"
                          value={newLinePrice}
                          onChange={(e) => setNewLinePrice(e.target.value)}
                          variant="bordered"
                          startContent={<span className="text-xs text-muted-foreground">$</span>}
                          isReadOnly={!canViewMargins}
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          label="Desc %"
                          type="number"
                          placeholder="0"
                          value={newLineDiscount}
                          onChange={(e) => setNewLineDiscount(e.target.value)}
                          variant="bordered"
                        />
                      </div>
                      {/* Commission indicator */}
                      {newLineProduct && newLinePrice && selectedClient && (
                        <div className="flex items-center gap-2 pb-1">
                          {(() => {
                            const cost = getProductCost(newLineProduct);
                            const price = parseFloat(newLinePrice);
                            const isEligible = calculateCommissionEligible(price, cost);
                            return (
                              <span
                                className={cn(
                                  'flex h-6 w-6 items-center justify-center rounded-full',
                                  isEligible ? 'bg-emerald-500/10' : 'bg-red-500/10'
                                )}
                                title={isEligible ? 'Comisiona' : 'No comisiona (margen < 10%)'}
                              >
                                <span
                                  className={cn(
                                    'h-3 w-3 rounded-full',
                                    isEligible ? 'bg-emerald-500' : 'bg-red-500'
                                  )}
                                />
                              </span>
                            );
                          })()}
                        </div>
                      )}
                      <Button color="primary" onPress={handleAddLine}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Lines Table */}
                  {quoteLines.length > 0 && (
                    <div className="overflow-hidden rounded-lg border border-border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                              Producto
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">
                              Cant.
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">
                              Precio
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">
                              Desc.
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">
                              Subtotal
                            </th>
                            {canViewMargins && (
                              <th className="px-4 py-2 text-right text-xs font-medium uppercase text-muted-foreground">
                                Margen
                              </th>
                            )}
                            <th className="px-4 py-2 text-center text-xs font-medium uppercase text-muted-foreground">
                              {isVendedor ? '' : ''}
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium uppercase text-muted-foreground">
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {quoteLines.map((line) => (
                            <tr key={line.id}>
                              <td className="px-4 py-2">
                                <div>
                                  <p className="text-sm text-foreground">{line.productDescription}</p>
                                  <p className="text-xs text-muted-foreground">{line.productReference}</p>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <span className="text-sm text-foreground">{line.quantity}</span>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <span className="font-mono text-sm text-foreground">
                                  {formatCurrency(line.unitPrice || 0)}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <span className="text-sm text-muted-foreground">
                                  {line.discount}%
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <span className="font-mono text-sm font-medium text-foreground">
                                  {formatCurrency(line.subtotal || 0)}
                                </span>
                              </td>
                              {canViewMargins && (
                                <td className="px-4 py-2 text-right">
                                  <span className={cn(
                                    'font-mono text-sm',
                                    (line.marginPercent || 0) >= 10 ? 'text-emerald-500' : 'text-red-500'
                                  )}>
                                    {line.marginPercent?.toFixed(1)}%
                                  </span>
                                </td>
                              )}
                              <td className="px-4 py-2 text-center">
                                {isVendedor && (
                                  <span
                                    className={cn(
                                      'inline-flex h-4 w-4 rounded-full',
                                      line.commissionEligible ? 'bg-emerald-500' : 'bg-red-500'
                                    )}
                                    title={line.commissionEligible ? 'Comisiona' : 'No comisiona'}
                                  />
                                )}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  onClick={() => handleRemoveLine(line.id || '')}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-border bg-muted/50">
                            <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium text-foreground">
                              Subtotal:
                            </td>
                            <td className="px-4 py-2 text-right">
                              <span className="font-mono text-sm font-bold text-foreground">
                                {formatCurrency(quoteSubtotal)}
                              </span>
                            </td>
                            {canViewMargins && (
                              <td className="px-4 py-2 text-right">
                                <span className={cn(
                                  'font-mono text-sm font-bold',
                                  quoteMarginPercent >= 10 ? 'text-emerald-500' : 'text-red-500'
                                )}>
                                  {quoteMarginPercent.toFixed(1)}%
                                </span>
                              </td>
                            )}
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  {/* Empty state for lines */}
                  {quoteLines.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 py-8 text-center">
                      <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No hay productos agregados</p>
                      <p className="text-xs text-muted-foreground">Selecciona productos del catálogo</p>
                    </div>
                  )}

                  {/* Warning for low margin lines */}
                  {hasLowMarginLines && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        Esta cotización tiene líneas con margen menor al 10%.
                        {canApproveOrders ? ' No requerirá aprobación adicional.' : ' Requerirá aprobación de gerencia.'}
                      </span>
                    </div>
                  )}
                </div>
              </Tab>

              {/* Tab 3: Resumen */}
              <Tab key="resumen" title="Resumen" isDisabled={!selectedClient || quoteLines.length === 0}>
                <div className="mt-4 space-y-6">
                  {/* Summary Card */}
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="mb-4 text-lg font-medium text-foreground">Resumen de Cotización</h3>

                    <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cliente:</span>
                        <p className="font-medium text-foreground">{selectedClient?.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nivel de Precio:</span>
                        <p className="font-medium text-foreground">Nivel {selectedClient?.priceLevel}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Términos de Pago:</span>
                        <p className="font-medium text-foreground">
                          {selectedClient?.paymentTerms === 'contado' ? 'Contado' :
                            selectedClient?.paymentTerms.replace('credito_', 'Crédito ') + ' días'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Productos:</span>
                        <p className="font-medium text-foreground">{quoteLines.length} líneas</p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-mono font-medium text-foreground">{formatCurrency(quoteSubtotal)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">ITBMS (0%)</span>
                        <span className="font-mono text-foreground">$0.00</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <span className="text-lg font-semibold text-foreground">Total</span>
                        <span className="font-mono text-xl font-bold text-foreground">{formatCurrency(quoteSubtotal)}</span>
                      </div>
                    </div>

                    {canViewMargins && (
                      <div className="mt-4 rounded-lg bg-muted/50 p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Costo Total</span>
                          <span className="font-mono text-foreground">{formatCurrency(quoteTotalCost)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Margen Bruto</span>
                          <span className={cn(
                            'font-mono font-medium',
                            quoteMarginPercent >= 10 ? 'text-emerald-500' : 'text-red-500'
                          )}>
                            {formatCurrency(quoteMargin)} ({quoteMarginPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )}

                    {hasLowMarginLines && !canApproveOrders && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-500">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Esta cotización requerirá aprobación de gerencia al convertirse en pedido.</span>
                      </div>
                    )}
                  </div>
                </div>
              </Tab>
            </Tabs>
          </ModalBody>
          <ModalFooter className="border-t border-border pt-4">
            <Button variant="light" onPress={onCreateClose}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleCreateQuote}
              isDisabled={!selectedClient || quoteLines.length === 0}
            >
              Crear Cotización
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
