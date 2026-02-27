'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Button,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import { CustomModal, CustomModalHeader, CustomModalBody, CustomModalFooter } from '@/components/ui/custom-modal';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  GitBranch,
  Plus,
  Edit,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { useStore } from '@/hooks/use-store';
import {
  getApprovalFlowsData,
  subscribeApprovalFlows,
  addApprovalFlow,
  updateApprovalFlow,
} from '@/lib/mock-data/configuration';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/constants/roles';
import type { ApprovalFlow } from '@/lib/types/configuration';

export default function AprobacionesPage() {
  const router = useRouter();

  const flows = useStore(subscribeApprovalFlows, getApprovalFlowsData);

  const [isOpen, setIsOpen] = useState(false);

  const [editingFlow, setEditingFlow] = useState<ApprovalFlow | null>(null);
  const [flowForm, setFlowForm] = useState({
    name: '',
    description: '',
    triggerCondition: '',
  });

  const handleToggleFlow = (flowId: string) => {
    const flow = flows.find((f) => f.id === flowId);
    if (!flow) return;
    const newActive = !flow.isActive;
    updateApprovalFlow(flowId, { isActive: newActive });
    toast.success(newActive ? 'Flujo activado' : 'Flujo desactivado', {
      id: `toggle-flow-${flowId}`,
      description: flow.name,
    });
  };

  const handleOpenModal = (flow?: ApprovalFlow) => {
    if (flow) {
      setEditingFlow(flow);
      setFlowForm({
        name: flow.name,
        description: flow.description,
        triggerCondition: flow.triggerCondition,
      });
    } else {
      setEditingFlow(null);
      setFlowForm({ name: '', description: '', triggerCondition: '' });
    }
    setIsOpen(true);
  };

  const handleSaveFlow = () => {
    if (editingFlow) {
      updateApprovalFlow(editingFlow.id, { name: flowForm.name, description: flowForm.description, triggerCondition: flowForm.triggerCondition });
    } else {
      const newId = `AF-${String(flows.length + 1).padStart(3, '0')}`;
      addApprovalFlow({ id: newId, name: flowForm.name, description: flowForm.description, triggerCondition: flowForm.triggerCondition, isActive: true, steps: [] });
    }
    toast.success(editingFlow ? 'Flujo actualizado' : 'Flujo creado', {
      description: editingFlow
        ? `El flujo "${flowForm.name}" se ha actualizado.`
        : `El flujo "${flowForm.name}" se ha creado exitosamente.`,
    });
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Back link and header */}
      <div>
        <button
          onClick={() => router.push('/configuracion')}
          className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-[#888888] transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Configuración
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
              <GitBranch className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Flujos de Aprobación</h1>
              <p className="text-sm text-gray-500 dark:text-[#888888]">{flows.length} flujos configurados</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex h-9 items-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            <Plus className="h-4 w-4" />
            Nuevo Flujo
          </button>
        </div>
      </div>

      {/* Approval Flow Cards */}
      <div className="space-y-4">
        {flows.map((flow, index) => (
          <motion.div
            key={flow.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#141414] p-5"
          >
            {/* Flow Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{flow.name}</h3>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    flow.isActive
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-gray-500/10 text-gray-500'
                  )}>
                    {flow.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-[#888888]">{flow.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={flow.isActive}
                  onCheckedChange={() => handleToggleFlow(flow.id)}
                />
                <button
                  onClick={() => handleOpenModal(flow)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-[#666666] transition-colors hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-gray-600 dark:hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Trigger Condition */}
            <div className="mt-3 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                {flow.triggerCondition}
              </span>
            </div>

            {/* Visual Flow Steps */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {flow.steps.map((step, stepIndex) => {
                const roleColor = ROLE_COLORS[step.approverRole];
                return (
                  <div key={step.id} className="flex items-center gap-2">
                    {stepIndex > 0 && (
                      <ArrowRight className="h-4 w-4 text-gray-300 dark:text-[#444444]" />
                    )}
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a] px-3 py-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-[#2a2a2a] text-xs font-bold text-gray-600 dark:text-gray-400">
                        {step.order}
                      </div>
                      <div>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', roleColor.bg, roleColor.text)}>
                          {step.approverLabel}
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          {step.isRequired && (
                            <span className="flex items-center gap-0.5 text-[10px] text-red-500">
                              <AlertTriangle className="h-3 w-3" />
                              Requerido
                            </span>
                          )}
                          {step.timeoutHours && (
                            <span className="flex items-center gap-0.5 text-[10px] text-gray-500 dark:text-[#888888]">
                              <Clock className="h-3 w-3" />
                              {step.timeoutHours}h
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Escalation */}
            {flow.escalationTimeout && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#0a0a0a] px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs text-gray-500 dark:text-[#888888]">
                  Escalamiento automático después de {flow.escalationTimeout}h
                  {flow.escalateTo && ` a ${ROLE_LABELS[flow.escalateTo as keyof typeof ROLE_LABELS] || flow.escalateTo}`}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Flow Modal */}
      <CustomModal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg" scrollable>
        <CustomModalHeader onClose={() => setIsOpen(false)}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
              <GitBranch className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingFlow ? 'Editar Flujo de Aprobación' : 'Nuevo Flujo de Aprobación'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-[#888888]">
                {editingFlow ? `Editando ${editingFlow.name}` : 'Definir un nuevo flujo de aprobación'}
              </p>
            </div>
          </div>
        </CustomModalHeader>
        <CustomModalBody className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Flujo</label>
              <Input placeholder="Ej: Aprobación de descuentos especiales" value={flowForm.name} onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })} variant="bordered" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
              <Input placeholder="Descripción detallada del flujo" value={flowForm.description} onChange={(e) => setFlowForm({ ...flowForm, description: e.target.value })} variant="bordered" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Condición de Activación</label>
              <Input placeholder="Ej: Descuento > 15%" value={flowForm.triggerCondition} onChange={(e) => setFlowForm({ ...flowForm, triggerCondition: e.target.value })} variant="bordered" />
            </div>

            {/* Steps Builder */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Pasos de Aprobación</h4>
              {editingFlow ? (
                <div className="space-y-2">
                  {editingFlow.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#0a0a0a] p-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-600">{step.order}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{step.approverLabel}</span>
                      {step.isRequired && <span className="text-xs text-red-500">Requerido</span>}
                      {step.timeoutHours && <span className="text-xs text-gray-500 dark:text-[#888888]">Timeout: {step.timeoutHours}h</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#0a0a0a] p-6 text-center">
                  <User className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-[#888888]">Agrega pasos de aprobación al flujo</p>
                  <button
                    onClick={() => toast.info('Constructor de pasos (mock)')}
                    className="mt-3 flex mx-auto items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2a2a2a]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar Paso
                  </button>
                </div>
              )}
            </div>
          </div>
        </CustomModalBody>
        <CustomModalFooter>
          <Button variant="light" onPress={() => setIsOpen(false)}>Cancelar</Button>
          <Button color="primary" onPress={handleSaveFlow} className="bg-brand-600">
            {editingFlow ? 'Guardar Cambios' : 'Crear Flujo'}
          </Button>
        </CustomModalFooter>
      </CustomModal>
    </div>
  );
}
