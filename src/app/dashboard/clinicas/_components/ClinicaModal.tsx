// src/app/dashboard/clinicas/_components/ClinicaModal.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiBriefcase, FiMail, FiPhone, FiSmartphone, FiMapPin, FiGlobe, FiFacebook, FiInstagram, FiPlusCircle, FiList, FiSave } from 'react-icons/fi';
import { MultiSelectEspecialidades } from '../_components/MultiSelectEspecialidades';
import { AddEspecialidadeModal } from '../_components/AddEspecialidadeModal';
import { Button, Input, Label, Select, Card } from '../../../components/ui/custom-elements';
import { Clinica, Especialidade } from '../../../types/clinicas';

interface ClinicaModalProps {
  clinica: Clinica | null;
  onClose: () => void;
  onSave: (clinica: Clinica) => Promise<void>;
  estados: { sigla: string; nome: string }[];
  especialidadesDisponiveis: Especialidade[];
  onEspecialidadeAdded: () => void;
}

export const ClinicaModal = ({
  clinica,
  onClose,
  onSave,
  estados,
  especialidadesDisponiveis,
  onEspecialidadeAdded
}: ClinicaModalProps) => {
  // Removido 'address' do Omit
  const [formData, setFormData] = useState<Omit<Clinica, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    cnpj: '',
    email: '',
    telephone: '',
    cellphone: '',
    especialidades: [],
    city: '',
    state: '',
    metaAdsId: '',
    instagramId: '',
    ativo: true,
    ...clinica
  });
  const [isAddEspecialidadeModalOpen, setIsAddEspecialidadeModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (clinica) {
      // Removido a desestruturação de 'address'
      setFormData({
        ...clinica,
        especialidades: clinica.especialidades || [],
      });
    } else {
      setFormData({
        name: '',
        cnpj: '',
        email: '',
        telephone: '',
        cellphone: '',
        especialidades: [],
        city: '',
        state: '',
        metaAdsId: '',
        instagramId: '',
        ativo: true,
      });
    }
  }, [clinica]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEspecialidadesChange = (especialidadesSelecionadas: Especialidade[]) => {
    setFormData(prev => ({
      ...prev,
      especialidades: especialidadesSelecionadas
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        id: clinica?.id || 0,
        createdAt: clinica?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Clinica);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewEspecialidadeAdded = (newEspecialidade: Especialidade) => {
    onEspecialidadeAdded();
    setFormData(prev => ({
      ...prev,
      especialidades: [...prev.especialidades, newEspecialidade]
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-900/75 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="relative w-full max-w-2xl p-6 rounded-lg shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in bg-white text-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-3 border-gray-200">
          {clinica ? 'Editar Clínica' : 'Nova Clínica'}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
          aria-label="Fechar"
        >
          <FiX className="h-6 w-6" />
        </Button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SEÇÃO 1: Cadastro da Clínica */}
          <div className="space-y-4 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-indigo-600 flex items-center gap-2">
              <FiUser className="text-gray-500" /> Cadastro da Clínica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">Nome da Clínica *</Label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cnpj" className="mb-1 block text-sm font-medium text-gray-700">CNPJ *</Label>
                <div className="relative">
                  <FiList className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">E-mail *</Label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telephone" className="mb-1 block text-sm font-medium text-gray-700">Telefone</Label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cellphone" className="mb-1 block text-sm font-medium text-gray-700">Celular *</Label>
                <div className="relative">
                  <FiSmartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="cellphone"
                    name="cellphone"
                    value={formData.cellphone}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: Localização */}
          <div className="space-y-4 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-indigo-600 flex items-center gap-2">
              <FiMapPin className="text-gray-500" /> Localização
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">Cidade *</Label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="state" className="mb-1 block text-sm font-medium text-gray-700">Estado *</Label>
                <Select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Selecione' },
                    ...estados.map(estado => ({ value: estado.sigla, label: `${estado.nome} (${estado.sigla})` }))
                  ]}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: Especialidades e Status */}
          <div className="space-y-4 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-indigo-600 flex items-center gap-2">
              <FiList className="text-gray-500" /> Especialidades e Status
            </h3>
            <div className="col-span-2">
              <Label className="mb-1 block text-sm font-medium text-gray-700">Especialidades</Label>
              <div className="flex items-center gap-2">
                <MultiSelectEspecialidades
                  selected={formData.especialidades}
                  onChange={handleEspecialidadesChange}
                  especialidades={especialidadesDisponiveis}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => setIsAddEspecialidadeModalOpen(true)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-md"
                  title="Adicionar nova especialidade"
                >
                  <FiPlusCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 bg-white checked:bg-indigo-600 checked:border-transparent"
              />
              <Label htmlFor="ativo" className="text-sm text-gray-900">Clínica ativa</Label>
            </div>
          </div>

          {/* SEÇÃO 4: Integrações */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-indigo-600 flex items-center gap-2">
              <FiGlobe className="text-gray-500" /> Integrações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metaAdsId" className="mb-1 block text-sm font-medium text-gray-700">Meta Ads ID</Label>
                <div className="relative">
                  <FiFacebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="metaAdsId"
                    name="metaAdsId"
                    value={formData.metaAdsId || ''}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instagramId" className="mb-1 block text-sm font-medium text-gray-700">Instagram ID</Label>
                <div className="relative">
                  <FiInstagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="instagramId"
                    name="instagramId"
                    value={formData.instagramId || ''}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow-sm transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors flex items-center"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> {clinica ? 'Atualizar' : 'Cadastrar'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
      {isAddEspecialidadeModalOpen && (
        <AddEspecialidadeModal
          isOpen={isAddEspecialidadeModalOpen}
          onClose={() => setIsAddEspecialidadeModalOpen(false)}
          onEspecialidadeAdded={handleNewEspecialidadeAdded}
        />
      )}
    </div>
  );
};
