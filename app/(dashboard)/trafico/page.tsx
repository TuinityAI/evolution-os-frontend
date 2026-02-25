'use client';

import { PlaceholderPage } from '@/components/shared/placeholder-page';
import { Ship } from 'lucide-react';

export default function TraficoPage() {
  return (
    <PlaceholderPage
      title="Tráfico"
      description="Documentos aduanales, DMC, Bill of Lading"
      icon={<Ship className="h-10 w-10 text-brand-600" />}
    />
  );
}
