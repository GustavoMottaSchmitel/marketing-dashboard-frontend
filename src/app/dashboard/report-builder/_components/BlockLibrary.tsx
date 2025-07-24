// src/app/dashboard/report-builder/_components/BlockLibrary.tsx
'use client';

import React from 'react';
import { FiGrid, FiBarChart2, FiEdit3, FiImage, FiTable, FiUsers, FiFileText } from 'react-icons/fi';
import { ReportBlockType } from '@/app/types/report-builders';
import { cn } from '@/app/lib/utils'; // Função utilitária para combinar classes Tailwind

// Importações para dnd-kit
import { useDraggable } from '@dnd-kit/core';

interface BlockLibraryProps {
  onAddBlock: (type: ReportBlockType) => void;
}

// Definição dos tipos de blocos disponíveis na biblioteca
const blockTypes = [
  {
    type: ReportBlockType.METRIC,
    name: 'Métrica (KPI)',
    description: 'Exibe um indicador chave de performance com valor e variação percentual.',
    icon: FiUsers, // Ícone para Métrica
  },
  {
    type: ReportBlockType.CHART,
    name: 'Gráfico',
    description: 'Visualiza dados em diversos formatos como linha, barra, pizza, etc.',
    icon: FiBarChart2, // Ícone para Gráfico
  },
  {
    type: ReportBlockType.TEXT,
    name: 'Texto',
    description: 'Adiciona blocos de texto formatável, títulos ou parágrafos de conteúdo.',
    icon: FiEdit3, // Ícone para Texto
  },
  {
    type: ReportBlockType.IMAGE,
    name: 'Imagem',
    description: 'Insere imagens, logotipos ou infográficos para enriquecer o relatório.',
    icon: FiImage, // Ícone para Imagem
  },
  {
    type: ReportBlockType.TABLE,
    name: 'Tabela',
    description: 'Exibe dados brutos em um formato tabular com linhas e colunas personalizáveis.',
    icon: FiTable, // Ícone para Tabela
  },
  {
    type: ReportBlockType.GROUP,
    name: 'Grupo de Blocos',
    description: 'Agrupa múltiplos blocos em uma seção ou layout específico para organização.',
    icon: FiGrid, // Ícone para Grupo
  },
  {
    type: ReportBlockType.PAGE_BREAK,
    name: 'Quebra de Página',
    description: 'Insere uma quebra de página explícita, ideal para relatórios impressos ou PDF.',
    icon: FiFileText, // Ícone para Quebra de Página
  },
];

export const BlockLibrary: React.FC<BlockLibraryProps> = ({ onAddBlock }) => {
  return (
    <aside className="w-72 bg-[#1C1C2C] p-6 border-r border-[#2A2A3A] shadow-lg flex flex-col overflow-y-auto custom-scrollbar z-10">
      <h2 className="text-2xl font-bold text-[#E0E0F0] mb-6 border-b border-[#3A3A4E] pb-3">Biblioteca de Blocos</h2>
      
      <div className="flex flex-col gap-4">
        {blockTypes.map((blockDef) => (
          <DraggableBlockItem
            key={blockDef.type}
            blockType={blockDef.type}
            name={blockDef.name}
            description={blockDef.description}
            Icon={blockDef.icon}
            onAddBlock={onAddBlock}
          />
        ))}
      </div>
    </aside>
  );
};

interface DraggableBlockItemProps {
  blockType: ReportBlockType;
  name: string;
  description: string;
  Icon: React.ElementType; // Tipo para o componente de ícone (ex: FiUsers)
  onAddBlock: (type: ReportBlockType) => void;
}

const DraggableBlockItem: React.FC<DraggableBlockItemProps> = ({ blockType, name, description, Icon, onAddBlock }) => {
  // Configuração do useDraggable para cada item da biblioteca
  // O 'id' do draggable será o tipo do bloco, prefixado para evitar colisões
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block-library-${blockType}`, // ID único para cada item arrastável da biblioteca
    data: {
      type: 'block-library-item', // Identificador para diferenciar de blocos do canvas
      blockType: blockType, // O tipo de bloco real a ser adicionado
    },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners} // Listeners para o dnd-kit (arrastar)
      {...attributes} // Atributos de acessibilidade
      onClick={() => onAddBlock(blockType)} // Adiciona ao clicar (fallback)
      className={cn(
        "flex flex-col items-start p-4 rounded-lg border border-[#3A3A4E] text-left transition-all duration-200 ease-in-out",
        "bg-[#2C2C3E] hover:bg-[#3A3A4E] hover:border-[#8A2BE2] active:bg-[#404058]",
        "focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:ring-offset-2 focus:ring-offset-[#1C1C2C]",
        isDragging ? "opacity-50 ring-2 ring-[#8A2BE2] shadow-xl" : "opacity-100", // Mais feedback visual ao arrastar
        "cursor-grab active:cursor-grabbing" // Feedback visual de arrastar
      )}
    >
      <div className="flex items-center mb-2">
        <Icon className="h-6 w-6 text-[#8A2BE2] mr-3 flex-shrink-0" /> {/* Ícone maior e colorido */}
        <span className="text-lg font-semibold text-[#E0E0F0] whitespace-nowrap">{name}</span> {/* Título maior e sem quebra */}
      </div>
      <p className="text-sm text-[#A0A0C0] leading-snug flex-grow"> {/* Descrição com leading-snug e flex-grow */}
        {description}
      </p>
    </button>
  );
};
