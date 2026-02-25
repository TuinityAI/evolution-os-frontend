'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
} from '@heroui/react';
import {
  Users,
  Building2,
  CreditCard,
  MapPin,
  Search,
  Plus,
  AlertCircle,
  Phone,
  Mail,
  User,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  Eye,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  MOCK_CLIENTS,
  getClientStats,
  getCreditStatus,
  getUniqueCountries,
} from '@/lib/mock-data/clients';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priceLevelFilter, setPriceLevelFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  // Modal/Drawer states
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'contacts' | 'stats'>('info');

  // Form state for new client
  const [newClientData, setNewClientData] = useState({
    name: '',
    tradeName: '',
    taxId: '',
    taxIdType: 'RUC',
    country: '',
    city: '',
    address: '',
    priceLevel: '' as PriceLevel | '',
    paymentTerms: 'contado',
    creditLimit: '',
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Get stats
  const stats = getClientStats();
  const countries = getUniqueCountries();

  // Filter clients
  const filteredClients = useMemo(() => {
    return MOCK_CLIENTS.filter((client) => {
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
  }, [searchQuery, statusFilter, priceLevelFilter, countryFilter]);

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setActiveTab('info');
    setIsViewOpen(true);
  };

  const resetNewClientForm = () => {
    setNewClientData({
      name: '',
      tradeName: '',
      taxId: '',
      taxIdType: 'RUC',
      country: '',
      city: '',
      address: '',
      priceLevel: '',
      paymentTerms: 'contado',
      creditLimit: '',
      contactName: '',
      contactRole: '',
      contactEmail: '',
      contactPhone: '',
    });
  };

  const handleCreateClient = () => {
    if (!newClientData.name.trim()) {
      toast.error('Campo requerido', { description: 'El nombre del cliente es obligatorio.' });
      return;
    }
    if (!newClientData.taxId.trim()) {
      toast.error('Campo requerido', { description: 'El RUC / Tax ID es obligatorio.' });
      return;
    }
    if (!newClientData.country) {
      toast.error('Campo requerido', { description: 'El país es obligatorio.' });
      return;
    }
    if (!newClientData.priceLevel) {
      toast.error('Campo requerido', { description: 'El nivel de precio es obligatorio.' });
      return;
    }
    if (!newClientData.contactEmail.trim()) {
      toast.error('Campo requerido', { description: 'El email del contacto es obligatorio.' });
      return;
    }

    setIsCreating(true);

    setTimeout(() => {
      toast.success('Cliente creado', {
        description: `El cliente ${newClientData.name} ha sido registrado exitosamente.`,
      });
      resetNewClientForm();
      setIsCreating(false);
      setIsNewOpen(false);
    }, 500);
  };

  const handleEditClient = (client: Client) => {
    toast.info('Editar cliente', {
      description: `La edición de ${client.name} estará disponible próximamente.`,
    });
  };

  if (!canManageClients) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-amber-500" />
        <h2 className="mb-2 text-lg font-medium text-foreground">Acceso restringido</h2>
        <p className="mb-4 text-sm text-muted-foreground">No tienes permisos para gestionar clientes.</p>
        <Button color="primary" onPress={() => router.push('/ventas')}>
          Volver a Ventas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes B2B</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión de clientes y créditos
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => setIsNewOpen(true)}
        >
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.totalClients}</p>
              <p className="text-sm text-muted-foreground">Total Clientes</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.activeClients}</p>
              <p className="text-sm text-muted-foreground">Activos</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <CreditCard className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.withCreditAvailable}</p>
              <p className="text-sm text-muted-foreground">Con Crédito</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.blockedClients}</p>
              <p className="text-sm text-muted-foreground">Bloqueados</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, ID o RUC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            variant="bordered"
          />
        </div>
        <Select
          className="w-36"
          selectedKeys={[statusFilter]}
          onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
          variant="bordered"
          label="Estado"
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
          label="Nivel"
          items={[{ key: 'all', label: 'Todos' }, ...PRICE_LEVELS.map((l) => ({ key: l, label: `Nivel ${l}` }))]}
        >
          {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
        </Select>
        <Select
          className="w-48"
          selectedKeys={[countryFilter]}
          onSelectionChange={(keys) => setCountryFilter(Array.from(keys)[0] as string)}
          variant="bordered"
          label="País"
          items={[{ key: 'all', label: 'Todos' }, ...countries.map((c) => ({ key: c, label: c }))]}
        >
          {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
        </Select>
      </div>

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
          <Users className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-1 text-lg font-medium text-foreground">Sin resultados</h3>
          <p className="text-sm text-muted-foreground">No se encontraron clientes con los filtros aplicados</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">País</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Nivel</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Crédito</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Compras</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.map((client) => {
                  const statusConfig = STATUS_CONFIG[client.status];
                  const StatusIcon = statusConfig.icon;
                  const creditStatus = getCreditStatus(client);

                  return (
                    <tr key={client.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                              creditStatus.status === 'ok' ? 'text-foreground' :
                              creditStatus.status === 'warning' ? 'text-amber-500' :
                              'text-red-500'
                            )}>
                              {formatCurrency(client.creditAvailable)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              de {formatCurrency(client.creditLimit)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Contado</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-mono font-semibold text-foreground">
                          {formatCurrency(client.totalPurchases || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => handleViewClient(client)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => handleEditClient(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Client Drawer */}
      <AnimatePresence>
        {isViewOpen && selectedClient && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewOpen(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto bg-white dark:bg-[#141414] shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white dark:bg-[#141414] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
                    <Building2 className="h-5 w-5 text-brand-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{selectedClient.name}</h2>
                    <p className="text-xs text-muted-foreground">{selectedClient.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                    STATUS_CONFIG[selectedClient.status].bg,
                    STATUS_CONFIG[selectedClient.status].text
                  )}>
                    {STATUS_CONFIG[selectedClient.status].label}
                  </span>
                  <button
                    onClick={() => setIsViewOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-border">
                <div className="flex gap-1 px-4">
                  {(['info', 'contacts', 'stats'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'px-4 py-3 text-sm font-medium transition-colors',
                        activeTab === tab
                          ? 'border-b-2 border-brand-500 text-brand-500'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {tab === 'info' && 'Información'}
                      {tab === 'contacts' && 'Contactos'}
                      {tab === 'stats' && 'Estadísticas'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Nombre Comercial</span>
                        <p className="font-medium text-foreground">{selectedClient.tradeName || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">RUC / Tax ID</span>
                        <p className="font-mono text-foreground">{selectedClient.taxId}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">País / Ciudad</span>
                        <p className="text-foreground">{selectedClient.country}, {selectedClient.city}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Nivel de Precio</span>
                        <p className="flex items-center gap-2 text-foreground">
                          <span className={cn(
                            'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                            PRICE_LEVEL_COLORS[selectedClient.priceLevel]
                          )}>
                            {selectedClient.priceLevel}
                          </span>
                          Nivel {selectedClient.priceLevel}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Términos de Pago</span>
                        <p className="capitalize text-foreground">
                          {selectedClient.paymentTerms.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Vendedor Asignado</span>
                        <p className="text-foreground">{selectedClient.salesRepName || '-'}</p>
                      </div>
                    </div>

                    {selectedClient.creditLimit > 0 && (
                      <div className="rounded-lg border border-border p-4">
                        <h4 className="mb-3 text-sm font-medium text-foreground">Información de Crédito</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xl font-bold text-foreground">
                              {formatCurrency(selectedClient.creditLimit)}
                            </p>
                            <p className="text-xs text-muted-foreground">Límite</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-amber-500">
                              {formatCurrency(selectedClient.creditUsed)}
                            </p>
                            <p className="text-xs text-muted-foreground">Utilizado</p>
                          </div>
                          <div>
                            <p className={cn(
                              'text-xl font-bold',
                              selectedClient.creditAvailable > 0 ? 'text-emerald-500' : 'text-red-500'
                            )}>
                              {formatCurrency(selectedClient.creditAvailable)}
                            </p>
                            <p className="text-xs text-muted-foreground">Disponible</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                'h-full transition-all',
                                selectedClient.creditUsed / selectedClient.creditLimit > 0.8
                                  ? 'bg-red-500'
                                  : 'bg-brand-500'
                              )}
                              style={{
                                width: `${Math.min((selectedClient.creditUsed / selectedClient.creditLimit) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedClient.notes && (
                      <div className="rounded-lg border border-amber-500/50 bg-amber-500/5 p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                          <p className="text-sm text-foreground">{selectedClient.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'contacts' && (
                  <div className="space-y-3">
                    {selectedClient.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.role}</p>
                          </div>
                          {contact.isPrimary && (
                            <Chip size="sm" color="primary" variant="flat">Principal</Chip>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border border-border p-4 text-center">
                        <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-brand-500" />
                        <p className="text-2xl font-bold text-foreground">{selectedClient.totalOrders || 0}</p>
                        <p className="text-sm text-muted-foreground">Pedidos Totales</p>
                      </div>
                      <div className="rounded-lg border border-border p-4 text-center">
                        <DollarSign className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(selectedClient.totalPurchases || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Compras Totales</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border border-border p-4">
                        <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                        <p className="text-xl font-bold text-foreground">
                          {formatCurrency(selectedClient.averageOrderValue || 0)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border p-4">
                        <p className="text-sm text-muted-foreground">Último Pedido</p>
                        <p className="text-lg font-medium text-foreground">
                          {selectedClient.lastOrderDate ? formatDate(selectedClient.lastOrderDate) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 border-t border-border bg-white dark:bg-[#141414] p-4">
                <div className="flex gap-3">
                  <Button variant="light" className="flex-1" onPress={() => setIsViewOpen(false)}>
                    Cerrar
                  </Button>
                  <Button
                    color="primary"
                    className="flex-1"
                    startContent={<Edit className="h-4 w-4" />}
                    onPress={() => {
                      handleEditClient(selectedClient);
                      setIsViewOpen(false);
                    }}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Client Modal */}
      <AnimatePresence>
        {isNewOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isCreating) {
                  setIsNewOpen(false);
                  resetNewClientForm();
                }
              }}
              className="fixed inset-0 z-50 bg-black/50"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white dark:bg-[#141414] shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
                    <Plus className="h-5 w-5 text-brand-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Nuevo Cliente</h2>
                    <p className="text-xs text-muted-foreground">Registrar un nuevo cliente B2B</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isCreating) {
                      setIsNewOpen(false);
                      resetNewClientForm();
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <div className="max-h-[60vh] overflow-y-auto p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Nombre / Razón Social <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="EMPRESA S.A."
                        variant="bordered"
                        value={newClientData.name}
                        onChange={(e) => setNewClientData((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Nombre Comercial
                      </label>
                      <Input
                        placeholder="Nombre de fantasía"
                        variant="bordered"
                        value={newClientData.tradeName}
                        onChange={(e) => setNewClientData((prev) => ({ ...prev, tradeName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        RUC / Tax ID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="000-000000-0-000000"
                        variant="bordered"
                        value={newClientData.taxId}
                        onChange={(e) => setNewClientData((prev) => ({ ...prev, taxId: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Tipo de Documento
                      </label>
                      <Select
                        placeholder="Seleccionar..."
                        variant="bordered"
                        selectedKeys={newClientData.taxIdType ? [newClientData.taxIdType] : []}
                        onSelectionChange={(keys) => setNewClientData((prev) => ({ ...prev, taxIdType: Array.from(keys)[0] as string }))}
                      >
                        <SelectItem key="RUC">RUC</SelectItem>
                        <SelectItem key="NIT">NIT</SelectItem>
                        <SelectItem key="EIN">EIN</SelectItem>
                        <SelectItem key="VAT">VAT</SelectItem>
                        <SelectItem key="Cedula">Cédula</SelectItem>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        País <span className="text-red-500">*</span>
                      </label>
                      <Select
                        placeholder="Seleccionar país..."
                        variant="bordered"
                        items={countries.map((c) => ({ key: c, label: c }))}
                        selectedKeys={newClientData.country ? [newClientData.country] : []}
                        onSelectionChange={(keys) => setNewClientData((prev) => ({ ...prev, country: Array.from(keys)[0] as string }))}
                      >
                        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Ciudad
                      </label>
                      <Input
                        placeholder="Ciudad"
                        variant="bordered"
                        value={newClientData.city}
                        onChange={(e) => setNewClientData((prev) => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Dirección
                    </label>
                    <Input
                      placeholder="Dirección completa"
                      variant="bordered"
                      value={newClientData.address}
                      onChange={(e) => setNewClientData((prev) => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Nivel de Precio <span className="text-red-500">*</span>
                      </label>
                      <Select
                        placeholder="Seleccionar..."
                        variant="bordered"
                        items={PRICE_LEVELS.map((l) => ({ key: l, label: `Nivel ${l}` }))}
                        selectedKeys={newClientData.priceLevel ? [newClientData.priceLevel] : []}
                        onSelectionChange={(keys) => setNewClientData((prev) => ({ ...prev, priceLevel: Array.from(keys)[0] as PriceLevel }))}
                      >
                        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Términos de Pago <span className="text-red-500">*</span>
                      </label>
                      <Select
                        placeholder="Seleccionar..."
                        variant="bordered"
                        selectedKeys={newClientData.paymentTerms ? [newClientData.paymentTerms] : []}
                        onSelectionChange={(keys) => setNewClientData((prev) => ({ ...prev, paymentTerms: Array.from(keys)[0] as string }))}
                      >
                        <SelectItem key="contado">Contado</SelectItem>
                        <SelectItem key="credito_15">Crédito 15 días</SelectItem>
                        <SelectItem key="credito_30">Crédito 30 días</SelectItem>
                        <SelectItem key="credito_45">Crédito 45 días</SelectItem>
                        <SelectItem key="credito_60">Crédito 60 días</SelectItem>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Límite de Crédito
                      </label>
                      <Input
                        placeholder="0.00"
                        type="number"
                        variant="bordered"
                        startContent={<span className="text-muted-foreground">$</span>}
                        value={newClientData.creditLimit}
                        onChange={(e) => setNewClientData((prev) => ({ ...prev, creditLimit: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="mb-4 text-sm font-medium text-foreground">Contacto Principal</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="Nombre del contacto"
                          variant="bordered"
                          value={newClientData.contactName}
                          onChange={(e) => setNewClientData((prev) => ({ ...prev, contactName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          Cargo
                        </label>
                        <Input
                          placeholder="Gerente, Director, etc."
                          variant="bordered"
                          value={newClientData.contactRole}
                          onChange={(e) => setNewClientData((prev) => ({ ...prev, contactRole: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="email@empresa.com"
                          type="email"
                          variant="bordered"
                          value={newClientData.contactEmail}
                          onChange={(e) => setNewClientData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          Teléfono
                        </label>
                        <Input
                          placeholder="+507 000-0000"
                          variant="bordered"
                          value={newClientData.contactPhone}
                          onChange={(e) => setNewClientData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 border-t border-border p-4">
                <Button
                  variant="light"
                  className="flex-1"
                  onPress={() => {
                    if (!isCreating) {
                      setIsNewOpen(false);
                      resetNewClientForm();
                    }
                  }}
                  isDisabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  className="flex-1"
                  onPress={handleCreateClient}
                  isLoading={isCreating}
                >
                  Crear Cliente
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
