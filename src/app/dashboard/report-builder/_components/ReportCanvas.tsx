// src/app/dashboard/report-builder/_components/ReportCanvas.tsx
'use client';

import React, { FC } from 'react'; // Removido useState, useEffect, useCallback, pois não são mais necessários aqui

import {
  ReportBlock,
  ReportBlockType,
  GroupBlock as GroupBlockType,
  CommonBlockRenderProps,
} from '@/app/types/report-builders';
import { ReportBlockWrapper } from './ReportBlockWrapper';
import { MetricBlock } from './blocks/MetricBlock';
import { ChartBlock } from './blocks/ChartBlock';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { TableBlock } from './blocks/TableBlock';
import { GroupBlock } from './blocks/GroupBlock';
import { PageBreakBlock } from './blocks/PageBreakBlock';

// Removidas todas as importações do dnd-kit, pois o contexto D&D agora vive no page.tsx

interface ReportCanvasProps {
  blocks: ReportBlock[]; // A lista de blocos a ser renderizada
  setBlocks: React.Dispatch<React.SetStateAction<ReportBlock[]>>; // Função para atualizar os blocos no estado pai
  // As funções de manipulação de blocos são passadas do componente pai (page.tsx)
  onEditBlock: CommonBlockRenderProps['onEdit'];
  onDuplicateBlock: CommonBlockRenderProps['onDuplicate'];
  onDeleteBlock: CommonBlockRenderProps['onDelete'];
  onMoveBlockUp: CommonBlockRenderProps['onMoveUp'];
  onMoveBlockDown: CommonBlockRenderProps['onMoveDown'];
}

// Mapeia tipos de bloco para componentes de renderização
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlockComponents: { [key in ReportBlockType]: FC<any> } = {
  [ReportBlockType.METRIC]: MetricBlock,
  [ReportBlockType.CHART]: ChartBlock,
  [ReportBlockType.TEXT]: TextBlock,
  [ReportBlockType.IMAGE]: ImageBlock,
  [ReportBlockType.TABLE]: TableBlock,
  [ReportBlockType.GROUP]: GroupBlock,
  [ReportBlockType.PAGE_BREAK]: PageBreakBlock,
};

export const ReportCanvas: React.FC<ReportCanvasProps> = ({
  blocks,
  onEditBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onMoveBlockUp,
  onMoveBlockDown,
}) => {
  const commonProps: CommonBlockRenderProps = {
    onEdit: onEditBlock,
    onDuplicate: onDuplicateBlock,
    onDelete: onDeleteBlock,
    onMoveUp: onMoveBlockUp,
    onMoveDown: onMoveBlockDown,
  };

  return (
    <div
      className="flex-1 p-8 bg-[#1A1A2A] overflow-y-auto custom-scrollbar relative rounded-lg border border-[#3A3A4E] shadow-xl"
    >
      <h2 className="text-3xl font-bold text-white mb-8 border-b border-[#3A3A4E] pb-4">Conteúdo do Relatório</h2>

      {/* Mensagem de "canvas vazio" se não houver blocos */}
      {blocks.length === 0 ? (
        <div className="text-center text-[#A0A0C0] py-20 border-2 border-dashed border-[#404058] rounded-xl bg-[#2C2C3E] flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-xl font-semibold mb-4 text-[#8A2BE2]">Comece a construir seu relatório!</p>
          <p className="text-lg">Clique em um bloco na Biblioteca ou arraste e solte aqui.</p>
          <p className="text-sm mt-2 text-[#A0A0C0]">Seu relatório ganhará vida aqui.</p>
        </div>
      ) : (
        // Mapeia e renderiza cada bloco dentro de um ReportBlockWrapper
        blocks.map((block, index) => {
          const BlockComponent = BlockComponents[block.type];

          if (!BlockComponent) {
            console.warn(`Componente para o tipo de bloco ${block.type} não encontrado.`);
            return (
              <ReportBlockWrapper
                key={block.id}
                block={block}
                {...commonProps}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
              >
                <div className="text-red-400">Erro: Bloco desconhecido ou não renderizável.</div>
              </ReportBlockWrapper>
            );
          }

          // Tratamento especial para GroupBlock, que precisa do mapa de componentes
          if (block.type === ReportBlockType.GROUP) {
            return (
              <ReportBlockWrapper
                key={block.id}
                block={block}
                {...commonProps}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
              >
                <GroupBlock
                  block={block as GroupBlockType}
                  {...commonProps}
                  blockComponentsMap={BlockComponents} // Passa o mapa de componentes para o GroupBlock
                />
              </ReportBlockWrapper>
            );
          }

          // Renderiza outros tipos de blocos
          return (
            <ReportBlockWrapper
              key={block.id}
              block={block}
              {...commonProps}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
            >
              <BlockComponent block={block} {...commonProps} />
            </ReportBlockWrapper>
          );
        })
      )}
    </div>
  );
};
