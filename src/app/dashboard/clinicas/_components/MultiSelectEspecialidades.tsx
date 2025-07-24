// src/app/dashboard/clinicas/_components/MultiSelectEspecialidades.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { FiX, FiCheck, FiChevronDown, FiSearch } from 'react-icons/fi';
import { Especialidade } from '../../../types/clinicas';
import { Button, Badge } from '../../../components/ui/custom-elements';
import { getSpecialtyColor } from '@/app/lib/utils';

interface MultiSelectEspecialidadesProps {
  selected: Especialidade[];
  onChange: (especialidades: Especialidade[]) => void;
  especialidades?: Especialidade[];
  className?: string;
}

export function MultiSelectEspecialidades({
  selected,
  onChange,
  especialidades = [],
  className = '',
}: MultiSelectEspecialidadesProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null); // Mantido o tipo HTMLButtonElement

  const filteredEspecialidades = especialidades.filter(esp =>
    esp.nome.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (esp: Especialidade) => {
    const isSelected = selected.some((e) => e.id === esp.id);
    onChange(
      isSelected
        ? selected.filter((e) => e.id !== esp.id)
        : [...selected, esp]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Button
        ref={triggerRef} // O erro está aqui, precisamos corrigir o componente Button
        type="button"
        variant="outline"
        className="w-full justify-between flex items-center min-h-[40px] px-3 py-2 border rounded-md bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-2 focus:ring-[#8A2BE2] focus:outline-none transition"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1">
          {selected.length > 0 ? (
            selected.map((esp) => (
              <Badge
                key={esp.id}
                color={esp.color || getSpecialtyColor(esp.nome)}
                className="mr-1 text-white hover:opacity-80 transition-opacity duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(selected.filter((e) => e.id !== esp.id));
                }}
              >
                {esp.nome}
                <FiX className="ml-1 h-3 w-3 inline-block cursor-pointer" />
              </Badge>
            ))
          ) : (
            <span className="text-[#A0A0C0]">
              Selecione especialidades...
            </span>
          )}
        </div>
        <FiChevronDown className={`ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform ${open ? 'rotate-180' : 'rotate-0'} text-[#A0A0C0]`} />
      </Button>

      {open && (
        <div ref={popoverRef} className="absolute z-50 mt-1 w-full rounded-md border border-[#404058] bg-[#2C2C3E] shadow-lg">
          <div className="p-2 border-b border-[#404058]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0C0]" />
              <input
                type="text"
                placeholder="Pesquisar especialidades..."
                className="w-full pl-9 pr-2 py-2 rounded-md bg-[#1C1C2C] border border-[#404058] text-sm text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-1 focus:ring-[#8A2BE2] focus:outline-none"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredEspecialidades.length === 0 && (
              <div className="py-6 text-center text-sm text-[#A0A0C0]">
                Nenhuma especialidade encontrada.
              </div>
            )}
            {filteredEspecialidades.map((esp) => {
              const isSelected = selected.some((e) => e.id === esp.id);
              return (
                <div
                  key={esp.id}
                  className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#404058] transition-colors"
                  onClick={() => handleSelect(esp)}
                >
                  <div
                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                      isSelected
                        ? 'bg-[#8A2BE2] text-white border-[#8A2BE2]'
                        : 'border-[#404058] bg-[#1C1C2C]'
                    }`}
                  >
                    {isSelected && <FiCheck className="h-3 w-3" />}
                  </div>
                  <span className="text-[#E0E0F0]">{esp.nome}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
