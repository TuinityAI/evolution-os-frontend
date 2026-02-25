'use client';

import { PlaceholderPage } from '@/components/shared/placeholder-page';
import { Store } from 'lucide-react';

export default function POSPage() {
  return (
    <PlaceholderPage
      title="Punto de Venta"
      description="Sistema de ventas B2C para mostrador"
      icon={<Store className="h-10 w-10 text-brand-600" />}
    />
  );
}
