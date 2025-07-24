// src/app/dashboard/clinicas/_components/Filters.tsx

'use client';

import { FiSearch, FiX } from 'react-icons/fi';
import { estadosBrasil } from '../../../lib/constants/states';
import { Especialidade } from '../../../types/clinicas';
import { Input, Label, Button, Select } from '../../../components/ui/custom-elements'; 

interface FiltersProps {
  searchTerm: string;
  filters: {
    state: string;
    specialty: string;
    status: string;
  };
  especialidades: Especialidade[];
  onSearchChange: (term: string) => void;
  onFilterChange: (filterName: string, value: string) => void;
  onResetFilters: () => void;
}

export const Filters = ({
  searchTerm,
  filters,
  especialidades,
  onSearchChange,
  onFilterChange,
  onResetFilters,
}: FiltersProps) => {
  return (
    <div className="bg-[#2C2C3E] p-6 rounded-lg border border-[#404058] shadow-xl"> {/* Mais padding e sombra */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Aumenta o gap */}
        {/* Pesquisa */}
        <div>
          <Label htmlFor="search-input" className="mb-1 block">Pesquisar</Label> {/* Label com margin-bottom */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0C0]" /> 
            <Input 
              id="search-input"
              placeholder="Nome, email, cidade..."
              className="pl-9 bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]" // Borda de foco roxa
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <Label htmlFor="filter-state" className="mb-1 block">Estado</Label>
          <Select 
            id="filter-state"
            value={filters.state}
            onChange={(e) => onFilterChange('state', e.target.value)}
            options={[
              { value: '', label: 'Todos estados' },
              ...estadosBrasil.map(estado => ({ value: estado.sigla, label: `${estado.nome} (${estado.sigla})` }))
            ]}
            className="bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]" // Borda de foco roxa
          />
        </div>

        {/* Especialidade */}
        <div>
          <Label htmlFor="filter-specialty" className="mb-1 block">Especialidade</Label>
          <Select 
            id="filter-specialty"
            value={filters.specialty}
            onChange={(e) => onFilterChange('specialty', e.target.value)}
            options={[
              { value: '', label: 'Todas especialidades' },
              ...especialidades.map(esp => ({ value: String(esp.id), label: esp.nome }))
            ]}
            className="bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]" // Borda de foco roxa
          />
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="filter-status" className="mb-1 block">Status</Label>
          <Select 
            id="filter-status"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            options={[
              { value: '', label: 'Todos status' },
              { value: 'Ativo', label: 'Ativo' },
              { value: 'Inativo', label: 'Inativo' }
            ]}
            className="bg-[#1C1C2C] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]" // Borda de foco roxa
          />
        </div>
      </div>

      <div className="flex justify-end mt-6"> {/* Mais margin-top */}
        <Button
          onClick={onResetFilters}
          variant="ghost" 
          className="text-sm flex items-center text-[#8A2BE2] hover:text-white hover:bg-[#3A3A4E] px-4 py-2 rounded-md" // Cores de hover mais suaves e fundo
        >
          <FiX className="mr-1 h-4 w-4" />
          Limpar filtros
        </Button>
      </div>
    </div>
  );
};
