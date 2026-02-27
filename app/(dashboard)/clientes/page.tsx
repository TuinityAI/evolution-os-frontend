'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/hooks/use-store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Button,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import {
  Users,
  Building2,
  CreditCard,
  MapPin,
  Search,
  Plus,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  DollarSign,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getClientsData,
  subscribeClients,
  getClientStats,
  getCreditStatus,
  getUniqueCountries,
} from '@/lib/mock-data/clients';
import { getCxCStats } from '@/lib/mock-data/accounts-receivable';
import { formatCurrency, formatDate } from '@/lib/mock-data/sales-orders';
import type { Client, PriceLevel, ClientStatus } from '@/lib/types/client';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/contexts/auth-context';

const PRICE_LEVELS: PriceLevel[] = ['A', 'B', 'C', 'D', 'E'];

const STATUS_CONFIG: Record<ClientStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  active: { label: 'Activo', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle2 },
  inactive: { label: 'Inactivo', bg: 'bg-gray-500/10', text: 'text-gray-500', icon: XCircle },
  blocked: { label: 'Bloqueado', bg: 'bg-red-500/10', text: 'text-red-500', icon: AlertTriangle },
};

const PRICE_LEVEL_COLORS: Record<PriceLevel, string> = {
  A: 'bg-emerald-500/10 text-emerald-500',
  B: 'bg-blue-500/10 text-blue-500',
  C: 'bg-amber-500/10 text-amber-500',
  D: 'bg-orange-500/10 text-orange-500',
  E: 'bg-red-500/10 text-red-500',
};

export default function ClientesPage() {
  const router = useRouter();
  const { checkPermission } = useAuth();
  const canManageClients = checkPermission('canManageClients');

  const clients = useStore(subscribeClients, getClientsData);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priceLevelFilter, setPriceLevelFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  // Get stats
  const stats = getClientStats();
  const cxcStats = getCxCStats();
  const countries = getUniqueCountries();

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        !searchQuery ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.tradeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.taxId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      const matchesPriceLevel = priceLevelFilter === 'all' || client.priceLevel === priceLevelFilter;
      const matchesCountry = countryFilter === 'all' || client.country === countryFilter;
      return matchesSearch && matchesStatus && matchesPriceLevel && matchesCountry;
    });
  }, [clients, searchQuery, statusFilter, priceLevelFilter, countryFilter]);

  const fmtCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

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
            <Users className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Clientes</h1>
            <p className="text-sm text-gray-500 dark:text-[#888888]">Gestión de clientes y cuentas por cobrar</p>
          </div>
        </div>
        {canManageClients && (
          <Button
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => router.push('/clientes/nuevo')}
            className="bg-brand-700"
          >
            Nuevo Cliente
          </Button>
        )}
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] p-1 w-fit">
        <button
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
        >
          Directorio de Clientes
        </button>
        <button
          onClick={() => router.push('/clientes/cxc')}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Cuentas por Cobrar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: 'Total Clientes', value: stats.totalClients, icon: Users, color: 'blue' },
          { label: 'Activos', value: stats.activeClients, icon: CheckCircle2, color: 'emerald' },
          { label: 'Con Crédito', value: stats.withCreditAvailable, icon: CreditCard, color: 'purple' },
          { label: 'Bloqueados', value: stats.blockedClients, icon: AlertTriangle, color: 'red' },
          { label: 'Total Pendiente CxC', value: fmtCurrency(cxcStats.totalReceivable), icon: Receipt, color: 'amber', isValue: true },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-3"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                stat.color === 'blue' && 'bg-blue-50 dark:bg-blue-950',
                stat.color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-950',
                stat.color === 'purple' && 'bg-purple-50 dark:bg-purple-950',
                stat.color === 'red' && 'bg-red-50 dark:bg-red-950',
                stat.color === 'amber' && 'bg-amber-50 dark:bg-amber-950',
              )}>
                <stat.icon className={cn(
                  'h-5 w-5',
                  stat.color === 'blue' && 'text-blue-600',
                  stat.color === 'emerald' && 'text-emerald-600',
                  stat.color === 'purple' && 'text-purple-600',
                  stat.color === 'red' && 'text-red-600',
                  stat.color === 'amber' && 'text-amber-600',
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
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID o RUC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#666666] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <Select
          className="w-36"
          selectedKeys={[statusFilter]}
          onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
          variant="bordered"
          placeholder="Estado"
          aria-label="Filtrar por estado"
        >
          <SelectItem key="all">Todos</SelectItem>
          <SelectItem key="active">Activos</SelectItem>
          <SelectItem key="inactive">Inactivos</SelectItem>
          <SelectItem key="blocked">Bloqueados</SelectItem>
        </Select>
        <Select
          className="w-36"
          selectedKeys={[priceLevelFilter]}
          onSelectionChange={(keys) => setPriceLevelFilter(Array.from(keys)[0] as string)}
          variant="bordered"
          placeholder="Nivel"
          aria-label="Filtrar por nivel"
          items={[{ key: 'all', label: 'Todos' }, ...PRICE_LEVELS.map((l) => ({ key: l, label: `Nivel ${l}` }))]}
        >
          {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
        </Select>
        <Select
          className="w-48"
          selectedKeys={[countryFilter]}
          onSelectionChange={(keys) => setCountryFilter(Array.from(keys)[0] as string)}
          variant="bordered"
          placeholder="País"
          aria-label="Filtrar por país"
          items={[{ key: 'all', label: 'Todos' }, ...countries.map((c) => ({ key: c, label: c }))]}
        >
          {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
        </Select>
      </div>

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#141414] py-16">
          <Users className="mb-4 h-12 w-12 text-gray-400 dark:text-[#666666]" />
          <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">Sin resultados</h3>
          <p className="text-sm text-gray-500 dark:text-[#888888]">No se encontraron clientes con los filtros aplicados</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Pais</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Nivel</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Credito</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Compras</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#888888]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                {filteredClients.map((client, index) => {
                  const statusConfig = STATUS_CONFIG[client.status];
                  const StatusIcon = statusConfig.icon;
                  const creditStatus = getCreditStatus(client);

                  return (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => router.push(`/clientes/${client.id}`)}
                      className="group cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#2a2a2a]">
                            <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-[#00D1B2]">
                              {client.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-[#888888]">{client.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{client.country}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold',
                          PRICE_LEVEL_COLORS[client.priceLevel]
                        )}>
                          {client.priceLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {client.creditLimit > 0 ? (
                          <div>
                            <p className={cn(
                              'font-mono font-semibold',
                              creditStatus.status === 'ok' ? 'text-gray-900 dark:text-white' :
                              creditStatus.status === 'warning' ? 'text-amber-500' :
                              'text-red-500'
                            )}>
                              {formatCurrency(client.creditAvailable)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-[#888888]">
                              de {formatCurrency(client.creditLimit)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-[#888888]">Contado</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-mono font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(client.totalPurchases || 0)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-[#888888]">
                          {client.totalOrders || 0} pedidos
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                          statusConfig.bg,
                          statusConfig.text
                        )}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => router.push(`/clientes/${client.id}`)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-[#666666] transition-colors hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-gray-600 dark:hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {canManageClients && (
                            <button
                              onClick={() => router.push(`/clientes/${client.id}/editar`)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-[#666666] transition-colors hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-gray-600 dark:hover:text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-center text-sm text-gray-500 dark:text-[#888888]">
        Mostrando {filteredClients.length} de {clients.length} clientes
      </div>
    </motion.div>
  );
}
