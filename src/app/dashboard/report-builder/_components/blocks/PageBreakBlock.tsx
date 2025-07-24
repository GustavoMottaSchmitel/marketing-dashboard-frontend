// src/app/dashboard/report-builder/_components/blocks/PageBreakBlock.tsx
'use client';

import React from 'react';
import { PageBreakBlock as PageBreakBlockType, CommonBlockRenderProps } from '@/app/types/report-builders';
import { cn } from '@/app/lib/utils';

interface PageBreakBlockProps extends CommonBlockRenderProps {
  block: PageBreakBlockType;
}

export const PageBreakBlock: React.FC<PageBreakBlockProps> = ({ block, isDragging }) => {
  return (
    <div
      className={cn(
        "w-full my-8 border-t-2 border-dashed border-[#6A5ACD] text-center py-4 text-[#A0A0C0] text-sm relative",
        block.layout?.marginTop, 
        block.layout?.marginBottom, 
        isDragging ? 'opacity-50 scale-98' : 'opacity-100 scale-100',
        "transition-all duration-200 ease-in-out" 
      )}
      style={{
      }}
    >
      <span className="bg-gray-900 px-4 py-1 rounded-full text-[#A0A0C0] font-semibold text-xs uppercase tracking-wider">
        --- QUEBRA DE PÁGINA ---
      </span>
      <div className="absolute bottom-0 left-0 w-full border-b-2 border-dashed border-[#6A5ACD]"></div>
    </div>
  );
};
