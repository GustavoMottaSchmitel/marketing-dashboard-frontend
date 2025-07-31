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
      setPreviewColor('#D1D5DB'); // Cor padrão para preview no tema claro (gray-300)
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
    <div className="fixed inset-0 bg-gray-900/75 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="relative w-full max-w-md p-6 rounded-lg shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in bg-white text-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiPlus className="text-indigo-600" /> Nova Especialidade
        </h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors">
          <FiX className="h-6 w-6" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome da Especialidade *</Label>
            <Input
              id="nome"
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
          </div>
          <div>
            <Label htmlFor="color" className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
              Cor (Hex ou Nome CSS)
              <span
                className="w-6 h-6 rounded-full border border-gray-300"
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
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">Se vazio, uma cor será gerada automaticamente.</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow-sm transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Adicionando...
                </>
              ) : (
                'Adicionar'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
