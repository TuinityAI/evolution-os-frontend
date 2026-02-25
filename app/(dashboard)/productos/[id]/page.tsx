'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@heroui/react';
import {
  ArrowLeft,
  Edit,
  Copy,
  ToggleLeft,
  Trash2,
  Package,
  Barcode,
  Ruler,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Truck,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import { getProductById, PRODUCT_GROUPS } from '@/lib/mock-data/products';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/contexts/auth-context';
import { printReport } from '@/lib/utils/print-utils';

// Product images mapping
const PRODUCT_IMAGES: Record<string, string> = {
  'WHISKY': 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop',
  'RON': 'https://images.unsplash.com/photo-1598018553943-93a44e4e7af8?w=400&h=400&fit=crop',
  'VODKA': 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400&h=400&fit=crop',
  'TEQUILA': 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400&h=400&fit=crop',
  'GINEBRA': 'https://images.unsplash.com/photo-1608885898957-a559228e8749?w=400&h=400&fit=crop',
  'VINO': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
  'LICOR': 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop',
  'SNACKS': 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&h=400&fit=crop',
  'CERVEZA': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop',
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { checkPermission } = useAuth();
  const canViewCosts = checkPermission('canViewCosts');

  const productId = params.id as string;
  const product = getProductById(productId);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-lg font-medium text-foreground">Producto no encontrado</h2>
        <p className="mb-4 text-sm text-muted-foreground">El producto {productId} no existe o fue eliminado.</p>
        <Button color="primary" onPress={() => router.push('/productos')}>
          Volver a Productos
        </Button>
      </div>
    );
  }

  const imageUrl = PRODUCT_IMAGES[product.group] || PRODUCT_IMAGES['WHISKY'];
  const groupLabel = PRODUCT_GROUPS.find(g => g.id === product.group)?.label || product.group;

  const getStockStatus = () => {
    if (product.stock.available === 0) {
      return { label: 'Sin Stock', color: 'bg-red-500', textColor: 'text-red-500' };
    }
    if (product.stock.available <= product.minimumQty) {
      return { label: 'Stock Bajo', color: 'bg-amber-500', textColor: 'text-amber-500' };
    }
    return { label: 'En Stock', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  };

  const stockStatus = getStockStatus();

  const handleEdit = () => {
    router.push(`/productos/${product.id}/editar`);
  };

  const handleDuplicate = () => {
    toast.success('Producto duplicado', {
      description: `"${product.description}" ha sido copiado como borrador.`,
    });
  };

  const handleToggleStatus = () => {
    const newStatus = product.status === 'active' ? 'inactivo' : 'activo';
    toast.success(`Producto ${newStatus}`, {
      description: `"${product.description}" ahora está ${newStatus}.`,
    });
  };

  const handleDelete = () => {
    toast.success('Producto eliminado', {
      description: `"${product.description}" ha sido eliminado.`,
    });
    router.push('/productos');
  };

  const handlePrint = () => {
    printReport({
      title: `Ficha de Producto`,
      subtitle: product.reference,
      columns: [
        { key: 'campo', label: 'Campo', width: '40%' },
        { key: 'valor', label: 'Valor' },
      ],
      data: [
        { campo: 'Referencia', valor: product.reference },
        { campo: 'Descripción', valor: product.description },
        { campo: 'Categoría', valor: groupLabel },
        { campo: 'Marca', valor: product.brand },
        { campo: 'País de Origen', valor: product.country },
        { campo: 'Código de Barras', valor: product.barcode || '-' },
        { campo: 'Código Arancelario', valor: product.tariffCode },
        { campo: 'Unidad', valor: product.unit },
        { campo: 'Unidades por Caja', valor: product.unitsPerCase.toString() },
        { campo: 'Stock Disponible', valor: product.stock.available.toString() },
        { campo: 'Stock Mínimo', valor: product.minimumQty.toString() },
        { campo: 'Precio Nivel A', valor: `$${product.prices.A}` },
        { campo: 'Precio Nivel B', valor: `$${product.prices.B}` },
        { campo: 'Precio Nivel C', valor: `$${product.prices.C}` },
        { campo: 'Precio Nivel D', valor: `$${product.prices.D}` },
        { campo: 'Precio Nivel E', valor: `$${product.prices.E}` },
        ...(canViewCosts ? [
          { campo: 'Proveedor', valor: product.supplier },
          { campo: 'Costo FOB', valor: `$${product.costFOB}` },
          { campo: 'Costo CIF', valor: `$${product.costCIF}` },
          { campo: 'Costo Promedio', valor: `$${product.costAvgWeighted}` },
        ] : []),
      ],
      metadata: [
        { label: 'Producto', value: product.description },
        { label: 'Referencia', value: product.reference },
        { label: 'Estado', value: product.status === 'active' ? 'Activo' : 'Inactivo' },
      ],
    });
    toast.success('Documento generado', {
      description: 'Ficha de producto lista para imprimir.',
    });
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
            onClick={() => router.push('/productos')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">{product.description}</h1>
              <span className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                product.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-gray-500/10 text-gray-500'
              )}>
                <span className={cn('h-1.5 w-1.5 rounded-full', product.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500')} />
                {product.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{product.reference}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="bordered"
            startContent={<Printer className="h-4 w-4" />}
            onPress={handlePrint}
          >
            Imprimir
          </Button>
          <Button
            variant="bordered"
            startContent={<Edit className="h-4 w-4" />}
            onPress={handleEdit}
          >
            Editar
          </Button>
          <Button
            variant="bordered"
            startContent={<Copy className="h-4 w-4" />}
            onPress={handleDuplicate}
          >
            Duplicar
          </Button>
          <Button
            variant="bordered"
            startContent={<ToggleLeft className="h-4 w-4" />}
            onPress={handleToggleStatus}
          >
            {product.status === 'active' ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="bordered"
            color="danger"
            startContent={<Trash2 className="h-4 w-4" />}
            onPress={handleDelete}
          >
            Eliminar
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Image & Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Product Image */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="aspect-square w-full overflow-hidden bg-muted">
              <img src={imageUrl} alt={product.description} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', stockStatus.color.replace('bg-', 'bg-') + '/10', stockStatus.textColor)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', stockStatus.color)} />
                  {stockStatus.label}
                </span>
                <span className="text-2xl font-bold text-foreground">${product.prices.A}</span>
              </div>
            </div>
          </div>

          {/* Category & Brand */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Clasificación</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Categoría</span>
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">{groupLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subcategoría</span>
                <span className="text-sm text-foreground">{product.subGroup}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Marca</span>
                <span className="text-sm font-medium text-foreground">{product.brand}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Middle Column - Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-6 lg:col-span-2"
        >
          {/* Stock Information */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Inventario</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{product.stock.existence}</p>
                <p className="text-xs text-muted-foreground">Existencia</p>
              </div>
              <div className="rounded-lg bg-sky-500/10 p-4 text-center">
                <p className="text-2xl font-bold text-sky-500">{product.stock.arriving}</p>
                <p className="text-xs text-muted-foreground">Por Llegar</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">{product.stock.reserved}</p>
                <p className="text-xs text-muted-foreground">Reservado</p>
              </div>
              <div className={cn('rounded-lg p-4 text-center', stockStatus.color.replace('bg-', 'bg-') + '/10')}>
                <p className={cn('text-2xl font-bold', stockStatus.textColor)}>{product.stock.available}</p>
                <p className="text-xs text-muted-foreground">Disponible</p>
              </div>
            </div>
            {product.stock.available <= product.minimumQty && product.stock.available > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-500">
                <AlertTriangle className="h-4 w-4" />
                <span>Stock por debajo del mínimo ({product.minimumQty} unidades)</span>
              </div>
            )}
            {product.stock.arriving > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-sky-500/10 p-3 text-sm text-sky-500">
                <Truck className="h-4 w-4" />
                <span>{product.stock.arriving} unidades en tránsito</span>
              </div>
            )}
          </div>

          {/* Prices */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Precios por Nivel</h3>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {(['A', 'B', 'C', 'D', 'E'] as const).map((level, index) => (
                <div key={level} className={cn('rounded-lg p-4 text-center', index === 0 ? 'bg-brand-500/10' : 'bg-muted/50')}>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Nivel {level}</p>
                  <p className={cn('text-lg font-bold', index === 0 ? 'text-brand-500' : 'text-foreground')}>
                    ${product.prices[level]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Barcode className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Detalles del Producto</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Código de Barras</p>
                <p className="font-mono text-sm text-foreground">{product.barcode || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Código Arancelario</p>
                <p className="font-mono text-sm text-foreground">{product.tariffCode}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">País de Origen</p>
                <p className="text-sm text-foreground">{product.country}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unidad</p>
                <p className="text-sm text-foreground">{product.unit}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unidades por Caja</p>
                <p className="text-sm text-foreground">{product.unitsPerCase}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cantidad Mínima</p>
                <p className="text-sm text-foreground">{product.minimumQty}</p>
              </div>
              {product.casesPerBulk && (
                <div>
                  <p className="text-xs text-muted-foreground">Cajas por Bulto</p>
                  <p className="text-sm text-foreground">{product.casesPerBulk}</p>
                </div>
              )}
              {product.casesPerPallet && (
                <div>
                  <p className="text-xs text-muted-foreground">Cajas por Pallet</p>
                  <p className="text-sm text-foreground">{product.casesPerPallet}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dimensions & Weight - if available */}
          {(product.dimensions || product.weightPerCase) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Dimensiones y Peso</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {product.dimensions && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Largo</p>
                      <p className="text-sm text-foreground">{product.dimensions.length} cm</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ancho</p>
                      <p className="text-sm text-foreground">{product.dimensions.width} cm</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Alto</p>
                      <p className="text-sm text-foreground">{product.dimensions.height} cm</p>
                    </div>
                  </>
                )}
                {product.weightPerCase && (
                  <div>
                    <p className="text-xs text-muted-foreground">Peso por Caja</p>
                    <p className="text-sm text-foreground">{product.weightPerCase} kg</p>
                  </div>
                )}
                {product.cubicMeters && (
                  <div>
                    <p className="text-xs text-muted-foreground">Volumen</p>
                    <p className="text-sm text-foreground">{product.cubicMeters} m³</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Costs - Only for authorized users */}
          {canViewCosts && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Costos e Información Confidencial</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Proveedor</p>
                  <p className="text-sm font-medium text-foreground">{product.supplier}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Costo FOB</p>
                  <p className="font-mono text-sm text-foreground">${product.costFOB}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Costo CIF</p>
                  <p className="font-mono text-sm text-foreground">${product.costCIF}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Costo Promedio</p>
                  <p className="font-mono text-sm font-medium text-foreground">${product.costAvgWeighted}</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-emerald-500/10 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Margen (vs Precio A)</span>
                  <span className="font-mono font-medium text-emerald-500">
                    {((product.prices.A - product.costAvgWeighted) / product.prices.A * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
