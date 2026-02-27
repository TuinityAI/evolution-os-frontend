'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import {
  ArrowLeft,
  ArrowRightLeft,
  Plus,
  Trash2,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/contexts/auth-context';
import { cn } from '@/lib/utils/cn';
import { MOCK_WAREHOUSES, isB2BtoB2CTransfer, DEFAULT_TRANSFER_INFLATION_FACTOR, subscribeWarehouses, getWarehousesData } from '@/lib/mock-data/warehouses';
import { MOCK_PRODUCTS, getProductById } from '@/lib/mock-data/products';
import { calculateConversion, generateNextTransferId, addTransfer } from '@/lib/mock-data/inventory';
import { useStore } from '@/hooks/use-store';

interface TransferLine {
  productId: string;
  productDescription: string;
  productReference: string;
  sourceStock: number;
  quantityCases: number;
  unitsPerCase: number;
  costCIF: number;
}

export default function NuevaTransferenciaPage() {
  const router = useRouter();
  const { checkPermission } = useAuth();
  const canViewCosts = checkPermission('canViewCosts');

  // Reactive store subscription
  const warehouses = useStore(subscribeWarehouses, getWarehousesData);

  const [sourceWarehouseId, setSourceWarehouseId] = useState('WH-001');
  const [destWarehouseId, setDestWarehouseId] = useState('WH-002');
  const [observation, setObservation] = useState('');
  const [lines, setLines] = useState<TransferLine[]>([]);

  const isB2BtoB2C = isB2BtoB2CTransfer(sourceWarehouseId, destWarehouseId);

  // Add sample product
  const handleAddProduct = () => {
    const availableProducts = MOCK_PRODUCTS.filter((p) => !lines.some((l) => l.productId === p.id) && p.stock.existence > 0);
    if (availableProducts.length === 0) {
      toast.error('Sin productos', { description: 'No hay más productos disponibles para agregar' });
      return;
    }
    const product = availableProducts[0];
    setLines([...lines, {
      productId: product.id,
      productDescription: product.description,
      productReference: product.reference,
      sourceStock: product.stock.existence,
      quantityCases: 1,
      unitsPerCase: product.unitsPerCase,
      costCIF: product.costCIF,
    }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleUpdateQty = (index: number, qty: number) => {
    const newLines = [...lines];
    newLines[index].quantityCases = qty;
    setLines(newLines);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  // Calculate totals
  const totalCases = lines.reduce((sum, l) => sum + l.quantityCases, 0);
  const totalUnits = lines.reduce((sum, l) => sum + (l.quantityCases * l.unitsPerCase), 0);
  const totalValue = lines.reduce((sum, l) => sum + (l.quantityCases * l.costCIF), 0);

  const handleSubmit = () => {
    if (lines.length === 0) {
      toast.error('Sin productos', { description: 'Agrega al menos un producto a la transferencia' });
      return;
    }
    const transferId = generateNextTransferId();
    const sourceWarehouse = warehouses.find((w) => w.id === sourceWarehouseId);
    const destWarehouse = warehouses.find((w) => w.id === destWarehouseId);

    addTransfer({
      id: transferId,
      createdAt: new Date().toISOString(),
      createdBy: 'USR-000',
      createdByName: 'Usuario',
      sourceWarehouseId,
      sourceWarehouseName: sourceWarehouse?.name || '',
      sourceWarehouseType: sourceWarehouse?.type || 'B2B',
      destWarehouseId,
      destWarehouseName: destWarehouse?.name || '',
      destWarehouseType: destWarehouse?.type || 'B2C',
      observation,
      lines: lines.map((l, idx) => {
        const product = getProductById(l.productId);
        const conversion = product ? calculateConversion(product, l.quantityCases) : null;
        return {
          id: `TRL-NEW-${idx}`,
          productId: l.productId,
          productReference: l.productReference,
          productDescription: l.productDescription,
          sourceStock: l.sourceStock,
          quantityCases: l.quantityCases,
          unitsPerCase: l.unitsPerCase,
          resultingUnits: l.quantityCases * l.unitsPerCase,
          realCostCIF: l.costCIF,
          transferCost: isB2BtoB2C ? l.costCIF * DEFAULT_TRANSFER_INFLATION_FACTOR : l.costCIF,
          totalValue: l.quantityCases * l.costCIF,
        };
      }),
      totalCases,
      totalUnits,
      totalValue,
      inflationFactor: isB2BtoB2C ? DEFAULT_TRANSFER_INFLATION_FACTOR : 1,
      status: 'enviada',
    });

    toast.success('Transferencia creada', {
      description: `La transferencia ${transferId} ha sido enviada.`,
    });
    router.push('/inventario/transferencias');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
            <ArrowRightLeft className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Nueva Transferencia</h1>
            <p className="text-sm text-gray-500">Mover mercancía entre bodegas</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Bodega Origen</label>
              <Select
                selectedKeys={[sourceWarehouseId]}
                onChange={(e) => setSourceWarehouseId(e.target.value)}
                variant="bordered"
                classNames={{ trigger: 'bg-white' }}
              >
                {warehouses.map((w) => (
                  <SelectItem key={w.id}>{w.name} ({w.type})</SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Bodega Destino</label>
              <Select
                selectedKeys={[destWarehouseId]}
                onChange={(e) => setDestWarehouseId(e.target.value)}
                variant="bordered"
                classNames={{ trigger: 'bg-white' }}
              >
                {warehouses.filter((w) => w.id !== sourceWarehouseId).map((w) => (
                  <SelectItem key={w.id}>{w.name} ({w.type})</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {isB2BtoB2C && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Transferencia B2B → B2C</p>
                  <p className="mt-1 text-xs text-blue-700">
                    Las cajas se convertirán a unidades. Se aplicará un factor de inflación del {((DEFAULT_TRANSFER_INFLATION_FACTOR - 1) * 100).toFixed(0)}% al costo.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">Observación</label>
            <Textarea
              placeholder="Notas adicionales..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              variant="bordered"
              classNames={{ inputWrapper: 'bg-white' }}
            />
          </div>
        </div>

        {/* Products Section */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Productos a Transferir</h2>
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              Agregar Producto
            </button>
          </div>

          {lines.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Producto</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Cajas</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Und/Caja</th>
                    {isB2BtoB2C && (
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Unidades</th>
                    )}
                    {canViewCosts && (
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Valor</th>
                    )}
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lines.map((line, index) => {
                    const product = getProductById(line.productId);
                    const conversion = product ? calculateConversion(product, line.quantityCases) : null;

                    return (
                      <tr key={line.productId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{line.productDescription}</p>
                            <p className="text-xs text-gray-500">{line.productReference}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-gray-600">{line.sourceStock}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min={1}
                            max={line.sourceStock}
                            value={line.quantityCases.toString()}
                            onChange={(e) => handleUpdateQty(index, parseInt(e.target.value) || 0)}
                            variant="bordered"
                            size="sm"
                            classNames={{ base: 'w-20 ml-auto', inputWrapper: 'bg-white', input: 'text-right' }}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-gray-600">{line.unitsPerCase}</span>
                        </td>
                        {isB2BtoB2C && (
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-blue-600">{conversion?.totalUnits || 0}</span>
                          </td>
                        )}
                        {canViewCosts && (
                          <td className="px-4 py-3 text-right">
                            <span className="font-mono text-sm text-gray-700">
                              {formatCurrency(isB2BtoB2C ? (conversion?.totalTransferCost || 0) : line.quantityCases * line.costCIF)}
                            </span>
                          </td>
                        )}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveLine(index)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12">
              <Package className="mb-3 h-10 w-10 text-gray-400" />
              <p className="mb-1 text-sm font-medium text-gray-900">Sin productos</p>
              <p className="mb-4 text-xs text-gray-500">Agrega productos para transferir</p>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                <Plus className="h-4 w-4" />
                Agregar Producto
              </button>
            </div>
          )}

          {/* Summary */}
          {lines.length > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-gray-500">Total Cajas</p>
                  <p className="text-lg font-semibold text-gray-900">{totalCases}</p>
                </div>
                {isB2BtoB2C && (
                  <div>
                    <p className="text-xs text-gray-500">Total Unidades</p>
                    <p className="text-lg font-semibold text-blue-600">{totalUnits}</p>
                  </div>
                )}
                {canViewCosts && (
                  <div>
                    <p className="text-xs text-gray-500">Valor Total</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="light" onPress={() => router.back()}>Cancelar</Button>
                <Button color="primary" onPress={handleSubmit} className="bg-brand-600">Enviar Transferencia</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
