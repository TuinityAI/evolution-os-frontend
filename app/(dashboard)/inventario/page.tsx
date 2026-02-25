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
  Switch,
  useDisclosure,
} from '@heroui/react';
import {
  Search,
  Plus,
  Warehouse,
  Package,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Truck,
  Clock,
  DollarSign,
  ChevronDown,
  SlidersHorizontal,
  Eye,
  Edit,
  ClipboardList,
  ArrowRightLeft,
  MoreVertical,
  X,
  Calendar,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/contexts/auth-context';
import { cn } from '@/lib/utils/cn';
import {
  getInventoryItems,
  getInventoryStats,
  getPendingAdjustments,
} from '@/lib/mock-data/inventory';
import { MOCK_WAREHOUSES } from '@/lib/mock-data/warehouses';
import { PRODUCT_GROUPS } from '@/lib/mock-data/products';
import type { InventoryItem, InventoryStockFilter } from '@/lib/types/inventory';

// Product images mapping
const PRODUCT_IMAGES: Record<string, string> = {
  'WHISKY': 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=300&h=300&fit=crop',
  'RON': 'https://images.unsplash.com/photo-1598018553943-93a44e4e7af8?w=300&h=300&fit=crop',
  'VODKA': 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=300&h=300&fit=crop',
  'TEQUILA': 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=300&h=300&fit=crop',
  'GINEBRA': 'https://images.unsplash.com/photo-1608885898957-a559228e8749?w=300&h=300&fit=crop',
  'VINO': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop',
  'LICOR': 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=300&h=300&fit=crop',
  'SNACKS': 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=300&h=300&fit=crop',
  'CERVEZA': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&h=300&fit=crop',
};

export default function InventarioPage() {
  const router = useRouter();
  const { checkPermission } = useAuth();
  const canViewCosts = checkPermission('canViewCosts');
  const canViewSuppliers = checkPermission('canViewSuppliers');
  const canCreateAdjustments = checkPermission('canCreateAdjustments');
  const canCreateTransfers = checkPermission('canCreateTransfers');
  const canCreateCountSessions = checkPermission('canCreateCountSessions');

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<InventoryStockFilter>('all');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  // Advanced filters
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const [stockRange, setStockRange] = useState({ min: '', max: '' });
  const [showOnlyWithAlerts, setShowOnlyWithAlerts] = useState(false);

  // Get data
  const stats = getInventoryStats();
  const pendingAdjustments = getPendingAdjustments();

  // Filter inventory items
  const inventoryItems = useMemo(() => {
    const items = getInventoryItems({
      search: searchQuery,
      stockFilter,
      group: selectedGroup || undefined,
      brand: selectedBrand || undefined,
      warehouseId: selectedWarehouse || undefined,
      supplierId: selectedSupplier || undefined,
    });

    // Apply advanced filters
    return items.filter((item) => {
      // Stock range
      if (stockRange.min && item.available < parseFloat(stockRange.min)) return false;
      if (stockRange.max && item.available > parseFloat(stockRange.max)) return false;

      // Only with alerts
      if (showOnlyWithAlerts && item.alerts.length === 0) return false;

      return true;
    });
  }, [searchQuery, stockFilter, selectedGroup, selectedBrand, selectedWarehouse, selectedSupplier, stockRange, showOnlyWithAlerts]);

  // Get unique brands from inventory
  const uniqueBrands = useMemo(() => {
    return [...new Set(getInventoryItems().map((i) => i.brand))].sort();
  }, []);

  // Get unique suppliers from inventory
  const uniqueSuppliers = useMemo(() => {
    return [...new Set(getInventoryItems().map((i) => i.supplier))].sort();
  }, []);

  // Get stock status for an item
  const getStockStatus = (item: InventoryItem) => {
    if (item.available === 0) {
      return { label: 'Sin Stock', color: 'bg-red-500', textColor: 'text-red-600' };
    }
    if (item.available <= item.minimumQty) {
      return { label: 'Stock Bajo', color: 'bg-amber-500', textColor: 'text-amber-600' };
    }
    return { label: 'En Stock', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PA', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStockFilter('all');
    setSelectedGroup(null);
    setSelectedBrand(null);
    setSelectedWarehouse(null);
    setSelectedSupplier(null);
    setStockRange({ min: '', max: '' });
    setShowOnlyWithAlerts(false);
  };

  const hasActiveFilters = searchQuery || stockFilter !== 'all' || selectedGroup || selectedBrand ||
    selectedWarehouse || selectedSupplier || stockRange.min || stockRange.max || showOnlyWithAlerts;

  // Navigation handlers
  const handleNewAdjustment = () => {
    router.push('/inventario/ajustes/nuevo');
  };

  const handleNewTransfer = () => {
    router.push('/inventario/transferencias/nueva');
  };

  const handleNewCount = () => {
    router.push('/inventario/conteo/nuevo');
  };

  const handleViewProduct = (item: InventoryItem) => {
    router.push(`/productos/${item.productId}`);
  };

  const handleCreateAdjustment = (item: InventoryItem) => {
    router.push(`/inventario/ajustes/nuevo?product=${item.productId}`);
  };

  const handleViewMovements = (item: InventoryItem) => {
    toast.info('Movimientos', {
      description: `Ver historial de movimientos de ${item.productDescription}`,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
            <Warehouse className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Inventario</h1>
            <p className="text-sm text-gray-500 dark:text-[#888888]">Control de stock, ajustes y transferencias</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canCreateCountSessions && (
            <button
              onClick={handleNewCount}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
            >
              <ClipboardList className="h-4 w-4" />
              Conteo Físico
            </button>
          )}
          {canCreateTransfers && (
            <button
              onClick={handleNewTransfer}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Transferencia
            </button>
          )}
          {canCreateAdjustments && (
            <button
              onClick={handleNewAdjustment}
              className="flex h-9 items-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              <Plus className="h-4 w-4" />
              Nuevo Ajuste
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {[
          { label: 'Con Stock', value: stats.productsWithStock, icon: TrendingUp, color: 'emerald', filter: 'in_stock' as InventoryStockFilter },
          { label: 'Bajo Mínimo', value: stats.belowMinimum, icon: AlertTriangle, color: 'amber', filter: 'low_stock' as InventoryStockFilter },
          { label: 'Sin Stock', value: stats.outOfStock, icon: AlertCircle, color: 'red', filter: 'out_of_stock' as InventoryStockFilter },
          { label: 'Estancados 4+', value: stats.stagnant4Months, icon: Clock, color: 'orange', filter: 'stagnant' as InventoryStockFilter },
          ...(canViewCosts ? [{ label: 'Valor Total', value: formatCurrency(stats.totalValue), icon: DollarSign, color: 'blue', filter: 'all' as InventoryStockFilter, isValue: true }] : []),
          { label: 'Ajustes Pend.', value: stats.pendingAdjustments, icon: FileText, color: stats.pendingAdjustments > 0 ? 'red' : 'gray', filter: 'all' as InventoryStockFilter, link: '/inventario/ajustes?status=pendiente' },
        ].map((stat, index) => (
          <motion.button
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              if (stat.link) {
                router.push(stat.link);
              } else if (!stat.isValue) {
                setStockFilter(stockFilter === stat.filter ? 'all' : stat.filter);
              }
            }}
            className={cn(
              'rounded-xl border bg-white dark:bg-[#141414] p-3 text-left transition-all hover:shadow-md',
              !stat.isValue && stockFilter === stat.filter
                ? 'border-brand-500 ring-1 ring-brand-500'
                : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                stat.color === 'blue' && 'bg-blue-50 dark:bg-blue-950',
                stat.color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-950',
                stat.color === 'amber' && 'bg-amber-50 dark:bg-amber-950',
                stat.color === 'red' && 'bg-red-50 dark:bg-red-950',
                stat.color === 'orange' && 'bg-orange-50 dark:bg-orange-950',
                stat.color === 'gray' && 'bg-gray-50 dark:bg-[#1a1a1a]'
              )}>
                <stat.icon className={cn(
                  'h-5 w-5',
                  stat.color === 'blue' && 'text-blue-600',
                  stat.color === 'emerald' && 'text-emerald-600',
                  stat.color === 'amber' && 'text-amber-600',
                  stat.color === 'red' && 'text-red-600',
                  stat.color === 'orange' && 'text-orange-600',
                  stat.color === 'gray' && 'text-gray-600'
                )} />
              </div>
              <div>
                <p className={cn(
                  'font-semibold text-gray-900 dark:text-white',
                  stat.isValue ? 'text-lg' : 'text-xl'
                )}>{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-[#888888]">{stat.label}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en inventario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] pl-9 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#666666] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Group Filter */}
          <Dropdown>
            <DropdownTrigger>
              <button className={cn(
                'flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                selectedGroup ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2a2a2a]'
              )}>
                {selectedGroup || 'Categoría'}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode="single"
              selectedKeys={selectedGroup ? [selectedGroup] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedGroup(selected === selectedGroup ? null : selected);
              }}
              classNames={{ base: 'bg-white border border-gray-200 shadow-lg' }}
            >
              {PRODUCT_GROUPS.map((group) => (
                <DropdownItem key={group.id}>{group.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Brand Filter */}
          <Dropdown>
            <DropdownTrigger>
              <button className={cn(
                'flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                selectedBrand ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2a2a2a]'
              )}>
                {selectedBrand || 'Marca'}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode="single"
              selectedKeys={selectedBrand ? [selectedBrand] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedBrand(selected === selectedBrand ? null : selected);
              }}
              className="max-h-64 overflow-auto"
              classNames={{ base: 'bg-white border border-gray-200 shadow-lg' }}
            >
              {uniqueBrands.map((brand) => (
                <DropdownItem key={brand}>{brand}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Warehouse Filter */}
          <Dropdown>
            <DropdownTrigger>
              <button className={cn(
                'flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                selectedWarehouse ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2a2a2a]'
              )}>
                {selectedWarehouse ? MOCK_WAREHOUSES.find((w) => w.id === selectedWarehouse)?.name : 'Bodega'}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode="single"
              selectedKeys={selectedWarehouse ? [selectedWarehouse] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedWarehouse(selected === selectedWarehouse ? null : selected);
              }}
              classNames={{ base: 'bg-white border border-gray-200 shadow-lg' }}
            >
              {MOCK_WAREHOUSES.map((warehouse) => (
                <DropdownItem key={warehouse.id}>
                  {warehouse.name} ({warehouse.type})
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex h-9 items-center gap-1 px-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}

          {/* Advanced filters button */}
          <button
            onClick={onFilterOpen}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border bg-white dark:bg-[#141414] transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]',
              (stockRange.min || stockRange.max || showOnlyWithAlerts || selectedSupplier)
                ? 'border-brand-500 text-brand-600'
                : 'border-gray-200 dark:border-[#2a2a2a] text-gray-500 dark:text-gray-400'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Grupo</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Existencia</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Por Llegar</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Separado</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Disponible</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Mínimo</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Últ. Compra</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Últ. Venta</th>
                {canViewCosts && (
                  <>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Costo CIF</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Valor</th>
                  </>
                )}
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Alerta</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
              {inventoryItems.map((item, index) => {
                const stockStatus = getStockStatus(item);
                const imageUrl = PRODUCT_IMAGES[item.group] || PRODUCT_IMAGES['WHISKY'];
                const hasStagnantAlert = item.alerts.some((a) => a.type === 'stagnant_4m' || a.type === 'stagnant_6m');

                return (
                  <motion.tr
                    key={item.productId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="group transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-[#1a1a1a]">
                          <img src={imageUrl} alt={item.productDescription} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <button
                            onClick={() => handleViewProduct(item)}
                            className="max-w-xs truncate text-sm font-medium text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-[#00D1B2]"
                          >
                            {item.productDescription}
                          </button>
                          <p className="text-xs text-gray-500 dark:text-[#888888]">{item.productReference}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.group}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.existence}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('text-sm', item.arriving > 0 ? 'font-medium text-sky-600' : 'text-gray-400 dark:text-[#666666]')}>
                        {item.arriving || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('text-sm', item.reserved > 0 ? 'font-medium text-amber-600' : 'text-gray-400 dark:text-[#666666]')}>
                        {item.reserved || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('text-sm font-semibold', stockStatus.textColor)}>
                        {item.available}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.minimumQty}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-500 dark:text-[#888888]">{formatDate(item.lastPurchaseDate)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-500 dark:text-[#888888]">{formatDate(item.lastSaleDate)}</span>
                    </td>
                    {canViewCosts && (
                      <>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm text-gray-700 dark:text-gray-400">{formatCurrency(item.costCIF)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(item.stockValue)}</span>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {item.alerts.map((alert, idx) => (
                          <span
                            key={idx}
                            title={alert.message}
                            className={cn(
                              'flex h-6 w-6 items-center justify-center rounded-full',
                              alert.type === 'out_of_stock' && 'bg-red-100 dark:bg-red-950',
                              alert.type === 'low_stock' && 'bg-amber-100 dark:bg-amber-950',
                              (alert.type === 'stagnant_4m' || alert.type === 'stagnant_6m') && 'bg-orange-100 dark:bg-orange-950'
                            )}
                          >
                            {alert.type === 'out_of_stock' && <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />}
                            {alert.type === 'low_stock' && <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
                            {(alert.type === 'stagnant_4m' || alert.type === 'stagnant_6m') && <Clock className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />}
                          </span>
                        ))}
                        {item.alerts.length === 0 && (
                          <span className="text-gray-300 dark:text-[#444444]">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-[#666666] transition-colors hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-gray-600 dark:hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Acciones"
                          classNames={{ base: 'bg-white border border-gray-200 shadow-lg' }}
                          items={[
                            { key: 'view', label: 'Ver producto', icon: Eye, action: () => handleViewProduct(item), show: true },
                            { key: 'adjust', label: 'Crear ajuste', icon: Edit, action: () => handleCreateAdjustment(item), show: canCreateAdjustments },
                            { key: 'movements', label: 'Ver movimientos', icon: Calendar, action: () => handleViewMovements(item), show: true },
                          ].filter((menuItem) => menuItem.show)}
                        >
                          {(menuItem) => (
                            <DropdownItem key={menuItem.key} startContent={<menuItem.icon className="h-4 w-4" />} onPress={menuItem.action}>
                              {menuItem.label}
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
      {inventoryItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#141414] py-16">
          <Package className="mb-4 h-12 w-12 text-gray-400 dark:text-[#666666]" />
          <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">No se encontraron productos</h3>
          <p className="text-sm text-gray-500 dark:text-[#888888]">Intenta ajustar los filtros o el término de búsqueda</p>
        </div>
      )}

      {/* Results count */}
      <div className="text-center text-sm text-gray-500 dark:text-[#888888]">
        Mostrando {inventoryItems.length} productos en inventario
      </div>

      {/* Advanced Filters Modal */}
      <Modal isOpen={isFilterOpen} onClose={onFilterClose} size="md">
        <ModalContent className="bg-white dark:bg-[#141414]">
          <ModalHeader className="border-b border-gray-200 dark:border-[#2a2a2a]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#2a2a2a]">
                <SlidersHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros Avanzados</h2>
                <p className="text-sm text-gray-500 dark:text-[#888888]">Refina tu búsqueda de inventario</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-6">
              {/* Stock Range */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Rango de Stock Disponible</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Mínimo"
                    type="number"
                    placeholder="0"
                    value={stockRange.min}
                    onChange={(e) => setStockRange((prev) => ({ ...prev, min: e.target.value }))}
                    variant="bordered"
                    classNames={{ inputWrapper: 'bg-white' }}
                  />
                  <Input
                    label="Máximo"
                    type="number"
                    placeholder="1000"
                    value={stockRange.max}
                    onChange={(e) => setStockRange((prev) => ({ ...prev, max: e.target.value }))}
                    variant="bordered"
                    classNames={{ inputWrapper: 'bg-white' }}
                  />
                </div>
              </div>

              {/* Supplier - Role restricted */}
              {canViewSuppliers && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor</h3>
                  <Select
                    placeholder="Todos los proveedores"
                    selectedKeys={selectedSupplier ? [selectedSupplier] : []}
                    onChange={(e) => setSelectedSupplier(e.target.value || null)}
                    variant="bordered"
                    classNames={{ trigger: 'bg-white' }}
                  >
                    {uniqueSuppliers.map((supplier) => (
                      <SelectItem key={supplier}>{supplier}</SelectItem>
                    ))}
                  </Select>
                </div>
              )}

              {/* Show only with alerts */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a] p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Solo productos con alertas</p>
                  <p className="text-xs text-gray-500 dark:text-[#888888]">Mostrar solo bajo stock, sin stock o estancados</p>
                </div>
                <Switch
                  isSelected={showOnlyWithAlerts}
                  onValueChange={setShowOnlyWithAlerts}
                  color="primary"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-[#2a2a2a]">
            <Button
              variant="light"
              onPress={() => {
                setStockRange({ min: '', max: '' });
                setSelectedSupplier(null);
                setShowOnlyWithAlerts(false);
              }}
            >
              Limpiar filtros
            </Button>
            <Button
              color="primary"
              onPress={() => {
                toast.success('Filtros aplicados');
                onFilterClose();
              }}
              className="bg-brand-600"
            >
              Aplicar filtros
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
