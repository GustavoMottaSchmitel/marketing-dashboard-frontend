'use client';

import React from 'react';
import Image from 'next/image'; // Importado o componente Image do Next.js
import { ImageBlock as ImageBlockType, CommonBlockRenderProps } from '@/app/types/report-builders';
import { cn } from '@/app/lib/utils';

interface ImageBlockProps extends CommonBlockRenderProps {
  block: ImageBlockType;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block, isDragging }) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 relative", // Adicionado 'relative' para o Image com layout="fill"
        block.backgroundColor || 'bg-[#1A1A2A]', // Fundo padrão
        block.textColor || 'text-[#E0E0F0]', // Cor do texto padrão (para título/descrição)
        block.borderRadius || 'rounded-lg', // Borda padrão
        block.boxShadow || 'shadow-md', // Sombra padrão
        block.layout?.width || 'w-full', // Largura padrão
        block.layout?.height || 'h-auto', // Altura padrão
        block.layout?.padding || 'p-6', // Padding padrão do layout
        block.layout?.marginTop,
        block.layout?.marginBottom,
        block.layout?.alignment === 'center' && 'mx-auto',
        block.layout?.alignment === 'right' && 'ml-auto',
        block.layout?.alignment === 'left' && 'mr-auto',
        isDragging ? 'opacity-50 scale-98' : 'opacity-100 scale-100', // Efeito visual ao arrastar
        "transition-all duration-200 ease-in-out" // Transição para efeitos
      )}
      style={{
        backgroundColor: block.backgroundColor, // Permite sobrescrever com hex
        color: block.textColor, // Permite sobrescrever com hex
        minHeight: block.layout?.height === 'h-full' ? '100%' : (block.layout?.height || '200px'), // Garante altura mínima para o container do Image
      }}
    >
      {block.title && (
        <h3 className={cn(
          "text-xl font-semibold mb-3 text-center", // Título centralizado e com margem
          block.textColor || 'text-white' // Cor do título
        )}>
          {block.title}
        </h3>
      )}
      {/* Usando o componente Image do Next.js para otimização */}
      {block.imageUrl && (
        <Image
          src={block.imageUrl}
          alt={block.altText || 'Imagem do relatório'}
          // Para imagens responsivas que preenchem o container, use 'fill'
          // Certifique-se de que o elemento pai tem 'position: relative' e uma altura definida
          fill={block.layout?.height === 'h-full' ? true : false} // Se h-full, preenche o pai
          width={block.layout?.height === 'h-full' ? undefined : 600} // Largura padrão se não for fill
          height={block.layout?.height === 'h-full' ? undefined : 300} // Altura padrão se não for fill
          className={cn(
            "rounded-lg shadow-lg", // Sombra mais proeminente na imagem
            block.layout?.height !== 'h-full' && 'max-w-full', // Apenas se não for fill
            block.objectFit ? `object-${block.objectFit}` : 'object-contain',
            "transition-transform duration-300 ease-out" // Transição para a imagem
          )}
          style={{
            objectFit: block.objectFit, // Sobrescreve se for necessário
          }}
          onError={(e) => {
          }}
        />
      )}
      {!block.imageUrl && (
        <div className="flex items-center justify-center w-full h-48 bg-[#404058] rounded-lg text-[#A0A0C0] text-sm">
          Nenhuma imagem configurada.
        </div>
      )}
      {block.description && (
        <p className={cn(
          "text-sm text-center mt-3 leading-tight", // Descrição centralizada com margem
          block.textColor ? `text-[${block.textColor}] opacity-80` : 'text-[#A0A0C0]'
        )}>
          {block.description}
        </p>
      )}
    </div>
  );
};
