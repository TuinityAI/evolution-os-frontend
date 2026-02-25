'use client';

import { PlaceholderPage } from '@/components/shared/placeholder-page';
import { BarChart3 } from 'lucide-react';

export default function ReportesPage() {
  return (
    <PlaceholderPage
      title="Reportes"
      description="Reportes de ventas, inventario, compras y finanzas"
      icon={<BarChart3 className="h-10 w-10 text-brand-600" />}
    />
  );
}
