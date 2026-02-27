'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  Chip,
} from '@heroui/react';
import {
  ArrowLeft,
  Building2,
  Edit,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  ShoppingBag,
  DollarSign,
  FileText,
  Receipt,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { getClientById, getCreditStatus } from '@/lib/mock-data/clients';
import {
  getPendingInvoicesForClient,
  getPayments,
  formatCurrencyCxC,
} from '@/lib/mock-data/accounts-receivable';
import { formatCurrency, formatDate } from '@/lib/mock-data/sales-orders';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/contexts/auth-context';
import type { ClientStatus, PriceLevel } from '@/lib/types/client';
import {
  PAYMENT_TERMS_LABELS,
  PRICE_LEVEL_LABELS,
} from '@/lib/types/client';
import {
  CXC_STATUS_CONFIG,
  CXC_STATUS_LABELS,
} from '@/lib/types/accounts-receivable';

const STATUS_CONFIG: Record<ClientStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  active: { label: 'Activo', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle2 },
  inactive: { label: 'Inactivo', bg: 'bg-gray-500/10', text: 'text-gray-500', icon: XCircle },
  blocked: { label: 'Bloqueado', bg: 'bg-red-500/10', text: 'text-red-500', icon: AlertTriangle },
};

const TABS = [
  { key: 'general', label: 'General', icon: Building2 },
  { key: 'comercial', label: 'Comercial', icon: DollarSign },
  { key: 'historial', label: 'Historial', icon: Clock },
  { key: 'documentos', label: 'Documentos', icon: FileText },
  { key: 'cxc', label: 'CxC', icon: Receipt },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// Mock orders history
const MOCK_ORDERS = [
  { id: 'PED-00089', date: '2026-02-23', total: 15400, status: 'facturado' },
  { id: 'PED-00085', date: '2026-02-15', total: 22800, status: 'empacado' },
  { id: 'PED-00078', date: '2026-02-01', total: 8900, status: 'facturado' },
  { id: 'PED-00065', date: '2026-01-20', total: 34200, status: 'facturado' },
  { id: 'PED-00052', date: '2026-01-05', total: 12500, status: 'facturado' },
  { id: 'PED-00041', date: '2025-12-18', total: 45000, status: 'facturado' },
];

const ORDER_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  borrador: { label: 'Borrador', bg: 'bg-gray-500/10', text: 'text-gray-500' },
  cotizado: { label: 'Cotizado', bg: 'bg-blue-500/10', text: 'text-blue-500' },
  pedido: { label: 'Pedido', bg: 'bg-amber-500/10', text: 'text-amber-500' },
  aprobado: { label: 'Aprobado', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  empacado: { label: 'Empacado', bg: 'bg-purple-500/10', text: 'text-purple-500' },
  facturado: { label: 'Facturado', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
};

// Mock documents
const MOCK_DOCUMENTS = [
  { id: 'FAC-00015', type: 'Factura', date: '2026-02-23', amount: 15400, status: 'pendiente' },
  { id: 'FAC-00012', type: 'Factura', date: '2026-02-15', amount: 22800, status: 'parcial' },
  { id: 'COT-00045', type: 'Cotizacion', date: '2026-02-10', amount: 8500, status: 'vigente' },
  { id: 'FAC-00010', type: 'Factura', date: '2026-02-01', amount: 8900, status: 'pagado' },
  { id: 'NC-00002', type: 'Nota de Credito', date: '2026-01-25', amount: 1200, status: 'aplicada' },
  { id: 'FAC-00008', type: 'Factura', date: '2026-01-20', amount: 34200, status: 'pagado' },
];

const DOC_STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  pendiente: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  parcial: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  pagado: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  vigente: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  aplicada: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  vencido: { bg: 'bg-red-500/10', text: 'text-red-500' },
};

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const { checkPermission } = useAuth();
  const canManageClients = checkPermission('canManageClients');
  const canViewPriceLevels = checkPermission('canViewPriceLevels');

  const [activeTab, setActiveTab] = useState<TabKey>('general');

  const client = getClientById(clientId);

  const pendingInvoices = useMemo(() => {
    if (!client) return [];
    return getPendingInvoicesForClient(client.id);
  }, [client]);

  const payments = useMemo(() => {
    if (!client) return [];
    return getPayments(client.id);
  }, [client]);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="mb-4 h-12 w-12 text-gray-400 dark:text-[#666666]" />
        <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Cliente no encontrado</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-[#888888]">El cliente con ID {clientId} no existe.</p>
        <Button color="primary" onPress={() => router.push('/clientes')} className="bg-brand-700">
          Volver a Clientes
        </Button>
      </div>
    );
  }

  const creditStatus = getCreditStatus(client);
  const statusConfig = STATUS_CONFIG[client.status];
  const StatusIcon = statusConfig.icon;

  const totalCxCBalance = pendingInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push('/clientes')}
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{client.name}</h1>
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                statusConfig.bg,
                statusConfig.text
              )}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-[#888888]">
              <span className="font-mono">{client.id}</span>
              {client.tradeName && (
                <>
                  <span>|</span>
                  <span>{client.tradeName}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {canManageClients && (
          <Button
            color="primary"
            startContent={<Edit className="h-4 w-4" />}
            onPress={() => router.push(`/clientes/${client.id}/editar`)}
            className="bg-brand-700"
          >
            Editar Cliente
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 dark:text-[#888888] hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                <TabIcon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Datos de la Empresa</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-[#888888]">Razon Social</span>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">{client.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-[#888888]">Nombre Comercial</span>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">{client.tradeName || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-[#888888]">{client.taxIdType || 'Tax ID'}</span>
                    <p className="mt-1 font-mono text-gray-900 dark:text-white">{client.taxId}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-[#888888]">Pais</span>
                    <p className="mt-1 flex items-center gap-2 text-gray-900 dark:text-white">
                      <Globe className="h-4 w-4 text-gray-400" />
                      {client.country}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-[#888888]">Ciudad</span>
                    <p className="mt-1 text-gray-900 dark:text-white">{client.city || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-[#888888]">Direccion</span>
                    <p className="mt-1 text-gray-900 dark:text-white">{client.address || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Contactos</h3>
                <div className="space-y-3">
                  {client.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-[#2a2a2a] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-[#2a2a2a]">
                          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                            {contact.isPrimary && (
                              <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-600">PRINCIPAL</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-[#888888]">{contact.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-[#888888]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Addresses */}
              {client.shippingAddresses.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Direcciones de Envio</h3>
                  <div className="space-y-3">
                    {client.shippingAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-[#2a2a2a] p-4"
                      >
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{addr.label}</p>
                            {addr.isDefault && (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">PREDETERMINADA</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-[#888888]">
                            {addr.address}, {addr.city}, {addr.country}
                            {addr.postalCode && ` - ${addr.postalCode}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMERCIAL TAB */}
          {activeTab === 'comercial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Pricing & Terms */}
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Condiciones Comerciales</h3>
                  <div className="space-y-4">
                    {canViewPriceLevels && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-[#888888]">Nivel de Precio</span>
                        <span className="font-medium text-gray-900 dark:text-white">{PRICE_LEVEL_LABELS[client.priceLevel]}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-[#888888]">Terminos de Pago</span>
                      <span className="font-medium text-gray-900 dark:text-white">{PAYMENT_TERMS_LABELS[client.paymentTerms]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-[#888888]">Vendedor Asignado</span>
                      <span className="font-medium text-gray-900 dark:text-white">{client.salesRepName || 'Sin asignar'}</span>
                    </div>
                  </div>
                </div>

                {/* Credit Info */}
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Informacion de Credito</h3>
                  {client.creditLimit > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(client.creditLimit)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-[#888888]">Limite</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-amber-500">
                            {formatCurrency(client.creditUsed)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-[#888888]">Utilizado</p>
                        </div>
                        <div>
                          <p className={cn(
                            'text-xl font-bold',
                            client.creditAvailable > 0 ? 'text-emerald-500' : 'text-red-500'
                          )}>
                            {formatCurrency(client.creditAvailable)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-[#888888]">Disponible</p>
                        </div>
                      </div>
                      {/* Credit Bar */}
                      <div>
                        <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-[#888888]">
                          <span>Uso de credito</span>
                          <span>{creditStatus.percentUsed.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-[#2a2a2a]">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              creditStatus.percentUsed >= 80 ? 'bg-red-500' :
                              creditStatus.percentUsed >= 60 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            )}
                            style={{ width: `${Math.min(creditStatus.percentUsed, 100)}%` }}
                          />
                        </div>
                        <p className={cn(
                          'mt-2 text-xs font-medium',
                          creditStatus.status === 'ok' ? 'text-emerald-500' :
                          creditStatus.status === 'warning' ? 'text-amber-500' :
                          'text-red-500'
                        )}>
                          {creditStatus.message}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CreditCard className="mb-3 h-10 w-10 text-gray-300 dark:text-[#444444]" />
                      <p className="font-medium text-gray-900 dark:text-white">Cliente de Contado</p>
                      <p className="text-sm text-gray-500 dark:text-[#888888]">No tiene linea de credito asignada</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {client.notes && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Notas</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{client.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-4 text-center">
                  <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-brand-500" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.totalOrders || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-[#888888]">Pedidos Totales</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-4 text-center">
                  <DollarSign className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(client.totalPurchases || 0)}</p>
                  <p className="text-xs text-gray-500 dark:text-[#888888]">Compras Totales</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-4 text-center">
                  <TrendingUp className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(client.averageOrderValue || 0)}</p>
                  <p className="text-xs text-gray-500 dark:text-[#888888]">Ticket Promedio</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-4 text-center">
                  <Calendar className="mx-auto mb-2 h-8 w-8 text-purple-500" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {client.lastOrderDate ? formatDate(client.lastOrderDate) : '-'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[#888888]">Ultimo Pedido</p>
                </div>
              </div>
            </div>
          )}

          {/* HISTORIAL TAB */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414]">
                <div className="border-b border-gray-200 dark:border-[#2a2a2a] p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Historial de Pedidos Recientes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Pedido</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Fecha</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Total</th>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                      {MOCK_ORDERS.map((order) => {
                        const orderStatus = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.borrador;
                        return (
                          <tr key={order.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{order.id}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-[#888888]">{order.date}</td>
                            <td className="px-4 py-3 text-right font-mono text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(order.total)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn(
                                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                                orderStatus.bg,
                                orderStatus.text
                              )}>
                                {orderStatus.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTOS TAB */}
          {activeTab === 'documentos' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414]">
                <div className="border-b border-gray-200 dark:border-[#2a2a2a] p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Documentos Asociados</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Documento</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Fecha</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Monto</th>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                      {MOCK_DOCUMENTS.map((doc) => {
                        const docStatus = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG.pendiente;
                        return (
                          <tr key={doc.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{doc.id}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{doc.type}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-[#888888]">{doc.date}</td>
                            <td className="px-4 py-3 text-right font-mono text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(doc.amount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn(
                                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize',
                                docStatus.bg,
                                docStatus.text
                              )}>
                                {doc.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CXC TAB */}
          {activeTab === 'cxc' && (
            <div className="space-y-6">
              {/* Balance Summary */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrencyCxC(totalCxCBalance)}</p>
                  <p className="text-xs text-gray-500 dark:text-[#888888]">Saldo Pendiente</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-4 text-center">
                  <p className="text-2xl font-bold text-blue-500">{pendingInvoices.length}</p>
                  <p className="text-xs text-gray-500 dark:text-[#888888]">Facturas Pendientes</p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-500">{payments.length}</p>
                  <p className="text-xs text-gray-500 dark:text-[#888888]">Cobros Registrados</p>
                </div>
              </div>

              {/* Pending Invoices */}
              {pendingInvoices.length > 0 ? (
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414]">
                  <div className="border-b border-gray-200 dark:border-[#2a2a2a] p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Facturas Pendientes</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Factura</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Fecha Emision</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Vencimiento</th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Monto</th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Saldo</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Estado</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Dias Vencido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                        {pendingInvoices.map((inv) => {
                          const invStatus = CXC_STATUS_CONFIG[inv.status];
                          return (
                            <tr key={inv.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                              <td className="px-4 py-3">
                                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{inv.invoiceNumber}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 dark:text-[#888888]">{formatDate(inv.issueDate)}</td>
                              <td className="px-4 py-3 text-sm text-gray-500 dark:text-[#888888]">{formatDate(inv.dueDate)}</td>
                              <td className="px-4 py-3 text-right font-mono text-sm text-gray-600 dark:text-gray-400">
                                {formatCurrencyCxC(inv.originalAmount)}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrencyCxC(inv.balance)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={cn(
                                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                                  invStatus.bg,
                                  invStatus.text
                                )}>
                                  {CXC_STATUS_LABELS[inv.status]}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {inv.daysOverdue > 0 ? (
                                  <span className="font-mono text-sm font-semibold text-red-500">{inv.daysOverdue}d</span>
                                ) : (
                                  <span className="text-sm text-gray-400 dark:text-[#666666]">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#141414] py-12">
                  <Receipt className="mb-3 h-10 w-10 text-gray-300 dark:text-[#444444]" />
                  <p className="font-medium text-gray-900 dark:text-white">Sin facturas pendientes</p>
                  <p className="text-sm text-gray-500 dark:text-[#888888]">Este cliente no tiene cuentas por cobrar activas</p>
                </div>
              )}

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414]">
                  <div className="border-b border-gray-200 dark:border-[#2a2a2a] p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Historial de Cobros</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Cobro</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Metodo</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Referencia</th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                        {payments.map((pmt) => (
                          <tr key={pmt.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{pmt.id}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-[#888888]">{formatDate(pmt.date)}</td>
                            <td className="px-4 py-3 text-sm capitalize text-gray-600 dark:text-gray-400">{pmt.method}</td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-500 dark:text-[#888888]">{pmt.reference || '-'}</td>
                            <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-emerald-500">
                              {formatCurrencyCxC(pmt.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Aging Mini Chart */}
              {pendingInvoices.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Antiguedad de Saldos</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Corriente', bucket: 'corriente', color: 'bg-emerald-500' },
                      { label: '1-30 dias', bucket: '1_30', color: 'bg-amber-500' },
                      { label: '31-60 dias', bucket: '31_60', color: 'bg-orange-500' },
                      { label: '61-90 dias', bucket: '61_90', color: 'bg-red-400' },
                      { label: '90+ dias', bucket: '90_plus', color: 'bg-red-600' },
                    ].map((item) => {
                      const bucketAmount = pendingInvoices
                        .filter((inv) => inv.agingBucket === item.bucket)
                        .reduce((sum, inv) => sum + inv.balance, 0);
                      const percentage = totalCxCBalance > 0 ? (bucketAmount / totalCxCBalance) * 100 : 0;
                      return (
                        <div key={item.bucket} className="flex items-center gap-3">
                          <span className="w-24 text-xs text-gray-500 dark:text-[#888888]">{item.label}</span>
                          <div className="flex-1">
                            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-[#2a2a2a]">
                              <div
                                className={cn('h-full rounded-full transition-all', item.color)}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <span className="w-28 text-right font-mono text-xs font-medium text-gray-900 dark:text-white">
                            {formatCurrencyCxC(bucketAmount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
