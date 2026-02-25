/**
 * Warehouses Mock Data for Evolution OS
 * Based on Document 04 - Módulo de Control de Inventario
 */

import { Warehouse, WarehouseType } from '@/lib/types/inventory';

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'WH-001',
    name: 'Bodega Zona Libre',
    code: 'ZL',
    type: 'B2B',
    location: 'Colón Free Zone, Panamá',
    isActive: true,
  },
  {
    id: 'WH-002',
    name: 'Tienda Panama City',
    code: 'PTY-TIENDA',
    type: 'B2C',
    location: 'Panama City, Panamá',
    isActive: true,
  },
  {
    id: 'WH-003',
    name: 'Bodega CFZ',
    code: 'CFZ',
    type: 'B2B',
    location: 'Colón Free Zone - Sector 2',
    isActive: true,
  },
];

// Helper functions
export function getWarehouseById(id: string): Warehouse | undefined {
  return MOCK_WAREHOUSES.find((w) => w.id === id);
}

export function getWarehousesByType(type: WarehouseType): Warehouse[] {
  return MOCK_WAREHOUSES.filter((w) => w.type === type && w.isActive);
}

export function getActiveWarehouses(): Warehouse[] {
  return MOCK_WAREHOUSES.filter((w) => w.isActive);
}

export function getB2BWarehouses(): Warehouse[] {
  return getWarehousesByType('B2B');
}

export function getB2CWarehouses(): Warehouse[] {
  return getWarehousesByType('B2C');
}

// Check if transfer is B2B to B2C (requires conversion)
export function isB2BtoB2CTransfer(sourceId: string, destId: string): boolean {
  const source = getWarehouseById(sourceId);
  const dest = getWarehouseById(destId);
  return source?.type === 'B2B' && dest?.type === 'B2C';
}

// Default inflation factor for B2B to B2C transfers
export const DEFAULT_TRANSFER_INFLATION_FACTOR = 1.15; // 15% markup
