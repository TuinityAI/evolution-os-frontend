'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Ship, Package, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/contexts/auth-context';
import { useStore } from '@/hooks/use-store';
import {
  getExpedientsData,
  subscribeExpedients,
  getDMCDocumentsData,
  subscribeDMCDocuments,
  getPortsData,
  subscribePorts,
  getCarriersData,
  subscribeCarriers,
  getExpedientById,
  getDMCsByExpedient,
} from '@/lib/mock-data/traffic';
import { TRANSPORT_MODE_LABELS } from '@/lib/types/traffic';
import type { DMCType, TransportMode, DMCMerchandiseLine } from '@/lib/types/traffic';

const DMC_TYPE_OPTIONS: { value: DMCType; label: string }[] = [
  { value: 'salida', label: 'Salida' },
  { value: 'entrada', label: 'Entrada' },
  { value: 'traspaso', label: 'Traspaso' },
];

const TRANSPORT_MODE_OPTIONS: { value: TransportMode; label: string }[] = [
  { value: 'maritimo', label: 'Maritimo' },
  { value: 'aereo', label: 'Aereo' },
  { value: 'terrestre', label: 'Terrestre' },
  { value: 'multimodal', label: 'Multimodal' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
const inputClass =
  'h-9 w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#666] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500';
const selectClass =
  'h-9 w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-3 text-sm text-gray-900 dark:text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500';

export default function NuevaDMCPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkPermission } = useAuth();
  const canCreate = checkPermission('canCreateDMC');

  const allExpedients = useStore(subscribeExpedients, useCallback(() => getExpedientsData(), []));
  const allDmcs = useStore(subscribeDMCDocuments, useCallback(() => getDMCDocumentsData(), []));
  const ports = useStore(subscribePorts, useCallback(() => getPortsData(), []));
  const carriers = useStore(subscribeCarriers, useCallback(() => getCarriersData(), []));

  const expedientId = searchParams.get('expedientId');
  const expedient = useMemo(
    () => (expedientId ? getExpedientById(expedientId) : undefined),
    [expedientId, allExpedients]
  );
  const existingDMCs = useMemo(
    () => (expedientId ? getDMCsByExpedient(expedientId) : []),
    [expedientId, allDmcs]
  );
  const existingDMC = existingDMCs[0];

  // Form state - pre-fill from expedient
  const [dmcType, setDmcType] = useState<DMCType>(
    expedient?.type === 'entrada' ? 'entrada' : expedient?.type === 'traspaso' ? 'traspaso' : 'salida'
  );
  const [invoiceNumber, setInvoiceNumber] = useState(expedient?.sourceDocumentId ?? '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [shipper, setShipper] = useState('Evolution Zona Libre S.A.');
  const [consignee, setConsignee] = useState(expedient?.counterpartName ?? '');
  const [country, setCountry] = useState(expedient?.counterpartCountry ?? '');

  // Transport
  const [transportMode, setTransportMode] = useState<TransportMode>(
    expedient?.transport?.mode ?? 'maritimo'
  );
  const [carrier, setCarrier] = useState(expedient?.transport?.carrierName ?? '');
  const [vessel, setVessel] = useState(expedient?.transport?.vesselName ?? '');
  const [voyage, setVoyage] = useState(expedient?.transport?.voyageNumber ?? '');
  const [booking, setBooking] = useState(expedient?.transport?.bookingNumber ?? '');
  const [container, setContainer] = useState(expedient?.transport?.containerNumber ?? '');
  const [seal, setSeal] = useState(expedient?.transport?.sealNumber ?? '');
  const [etd, setEtd] = useState(expedient?.transport?.etd?.slice(0, 10) ?? '');
  const [portOfLoading, setPortOfLoading] = useState(
    expedient?.transport?.portOfLoading ?? 'PACLE'
  );
  const [portOfDischarge, setPortOfDischarge] = useState(
    expedient?.transport?.portOfDischarge ?? ''
  );

  // Merchandise lines - pre-fill from existing DMC or empty
  const [lines, setLines] = useState<DMCMerchandiseLine[]>(
    existingDMC?.merchandiseLines ?? [
      {
        tariffCode: '',
        description: '',
        numberOfPackages: 0,
        numberOfCases: 0,
        netWeightKg: 0,
        grossWeightKg: 0,
        volumeM3: 0,
        valueFOB: 0,
      },
    ]
  );

  const [notes, setNotes] = useState('');

  // Calculated totals
  const totals = useMemo(() => {
    return lines.reduce(
      (acc, line) => ({
        packages: acc.packages + line.numberOfPackages,
        cases: acc.cases + line.numberOfCases,
        netWeight: acc.netWeight + line.netWeightKg,
        grossWeight: acc.grossWeight + line.grossWeightKg,
        volume: acc.volume + line.volumeM3,
        valueFOB: acc.valueFOB + line.valueFOB,
      }),
      { packages: 0, cases: 0, netWeight: 0, grossWeight: 0, volume: 0, valueFOB: 0 }
    );
  }, [lines]);

  const updateLine = (index: number, field: keyof DMCMerchandiseLine, value: string | number) => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line))
    );
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        tariffCode: '',
        description: '',
        numberOfPackages: 0,
        numberOfCases: 0,
        netWeightKg: 0,
        grossWeightKg: 0,
        volumeM3: 0,
        valueFOB: 0,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    toast.success('DMC guardada como borrador', { id: 'dmc-draft' });
  };

  const handleComplete = () => {
    toast.success('DMC completada exitosamente', { id: 'dmc-complete' });
  };

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <FileText className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
        <h2 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
          Sin permisos
        </h2>
        <p className="text-sm text-gray-500 dark:text-[#888888]">
          No tienes permiso para crear DMC.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="flex w-fit items-center gap-1.5 text-sm text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Nueva DMC</h1>
            {expedient && (
              <p className="text-sm text-gray-500 dark:text-[#888888]">
                Desde expediente {expedient.id} - {expedient.counterpartName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Section 1: Datos Generales */}
        <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Datos Generales
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Tipo de DMC</label>
              <select
                value={dmcType}
                onChange={(e) => setDmcType(e.target.value as DMCType)}
                className={selectClass}
              >
                {DMC_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Numero de Factura</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="FAC-2026-XXXX"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Remitente (Shipper)</label>
              <input
                type="text"
                value={shipper}
                onChange={(e) => setShipper(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Consignatario</label>
              <input
                type="text"
                value={consignee}
                onChange={(e) => setConsignee(e.target.value)}
                placeholder="Nombre del consignatario"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Pais de destino</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Pais"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Transporte */}
        <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            <Ship className="h-4 w-4" />
            Transporte
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Modo</label>
              <select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value as TransportMode)}
                className={selectClass}
              >
                {TRANSPORT_MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Naviera / Carrier</label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className={selectClass}
              >
                <option value="">Seleccionar...</option>
                {carriers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Buque</label>
              <input
                type="text"
                value={vessel}
                onChange={(e) => setVessel(e.target.value)}
                placeholder="Nombre del buque"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Viaje</label>
              <input
                type="text"
                value={voyage}
                onChange={(e) => setVoyage(e.target.value)}
                placeholder="Numero de viaje"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Booking</label>
              <input
                type="text"
                value={booking}
                onChange={(e) => setBooking(e.target.value)}
                placeholder="Numero de booking"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Contenedor</label>
              <input
                type="text"
                value={container}
                onChange={(e) => setContainer(e.target.value)}
                placeholder="XXXX0000000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sello</label>
              <input
                type="text"
                value={seal}
                onChange={(e) => setSeal(e.target.value)}
                placeholder="Numero de sello"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>ETD</label>
              <input
                type="date"
                value={etd}
                onChange={(e) => setEtd(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Puerto de Embarque</label>
              <select
                value={portOfLoading}
                onChange={(e) => setPortOfLoading(e.target.value)}
                className={selectClass}
              >
                {ports.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Puerto de Descarga</label>
              <select
                value={portOfDischarge}
                onChange={(e) => setPortOfDischarge(e.target.value)}
                className={selectClass}
              >
                <option value="">Seleccionar...</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Mercancia */}
        <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              <Package className="h-4 w-4" />
              Mercancia
            </h3>
            <button
              onClick={addLine}
              className="flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-sky-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar linea
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#2a2a2a]">
                  <th className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-[#888]">
                    Arancel
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-[#888]">
                    Descripcion
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-[#888]">
                    Cajas
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-[#888]">
                    P.Neto
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-[#888]">
                    P.Bruto
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-[#888]">
                    Vol m3
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium uppercase text-gray-500 dark:text-[#888]">
                    FOB
                  </th>
                  <th className="px-2 py-2 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a2a]">
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={line.tariffCode}
                        onChange={(e) => updateLine(idx, 'tariffCode', e.target.value)}
                        placeholder="0000000000"
                        className={cn(inputClass, 'w-28 font-mono text-xs')}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateLine(idx, 'description', e.target.value)}
                        placeholder="Descripcion del producto"
                        className={cn(inputClass, 'min-w-[200px] text-xs')}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={line.numberOfCases || ''}
                        onChange={(e) => updateLine(idx, 'numberOfCases', Number(e.target.value))}
                        className={cn(inputClass, 'w-20 text-right text-xs')}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={line.netWeightKg || ''}
                        onChange={(e) => updateLine(idx, 'netWeightKg', Number(e.target.value))}
                        className={cn(inputClass, 'w-24 text-right text-xs')}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={line.grossWeightKg || ''}
                        onChange={(e) => updateLine(idx, 'grossWeightKg', Number(e.target.value))}
                        className={cn(inputClass, 'w-24 text-right text-xs')}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={line.volumeM3 || ''}
                        onChange={(e) => updateLine(idx, 'volumeM3', Number(e.target.value))}
                        className={cn(inputClass, 'w-20 text-right text-xs')}
                        step="0.1"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={line.valueFOB || ''}
                        onChange={(e) => updateLine(idx, 'valueFOB', Number(e.target.value))}
                        className={cn(inputClass, 'w-28 text-right text-xs')}
                        step="0.01"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => removeLine(idx)}
                        disabled={lines.length <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
                  <td className="px-2 py-2 text-xs font-semibold text-gray-900 dark:text-white" colSpan={2}>
                    Totales
                  </td>
                  <td className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">
                    {totals.cases}
                  </td>
                  <td className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">
                    {formatNumber(totals.netWeight)}
                  </td>
                  <td className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">
                    {formatNumber(totals.grossWeight)}
                  </td>
                  <td className="px-2 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">
                    {formatNumber(totals.volume)}
                  </td>
                  <td className="px-2 py-2 text-right text-xs font-bold text-sky-700 dark:text-sky-300">
                    {formatCurrency(totals.valueFOB)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 4: Totals & Notes */}
        <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Resumen y Notas
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Bultos', value: totals.packages.toString() },
                { label: 'Total Cajas', value: totals.cases.toString() },
                { label: 'Peso Neto', value: `${formatNumber(totals.netWeight)} kg` },
                { label: 'Peso Bruto', value: `${formatNumber(totals.grossWeight)} kg` },
                { label: 'Volumen', value: `${formatNumber(totals.volume)} m\u00B3` },
                { label: 'Valor FOB', value: formatCurrency(totals.valueFOB) },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-gray-50 dark:bg-[#1a1a1a] p-3">
                  <p className="text-xs text-gray-500 dark:text-[#888888]">{item.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <label className={labelClass}>Notas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder="Observaciones adicionales..."
                className="w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#666] focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveDraft}
            className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 px-4 py-2 text-sm font-medium text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/50 transition-colors"
          >
            Guardar Borrador
          </button>
          <button
            onClick={handleComplete}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors"
          >
            Completar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
