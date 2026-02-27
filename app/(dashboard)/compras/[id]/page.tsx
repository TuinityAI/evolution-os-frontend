'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Button,
  Input,
} from '@heroui/react';
import { CustomModal, CustomModalHeader, CustomModalBody, CustomModalFooter } from '@/components/ui/custom-modal';
import {
  ArrowLeft,
  PackageCheck,
  Edit,
  Printer,
  MoreVertical,
  Building2,
  Package,
  Calendar,
  Hash,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getPurchaseOrderById,
  formatCurrency,
  formatDate,
} from '@/lib/mock-data/purchase-orders';
import type { PurchaseOrderStatus } from '@/lib/types/purchase-order';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/contexts/auth-context';
import { useState } from 'react';
import { printPurchaseOrder } from '@/lib/utils/print-utils';

// Status badge colors
const STATUS_CONFIG: Record<PurchaseOrderStatus, { bg: string; text: string; dot: string; label: string }> = {
  pendiente: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', label: 'Pendiente' },
  en_transito: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', label: 'En Tránsito' },
  en_recepcion: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'En Recepción' },
  completada: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Completada' },
  cancelada: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Cancelada' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { checkPermission } = useAuth();
  const canViewCosts = checkPermission('canViewCosts');

  const orderId = params.id as string;
  const order = getPurchaseOrderById(orderId);

  const [expensePercentage, setExpensePercentage] = useState('15');
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
        <h2 className="mb-2 text-lg font-medium text-gray-900">Orden no encontrada</h2>
        <p className="mb-4 text-sm text-gray-500">La orden {orderId} no existe o fue eliminada.</p>
        <Button color="primary" onPress={() => router.push('/compras')} className="bg-brand-600">
          Volver a Compras
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status];
  const canReceive = order.status === 'en_transito' || order.status === 'en_recepcion';
  const canEdit = order.status === 'pendiente';

  // Calculate totals
  const totalQuantityOrdered = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  const totalQuantityReceived = order.lines.reduce((sum, line) => sum + line.quantityReceived, 0);
  const totalPending = totalQuantityOrdered - totalQuantityReceived;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/compras')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-2xl font-semibold text-gray-900">{order.orderNumber}</h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                  statusConfig.bg,
                  statusConfig.text
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dot)} />
                {statusConfig.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Creada el {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canReceive && (
            <Button
              color="success"
              onPress={() => setIsReceiveOpen(true)}
              startContent={<PackageCheck className="h-4 w-4" />}
            >
              Recibir Mercancía
            </Button>
          )}
          {canEdit && (
            <Button
              variant="bordered"
              startContent={<Edit className="h-4 w-4" />}
              onPress={() => toast.info('Editar orden', { description: 'Funcionalidad próximamente.' })}
            >
              Editar
            </Button>
          )}
          <Button
            variant="bordered"
            startContent={<Printer className="h-4 w-4" />}
            onPress={() => {
              printPurchaseOrder(
                {
                  orderNumber: order.orderNumber,
                  supplierName: order.supplierName,
                  supplierInvoice: order.supplierInvoice,
                  bodegaName: order.bodegaName,
                  createdAt: order.createdAt,
                  expectedArrivalDate: order.expectedArrivalDate,
                  status: statusConfig.label,
                  lines: order.lines.map((line) => ({
                    productReference: line.productReference,
                    productDescription: line.productDescription,
                    quantity: line.quantity,
                    quantityReceived: line.quantityReceived,
                    unitCostFOB: line.unitCostFOB,
                    totalFOB: line.totalFOB,
                  })),
                  totalFOB: order.totalFOB,
                  expensePercentage: order.expensePercentage,
                  totalCIF: order.totalCIF,
                  notes: order.notes,
                },
                canViewCosts
              );
              toast.success('Documento generado', {
                description: `Orden ${order.orderNumber} lista para imprimir.`,
              });
            }}
          >
            Imprimir
          </Button>
        </div>
      </motion.div>

      {/* Order Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <Building2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Proveedor</span>
          </div>
          <p className="font-medium text-gray-900">{order.supplierName}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <Hash className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">No. Factura</span>
          </div>
          <p className="font-mono font-medium text-gray-900">{order.supplierInvoice || '-'}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <Package className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Bodega Destino</span>
          </div>
          <p className="font-medium text-gray-900">{order.bodegaName}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Fecha Llegada</span>
          </div>
          <p className="font-medium text-gray-900">
            {order.actualArrivalDate
              ? formatDate(order.actualArrivalDate)
              : order.expectedArrivalDate
              ? `Est. ${formatDate(order.expectedArrivalDate)}`
              : '-'}
          </p>
        </div>
      </motion.div>

      {/* Lines Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Productos ({order.lines.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Referencia
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Descripción
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ordenado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Recibido
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Pendiente
                </th>
                {canViewCosts && (
                  <>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Costo FOB
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total FOB
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.lines.map((line, index) => {
                const pending = line.quantity - line.quantityReceived;
                return (
                  <tr key={line.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">{index + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-gray-600">{line.productReference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{line.productDescription}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-gray-900">{line.quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          line.quantityReceived === line.quantity
                            ? 'text-emerald-600'
                            : line.quantityReceived > 0
                            ? 'text-amber-600'
                            : 'text-gray-400'
                        )}
                      >
                        {line.quantityReceived}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          pending > 0 ? 'text-red-600' : 'text-gray-400'
                        )}
                      >
                        {pending}
                      </span>
                    </td>
                    {canViewCosts && (
                      <>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm text-gray-900">
                            {formatCurrency(line.unitCostFOB)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {formatCurrency(line.totalFOB)}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  Totales:
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-bold text-gray-900">{totalQuantityOrdered}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-bold text-emerald-600">{totalQuantityReceived}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={cn('text-sm font-bold', totalPending > 0 ? 'text-red-600' : 'text-gray-400')}>
                    {totalPending}
                  </span>
                </td>
                {canViewCosts && (
                  <>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {formatCurrency(order.totalFOB)}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Costs Section - Only for authorized roles */}
      {canViewCosts && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-200 bg-white"
        >
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Costos e Internación</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium uppercase text-gray-500">Sub-Total FOB</p>
                <p className="font-mono text-xl font-bold text-gray-900">{formatCurrency(order.totalFOB)}</p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="mb-1 text-xs font-medium uppercase text-gray-500">% Gastos Internación</p>
                <p className="font-mono text-xl font-bold text-gray-900">
                  {order.expensePercentage ? `${order.expensePercentage}%` : '-'}
                </p>
                {order.totalExpenses && (
                  <p className="mt-1 text-xs text-gray-500">
                    = {formatCurrency(order.totalExpenses)}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="mb-1 text-xs font-medium uppercase text-emerald-700">Total CIF</p>
                <p className="font-mono text-xl font-bold text-emerald-700">
                  {order.totalCIF ? formatCurrency(order.totalCIF) : '-'}
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  Costo real aterrizado
                </p>
              </div>
            </div>

            {/* CIF Formula explanation */}
            <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3">
              <p className="text-xs text-sky-800">
                <strong>Fórmula CIF:</strong> Total FOB × (1 + %Gastos/100) = Total CIF
                {order.totalFOB && order.expensePercentage && (
                  <span className="ml-2 font-mono">
                    {formatCurrency(order.totalFOB)} × {(1 + order.expensePercentage / 100).toFixed(2)} ={' '}
                    {formatCurrency(order.totalFOB * (1 + order.expensePercentage / 100))}
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notes Section */}
      {order.notes && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-gray-200 bg-white"
        >
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Notas</h2>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700">{order.notes}</p>
          </div>
        </motion.div>
      )}

      {/* Receive Merchandise Modal */}
      <CustomModal isOpen={isReceiveOpen} onClose={() => setIsReceiveOpen(false)} size="3xl" scrollable>
          <CustomModalHeader onClose={() => setIsReceiveOpen(false)}>
              <PackageCheck className="h-5 w-5 text-emerald-600" />
              Recibir Mercancía
          </CustomModalHeader>
          <CustomModalBody className="space-y-4">
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Proveedor:</span>
                  <span className="ml-2 font-medium text-gray-900">{order.supplierName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Factura:</span>
                  <span className="ml-2 font-mono font-medium text-gray-900">
                    {order.supplierInvoice || '-'}
                  </span>
                </div>
              </div>

              {/* Quantities Confirmation */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-900">Confirmar cantidades recibidas</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                          Producto
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                          Ordenado
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                          Recibido
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                          Pendiente
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.lines.map((line) => {
                        const pending = line.quantity - line.quantityReceived;
                        return (
                          <tr key={line.id}>
                            <td className="px-3 py-2">
                              <div className="max-w-[250px]">
                                <p className="truncate text-sm text-gray-900">{line.productDescription}</p>
                                <p className="text-xs text-gray-500">{line.productReference}</p>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="text-sm text-gray-900">{line.quantity}</span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Input
                                type="number"
                                size="sm"
                                defaultValue={String(pending)}
                                className="w-20"
                                classNames={{ inputWrapper: 'bg-white' }}
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className={cn('text-sm', pending > 0 ? 'text-amber-600' : 'text-gray-400')}>
                                0
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expenses */}
              {canViewCosts && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-900">Gastos de internación</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="% Gastos de internación"
                      type="number"
                      value={expensePercentage}
                      onChange={(e) => setExpensePercentage(e.target.value)}
                      variant="bordered"
                      classNames={{ inputWrapper: 'bg-white' }}
                      endContent={<span className="text-gray-400">%</span>}
                      description="Porcentaje total sobre FOB"
                    />
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">Total gastos estimado</p>
                      <p className="font-mono text-lg font-bold text-gray-900">
                        {formatCurrency(order.totalFOB * (parseFloat(expensePercentage) / 100))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Impact Preview */}
              {canViewCosts && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-gray-900">Impacto en costos</h3>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2 text-sm text-amber-800">
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        Al confirmar, los costos promedio ponderados se actualizarán automáticamente.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CustomModalBody>
          <CustomModalFooter>
            <Button variant="light" onPress={() => setIsReceiveOpen(false)}>
              Cancelar
            </Button>
            <Button
              color="success"
              onPress={() => {
                toast.success('Mercancía recibida', {
                  description: `La orden ${order.orderNumber} ha sido procesada exitosamente.`,
                });
                setIsReceiveOpen(false);
                router.push('/compras');
              }}
            >
              Confirmar Recepción
            </Button>
          </CustomModalFooter>
      </CustomModal>
    </div>
  );
}
