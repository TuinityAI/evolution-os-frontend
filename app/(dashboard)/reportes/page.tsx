'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Card, CardBody, CardHeader, Divider, Progress, Button, Chip, Tabs, Tab } from '@heroui/react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Target,
  Percent,
  RotateCcw,
  Boxes,
  FileText,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe,
  Building2,
  Truck,
  CreditCard,
  Activity,
  PieChart,
  LineChart,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ============================================
// MOCK DATA - Comprehensive Metrics
// ============================================

// General Business Metrics (visible to all)
const GENERAL_METRICS = {
  totalOrders: { value: 847, change: 12.5, label: 'Órdenes del Mes', icon: ShoppingCart },
  activeClients: { value: 156, change: 8.2, label: 'Clientes Activos', icon: Users },
  productsInCatalog: { value: 1247, change: 2.1, label: 'Productos en Catálogo', icon: Package },
  avgDeliveryTime: { value: 3.2, change: -15.8, label: 'Días Promedio Entrega', icon: Truck },
};

// Sales Performance (visible to all, amounts to those with permission)
const SALES_PERFORMANCE = {
  monthlySales: { value: 847320, change: 18.2, target: 1000000 },
  weeklyOrders: { value: 156, change: 5.4, target: 200 },
  avgOrderValue: { value: 5432, change: 3.2 },
  conversionRate: { value: 68.5, change: 2.8 },
  quotesToOrders: { value: 72.3, change: -1.2 },
  repeatCustomers: { value: 45.2, change: 5.6 },
};

// Top Products by Units Sold (visible to all)
const TOP_PRODUCTS_UNITS = [
  { name: 'WHISKY JOHNNIE WALKER BLACK 12YRS', reference: 'EVL-00003', units: 245, change: 12 },
  { name: 'VODKA GREY GOOSE ORIGINAL', reference: 'EVL-00008', units: 178, change: -3 },
  { name: 'WHISKY CHIVAS REGAL 12YRS', reference: 'EVL-00009', units: 156, change: 15 },
  { name: 'RON DIPLOMÁTICO RESERVA', reference: 'EVL-00010', units: 134, change: 5 },
  { name: 'TEQUILA DON JULIO 1942', reference: 'EVL-00004', units: 89, change: 8 },
  { name: 'WHISKY MACALLAN 12YRS', reference: 'EVL-00015', units: 78, change: 22 },
  { name: 'GIN HENDRICKS', reference: 'EVL-00018', units: 65, change: -5 },
  { name: 'CHAMPAGNE MOET & CHANDON', reference: 'EVL-00020', units: 54, change: 18 },
];

// Sales by Country
const SALES_BY_COUNTRY = [
  { country: 'Panamá', flag: '🇵🇦', orders: 245, percentage: 29 },
  { country: 'Curazao', flag: '🇨🇼', orders: 187, percentage: 22 },
  { country: 'Puerto Rico', flag: '🇵🇷', orders: 156, percentage: 18 },
  { country: 'República Dominicana', flag: '🇩🇴', orders: 134, percentage: 16 },
  { country: 'Colombia', flag: '🇨🇴', orders: 78, percentage: 9 },
  { country: 'Otros', flag: '🌎', orders: 47, percentage: 6 },
];

// Inventory Metrics
const INVENTORY_METRICS = {
  totalSKUs: { value: 1247, label: 'SKUs Totales' },
  inStock: { value: 1198, label: 'En Stock', percentage: 96 },
  lowStock: { value: 31, label: 'Bajo Mínimo', percentage: 2.5 },
  outOfStock: { value: 18, label: 'Sin Stock', percentage: 1.4 },
  inventoryTurnover: { value: 4.2, label: 'Rotación', target: 5.0 },
  avgDaysInStock: { value: 45, label: 'Días Promedio Stock' },
};

// Stock Movement
const STOCK_MOVEMENT = [
  { month: 'Sep', entries: 1250, exits: 980 },
  { month: 'Oct', entries: 1180, exits: 1050 },
  { month: 'Nov', entries: 1420, exits: 1280 },
  { month: 'Dic', entries: 1680, exits: 1520 },
  { month: 'Ene', entries: 1350, exits: 1180 },
  { month: 'Feb', entries: 1480, exits: 1320 },
];

// Order Status Distribution
const ORDER_STATUS = [
  { status: 'Pendiente', count: 23, color: 'bg-warning' },
  { status: 'En Proceso', count: 45, color: 'bg-info' },
  { status: 'Listo para Envío', count: 18, color: 'bg-brand-500' },
  { status: 'Enviado', count: 156, color: 'bg-success' },
  { status: 'Entregado', count: 580, color: 'bg-success' },
  { status: 'Cancelado', count: 25, color: 'bg-danger' },
];

// Customer Metrics
const CUSTOMER_METRICS = {
  totalClients: { value: 342, change: 5.2 },
  newThisMonth: { value: 18, change: 12.5 },
  activeThisMonth: { value: 156, change: 8.2 },
  avgOrdersPerClient: { value: 5.4, change: 2.1 },
  topCountries: ['Panamá', 'Curazao', 'Puerto Rico'],
};

// Weekly Performance
const WEEKLY_PERFORMANCE = [
  { day: 'Lun', orders: 45, units: 520 },
  { day: 'Mar', orders: 52, units: 610 },
  { day: 'Mié', orders: 48, units: 580 },
  { day: 'Jue', orders: 61, units: 720 },
  { day: 'Vie', orders: 55, units: 640 },
  { day: 'Sáb', orders: 32, units: 380 },
  { day: 'Dom', orders: 15, units: 180 },
];

// Commission Summary (for vendedores)
const COMMISSION_SUMMARY = {
  totalQuotes: 45,
  quotesAbove10: 38,
  quotesBelow10: 7,
  avgMargin: 14.2,
  commissionEligiblePercent: 84.4,
};

// ============================================
// COMPONENT
// ============================================

export default function ReportesPage() {
  const { user, checkPermission } = useAuth();
  const router = useRouter();
  const canViewCosts = checkPermission('canViewCosts');
  const canViewMargins = checkPermission('canViewMargins');
  const isVendedor = !canViewMargins;

  const [selectedTab, setSelectedTab] = useState('general');
  const [selectedMonth, setSelectedMonth] = useState(1); // 0-indexed: 1 = Feb
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);

  const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Close month picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target as Node)) {
        setIsMonthPickerOpen(false);
      }
    };
    if (isMonthPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMonthPickerOpen]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-PA').format(value);
  };

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

  const maxWeeklyOrders = Math.max(...WEEKLY_PERFORMANCE.map(d => d.orders));
  const totalStatusOrders = ORDER_STATUS.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30 sm:h-12 sm:w-12">
            <BarChart3 className="h-5 w-5 text-brand-600 dark:text-brand-400 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-text-primary sm:text-2xl">
              Métricas y Reportes
            </h1>
            <p className="mt-0.5 text-xs text-text-secondary sm:mt-1 sm:text-sm">
              Indicadores • {MONTH_NAMES[selectedMonth]} {selectedYear}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Month Picker */}
          <div className="relative" ref={monthPickerRef}>
            <Button
              variant="bordered"
              size="sm"
              startContent={<Calendar className="h-4 w-4" />}
              onPress={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
            >
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </Button>
            {isMonthPickerOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-3 shadow-xl">
                {/* Year selector */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setSelectedYear((y) => y - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedYear}</span>
                  <button
                    onClick={() => setSelectedYear((y) => y + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                {/* Month grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTH_SHORT.map((name, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedMonth(idx);
                        setIsMonthPickerOpen(false);
                      }}
                      className={cn(
                        'rounded-lg px-2 py-2 text-xs font-medium transition-colors',
                        idx === selectedMonth && selectedYear === 2026
                          ? 'bg-brand-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            color="primary"
            size="sm"
            startContent={<Printer className="h-4 w-4" />}
            className="bg-brand-600"
            onPress={handlePrint}
          >
            Imprimir
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        variant="underlined"
        classNames={{
          tabList: 'gap-6',
          cursor: 'bg-brand-600',
          tab: 'px-0 h-10',
        }}
      >
        <Tab key="general" title="General" />
        <Tab key="ventas" title="Ventas" />
        <Tab key="inventario" title="Inventario" />
        <Tab key="clientes" title="Clientes" />
        {isVendedor && <Tab key="comisiones" title="Mis Comisiones" />}
      </Tabs>

      {/* General Tab */}
      {selectedTab === 'general' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Main Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(GENERAL_METRICS).map(([key, metric]) => {
              const Icon = metric.icon;
              const isPositive = metric.change >= 0;
              return (
                <motion.div key={key} variants={itemVariants}>
                  <Card className="border border-border-default bg-surface-main shadow-sm">
                    <CardBody className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-text-secondary">{metric.label}</p>
                          <p className="mt-2 text-2xl font-semibold text-text-primary">
                            {key === 'avgDeliveryTime' ? `${metric.value} días` : formatNumber(metric.value)}
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            {isPositive ? (
                              <ArrowUpRight className={cn('h-4 w-4', key === 'avgDeliveryTime' ? 'text-danger' : 'text-success')} />
                            ) : (
                              <ArrowDownRight className={cn('h-4 w-4', key === 'avgDeliveryTime' ? 'text-success' : 'text-danger')} />
                            )}
                            <span className={cn(
                              'text-xs font-medium',
                              key === 'avgDeliveryTime'
                                ? (isPositive ? 'text-danger' : 'text-success')
                                : (isPositive ? 'text-success' : 'text-danger')
                            )}>
                              {isPositive ? '+' : ''}{metric.change}%
                            </span>
                            <span className="text-xs text-text-muted">vs mes anterior</span>
                          </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
                          <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Weekly Performance */}
            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardHeader className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-bg">
                      <Activity className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">Rendimiento Semanal</h3>
                      <p className="text-xs text-text-muted">Órdenes por día</p>
                    </div>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="p-5">
                  <div className="flex h-48 items-end justify-between gap-3">
                    {WEEKLY_PERFORMANCE.map((day, index) => {
                      const heightPercent = (day.orders / maxWeeklyOrders) * 100;
                      return (
                        <div key={day.day} className="group relative flex flex-1 flex-col items-center">
                          <div className="relative flex h-40 w-full flex-col justify-end">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercent}%` }}
                              transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
                              className="w-full rounded-t-md bg-brand-500 transition-colors group-hover:bg-brand-600 dark:bg-brand-600 dark:group-hover:bg-brand-500"
                            />
                          </div>
                          <p className="mt-2 text-xs font-medium text-text-secondary">{day.day}</p>
                          <div className="pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-surface-secondary px-3 py-2 text-xs text-text-primary opacity-0 shadow-lg ring-1 ring-border-default transition-opacity group-hover:opacity-100 dark:bg-surface-tertiary">
                            <p className="font-semibold">{day.orders} órdenes</p>
                            <p className="text-text-muted">{day.units} unidades</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Order Status Distribution */}
            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardHeader className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-bg">
                      <PieChart className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">Estado de Órdenes</h3>
                      <p className="text-xs text-text-muted">Distribución actual</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">{totalStatusOrders} total</span>
                </CardHeader>
                <Divider />
                <CardBody className="p-5">
                  <div className="space-y-3">
                    {ORDER_STATUS.map((status) => {
                      const percentage = (status.count / totalStatusOrders) * 100;
                      return (
                        <div key={status.status} className="flex items-center gap-3">
                          <span className="w-28 text-sm text-text-secondary">{status.status}</span>
                          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-surface-secondary">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 0.3, duration: 0.4 }}
                              className={cn('absolute inset-y-0 left-0 rounded-full', status.color)}
                            />
                          </div>
                          <span className="w-12 text-right text-sm font-medium text-text-primary">{status.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Sales by Country */}
          <motion.div variants={itemVariants}>
            <Card className="border border-border-default bg-surface-main shadow-sm">
              <CardHeader className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                    <Globe className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">Ventas por País</h3>
                    <p className="text-xs text-text-muted">Distribución geográfica</p>
                  </div>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                <div className="grid grid-cols-2 divide-x divide-border-default sm:grid-cols-3 lg:grid-cols-6">
                  {SALES_BY_COUNTRY.map((country) => (
                    <div key={country.country} className="p-5 text-center">
                      <span className="text-2xl">{country.flag}</span>
                      <p className="mt-2 text-sm font-medium text-text-primary">{country.country}</p>
                      <p className="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">{country.percentage}%</p>
                      <p className="text-xs text-text-muted">{country.orders} órdenes</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Ventas Tab */}
      {selectedTab === 'ventas' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Sales KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Monthly Sales */}
            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg">
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Ventas del Mes</p>
                      {canViewCosts ? (
                        <p className="text-xl font-bold text-success">{formatCurrency(SALES_PERFORMANCE.monthlySales.value)}</p>
                      ) : (
                        <p className="text-xl font-bold text-text-primary">{formatNumber(SALES_PERFORMANCE.weeklyOrders.value * 4)} órdenes</p>
                      )}
                    </div>
                  </div>
                  {canViewCosts && (
                    <>
                      <Progress
                        value={(SALES_PERFORMANCE.monthlySales.value / SALES_PERFORMANCE.monthlySales.target) * 100}
                        color="success"
                        size="sm"
                        className="mt-4"
                      />
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-text-muted">Meta: {formatCurrency(SALES_PERFORMANCE.monthlySales.target)}</span>
                        <span className="font-semibold text-success">
                          {((SALES_PERFORMANCE.monthlySales.value / SALES_PERFORMANCE.monthlySales.target) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* Conversion Rate */}
            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-bg">
                      <Percent className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Conversión Cotización → Orden</p>
                      <p className="text-xl font-bold text-text-primary">{SALES_PERFORMANCE.quotesToOrders.value}%</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {SALES_PERFORMANCE.quotesToOrders.change >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-danger" />
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      SALES_PERFORMANCE.quotesToOrders.change >= 0 ? 'text-success' : 'text-danger'
                    )}>
                      {SALES_PERFORMANCE.quotesToOrders.change >= 0 ? '+' : ''}{SALES_PERFORMANCE.quotesToOrders.change}%
                    </span>
                    <span className="text-sm text-text-muted">vs mes anterior</span>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Repeat Customers */}
            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-bg">
                      <RotateCcw className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Clientes Recurrentes</p>
                      <p className="text-xl font-bold text-text-primary">{SALES_PERFORMANCE.repeatCustomers.value}%</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">+{SALES_PERFORMANCE.repeatCustomers.change}%</span>
                    <span className="text-sm text-text-muted">vs mes anterior</span>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Top Products */}
          <motion.div variants={itemVariants}>
            <Card className="border border-border-default bg-surface-main shadow-sm">
              <CardHeader className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                    <Award className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">Top Productos Vendidos</h3>
                    <p className="text-xs text-text-muted">Por unidades este mes</p>
                  </div>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-default bg-surface-secondary">
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">#</th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">Producto</th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">Unidades</th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">Tendencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {TOP_PRODUCTS_UNITS.map((product, index) => (
                      <tr key={product.reference} className="hover:bg-surface-secondary">
                        <td className="px-5 py-3">
                          <div className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold',
                            index === 0 ? 'bg-warning-bg text-warning' :
                            index === 1 ? 'bg-surface-tertiary text-text-secondary' :
                            index === 2 ? 'bg-warning-bg/50 text-warning' : 'bg-surface-secondary text-text-muted'
                          )}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-text-primary">{product.name}</p>
                          <p className="text-xs text-text-muted">{product.reference}</p>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-semibold text-text-primary">{product.units}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={cn(
                            'inline-flex items-center text-sm font-medium',
                            product.change >= 0 ? 'text-success' : 'text-danger'
                          )}>
                            {product.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                            {Math.abs(product.change)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Inventario Tab */}
      {selectedTab === 'inventario' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Inventory Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">SKUs Totales</p>
                      <p className="mt-1 text-2xl font-bold text-text-primary">{formatNumber(INVENTORY_METRICS.totalSKUs.value)}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
                      <Boxes className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">En Stock</p>
                      <p className="mt-1 text-2xl font-bold text-success">{formatNumber(INVENTORY_METRICS.inStock.value)}</p>
                      <p className="text-xs text-text-muted">{INVENTORY_METRICS.inStock.percentage}% del catálogo</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Bajo Mínimo</p>
                      <p className="mt-1 text-2xl font-bold text-warning">{INVENTORY_METRICS.lowStock.value}</p>
                      <p className="text-xs text-text-muted">{INVENTORY_METRICS.lowStock.percentage}% del catálogo</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-bg">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Sin Stock</p>
                      <p className="mt-1 text-2xl font-bold text-danger">{INVENTORY_METRICS.outOfStock.value}</p>
                      <p className="text-xs text-text-muted">{INVENTORY_METRICS.outOfStock.percentage}% del catálogo</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-bg">
                      <XCircle className="h-5 w-5 text-danger" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Stock Movement Chart */}
          <motion.div variants={itemVariants}>
            <Card className="border border-border-default bg-surface-main shadow-sm">
              <CardHeader className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-bg">
                    <LineChart className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">Movimiento de Stock</h3>
                    <p className="text-xs text-text-muted">Entradas vs Salidas (últimos 6 meses)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <span className="text-text-secondary">Entradas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-brand-500" />
                    <span className="text-text-secondary">Salidas</span>
                  </div>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-5">
                <div className="space-y-4">
                  {STOCK_MOVEMENT.map((month) => {
                    const maxValue = Math.max(...STOCK_MOVEMENT.map(m => Math.max(m.entries, m.exits)));
                    const entryWidth = (month.entries / maxValue) * 100;
                    const exitWidth = (month.exits / maxValue) * 100;
                    return (
                      <div key={month.month} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-10 text-sm font-medium text-text-secondary">{month.month}</span>
                          <div className="flex gap-4 text-xs text-text-muted">
                            <span>+{formatNumber(month.entries)}</span>
                            <span>-{formatNumber(month.exits)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-surface-secondary">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${entryWidth}%` }}
                              transition={{ delay: 0.2, duration: 0.4 }}
                              className="absolute inset-y-0 left-0 rounded-full bg-success"
                            />
                          </div>
                          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-surface-secondary">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${exitWidth}%` }}
                              transition={{ delay: 0.2, duration: 0.4 }}
                              className="absolute inset-y-0 left-0 rounded-full bg-brand-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Inventory Turnover */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-bg">
                      <RotateCcw className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Rotación de Inventario</p>
                      <p className="text-xl font-bold text-text-primary">{INVENTORY_METRICS.inventoryTurnover.value}x</p>
                    </div>
                  </div>
                  <Progress
                    value={(INVENTORY_METRICS.inventoryTurnover.value / INVENTORY_METRICS.inventoryTurnover.target) * 100}
                    color="warning"
                    size="sm"
                    className="mt-4"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-text-muted">Meta: {INVENTORY_METRICS.inventoryTurnover.target}x</span>
                    <span className="font-semibold text-warning">
                      {((INVENTORY_METRICS.inventoryTurnover.value / INVENTORY_METRICS.inventoryTurnover.target) * 100).toFixed(0)}%
                    </span>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-bg">
                      <Clock className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Días Promedio en Stock</p>
                      <p className="text-xl font-bold text-text-primary">{INVENTORY_METRICS.avgDaysInStock.value} días</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-text-muted">
                    En promedio, un producto permanece {INVENTORY_METRICS.avgDaysInStock.value} días en inventario antes de ser vendido.
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Clientes Tab */}
      {selectedTab === 'clientes' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Customer Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Clientes Totales</p>
                      <p className="mt-1 text-2xl font-bold text-text-primary">{CUSTOMER_METRICS.totalClients.value}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3 text-success" />
                        <span className="text-xs text-success">+{CUSTOMER_METRICS.totalClients.change}%</span>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
                      <Users className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Nuevos Este Mes</p>
                      <p className="mt-1 text-2xl font-bold text-success">{CUSTOMER_METRICS.newThisMonth.value}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3 text-success" />
                        <span className="text-xs text-success">+{CUSTOMER_METRICS.newThisMonth.change}%</span>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Activos Este Mes</p>
                      <p className="mt-1 text-2xl font-bold text-info">{CUSTOMER_METRICS.activeThisMonth.value}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3 text-success" />
                        <span className="text-xs text-success">+{CUSTOMER_METRICS.activeThisMonth.change}%</span>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-bg">
                      <Activity className="h-5 w-5 text-info" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Órdenes/Cliente</p>
                      <p className="mt-1 text-2xl font-bold text-text-primary">{CUSTOMER_METRICS.avgOrdersPerClient.value}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3 text-success" />
                        <span className="text-xs text-success">+{CUSTOMER_METRICS.avgOrdersPerClient.change}%</span>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-bg">
                      <ShoppingCart className="h-5 w-5 text-warning" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Top Countries */}
          <motion.div variants={itemVariants}>
            <Card className="border border-border-default bg-surface-main shadow-sm">
              <CardHeader className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                    <Globe className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">Clientes por País</h3>
                    <p className="text-xs text-text-muted">Distribución geográfica de clientes</p>
                  </div>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                <div className="grid grid-cols-2 divide-x divide-border-default sm:grid-cols-3 lg:grid-cols-6">
                  {SALES_BY_COUNTRY.map((country) => (
                    <div key={country.country} className="p-5 text-center">
                      <span className="text-3xl">{country.flag}</span>
                      <p className="mt-2 text-sm font-medium text-text-primary">{country.country}</p>
                      <p className="mt-1 text-lg font-bold text-text-primary">{Math.round(country.orders * 0.4)}</p>
                      <p className="text-xs text-text-muted">clientes</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Comisiones Tab (only for vendedores) */}
      {selectedTab === 'comisiones' && isVendedor && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Commission Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Cotizaciones Este Mes</p>
                      <p className="mt-1 text-2xl font-bold text-text-primary">{COMMISSION_SUMMARY.totalQuotes}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
                      <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Comisionables (≥10%)</p>
                      <p className="mt-1 text-2xl font-bold text-success">{COMMISSION_SUMMARY.quotesAbove10}</p>
                      <p className="text-xs text-success">{COMMISSION_SUMMARY.commissionEligiblePercent}% del total</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-border-default bg-surface-main shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-secondary">No Comisionables (&lt;10%)</p>
                      <p className="mt-1 text-2xl font-bold text-danger">{COMMISSION_SUMMARY.quotesBelow10}</p>
                      <p className="text-xs text-danger">{(100 - COMMISSION_SUMMARY.commissionEligiblePercent).toFixed(1)}% del total</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-bg">
                      <XCircle className="h-5 w-5 text-danger" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Commission Progress */}
          <motion.div variants={itemVariants}>
            <Card className="border border-border-default bg-surface-main shadow-sm">
              <CardHeader className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-bg">
                    <Target className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">Resumen de Comisiones</h3>
                    <p className="text-xs text-text-muted">Tu rendimiento este mes</p>
                  </div>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-5">
                <div className="flex items-center gap-8">
                  {/* Donut-like visualization */}
                  <div className="relative h-32 w-32">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-danger/20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={`${COMMISSION_SUMMARY.commissionEligiblePercent * 2.51} 251`}
                        className="text-success"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-text-primary">{COMMISSION_SUMMARY.commissionEligiblePercent}%</span>
                      <span className="text-xs text-text-muted">Comisionable</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Cotizaciones por encima del 10%</span>
                        <span className="text-sm font-semibold text-success">{COMMISSION_SUMMARY.quotesAbove10}</span>
                      </div>
                      <Progress value={COMMISSION_SUMMARY.commissionEligiblePercent} color="success" size="sm" className="mt-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Cotizaciones por debajo del 10%</span>
                        <span className="text-sm font-semibold text-danger">{COMMISSION_SUMMARY.quotesBelow10}</span>
                      </div>
                      <Progress value={100 - COMMISSION_SUMMARY.commissionEligiblePercent} color="danger" size="sm" className="mt-2" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-success-bg/50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        ¡Buen trabajo! El {COMMISSION_SUMMARY.commissionEligiblePercent}% de tus cotizaciones generan comisión.
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        Mantén los márgenes por encima del 10% para maximizar tus comisiones.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
