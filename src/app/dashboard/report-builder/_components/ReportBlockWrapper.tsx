// src/app/dashboard/report-builder/_components/ReportBlockWrapper.tsx
'use client';

import React from 'react';
import { FiEdit, FiCopy, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { GripVertical } from 'lucide-react';
import { Button } from '@/app/components/ui/custom-elements'; // Removido Card, pois estamos usando div agora
import { ReportBlock, CommonBlockRenderProps, ReportBlockType } from '@/app/types/report-builders';
import { cn } from '@/app/lib/utils';

// Importações para dnd-kit
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ReportBlockWrapperProps {
  block: ReportBlock;
  children: React.ReactNode;
  onEdit: CommonBlockRenderProps['onEdit'];
  onDuplicate: CommonBlockRenderProps['onDuplicate'];
  onDelete: CommonBlockRenderProps['onDelete'];
  onMoveUp: CommonBlockRenderProps['onMoveUp'];
  onMoveDown: CommonBlockRenderProps['onMoveDown'];
  isFirst: boolean;
  isLast: boolean;
}

export const ReportBlockWrapper: React.FC<ReportBlockWrapperProps> = ({
  block,
  children,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  // Convert transform to a CSS string
  const transformStyle = CSS.Transform.toString(transform);

  // Combine styles for the main div component
  const combinedStyle: React.CSSProperties = {
    transform: transformStyle, // Use the converted string
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : 1,
    // As cores de background e texto agora serão aplicadas via classes Tailwind no cn()
    // backgroundColor: block.backgroundColor, // Removido daqui
    // color: block.textColor, // Removido daqui
    // Adicione outras propriedades de estilo que podem vir do block.layout
    // e que você deseja aplicar diretamente via style prop, se necessário.
    // Ex: height: block.layout?.height, // Se block.layout.height for um valor CSS válido (ex: '200px')
    // padding: block.layout?.padding, // Se block.layout.padding for um valor CSS válido
  };

  return (
    <div
      ref={setNodeRef} // Conecta o ref do dnd-kit
      id={block.id} // <--- AGORA O ID ESTÁ AQUI, NO ELEMENTO DOM REAL
      style={combinedStyle} // Aplica o objeto de estilo combinado
      {...attributes} // Passa os atributos de acessibilidade e ARIA do dnd-kit
      className={cn(
        "relative p-6 mb-6 border border-[#3A3A4E] rounded-xl shadow-lg",
        block.backgroundColor || 'bg-[#2C2C3E]', // Aplica background via Tailwind
        block.textColor || 'text-[#E0E0F0]', // Aplica text color via Tailwind
        "hover:border-[#8A2BE2] hover:shadow-xl transition-all duration-300 ease-in-out",
        isDragging && "ring-2 ring-[#8A2BE2] ring-offset-2 ring-offset-[#1A1A1A]", // Ajustado ring-offset
        block.borderRadius || 'rounded-xl',
        block.boxShadow || 'shadow-lg',
        block.layout?.width || 'w-full',
        block.layout?.height || 'h-auto',
        block.layout?.padding || 'p-6',
        block.layout?.marginTop,
        block.layout?.marginBottom,
        block.layout?.alignment === 'center' && 'mx-auto',
        block.layout?.alignment === 'right' && 'ml-auto',
        block.layout?.alignment === 'left' && 'mr-auto',
        "group",
        // Estilo específico para PageBreakBlock
        block.type === ReportBlockType.PAGE_BREAK && "border-dashed border-2 border-[#404058] flex items-center justify-center py-8 my-4 bg-transparent shadow-none"
      )}
    >
      {/* Handle de Drag (GripVertical) e Controles do Bloco */}
      <div className={cn(
        "block-controls absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10",
        block.type === ReportBlockType.PAGE_BREAK && "hidden" // Esconde controles para PageBreak
      )}>
        {/* Handle de Drag */}
        <Button
          size="icon"
          variant="ghost"
          {...listeners} // Listeners para o dnd-kit (drag)
          className="cursor-grab active:cursor-grabbing text-[#A0A0C0] hover:text-[#8A2BE2] bg-[#3A3A4E]/50 hover:bg-[#3A3A4E]"
          title="Arrastar Bloco"
        >
          <GripVertical className="h-5 w-5" />
        </Button>

        {/* Botões de Ação */}
        <Button size="icon" variant="ghost" onClick={() => onEdit(block.id)} title="Editar Bloco"
          className="bg-[#3A3A4E]/50 hover:bg-[#3A3A4E] text-[#A0A0C0] hover:text-blue-400">
          <FiEdit className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDuplicate(block.id)} title="Duplicar Bloco"
          className="bg-[#3A3A4E]/50 hover:bg-[#3A3A4E] text-[#A0A0C0] hover:text-green-400"> {/* Cor ajustada */}
          <FiCopy className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete(block.id)} title="Remover Bloco"
          className="bg-[#3A3A4E]/50 hover:bg-[#3A3A4E] text-[#A0A0C0] hover:text-red-500">
          <FiTrash2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onMoveUp(block.id)} disabled={isFirst} title="Mover para Cima"
          className="bg-[#3A3A4E]/50 hover:bg-[#3A3A4E] text-[#A0A0C0] disabled:opacity-50 hover:text-purple-400"> {/* Cor ajustada */}
          <FiArrowUp className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onMoveDown(block.id)} disabled={isLast} title="Mover para Baixo"
          className="bg-[#3A3A4E]/50 hover:bg-[#3A3A4E] text-[#A0A0C0] disabled:opacity-50 hover:text-yellow-400"> {/* Cor ajustada */}
          <FiArrowDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Conteúdo específico para Quebra de Página ou o children para outros blocos */}
      {block.type === ReportBlockType.PAGE_BREAK ? (
        <div className="w-full text-center text-[#A0A0C0] text-lg font-semibold relative">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#404058] opacity-50"></div>
          <span className="relative z-10 bg-[#2A2A3A] px-4 py-1 rounded-full text-sm text-[#A0A0C0] border border-[#404058]">
            QUEBRA DE PÁGINA
          </span>
        </div>
      ) : (
        children // Conteúdo real do bloco (Metric, Chart, Text, Image, Table, Group)
      )}
    </div>
  );
};
