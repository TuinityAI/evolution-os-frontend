'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  useDisclosure,
} from '@heroui/react';
import {
  ArrowLeft,
  Edit,
  Printer,
  Building2,
  Package,
  Calendar,
  FileText,
  AlertCircle,
  Send,
  CheckCircle2,
  ThumbsUp,
  PackageCheck,
  FileCheck,
  XCircle,
  User,
  CreditCard,
  Truck,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getSalesOrderById,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '@/lib/mock-data/sales-orders';
import { getClientById } from '@/lib/mock-data/clients';
import type { SalesOrderStatus } from '@/lib/types/sales-order';
import { STATUS_CONFIG, DOCUMENT_TYPE_LABELS } from '@/lib/types/sales-order';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/contexts/auth-context';
import { useState } from 'react';

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { checkPermission, user } = useAuth();
  const canViewMargins = checkPermission('canViewMargins');
  const canApproveOrders = checkPermission('canApproveOrders');
  const canCreateQuotes = checkPermission('canCreateQuotes');
  const canPackOrders = checkPermission('canPackOrders');
  const canCreateInvoices = checkPermission('canCreateInvoices');
  const isVendedor = user?.role === 'vendedor';

  const orderId = params.id as string;
  const order = getSalesOrderById(orderId);
  const client = order ? getClientById(order.customerId) : null;

  const [approvalNotes, setApprovalNotes] = useState('');
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-lg font-medium text-foreground">Documento no encontrado</h2>
        <p className="mb-4 text-sm text-muted-foreground">El documento {orderId} no existe o fue eliminado.</p>
        <Button color="primary" onPress={() => router.push('/ventas')}>
          Volver a Ventas
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status];
  const docTypeLabel = order.documentType === 'cotizacion' ? 'COT' : order.documentType === 'pedido' ? 'PED' : 'FAC';

  // Check if all lines are commission eligible
  const allLinesEligible = order.lines.every((l) => l.commissionEligible);

  // Actions based on status
  const canSendQuote = order.status === 'borrador' && canCreateQuotes;
  const canConvertToOrder = order.status === 'cotizado' && canCreateQuotes;
  const canApprove = order.status === 'pedido' && canApproveOrders;
  const canPack = order.status === 'aprobado' && canPackOrders;
  const canInvoice = order.status === 'empacado' && canCreateInvoices;
  const canEdit = order.status === 'borrador' && canCreateQuotes;

  const handleSendQuote = () => {
    toast.success('Cotización enviada', {
      description: `La cotización ${order.orderNumber} ha sido enviada al cliente.`,
    });
  };

  const handleConvertToOrder = () => {
    toast.success('Convertido a Pedido', {
      description: `La cotización ha sido convertida a pedido. ${order.requiresApproval ? 'Requiere aprobación de gerencia.' : ''}`,
    });
    router.push('/ventas');
  };

  const handleApprove = () => {
    toast.success('Pedido aprobado', {
      description: `El pedido ${order.orderNumber} ha sido aprobado y está listo para empacar.`,
    });
    onApproveClose();
    router.push('/ventas');
  };

  const handleReject = () => {
    toast.error('Pedido rechazado', {
      description: `El pedido ${order.orderNumber} ha sido rechazado.`,
    });
    onRejectClose();
    router.push('/ventas');
  };

  const handlePack = () => {
    toast.success('Empaque registrado', {
      description: `El pedido ${order.orderNumber} ha sido marcado como empacado.`,
    });
    router.push('/ventas');
  };

  const handleInvoice = () => {
    toast.success('Factura generada', {
      description: `Se ha generado la factura para el pedido ${order.orderNumber}.`,
    });
    router.push('/ventas');
  };

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
            onClick={() => router.push('/ventas')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                  order.documentType === 'cotizacion' && 'bg-blue-500/10 text-blue-500',
                  order.documentType === 'pedido' && 'bg-purple-500/10 text-purple-500',
                  order.documentType === 'factura' && 'bg-teal-500/10 text-teal-500'
                )}
              >
                {DOCUMENT_TYPE_LABELS[order.documentType]}
              </span>
              <h1 className="font-mono text-2xl font-semibold text-foreground">{order.orderNumber}</h1>
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
            <p className="mt-1 text-sm text-muted-foreground">
              Creado el {formatDate(order.createdAt)} por {order.createdByName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canSendQuote && (
            <Button
              color="primary"
              onPress={handleSendQuote}
              startContent={<Send className="h-4 w-4" />}
            >
              Enviar Cotización
            </Button>
          )}
          {canConvertToOrder && (
            <Button
              color="primary"
              onPress={handleConvertToOrder}
              startContent={<CheckCircle2 className="h-4 w-4" />}
            >
              Convertir a Pedido
            </Button>
          )}
          {canApprove && (
            <>
              <Button
                color="success"
                onPress={onApproveOpen}
                startContent={<ThumbsUp className="h-4 w-4" />}
              >
                Aprobar
              </Button>
              <Button
                color="danger"
                variant="bordered"
                onPress={onRejectOpen}
                startContent={<XCircle className="h-4 w-4" />}
              >
                Rechazar
              </Button>
            </>
          )}
          {canPack && (
            <Button
              color="warning"
              onPress={handlePack}
              startContent={<PackageCheck className="h-4 w-4" />}
            >
              Marcar Empacado
            </Button>
          )}
          {canInvoice && (
            <Button
              color="success"
              onPress={handleInvoice}
              startContent={<FileCheck className="h-4 w-4" />}
            >
              Generar Factura
            </Button>
          )}
          {canEdit && (
            <Button
              variant="bordered"
              startContent={<Edit className="h-4 w-4" />}
              onPress={() => toast.info('Editar', { description: 'Funcionalidad próximamente.' })}
            >
              Editar
            </Button>
          )}
          <Button
            variant="bordered"
            startContent={<Printer className="h-4 w-4" />}
            onPress={() => toast.info('Imprimir', { description: 'Generando PDF...' })}
          >
            Imprimir
          </Button>
        </div>
      </motion.div>

      {/* Requires Approval Warning */}
      {order.status === 'pedido' && order.requiresApproval && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg bg-amber-500/10 p-4 text-amber-500"
        >
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-medium">Este pedido requiere aprobación</p>
            <p className="text-sm opacity-80">Contiene líneas con margen menor al 10%. Un gerente debe aprobar antes de continuar.</p>
          </div>
        </motion.div>
      )}

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        {/* Customer Card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Cliente</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-foreground">{order.customerName}</span>
              <p className="text-muted-foreground">{order.customerTaxId}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">País:</span>
              <span className="text-foreground">{order.customerCountry}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Nivel:</span>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                order.priceLevel === 'A' && 'bg-emerald-500/10 text-emerald-500',
                order.priceLevel === 'B' && 'bg-blue-500/10 text-blue-500',
                order.priceLevel === 'C' && 'bg-purple-500/10 text-purple-500',
                order.priceLevel === 'D' && 'bg-amber-500/10 text-amber-500',
                order.priceLevel === 'E' && 'bg-muted text-muted-foreground'
              )}>
                Nivel {order.priceLevel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Pago:</span>
              <span className="text-foreground">
                {order.paymentTerms === 'contado' ? 'Contado' :
                  order.paymentTerms.replace('credito_', 'Crédito ') + ' días'}
              </span>
            </div>
            {client && (
              <div className="flex items-center gap-2 border-t border-border pt-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Crédito:</span>
                <span className={cn(
                  'font-mono font-medium',
                  client.creditAvailable > 0 ? 'text-emerald-500' : 'text-red-500'
                )}>
                  {formatCurrency(client.creditAvailable)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dates Card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Fechas</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Creación:</span>
              <span className="text-foreground">{formatDate(order.createdAt)}</span>
            </div>
            {order.validUntil && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Válido hasta:</span>
                <span className="text-foreground">{formatDate(order.validUntil)}</span>
              </div>
            )}
            {order.requestedDeliveryDate && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Entrega solicitada:</span>
                <span className="text-foreground">{formatDate(order.requestedDeliveryDate)}</span>
              </div>
            )}
            {order.approvalDate && (
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Aprobado:</span>
                <span className="text-foreground">{formatDate(order.approvalDate)}</span>
              </div>
            )}
            {order.packedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Empacado:</span>
                <span className="text-foreground">{formatDate(order.packedAt)}</span>
              </div>
            )}
            {order.actualDeliveryDate && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Entregado:</span>
                <span className="text-foreground">{formatDate(order.actualDeliveryDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Totals Card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Totales</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-mono text-foreground">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.expensesTotal > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gastos:</span>
                <span className="font-mono text-foreground">{formatCurrency(order.expensesTotal)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ITBMS ({order.taxRate}%):</span>
              <span className="font-mono text-foreground">{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-medium text-foreground">Total:</span>
              <span className="font-mono text-lg font-bold text-foreground">{formatCurrency(order.total)}</span>
            </div>

            {/* Margin info - only for gerencia/contabilidad */}
            {canViewMargins && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Costo:</span>
                  <span className="font-mono text-foreground">{formatCurrency(order.totalCost || 0)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Margen:</span>
                  <span className={cn(
                    'font-mono font-medium',
                    (order.marginPercent || 0) >= 10 ? 'text-emerald-500' : 'text-red-500'
                  )}>
                    {formatCurrency(order.totalMargin || 0)} ({order.marginPercent?.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}

            {/* Commission indicator for vendedor */}
            {isVendedor && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <span
                  className={cn(
                    'h-4 w-4 rounded-full',
                    allLinesEligible ? 'bg-emerald-500' : 'bg-red-500'
                  )}
                />
                <span className="text-sm text-muted-foreground">
                  {allLinesEligible ? 'Este documento genera comisión' : 'Este documento NO genera comisión'}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Pipeline Links */}
      {(order.quoteNumber || order.invoiceNumber) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
        >
          <span className="text-sm text-muted-foreground">Documentos relacionados:</span>
          {order.quoteNumber && (
            <button
              onClick={() => router.push(`/ventas/${order.quoteId}`)}
              className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-500 hover:bg-blue-500/20"
            >
              <FileText className="h-4 w-4" />
              {order.quoteNumber}
            </button>
          )}
          {order.invoiceNumber && (
            <button
              onClick={() => router.push(`/ventas/${order.invoiceId}`)}
              className="flex items-center gap-2 rounded-lg bg-teal-500/10 px-3 py-1.5 text-sm font-medium text-teal-500 hover:bg-teal-500/20"
            >
              <FileCheck className="h-4 w-4" />
              {order.invoiceNumber}
            </button>
          )}
        </motion.div>
      )}

      {/* Order Lines Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="border-b border-border bg-muted/50 px-5 py-3">
          <h3 className="font-medium text-foreground">Líneas del Documento ({order.lines.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Producto
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Cantidad
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Precio Unit.
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Descuento
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Subtotal
                </th>
                {canViewMargins && (
                  <>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Costo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Margen
                    </th>
                  </>
                )}
                {isVendedor && (
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Comisión
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.lines.map((line, index) => (
                <motion.tr
                  key={line.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                  className="transition-colors hover:bg-accent/50"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{line.productDescription}</p>
                      <p className="text-xs text-muted-foreground">{line.productReference}</p>
                      {line.productBrand && (
                        <span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {line.productBrand}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm text-foreground">{line.quantity}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm text-foreground">{formatCurrency(line.unitPrice)}</span>
                    {line.lastPriceToCustomer && line.lastPriceToCustomer !== line.unitPrice && (
                      <p className="text-xs text-muted-foreground">
                        Anterior: {formatCurrency(line.lastPriceToCustomer)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-muted-foreground">{line.discount}%</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm font-medium text-foreground">
                      {formatCurrency(line.subtotal)}
                    </span>
                  </td>
                  {canViewMargins && (
                    <>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-muted-foreground">
                          {formatCurrency(line.unitCost || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          'font-mono text-sm font-medium',
                          (line.marginPercent || 0) >= 10 ? 'text-emerald-500' : 'text-red-500'
                        )}>
                          {line.marginPercent?.toFixed(1)}%
                        </span>
                      </td>
                    </>
                  )}
                  {isVendedor && (
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'inline-flex h-4 w-4 rounded-full',
                          line.commissionEligible ? 'bg-emerald-500' : 'bg-red-500'
                        )}
                        title={line.commissionEligible ? 'Comisiona' : 'No comisiona'}
                      />
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Additional Expenses */}
      {order.additionalExpenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-card"
        >
          <div className="border-b border-border bg-muted/50 px-5 py-3">
            <h3 className="font-medium text-foreground">Gastos Adicionales</h3>
          </div>
          <div className="p-5">
            <table className="w-full">
              <tbody className="divide-y divide-border">
                {order.additionalExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="py-2 text-sm text-foreground">{expense.description}</td>
                    <td className="py-2 text-right">
                      <span className="font-mono text-sm text-foreground">{formatCurrency(expense.amount)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Notes */}
      {(order.notes || order.internalNotes) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {order.notes && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 font-medium text-foreground">Notas para el Cliente</h3>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
          {order.internalNotes && canViewMargins && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
              <h3 className="mb-3 font-medium text-amber-500">Notas Internas</h3>
              <p className="text-sm text-amber-500/80">{order.internalNotes}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Approval History */}
      {order.approvedByName && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <h3 className="mb-3 font-medium text-foreground">Historial de Aprobación</h3>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
              <ThumbsUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-foreground">Aprobado por <span className="font-medium">{order.approvedByName}</span></p>
              <p className="text-muted-foreground">{order.approvalDate && formatDateTime(order.approvalDate)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Approve Modal */}
      <Modal isOpen={isApproveOpen} onClose={onApproveClose} size="md">
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <ThumbsUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Aprobar Pedido</h2>
              <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              {order.requiresApproval && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-500">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium">Atención</p>
                    <p className="opacity-80">Este pedido tiene líneas con margen menor al 10%.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cliente:</span>
                  <p className="font-medium text-foreground">{order.customerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <p className="font-mono font-medium text-foreground">{formatCurrency(order.total)}</p>
                </div>
                {canViewMargins && (
                  <div>
                    <span className="text-muted-foreground">Margen:</span>
                    <p className={cn(
                      'font-mono font-medium',
                      (order.marginPercent || 0) >= 10 ? 'text-emerald-500' : 'text-red-500'
                    )}>
                      {order.marginPercent?.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>

              <Textarea
                label="Notas de aprobación (opcional)"
                placeholder="Agregar comentarios..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                variant="bordered"
                minRows={2}
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-border pt-4">
            <Button variant="light" onPress={onApproveClose}>
              Cancelar
            </Button>
            <Button color="success" onPress={handleApprove}>
              Aprobar Pedido
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={isRejectOpen} onClose={onRejectClose} size="md">
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Rechazar Pedido</h2>
              <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <Textarea
              label="Motivo del rechazo *"
              placeholder="Explica el motivo del rechazo..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              variant="bordered"
              minRows={3}
            />
          </ModalBody>
          <ModalFooter className="border-t border-border pt-4">
            <Button variant="light" onPress={onRejectClose}>
              Cancelar
            </Button>
            <Button color="danger" onPress={handleReject} isDisabled={!approvalNotes.trim()}>
              Rechazar Pedido
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
