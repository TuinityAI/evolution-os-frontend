'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  useDisclosure,
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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isNewOpen, onOpen: onNewOpen, onClose: onNewClose } = useDisclosure();

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
    onViewOpen();
  };

  const handleCreateClient = () => {
    toast.success('Cliente creado', {
      description: 'El nuevo cliente ha sido registrado exitosamente.',
    });
    onNewClose();
  };

  // Redirect if not authorized
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
          onPress={onNewOpen}
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

      {/* View Client Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="3xl">
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
              <Building2 className="h-6 w-6 text-brand-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">{selectedClient?.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedClient?.id}</p>
            </div>
            {selectedClient && (
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium',
                STATUS_CONFIG[selectedClient.status].bg,
                STATUS_CONFIG[selectedClient.status].text
              )}>
                {STATUS_CONFIG[selectedClient.status].label}
              </span>
            )}
          </ModalHeader>
          <ModalBody className="py-6">
            <Tabs aria-label="Client details" variant="underlined">
              <Tab key="info" title="Información">
                <div className="space-y-6 py-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Nombre Comercial</span>
                        <p className="font-medium text-foreground">{selectedClient?.tradeName || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">RUC / Tax ID</span>
                        <p className="font-mono text-foreground">{selectedClient?.taxId}</p>
                        <p className="text-xs text-muted-foreground">{selectedClient?.taxIdType}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">País / Ciudad</span>
                        <p className="text-foreground">{selectedClient?.country}, {selectedClient?.city}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Nivel de Precio</span>
                        <p className="flex items-center gap-2 text-foreground">
                          <span className={cn(
                            'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                            selectedClient ? PRICE_LEVEL_COLORS[selectedClient.priceLevel] : ''
                          )}>
                            {selectedClient?.priceLevel}
                          </span>
                          Nivel {selectedClient?.priceLevel}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Términos de Pago</span>
                        <p className="capitalize text-foreground">
                          {selectedClient?.paymentTerms.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Vendedor Asignado</span>
                        <p className="text-foreground">{selectedClient?.salesRepName || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Credit Info */}
                  {selectedClient && selectedClient.creditLimit > 0 && (
                    <div className="rounded-lg border border-border p-4">
                      <h4 className="mb-3 text-sm font-medium text-foreground">Información de Crédito</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {formatCurrency(selectedClient.creditLimit)}
                          </p>
                          <p className="text-xs text-muted-foreground">Límite</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-amber-500">
                            {formatCurrency(selectedClient.creditUsed)}
                          </p>
                          <p className="text-xs text-muted-foreground">Utilizado</p>
                        </div>
                        <div>
                          <p className={cn(
                            'text-2xl font-bold',
                            selectedClient.creditAvailable > 0 ? 'text-emerald-500' : 'text-red-500'
                          )}>
                            {formatCurrency(selectedClient.creditAvailable)}
                          </p>
                          <p className="text-xs text-muted-foreground">Disponible</p>
                        </div>
                      </div>
                      {/* Credit bar */}
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

                  {/* Notes */}
                  {selectedClient?.notes && (
                    <div className="rounded-lg border border-amber-500/50 bg-amber-500/5 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                        <p className="text-sm text-foreground">{selectedClient.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Tab>
              <Tab key="contacts" title="Contactos">
                <div className="space-y-3 py-4">
                  {selectedClient?.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{contact.phone}</span>
                        </div>
                        {contact.isPrimary && (
                          <Chip size="sm" color="primary" variant="flat">Principal</Chip>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Tab>
              <Tab key="stats" title="Estadísticas">
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border p-4 text-center">
                      <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-brand-500" />
                      <p className="text-3xl font-bold text-foreground">{selectedClient?.totalOrders || 0}</p>
                      <p className="text-sm text-muted-foreground">Pedidos Totales</p>
                    </div>
                    <div className="rounded-lg border border-border p-4 text-center">
                      <DollarSign className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                      <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(selectedClient?.totalPurchases || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Compras Totales</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">Ticket Promedio</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(selectedClient?.averageOrderValue || 0)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground">Último Pedido</p>
                      <p className="text-lg font-medium text-foreground">
                        {selectedClient?.lastOrderDate ? formatDate(selectedClient.lastOrderDate) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </ModalBody>
          <ModalFooter className="border-t border-border pt-4">
            <Button variant="light" onPress={onViewClose}>
              Cerrar
            </Button>
            <Button color="primary" startContent={<Edit className="h-4 w-4" />}>
              Editar Cliente
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New Client Modal */}
      <Modal isOpen={isNewOpen} onClose={onNewClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
              <Plus className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Nuevo Cliente</h2>
              <p className="text-sm text-muted-foreground">Registrar un nuevo cliente B2B</p>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre / Razón Social"
                  placeholder="EMPRESA S.A."
                  variant="bordered"
                  labelPlacement="outside"
                  isRequired
                />
                <Input
                  label="Nombre Comercial"
                  placeholder="Nombre de fantasía"
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="RUC / Tax ID"
                  placeholder="000-000000-0-000000"
                  variant="bordered"
                  labelPlacement="outside"
                  isRequired
                />
                <Select
                  label="Tipo de Documento"
                  variant="bordered"
                  labelPlacement="outside"
                >
                  <SelectItem key="RUC">RUC</SelectItem>
                  <SelectItem key="NIT">NIT</SelectItem>
                  <SelectItem key="EIN">EIN</SelectItem>
                  <SelectItem key="VAT">VAT</SelectItem>
                  <SelectItem key="Cedula">Cédula</SelectItem>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="País"
                  variant="bordered"
                  labelPlacement="outside"
                  isRequired
                  items={countries.map((c) => ({ key: c, label: c }))}
                >
                  {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                </Select>
                <Input
                  label="Ciudad"
                  placeholder="Ciudad"
                  variant="bordered"
                  labelPlacement="outside"
                />
              </div>
              <Input
                label="Dirección"
                placeholder="Dirección completa"
                variant="bordered"
                labelPlacement="outside"
              />
              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Nivel de Precio"
                  variant="bordered"
                  labelPlacement="outside"
                  isRequired
                  items={PRICE_LEVELS.map((l) => ({ key: l, label: `Nivel ${l}` }))}
                >
                  {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                </Select>
                <Select
                  label="Términos de Pago"
                  variant="bordered"
                  labelPlacement="outside"
                  isRequired
                >
                  <SelectItem key="contado">Contado</SelectItem>
                  <SelectItem key="credito_15">Crédito 15 días</SelectItem>
                  <SelectItem key="credito_30">Crédito 30 días</SelectItem>
                  <SelectItem key="credito_45">Crédito 45 días</SelectItem>
                  <SelectItem key="credito_60">Crédito 60 días</SelectItem>
                </Select>
                <Input
                  label="Límite de Crédito"
                  placeholder="0.00"
                  type="number"
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<span className="text-muted-foreground">$</span>}
                />
              </div>
              {/* Contact */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-4 text-sm font-medium text-foreground">Contacto Principal</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    placeholder="Nombre del contacto"
                    variant="bordered"
                    labelPlacement="outside"
                    isRequired
                  />
                  <Input
                    label="Cargo"
                    placeholder="Gerente, Director, etc."
                    variant="bordered"
                    labelPlacement="outside"
                  />
                  <Input
                    label="Email"
                    placeholder="email@empresa.com"
                    type="email"
                    variant="bordered"
                    labelPlacement="outside"
                    isRequired
                  />
                  <Input
                    label="Teléfono"
                    placeholder="+507 000-0000"
                    variant="bordered"
                    labelPlacement="outside"
                  />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-border pt-4">
            <Button variant="light" onPress={onNewClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleCreateClient}>
              Crear Cliente
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
