// src/app/dashboard/clinicas/_components/MultiSelectEspecialidades.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const triggerRef = useRef<HTMLButtonElement>(null);

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
        ref={triggerRef}
        type="button"
        variant="outline"
        className="w-full justify-between flex items-center min-h-[40px] px-3 py-2 border rounded-md bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1">
          {selected.length > 0 ? (
            selected.map((esp) => (
              <Badge
                key={esp.id}
                style={{ backgroundColor: esp.color || getSpecialtyColor(esp.nome), color: '#FFFFFF' }} // Cores dinâmicas para as badges
                className="mr-1 hover:opacity-80 transition-opacity duration-200"
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
            <span className="text-gray-500">
              Selecione especialidades...
            </span>
          )}
        </div>
        <FiChevronDown className={`ml-2 h-4 w-4 shrink-0 text-gray-400 opacity-50 transition-transform ${open ? 'rotate-180' : 'rotate-0'}`} />
      </Button>

      {open && (
        <div ref={popoverRef} className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar especialidades..."
                className="w-full pl-9 pr-2 py-2 rounded-md bg-gray-50 border border-gray-300 text-sm text-gray-900 placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredEspecialidades.length === 0 && (
              <div className="py-6 text-center text-sm text-gray-500">
                Nenhuma especialidade encontrada.
              </div>
            )}
            {filteredEspecialidades.map((esp) => {
              const isSelected = selected.some((e) => e.id === esp.id);
              return (
                <div
                  key={esp.id}
                  className="flex items-center px-4 py-2 cursor-pointer hover:bg-indigo-50 transition-colors"
                  onClick={() => handleSelect(esp)}
                >
                  <div
                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 bg-white'
                      }`}
                  >
                    {isSelected && <FiCheck className="h-3 w-3" />}
                  </div>
                  <span className="text-gray-900">{esp.nome}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
