'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Card, CardBody, CardHeader, Divider, Progress, Avatar, Button, Chip } from '@heroui/react';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  Users,
  Truck,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  ClipboardList,
  Calendar,
  BarChart3,
  Target,
  Boxes,
  ChevronRight,
  Sparkles,
  Award,
  AlertCircle,
  Ship,
  Building2,
  TrendingDown,
  Percent,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ============================================
// MOCK DATA - Business Intelligence
// ============================================

const STATS = [
  {
    label: 'Total Productos',
    value: '1,247',
    change: '+12',
    changeType: 'positive' as const,
    icon: Package,
    color: 'brand',
    href: '/productos',
  },
  {
    label: 'Órdenes Pendientes',
    value: '23',
    change: '5 urgentes',
    changeType: 'warning' as const,
    icon: ShoppingCart,
    color: 'warning',
    href: '/compras',
  },
  {
    label: 'Ventas del Mes',
    value: '$847,320',
    change: '+18.2%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    color: 'success',
    href: '/ventas',
  },
  {
    label: 'Productos Bajo Mínimo',
    value: '18',
    change: '3 sin stock',
    changeType: 'negative' as const,
    icon: AlertTriangle,
    color: 'danger',
    href: '/inventario?filter=low_stock',
  },
];

const KPIS = [
  { label: 'Meta Mensual', current: 847320, target: 1000000, unit: '$', icon: Target, color: 'brand' },
  { label: 'Órdenes Procesadas', current: 156, target: 200, unit: '', icon: ShoppingCart, color: 'info' },
  { label: 'Rotación Inventario', current: 4.2, target: 5.0, unit: 'x', icon: RotateCcw, color: 'success' },
  { label: 'Margen Promedio', current: 21, target: 25, unit: '%', icon: Percent, color: 'warning' },
];

const WEEKLY_SALES = [
  { day: 'Lun', value: 45000, target: 50000 },
  { day: 'Mar', value: 52000, target: 50000 },
  { day: 'Mié', value: 48000, target: 50000 },
  { day: 'Jue', value: 61000, target: 50000 },
  { day: 'Vie', value: 55000, target: 50000 },
  { day: 'Sáb', value: 42000, target: 40000 },
  { day: 'Dom', value: 25000, target: 30000 },
];

const MONTHLY_REVENUE = [
  { month: 'Sep', revenue: 720000, profit: 144000 },
  { month: 'Oct', revenue: 680000, profit: 136000 },
  { month: 'Nov', revenue: 750000, profit: 157500 },
  { month: 'Dic', revenue: 920000, profit: 193200 },
  { month: 'Ene', revenue: 810000, profit: 170100 },
  { month: 'Feb', revenue: 847320, profit: 177937 },
];

const TOP_PRODUCTS = [
  { id: 1, name: 'WHISKY JOHNNIE WALKER BLACK 12YRS', reference: 'EVL-00003', sold: 245, revenue: 48755, trend: 'up', percentChange: 12 },
  { id: 2, name: 'TEQUILA DON JULIO 1942', reference: 'EVL-00004', sold: 89, revenue: 54040, trend: 'up', percentChange: 8 },
  { id: 3, name: 'VODKA GREY GOOSE ORIGINAL', reference: 'EVL-00008', sold: 178, revenue: 21360, trend: 'down', percentChange: -3 },
  { id: 4, name: 'WHISKY CHIVAS REGAL 12YRS', reference: 'EVL-00009', sold: 156, revenue: 22412, trend: 'up', percentChange: 15 },
  { id: 5, name: 'RON DIPLOMÁTICO RESERVA', reference: 'EVL-00010', sold: 134, revenue: 16080, trend: 'up', percentChange: 5 },
];

const TOP_CUSTOMERS = [
  { id: 1, name: 'BRAND DISTRIBUIDOR CURACAO', country: 'Curazao', purchases: 125400, orders: 12, avatar: 'BD' },
  { id: 2, name: 'TRIPLE DOUBLE TRADING', country: 'Panamá', purchases: 98750, orders: 8, avatar: 'TD' },
  { id: 3, name: 'CARIBBEAN SPIRITS LLC', country: 'Puerto Rico', purchases: 87200, orders: 15, avatar: 'CS' },
  { id: 4, name: 'DUTY FREE AMERICAS', country: 'USA', purchases: 76500, orders: 6, avatar: 'DF' },
  { id: 5, name: 'ISLAND BEVERAGES CO', country: 'Bahamas', purchases: 65800, orders: 9, avatar: 'IB' },
];

const PENDING_APPROVALS = [
  { id: 'AJ-00001', type: 'adjustment', title: 'Ajuste de Inventario', description: 'Rotura - 5 unidades', createdBy: 'Ariel (Tráfico)', createdAt: '2026-02-20', value: 339.25, status: 'pendiente' },
  { id: 'AJ-00005', type: 'adjustment', title: 'Ajuste de Inventario', description: 'Merma - 1 unidad', createdBy: 'Ariel (Tráfico)', createdAt: '2026-02-22', value: 59.80, status: 'pendiente' },
  { id: 'TR-00001', type: 'transfer', title: 'Transferencia B2B→B2C', description: 'Bodega ZL → Tienda PTY', createdBy: 'Celly (Compras)', createdAt: '2026-02-21', value: 599.15, status: 'enviada' },
];

const UPCOMING_SHIPMENTS = [
  { id: 'OC-03568', supplier: 'DIAGEO PANAMA', items: 450, eta: '2026-02-28', status: 'in_transit', vessel: 'MSC CAROLINA' },
  { id: 'OC-03569', supplier: 'PERNOD RICARD', items: 280, eta: '2026-03-02', status: 'confirmed', vessel: 'MAERSK DENVER' },
  { id: 'OC-03570', supplier: 'BACARDI GLOBAL', items: 320, eta: '2026-03-05', status: 'processing', vessel: 'Pendiente' },
  { id: 'OC-03571', supplier: 'BEAM SUNTORY', items: 185, eta: '2026-03-08', status: 'processing', vessel: 'Pendiente' },
];

const INVENTORY_ALERTS = [
  { id: 1, product: 'WHISKY BLACK & WHITE 24X375ML', reference: 'EVL-00001', type: 'out_of_stock', current: 0, minimum: 20, severity: 'critical' },
  { id: 2, product: 'VODKA ABSOLUT FIVE MINI 18X5X50ML', reference: 'EVL-00012', type: 'stagnant', monthsWithoutSale: 58, severity: 'warning' },
  { id: 3, product: 'WHISKY CROWN ROYAL CORCHO', reference: 'EVL-00011', type: 'low_stock', current: 2, minimum: 20, severity: 'warning' },
  { id: 4, product: 'TEQUILA CLASE AZUL REPOSADO', reference: 'EVL-00005', type: 'low_stock', current: 7, minimum: 15, severity: 'medium' },
];

const RECENT_ACTIVITY = [
  { id: 1, action: 'Nueva orden de compra', description: 'OC-03567 creada para TRIPLE DOUBLE TRADING', time: 'Hace 5 min', type: 'purchase' },
  { id: 2, action: 'Entrada de mercancía', description: 'OC-03566 recibida - 355 cajas', time: 'Hace 1 hora', type: 'inventory' },
  { id: 3, action: 'Nueva cotización', description: 'COT-2024-0892 para BRAND DISTRIBUIDOR CURACAO', time: 'Hace 2 horas', type: 'sale' },
  { id: 4, action: 'Producto bajo mínimo', description: 'WHISKY JOHNNIE WALKER BLACK - Stock: 30 cajas', time: 'Hace 3 horas', type: 'alert' },
  { id: 5, action: 'Transferencia confirmada', description: 'TR-00002 recibida en Tienda PTY', time: 'Hace 4 horas', type: 'transfer' },
  { id: 6, action: 'Ajuste aprobado', description: 'AJ-00002 aprobado por Javier', time: 'Hace 5 horas', type: 'adjustment' },
];

const CALENDAR_EVENTS = [
  { id: 1, title: 'Llegada contenedor DIAGEO', date: '2026-02-28', type: 'shipment' },
  { id: 2, title: 'Reunión con Pernod Ricard', date: '2026-03-01', type: 'meeting' },
  { id: 3, title: 'Conteo físico Zona A', date: '2026-03-03', type: 'inventory' },
  { id: 4, title: 'Vencimiento crédito BACARDI', date: '2026-03-05', type: 'payment' },
  { id: 5, title: 'Auditoría trimestral', date: '2026-03-10', type: 'audit' },
];

// ============================================
// COMPONENT
// ============================================

export default function DashboardPage() {
  const { user, checkPermission } = useAuth();
  const router = useRouter();
  const canViewCosts = checkPermission('canViewCosts');
  const canApproveAdjustments = checkPermission('canApproveAdjustments');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const maxWeeklySale = Math.max(...WEEKLY_SALES.map(d => d.value));
  const totalWeeklySales = WEEKLY_SALES.reduce((sum, d) => sum + d.value, 0);
  const weeklyTarget = WEEKLY_SALES.reduce((sum, d) => sum + d.target, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Bienvenido, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Aquí está el resumen de tu actividad comercial • {new Date().toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="bordered"
            size="sm"
            startContent={<Calendar className="h-4 w-4" />}
          >
            Febrero 2026
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid - Main 4 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STATS.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            brand: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
            success: 'bg-success-bg text-success',
            warning: 'bg-warning-bg text-warning',
            danger: 'bg-danger-bg text-danger',
          };

          return (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card
                isPressable
                onPress={() => router.push(stat.href)}
                className="border border-border-default bg-surface-main shadow-sm transition-all hover:border-brand-200 hover:shadow-md"
              >
                <CardBody className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-text-primary">{stat.value}</p>
                      <div className="mt-2 flex items-center gap-1">
                        {stat.changeType === 'positive' && <ArrowUpRight className="h-4 w-4 text-success" />}
                        {stat.changeType === 'negative' && <ArrowDownRight className="h-4 w-4 text-danger" />}
                        <span className={cn('text-xs font-medium', stat.changeType === 'positive' ? 'text-success' : stat.changeType === 'negative' ? 'text-danger' : 'text-warning')}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorClasses[stat.color as keyof typeof colorClasses])}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* KPIs Row - All together */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          const progress = (kpi.current / kpi.target) * 100;
          const isOnTrack = progress >= 80;

          const colorClasses = {
            brand: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
            info: 'bg-info-bg text-info',
            success: 'bg-success-bg text-success',
            warning: 'bg-warning-bg text-warning',
          };

          return (
            <motion.div key={kpi.label} variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', colorClasses[kpi.color as keyof typeof colorClasses])}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-text-secondary">{kpi.label}</span>
                    </div>
                    <span className={cn('text-lg font-bold', isOnTrack ? 'text-success' : 'text-warning')}>
                      {kpi.unit === '$' ? formatCurrency(kpi.current) : `${kpi.current}${kpi.unit}`}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(progress, 100)}
                    color={isOnTrack ? 'success' : 'warning'}
                    size="sm"
                    className="h-1.5"
                  />
                  <p className="mt-2 text-xs text-text-muted">
                    Meta: {kpi.unit === '$' ? formatCurrency(kpi.target) : `${kpi.target}${kpi.unit}`} • {progress.toFixed(0)}%
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row - Sales + Monthly */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Weekly Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="border border-border-default bg-surface-main shadow-sm">
            <CardHeader className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                  <BarChart3 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Ventas de la Semana</h3>
                  <p className="text-xs text-text-muted">Comparativa con meta diaria</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <span className="text-text-secondary">Ventas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2.5 w-2.5 rounded-full bg-text-muted/30" />
                  <span className="text-text-secondary">Meta</span>
                </div>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalWeeklySales)}</p>
                  <p className="text-sm text-text-secondary">
                    {totalWeeklySales >= weeklyTarget ? (
                      <span className="text-success">+{((totalWeeklySales / weeklyTarget - 1) * 100).toFixed(1)}% sobre meta</span>
                    ) : (
                      <span className="text-danger">{((totalWeeklySales / weeklyTarget - 1) * 100).toFixed(1)}% bajo meta</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex h-48 items-end justify-between gap-3">
                {WEEKLY_SALES.map((day, index) => {
                  const heightPercent = (day.value / maxWeeklySale) * 100;
                  const targetPercent = (day.target / maxWeeklySale) * 100;
                  const isAboveTarget = day.value >= day.target;

                  return (
                    <div key={day.day} className="group relative flex flex-1 flex-col items-center">
                      <div className="relative flex h-40 w-full flex-col justify-end">
                        {/* Target line */}
                        <div
                          className="absolute left-0 right-0 border-t-2 border-dashed border-text-muted/30"
                          style={{ bottom: `${targetPercent}%` }}
                        />
                        {/* Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
                          className={cn(
                            'w-full rounded-t-md transition-colors',
                            isAboveTarget
                              ? 'bg-brand-500 group-hover:bg-brand-600 dark:bg-brand-600 dark:group-hover:bg-brand-500'
                              : 'bg-warning group-hover:bg-warning/80'
                          )}
                        />
                      </div>
                      <p className="mt-2 text-xs font-medium text-text-secondary">{day.day}</p>
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-surface-secondary px-3 py-2 text-xs text-text-primary opacity-0 shadow-lg ring-1 ring-border-default transition-opacity group-hover:opacity-100 dark:bg-surface-tertiary">
                        <p className="font-semibold">{formatCurrency(day.value)}</p>
                        <p className="text-text-muted">Meta: {formatCurrency(day.target)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="border border-border-default bg-surface-main shadow-sm">
            <CardHeader className="flex items-center gap-3 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-bg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Tendencia Mensual</h3>
                <p className="text-xs text-text-muted">Últimos 6 meses</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-4">
              <div className="space-y-3">
                {MONTHLY_REVENUE.map((month, index) => {
                  const maxRevenue = Math.max(...MONTHLY_REVENUE.map(m => m.revenue));
                  const widthPercent = (month.revenue / maxRevenue) * 100;
                  const isCurrentMonth = index === MONTHLY_REVENUE.length - 1;

                  return (
                    <div key={month.month} className="flex items-center gap-3">
                      <span className={cn('w-8 text-xs font-medium', isCurrentMonth ? 'text-brand-600 dark:text-brand-400' : 'text-text-muted')}>
                        {month.month}
                      </span>
                      <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-surface-secondary">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPercent}%` }}
                          transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
                          className={cn(
                            'absolute inset-y-0 left-0 rounded-md',
                            isCurrentMonth
                              ? 'bg-brand-500 dark:bg-brand-600'
                              : 'bg-brand-200 dark:bg-brand-800'
                          )}
                        />
                      </div>
                      {canViewCosts && (
                        <span className={cn('w-20 text-right text-xs font-semibold', isCurrentMonth ? 'text-text-primary' : 'text-text-secondary')}>
                          {formatCurrency(month.revenue)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Pending Approvals + Inventory Alerts */}
      {canApproveAdjustments && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pending Approvals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="border border-border-default bg-surface-main shadow-sm">
              <CardHeader className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-bg">
                    <ClipboardList className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">Pendientes de Aprobación</h3>
                    <p className="text-xs text-text-muted">{PENDING_APPROVALS.length} items requieren acción</p>
                  </div>
                </div>
                <Chip color="warning" variant="flat" size="sm">
                  {PENDING_APPROVALS.length}
                </Chip>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                <ul className="divide-y divide-border-default">
                  {PENDING_APPROVALS.map((item) => (
                    <li
                      key={item.id}
                      className="cursor-pointer px-5 py-4 transition-colors hover:bg-surface-secondary"
                      onClick={() => router.push(item.type === 'adjustment' ? `/inventario/ajustes/${item.id}` : `/inventario/transferencias/${item.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full',
                            item.type === 'adjustment' ? 'bg-info-bg text-info' : 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                          )}>
                            {item.type === 'adjustment' ? <FileText className="h-4 w-4" /> : <ArrowRightLeft className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{item.id}</p>
                            <p className="text-xs text-text-secondary">{item.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {canViewCosts && (
                            <p className="text-sm font-semibold text-text-primary">{formatCurrency(item.value)}</p>
                          )}
                          <p className="text-xs text-text-muted">{item.createdBy}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </motion.div>

          {/* Inventory Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border border-border-default bg-surface-main shadow-sm">
              <CardHeader className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-bg">
                    <AlertCircle className="h-5 w-5 text-danger" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">Alertas de Inventario</h3>
                    <p className="text-xs text-text-muted">Productos que requieren atención</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => router.push('/inventario?filter=low_stock')}
                >
                  Ver todos
                </Button>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                <ul className="divide-y divide-border-default">
                  {INVENTORY_ALERTS.map((alert) => (
                    <li key={alert.id} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full',
                            alert.severity === 'critical' ? 'bg-danger-bg text-danger' :
                            alert.severity === 'warning' ? 'bg-warning-bg text-warning' :
                            'bg-warning-bg/50 text-warning'
                          )}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary line-clamp-1">{alert.product}</p>
                            <p className="text-xs text-text-muted">{alert.reference}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {alert.type === 'out_of_stock' && (
                            <Chip color="danger" variant="flat" size="sm">Sin Stock</Chip>
                          )}
                          {alert.type === 'low_stock' && (
                            <Chip color="warning" variant="flat" size="sm">{alert.current}/{alert.minimum}</Chip>
                          )}
                          {alert.type === 'stagnant' && (
                            <Chip color="secondary" variant="flat" size="sm">{alert.monthsWithoutSale} meses</Chip>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Upcoming Shipments + Top Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Shipments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="border border-border-default bg-surface-main shadow-sm">
            <CardHeader className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-bg">
                  <Ship className="h-5 w-5 text-info" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Próximos Embarques</h3>
                  <p className="text-xs text-text-muted">Mercancía en tránsito</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="light"
                onPress={() => router.push('/trafico')}
              >
                Ver todos
              </Button>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              <ul className="divide-y divide-border-default">
                {UPCOMING_SHIPMENTS.map((shipment) => (
                  <li key={shipment.id} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          shipment.status === 'in_transit' ? 'bg-success-bg' :
                          shipment.status === 'confirmed' ? 'bg-info-bg' : 'bg-surface-secondary'
                        )}>
                          <Truck className={cn(
                            'h-5 w-5',
                            shipment.status === 'in_transit' ? 'text-success' :
                            shipment.status === 'confirmed' ? 'text-info' : 'text-text-muted'
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text-primary">{shipment.id}</p>
                            {shipment.status === 'in_transit' && (
                              <Chip color="success" variant="dot" size="sm">En tránsito</Chip>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary">{shipment.supplier}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-text-primary">{shipment.items} cajas</p>
                        <p className="text-xs text-text-muted">ETA: {new Date(shipment.eta).toLocaleDateString('es-PA', { day: '2-digit', month: 'short' })}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border border-border-default bg-surface-main shadow-sm">
            <CardHeader className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                  <Award className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Top Productos</h3>
                  <p className="text-xs text-text-muted">Más vendidos este mes</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="light"
                onPress={() => router.push('/reportes')}
              >
                Ver reporte
              </Button>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              <ul className="divide-y divide-border-default">
                {TOP_PRODUCTS.slice(0, 4).map((product, index) => (
                  <li key={product.id} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                          index === 0 ? 'bg-warning-bg text-warning' :
                          index === 1 ? 'bg-surface-tertiary text-text-secondary' :
                          index === 2 ? 'bg-warning-bg/50 text-warning' : 'bg-surface-secondary text-text-muted'
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary line-clamp-1">{product.name}</p>
                          <p className="text-xs text-text-muted">{product.sold} unidades</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canViewCosts && (
                          <p className="text-sm font-semibold text-text-primary">{formatCurrency(product.revenue)}</p>
                        )}
                        <span className={cn(
                          'flex items-center text-xs font-medium',
                          product.trend === 'up' ? 'text-success' : 'text-danger'
                        )}>
                          {product.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(product.percentChange)}%
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Top Customers + Calendar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="lg:col-span-2"
        >
          <Card className="border border-border-default bg-surface-main shadow-sm">
            <CardHeader className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-bg">
                  <Users className="h-5 w-5 text-info" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Principales Clientes</h3>
                  <p className="text-xs text-text-muted">Por volumen de compras este mes</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="light"
                onPress={() => router.push('/clientes')}
              >
                Ver todos
              </Button>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-default bg-surface-secondary">
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">Cliente</th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">País</th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">Órdenes</th>
                      {canViewCosts && (
                        <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">Compras</th>
                      )}
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {TOP_CUSTOMERS.map((customer) => (
                      <tr key={customer.id} className="hover:bg-surface-secondary">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={customer.avatar}
                              size="sm"
                              classNames={{ base: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' }}
                            />
                            <span className="text-sm font-medium text-text-primary">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-text-secondary">{customer.country}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm text-text-primary">{customer.orders}</span>
                        </td>
                        {canViewCosts && (
                          <td className="px-5 py-3 text-right">
                            <span className="text-sm font-semibold text-text-primary">{formatCurrency(customer.purchases)}</span>
                          </td>
                        )}
                        <td className="px-5 py-3 text-right">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => router.push(`/clientes/${customer.id}`)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Calendar / Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border border-border-default bg-surface-main shadow-sm">
            <CardHeader className="flex items-center gap-3 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-bg">
                <Calendar className="h-5 w-5 text-danger" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Próximos Eventos</h3>
                <p className="text-xs text-text-muted">Actividades programadas</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              <ul className="divide-y divide-border-default">
                {CALENDAR_EVENTS.map((event) => {
                  const eventDate = new Date(event.date);
                  const isToday = eventDate.toDateString() === new Date().toDateString();
                  const isSoon = eventDate <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

                  return (
                    <li key={event.id} className="px-5 py-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'flex h-10 w-10 flex-col items-center justify-center rounded-lg',
                          isToday ? 'bg-brand-500 text-white' : isSoon ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-surface-secondary'
                        )}>
                          <span className={cn('text-xs font-medium', isToday ? 'text-white' : 'text-text-muted')}>
                            {eventDate.toLocaleDateString('es-PA', { month: 'short' }).toUpperCase()}
                          </span>
                          <span className={cn('text-sm font-bold', isToday ? 'text-white' : 'text-text-primary')}>
                            {eventDate.getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{event.title}</p>
                          <div className="mt-1 flex items-center gap-2">
                            {event.type === 'shipment' && <Chip color="success" variant="flat" size="sm">Embarque</Chip>}
                            {event.type === 'meeting' && <Chip color="primary" variant="flat" size="sm">Reunión</Chip>}
                            {event.type === 'inventory' && <Chip color="secondary" variant="flat" size="sm">Inventario</Chip>}
                            {event.type === 'payment' && <Chip color="warning" variant="flat" size="sm">Pago</Chip>}
                            {event.type === 'audit' && <Chip color="danger" variant="flat" size="sm">Auditoría</Chip>}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="lg:col-span-2"
        >
          <Card className="border border-border-default bg-surface-main shadow-sm">
            <CardHeader className="flex items-center justify-between px-5 py-4">
              <h3 className="text-base font-semibold text-text-primary">Actividad Reciente</h3>
              <button className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Ver todo</button>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              <ul className="divide-y divide-border-default">
                {RECENT_ACTIVITY.map((activity) => (
                  <li key={activity.id} className="px-5 py-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        activity.type === 'purchase' ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' :
                        activity.type === 'inventory' ? 'bg-success-bg text-success' :
                        activity.type === 'sale' ? 'bg-info-bg text-info' :
                        activity.type === 'transfer' ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' :
                        activity.type === 'adjustment' ? 'bg-info-bg text-info' :
                        'bg-warning-bg text-warning'
                      )}>
                        {activity.type === 'purchase' && <ShoppingCart className="h-4 w-4" />}
                        {activity.type === 'inventory' && <Package className="h-4 w-4" />}
                        {activity.type === 'sale' && <TrendingUp className="h-4 w-4" />}
                        {activity.type === 'transfer' && <ArrowRightLeft className="h-4 w-4" />}
                        {activity.type === 'adjustment' && <FileText className="h-4 w-4" />}
                        {activity.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">{activity.action}</p>
                        <p className="mt-0.5 text-sm text-text-secondary">{activity.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border border-border-default bg-surface-main shadow-sm">
            <CardHeader className="px-5 py-4">
              <h3 className="text-base font-semibold text-text-primary">Acciones Rápidas</h3>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-2 p-4">
              <button
                onClick={() => router.push('/compras/nueva')}
                className="flex w-full items-center gap-3 rounded-lg bg-brand-600 px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                <ShoppingCart className="h-4 w-4" />
                Nueva Orden de Compra
              </button>
              <button
                onClick={() => router.push('/productos/nuevo')}
                className="flex w-full items-center gap-3 rounded-lg border border-brand-600 px-4 py-3 text-left text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-900/20"
              >
                <Package className="h-4 w-4" />
                Nuevo Producto
              </button>
              <button
                onClick={() => router.push('/ventas/nueva')}
                className="flex w-full items-center gap-3 rounded-lg border border-border-default px-4 py-3 text-left text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
              >
                <TrendingUp className="h-4 w-4" />
                Nueva Cotización
              </button>
              <button
                onClick={() => router.push('/inventario/transferencias/nueva')}
                className="flex w-full items-center gap-3 rounded-lg border border-border-default px-4 py-3 text-left text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Nueva Transferencia
              </button>
              <button
                onClick={() => router.push('/inventario/conteo/nuevo')}
                className="flex w-full items-center gap-3 rounded-lg border border-border-default px-4 py-3 text-left text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
              >
                <ClipboardList className="h-4 w-4" />
                Conteo Físico
              </button>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
