// src/app/dashboard/clinicas/_components/AddEspecialidadeModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { Card, Button, Input, Label } from '@/app/components/ui/custom-elements';
import { Especialidade } from '@/app/types/clinicas';
import { saveEspecialidade } from '@/app/lib/especialidades';
import { getSpecialtyColor } from '@/app/lib/utils';
import { toast } from 'sonner';

interface AddEspecialidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEspecialidadeAdded: (newEspecialidade: Especialidade) => void;
}

export const AddEspecialidadeModal: React.FC<AddEspecialidadeModalProps> = ({ isOpen, onClose, onEspecialidadeAdded }) => {
  const [nome, setNome] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewColor, setPreviewColor] = useState('');

  useEffect(() => {
    if (color) {
      setPreviewColor(color);
    } else if (nome) {
      setPreviewColor(getSpecialtyColor(nome));
    } else {
      setPreviewColor('#A0A0C0');
    }
  }, [nome, color]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!nome.trim()) {
      toast.error('O nome da especialidade é obrigatório.');
      setLoading(false);
      return;
    }

    try {
      const especialidadeToSave = {
        nome: nome.trim(),
        color: color.trim() || getSpecialtyColor(nome.trim()),
      };
      const newEspecialidade: Especialidade = await saveEspecialidade(especialidadeToSave);
      toast.success(`Especialidade "${newEspecialidade.nome}" adicionada com sucesso!`);
      onEspecialidadeAdded(newEspecialidade);
      onClose();
    } catch (error: unknown) {
      console.error('Erro ao adicionar especialidade:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Erro ao adicionar especialidade.');
      } else {
        toast.error('Erro desconhecido ao adicionar especialidade.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="relative w-full max-w-md p-6 rounded-lg shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in">
        <h2 className="text-2xl font-bold text-[#E0E0F0] mb-4 flex items-center gap-2">
          <FiPlus className="text-[#8A2BE2]" /> Nova Especialidade
        </h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#A0A0C0] hover:text-white transition-colors">
          <FiX className="h-6 w-6" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Especialidade *</Label>
            <Input
              id="nome"
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]"
            />
          </div>
          <div>
            <Label htmlFor="color" className="flex items-center justify-between">
              Cor (Hex ou Nome CSS)
              <span
                className="w-6 h-6 rounded-full border border-[#404058]"
                style={{ backgroundColor: previewColor }}
                title={`Cor de preview: ${previewColor}`}
              ></span>
            </Label>
            <Input
              id="color"
              name="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#RRGGBB ou blue"
              className="bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]"
            />
            <p className="text-xs text-[#A0A0C0] mt-1">Se vazio, uma cor será gerada automaticamente.</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
