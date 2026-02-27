'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@heroui/react';
import { CustomModal, CustomModalHeader, CustomModalBody, CustomModalFooter } from '@/components/ui/custom-modal';
import {
  Search,
  ArrowLeft,
  ChevronDown,
  X,
  PackageCheck,
  Eye,
  Calendar,
} from 'lucide-react';
import {
  MOCK_MERCHANDISE_ENTRIES,
  MOCK_SUPPLIERS,
  MOCK_BODEGAS,
  formatCurrency,
  formatDate,
} from '@/lib/mock-data/purchase-orders';
import type { MerchandiseEntry } from '@/lib/types/purchase-order';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/contexts/auth-context';

export default function HistorialEntradasPage() {
  const router = useRouter();
  const { checkPermission } = useAuth();
  const canViewCosts = checkPermission('canViewCosts');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedBodega, setSelectedBodega] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<MerchandiseEntry | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return MOCK_MERCHANDISE_ENTRIES.filter((entry) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        entry.purchaseOrderNumber.toLowerCase().includes(searchLower) ||
        entry.supplierName.toLowerCase().includes(searchLower) ||
        entry.supplierInvoice.toLowerCase().includes(searchLower);

      const matchesSupplier = !selectedSupplier || entry.supplierId === selectedSupplier;
      const matchesBodega = !selectedBodega || entry.bodegaId === selectedBodega;

      return matchesSearch && matchesSupplier && matchesBodega;
    });
  }, [searchQuery, selectedSupplier, selectedBodega]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSupplier(null);
    setSelectedBodega(null);
  };

  const hasActiveFilters = searchQuery || selectedSupplier || selectedBodega;

  const handleViewEntry = (entry: MerchandiseEntry) => {
    setSelectedEntry(entry);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/compras')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Historial de Entradas</h1>
            <p className="text-sm text-gray-500">Registro de toda la mercancía recibida</p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar entrada..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Supplier Filter */}
          <Dropdown>
            <DropdownTrigger>
              <button
                className={cn(
                  'flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                  selectedSupplier
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {selectedSupplier
                  ? MOCK_SUPPLIERS.find((s) => s.id === selectedSupplier)?.name.slice(0, 15) + '...'
                  : 'Proveedor'}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode="single"
              selectedKeys={selectedSupplier ? [selectedSupplier] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedSupplier(selected === selectedSupplier ? null : selected);
              }}
              classNames={{ base: 'bg-white border border-gray-200 shadow-lg' }}
            >
              {MOCK_SUPPLIERS.map((supplier) => (
                <DropdownItem key={supplier.id}>{supplier.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Bodega Filter */}
          <Dropdown>
            <DropdownTrigger>
              <button
                className={cn(
                  'flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                  selectedBodega
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {selectedBodega
                  ? MOCK_BODEGAS.find((b) => b.id === selectedBodega)?.name
                  : 'Bodega'}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode="single"
              selectedKeys={selectedBodega ? [selectedBodega] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedBodega(selected === selectedBodega ? null : selected);
              }}
              classNames={{ base: 'bg-white border border-gray-200 shadow-lg' }}
            >
              {MOCK_BODEGAS.map((bodega) => (
                <DropdownItem key={bodega.id}>{bodega.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex h-9 items-center gap-1 px-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Entries Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  No. Orden
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  No. Factura
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Proveedor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Bodega
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Productos
                </th>
                {canViewCosts && (
                  <>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total FOB
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total CIF
                    </th>
                  </>
                )}
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tipo
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntries.map((entry, index) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="group transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{formatDate(entry.date)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/compras/${entry.purchaseOrderId}`)}
                      className="font-mono text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      {entry.purchaseOrderNumber}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-gray-600">{entry.supplierInvoice}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{entry.supplierName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{entry.bodegaName}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-700">
                      {entry.lines.length}
                    </span>
                  </td>
                  {canViewCosts && (
                    <>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {formatCurrency(entry.totalFOB)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {formatCurrency(entry.totalCIF)}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        entry.receptionType === 'completa'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      )}
                    >
                      {entry.receptionType === 'completa' ? 'Completa' : 'Parcial'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleViewEntry(entry)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16">
          <PackageCheck className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-1 text-lg font-medium text-gray-900">No se encontraron entradas</h3>
          <p className="text-sm text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Results count */}
      {filteredEntries.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {filteredEntries.length} de {MOCK_MERCHANDISE_ENTRIES.length} entradas
        </div>
      )}

      {/* Entry Detail Modal */}
      <CustomModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} size="3xl" scrollable>
          <CustomModalHeader onClose={() => setIsDetailOpen(false)}>
              <PackageCheck className="h-5 w-5 text-emerald-600" />
              Detalle de Entrada
          </CustomModalHeader>
          <CustomModalBody className="space-y-4">
            {selectedEntry && (
              <div className="space-y-6">
                {/* Entry Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Proveedor:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedEntry.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Factura:</span>
                    <span className="ml-2 font-mono font-medium text-gray-900">
                      {selectedEntry.supplierInvoice}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bodega:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedEntry.bodegaName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <span
                      className={cn(
                        'ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        selectedEntry.receptionType === 'completa'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      )}
                    >
                      {selectedEntry.receptionType === 'completa' ? 'Completa' : 'Parcial'}
                    </span>
                  </div>
                </div>

                {/* Lines Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                          Producto
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                          Cantidad
                        </th>
                        {canViewCosts && (
                          <>
                            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                              Costo FOB
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                              Costo CIF
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                              Costo Prom.
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedEntry.lines.map((line) => (
                        <tr key={line.productId}>
                          <td className="px-3 py-2">
                            <div>
                              <p className="text-sm text-gray-900">{line.productDescription}</p>
                              <p className="text-xs text-gray-500">{line.productReference}</p>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span className="text-sm font-medium text-gray-900">{line.quantityReceived}</span>
                          </td>
                          {canViewCosts && (
                            <>
                              <td className="px-3 py-2 text-right">
                                <span className="font-mono text-sm text-gray-900">
                                  {formatCurrency(line.unitCostFOB)}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <span className="font-mono text-sm text-gray-900">
                                  {formatCurrency(line.unitCostCIF)}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <div>
                                  <span className="font-mono text-sm font-medium text-gray-900">
                                    {formatCurrency(line.newCostAvg)}
                                  </span>
                                  {line.newCostAvg > line.previousCostAvg && (
                                    <span className="ml-1 text-xs text-red-500">
                                      +{((line.newCostAvg - line.previousCostAvg) / line.previousCostAvg * 100).toFixed(1)}%
                                    </span>
                                  )}
                                  {line.newCostAvg < line.previousCostAvg && (
                                    <span className="ml-1 text-xs text-emerald-500">
                                      {((line.newCostAvg - line.previousCostAvg) / line.previousCostAvg * 100).toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                {canViewCosts && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">Total FOB</p>
                      <p className="font-mono text-lg font-bold text-gray-900">
                        {formatCurrency(selectedEntry.totalFOB)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">% Gastos</p>
                      <p className="font-mono text-lg font-bold text-gray-900">
                        {selectedEntry.expensePercentage}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs text-emerald-700">Total CIF</p>
                      <p className="font-mono text-lg font-bold text-emerald-700">
                        {formatCurrency(selectedEntry.totalCIF)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CustomModalBody>
          <CustomModalFooter>
            <Button variant="light" onPress={() => setIsDetailOpen(false)}>
              Cerrar
            </Button>
            <Button
              color="primary"
              onPress={() => {
                setIsDetailOpen(false);
                router.push(`/compras/${selectedEntry?.purchaseOrderId}`);
              }}
              className="bg-brand-600"
            >
              Ver Orden Completa
            </Button>
          </CustomModalFooter>
      </CustomModal>
    </div>
  );
}
