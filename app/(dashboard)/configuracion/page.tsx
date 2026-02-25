'use client';

import { PlaceholderPage } from '@/components/shared/placeholder-page';
import { Settings } from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <PlaceholderPage
      title="Configuración"
      description="Usuarios, roles, permisos y catálogos del sistema"
      icon={<Settings className="h-10 w-10 text-brand-600" />}
    />
  );
}
