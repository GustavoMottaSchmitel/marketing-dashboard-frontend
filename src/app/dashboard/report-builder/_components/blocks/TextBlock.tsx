// src/app/dashboard/report-builder/_components/blocks/TextBlock.tsx
'use client';

import React from 'react';
import { TextBlock as TextBlockType, CommonBlockRenderProps } from '@/app/types/report-builders';
import { cn } from '@/app/lib/utils';

interface TextBlockProps extends CommonBlockRenderProps {
  block: TextBlockType;
}

export const TextBlock: React.FC<TextBlockProps> = ({ block, isDragging }) => {
  return (
    <div
      className={cn(
        "p-6 rounded-lg", // Padding aumentado
        block.backgroundColor || 'bg-[#1A1A2A]', // Fundo padrão
        block.textColor || 'text-[#E0E0F0]', // Cor do texto padrão
        block.borderRadius || 'rounded-lg', // Borda padrão
        block.boxShadow || 'shadow-md', // Sombra padrão
        block.layout?.width || 'w-full', // Largura padrão
        block.layout?.height || 'h-auto', // Altura padrão
        block.layout?.padding || 'p-6', // Padding padrão do layout
        block.layout?.marginTop,
        block.layout?.marginBottom,
        block.layout?.alignment === 'center' && 'mx-auto text-center', // Alinhamento do texto no bloco
        block.layout?.alignment === 'right' && 'ml-auto text-right',
        block.layout?.alignment === 'left' && 'mr-auto text-left',
        isDragging ? 'opacity-50 scale-98' : 'opacity-100 scale-100', // Efeito visual ao arrastar
        "transition-all duration-200 ease-in-out" // Transição para efeitos
      )}
      style={{
        backgroundColor: block.backgroundColor, // Permite sobrescrever com hex
        color: block.textColor, // Permite sobrescrever com hex
      }}
    >
      {block.title && (
        <h3 className={cn(
          "font-semibold mb-2",
          block.fontSize || "text-xl", // Usa fontSize do bloco ou padrão
          block.fontWeight || "font-semibold", // Usa fontWeight do bloco ou padrão
          block.textColor || "text-[#E0E0F0]" // Usa textColor do bloco ou padrão
        )}>
          {block.title}
        </h3>
      )}
      <p className={cn(
        "whitespace-pre-wrap", // Garante que quebras de linha sejam respeitadas
        block.fontSize || "text-base", // Usa fontSize do bloco ou padrão
        block.fontWeight || "font-normal", // Usa fontWeight do bloco ou padrão
        block.textColor || "text-[#E0E0F0]" // Usa textColor do bloco ou padrão
      )}>
        {block.content}
      </p>
      {block.description && (
        <p className={cn(
          "text-xs mt-2 leading-tight",
          block.textColor ? `text-[${block.textColor}] opacity-80` : 'text-[#A0A0C0]' // Cor e opacidade para descrição
        )}>
          {block.description}
        </p>
      )}
    </div>
  );
};
