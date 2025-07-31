
'use client';

import { FiSearch, FiRefreshCcw } from 'react-icons/fi';
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
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pesquisa */}
        <div>
          <Label htmlFor="search-input" className="mb-1 block text-sm font-medium text-gray-700">Pesquisar</Label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search-input"
              placeholder="Nome, email, cidade..."
              className="pl-9 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <Label htmlFor="filter-state" className="mb-1 block text-sm font-medium text-gray-700">Estado</Label>
          <Select
            id="filter-state"
            value={filters.state}
            onChange={(e) => onFilterChange('state', e.target.value)}
            options={[
              { value: '', label: 'Todos estados' },
              ...estadosBrasil.map(estado => ({ value: estado.sigla, label: `${estado.nome} (${estado.sigla})` }))
            ]}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
          />
        </div>

        {/* Especialidade */}
        <div>
          <Label htmlFor="filter-specialty" className="mb-1 block text-sm font-medium text-gray-700">Especialidade</Label>
          <Select
            id="filter-specialty"
            value={filters.specialty}
            onChange={(e) => onFilterChange('specialty', e.target.value)}
            options={[
              { value: '', label: 'Todas especialidades' },
              ...especialidades.map(esp => ({ value: String(esp.id), label: esp.nome }))
            ]}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
          />
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="filter-status" className="mb-1 block text-sm font-medium text-gray-700">Status</Label>
          <Select
            id="filter-status"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            options={[
              { value: '', label: 'Todos status' },
              { value: 'true', label: 'Ativo' },
              { value: 'false', label: 'Inativo' }
            ]}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          onClick={onResetFilters}
          variant="ghost"
          className="text-sm flex items-center text-indigo-600 hover:text-indigo-800 hover:bg-gray-100 px-4 py-2 rounded-md transition-colors"
        >
          <FiRefreshCcw className="mr-1 h-4 w-4" />
          Limpar filtros
        </Button>
      </div>
    </div>
  );
};
