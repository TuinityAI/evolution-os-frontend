'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Button,
} from '@heroui/react';
import {
  Receipt,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  CreditCard,
  FileText,
  ArrowRight,
  Users,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getCxCStats,
  getAgingData,
  getTopClientsByBalance,
  MOCK_ACCOUNTS_RECEIVABLE,
  formatCurrencyCxC,
} from '@/lib/mock-data/accounts-receivable';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/contexts/auth-context';
import { formatDate } from '@/lib/mock-data/sales-orders';
import {
  CXC_STATUS_LABELS,
  CXC_STATUS_CONFIG,
} from '@/lib/types/accounts-receivable';

export default function CxCDashboardPage() {
  const router = useRouter();
  const { checkPermission } = useAuth();
  const canAccessCxC = checkPermission('canAccessCxC');
  const canRegisterPayments = checkPermission('canRegisterPayments');

  const stats = getCxCStats();
  const agingData = getAgingData();
  const topClients = getTopClientsByBalance(10);

  // Overdue invoices (morosidad alerts)
  const overdueInvoices = useMemo(() => {
    return MOCK_ACCOUNTS_RECEIVABLE
      .filter((ar) => ar.daysOverdue > 0 && ar.status !== 'anulado' && ar.status !== 'pagado')
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 8);
  }, []);

  if (!canAccessCxC) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Ban className="mb-4 h-12 w-12 text-gray-400 dark:text-[#666666]" />
        <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Acceso restringido</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-[#888888]">No tienes permisos para acceder a Cuentas por Cobrar.</p>
        <Button color="primary" onPress={() => router.push('/clientes')} className="bg-brand-700">
          Volver a Clientes
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
            <Receipt className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Cuentas por Cobrar</h1>
            <p className="text-sm text-gray-500 dark:text-[#888888]">Dashboard de cobranza y antiguedad de saldos</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canRegisterPayments && (
            <button
              onClick={() => router.push('/clientes/cxc/cobro')}
              className="flex h-9 items-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              <DollarSign className="h-4 w-4" />
              Registrar Cobro
            </button>
          )}
          <button
            onClick={() => router.push('/clientes/cxc/estados-cuenta')}
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
          >
            <FileText className="h-4 w-4" />
            Estados de Cuenta
          </button>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] p-1 w-fit">
        <button
          onClick={() => router.push('/clientes')}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Directorio de Clientes
        </button>
        <button
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
        >
          Cuentas por Cobrar
        </button>
      </div>

      {/* Quick Navigation */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => router.push('/clientes/cxc/transacciones')}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-3 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
        >
          <Clock className="h-3.5 w-3.5" />
          Transacciones
        </button>
        <button
          onClick={() => router.push('/clientes/cxc/anulaciones')}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-3 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
        >
          <Ban className="h-3.5 w-3.5" />
          Anulaciones
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        {[
          { label: 'Total CxC', value: formatCurrencyCxC(stats.totalReceivable), icon: Receipt, color: 'blue', isValue: true },
          { label: 'Corriente', value: formatCurrencyCxC(stats.currentAmount), icon: TrendingUp, color: 'emerald', isValue: true },
          { label: '1-30 dias', value: formatCurrencyCxC(stats.overdue1_30), icon: Clock, color: 'amber', isValue: true },
          { label: '31-60 dias', value: formatCurrencyCxC(stats.overdue31_60), icon: Clock, color: 'orange', isValue: true },
          { label: '61-90 dias', value: formatCurrencyCxC(stats.overdue61_90), icon: AlertTriangle, color: 'red-light', isValue: true },
          { label: '90+ dias', value: formatCurrencyCxC(stats.overdue90Plus), icon: AlertTriangle, color: 'red', isValue: true },
          { label: 'Cobros del Mes', value: formatCurrencyCxC(stats.collectionsThisMonth), icon: DollarSign, color: 'emerald', isValue: true },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-3"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                stat.color === 'blue' && 'bg-blue-50 dark:bg-blue-950',
                stat.color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-950',
                stat.color === 'amber' && 'bg-amber-50 dark:bg-amber-950',
                stat.color === 'orange' && 'bg-orange-50 dark:bg-orange-950',
                stat.color === 'red-light' && 'bg-red-50 dark:bg-red-950',
                stat.color === 'red' && 'bg-red-50 dark:bg-red-950',
              )}>
                <stat.icon className={cn(
                  'h-4 w-4',
                  stat.color === 'blue' && 'text-blue-600',
                  stat.color === 'emerald' && 'text-emerald-600',
                  stat.color === 'amber' && 'text-amber-600',
                  stat.color === 'orange' && 'text-orange-600',
                  stat.color === 'red-light' && 'text-red-400',
                  stat.color === 'red' && 'text-red-600',
                )} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="truncate text-[10px] text-gray-500 dark:text-[#888888]">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Aging Bar Chart */}
        <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-6">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Antiguedad de Saldos</h3>
          <div className="space-y-4">
            {agingData.map((bucket) => (
              <div key={bucket.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{bucket.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{formatCurrencyCxC(bucket.amount)}</span>
                    <span className="w-12 text-right text-xs text-gray-500 dark:text-[#888888]">{bucket.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-[#2a2a2a]">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', bucket.color)}
                    style={{ width: `${Math.max(bucket.percentage, 1)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-[#666666]">{bucket.count} {bucket.count === 1 ? 'factura' : 'facturas'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Clients by Balance */}
        <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414]">
          <div className="border-b border-gray-200 dark:border-[#2a2a2a] p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Top 10 Clientes por Saldo</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Cliente</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Saldo</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Facturas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                {topClients.map((client, idx) => (
                  <tr
                    key={client.clientId}
                    onClick={() => router.push(`/clientes/${client.clientId}`)}
                    className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{client.clientName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrencyCxC(client.balance)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="rounded-full bg-gray-100 dark:bg-[#2a2a2a] px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                        {client.invoiceCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Morosidad Alerts */}
      <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414]">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-[#888888]">Alertas de Morosidad</h3>
          </div>
          <button
            onClick={() => router.push('/clientes/cxc/transacciones')}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Ver todas
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Factura</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Cliente</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Vencimiento</th>
                <th className="px-4 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Dias Vencido</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Saldo</th>
                <th className="px-4 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
              {overdueInvoices.map((inv) => {
                const invStatus = CXC_STATUS_CONFIG[inv.status];
                return (
                  <tr key={inv.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{inv.clientName}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500 dark:text-[#888888]">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn(
                        'font-mono text-sm font-bold',
                        inv.daysOverdue > 90 ? 'text-red-600' :
                        inv.daysOverdue > 60 ? 'text-red-400' :
                        inv.daysOverdue > 30 ? 'text-orange-500' :
                        'text-amber-500'
                      )}>
                        {inv.daysOverdue}d
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrencyCxC(inv.balance)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        invStatus.bg,
                        invStatus.text
                      )}>
                        {CXC_STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
