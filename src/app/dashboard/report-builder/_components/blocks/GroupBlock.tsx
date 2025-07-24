// src/app/dashboard/report-builder/_components/blocks/GroupBlock.tsx
'use client';

import React, { FC } from 'react';
import {
  GroupBlock as GroupBlockType,
  ReportBlockType,
  CommonBlockRenderProps,
} from '@/app/types/report-builders';
import { cn } from '@/app/lib/utils';

// Define a interface para as props do GroupBlock
export interface GroupBlockProps extends CommonBlockRenderProps {
  block: GroupBlockType;
  // blockComponentsMap é usado para renderizar dinamicamente os blocos aninhados
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockComponentsMap: { [key in ReportBlockType]: FC<any> };
}

export const GroupBlock: React.FC<GroupBlockProps> = ({ block, onEdit, onDuplicate, onDelete, onMoveUp, onMoveDown, blockComponentsMap, isDragging }) => {
  // Passa as props comuns para os blocos aninhados
  const commonNestedProps: CommonBlockRenderProps = {
    onEdit,
    onDuplicate,
    onDelete,
    onMoveUp,
    onMoveDown,
    // Garante que isDragging também seja passado para os blocos aninhados
    isDragging, 
  };

  return (
    <div className={cn(
      "p-6 border-2 border-dashed border-[#6A5ACD] rounded-xl transition-all duration-200 ease-in-out", // Borda tracejada mais grossa e arredondada
      block.backgroundColor || 'bg-[#1C1C2C]', // Fundo padrão para grupo
      block.textColor || 'text-[#E0E0F0]', // Cor do texto padrão
      block.layout?.marginTop,
      block.layout?.marginBottom,
      block.layout?.padding || 'p-6', // Garante padding padrão
      block.layout?.width,
      block.layout?.height,
      block.borderRadius || 'rounded-xl', // Arredondamento padrão
      block.boxShadow || 'shadow-lg', // Sombra padrão
      isDragging ? 'opacity-50 scale-98' : 'opacity-100 scale-100', // Efeito visual ao arrastar
    )}
    style={{
      backgroundColor: block.backgroundColor, // Permite sobrescrever com hex
      color: block.textColor, // Permite sobrescrever com hex
    }}
    >
      {block.title && (
        <h3 className={cn(
          "text-2xl font-bold mb-4", // Título maior e mais impactante
          block.textColor || 'text-white' // Cor do título
        )}>
          {block.title}
        </h3>
      )}
      {block.description && (
        <p className={cn(
          "text-sm mb-4",
          block.textColor ? `text-[${block.textColor}] opacity-80` : 'text-[#A0A0C0]'
        )}>
          {block.description}
        </p>
      )}
      <div className={cn(
        "flex",
        block.groupLayout === 'row' ? 'flex-row items-stretch' : 'flex-col', // items-stretch para que os itens da linha preencham a altura
        block.groupLayout === 'row' ? `gap-${block.gap || '6'}` : `space-y-${block.gap || '6'}` // Gap maior
      )}>
        {block.blocks.map((nestedBlock, index) => {
          const BlockComponent = blockComponentsMap[nestedBlock.type];
          if (!BlockComponent) return null;

          return (
            <div
              key={nestedBlock.id}
              className={cn(
                // Adiciona flex-1 para que os itens em linha se expandam igualmente
                block.groupLayout === 'row' ? 'flex-1' : 'w-full',
                // Aplica a largura definida no layout do bloco aninhado se existir
                block.groupLayout === 'row' && nestedBlock.layout?.width ? nestedBlock.layout.width : 'w-full'
              )}
            >
              {/* Passa o bloco aninhado e as props comuns */}
              <BlockComponent block={nestedBlock} {...commonNestedProps} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
