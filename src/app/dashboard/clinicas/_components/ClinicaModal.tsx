// src/app/dashboard/clinicas/_components/ClinicaModal.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiBriefcase, FiMail, FiPhone, FiSmartphone, FiMapPin, FiGlobe, FiFacebook, FiInstagram, FiPlusCircle, FiList } from 'react-icons/fi'; 
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

  useEffect(() => {
    if (clinica) {
      setFormData({ 
        ...clinica,
        especialidades: clinica.especialidades || [] 
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
    await onSave({
      ...formData,
      id: clinica?.id || 0,
      createdAt: clinica?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Clinica);
  };

  const handleNewEspecialidadeAdded = (newEspecialidade: Especialidade) => {
    // Adiciona a nova especialidade à lista de especialidades disponíveis
    // E também a seleciona automaticamente na MultiSelect
    onEspecialidadeAdded(); // Recarrega a lista completa de especialidades na página pai
    setFormData(prev => ({
      ...prev,
      especialidades: [...prev.especialidades, newEspecialidade]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in"> 
      <Card className="relative w-full max-w-2xl p-6 rounded-lg shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in">
        <h2 className="text-2xl font-bold text-[#E0E0F0] mb-4"> 
          {clinica ? 'Editar Clínica' : 'Nova Clínica'}
        </h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#A0A0C0] hover:text-white transition-colors"> 
          <FiX className="h-6 w-6" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6"> {/* Aumenta o espaçamento entre as seções */}
          {/* SEÇÃO 1: Cadastro da Clínica */}
          <div className="space-y-4 pb-4 border-b border-[#404058]">
            <h3 className="text-xl font-semibold text-[#8A2BE2] flex items-center gap-2">
              <FiUser className="text-[#A0A0C0]" /> Cadastro da Clínica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name" className="mb-1 block">Nome da Clínica *</Label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0C0]" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cnpj" className="mb-1 block">CNPJ *</Label>
                <div className="relative">
                  <FiList className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0C0]" />
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="mb-1 block">E-mail *</Label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0C0]" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telephone" className="mb-1 block">Telefone</Label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0C0]" />
                  <Input
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="pl-10 bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cellphone" className="mb-1 block">Celular *</Label>
                <div className="relative">
                  <FiSmartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0C0]" />
                  <Input
                    id="cellphone"
                    name="cellphone"
                    value={formData.cellphone}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: Localização */}
          <div className="space-y-4 pb-4 border-b border-[#404058]">
            <h3 className="text-xl font-semibold text-[#8A2BE2] flex items-center gap-2">
              <FiMapPin className="text-[#A0A0C0]" /> Localização
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="mb-1 block">Cidade *</Label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0C0]" />
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="state" className="mb-1 block">Estado *</Label>
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
                  className="bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: Especialidades e Status */}
          <div className="space-y-4 pb-4 border-b border-[#404058]">
            <h3 className="text-xl font-semibold text-[#8A2BE2] flex items-center gap-2">
              <FiList className="text-[#A0A0C0]" /> Especialidades e Status
            </h3>
            <div className="col-span-2">
              <Label className="mb-1 block">Especialidades</Label>
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
                  className="bg-[#404058] hover:bg-[#2C2C3E] text-[#E0E0F0] shadow-md"
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
                className="h-4 w-4 text-[#8A2BE2] border-[#404058] rounded focus:ring-[#8A2BE2] bg-[#2C2C3E] checked:bg-[#8A2BE2] checked:border-transparent"
              />
              <Label htmlFor="ativo">Clínica ativa</Label>
            </div>
          </div>

          {/* SEÇÃO 4: Integrações */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#8A2BE2] flex items-center gap-2">
              <FiGlobe className="text-[#A0A0C0]" /> Integrações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metaAdsId" className="mb-1 block">Meta Ads ID</Label>
                <div className="relative">
                  <FiFacebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0C0]" />
                  <Input
                    id="metaAdsId"
                    name="metaAdsId"
                    value={formData.metaAdsId || ''}
                    onChange={handleChange}
                    className="pl-10 bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instagramId" className="mb-1 block">Instagram ID</Label>
                <div className="relative">
                  <FiInstagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0C0]" />
                  <Input
                    id="instagramId"
                    name="instagramId"
                    value={formData.instagramId || ''}
                    onChange={handleChange}
                    className="pl-10 bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {clinica ? 'Atualizar' : 'Cadastrar'}
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
