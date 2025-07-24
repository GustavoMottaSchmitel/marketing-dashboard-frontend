// src/app/dashboard/report-builder/page.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import { FiSave, FiDownload, FiShare2, FiLayout, FiSearch, FiSliders } from 'react-icons/fi';
import { Button, Input, Select } from '@/app/components/ui/custom-elements';
import { ReportBlockType, ReportBlock, MetricBlock, ChartBlock, TextBlock, ImageBlock, TableBlock, GroupBlock, PageBreakBlock, ChartType } from '@/app/types/report-builders';
import { BlockLibrary } from './_components/BlockLibrary';
import { ReportCanvas } from './_components/ReportCanvas';
import { EditBlockModal } from './modals/EditBlockModal';
import { toast } from 'sonner';

// Importações para exportação de PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Importações para dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

export default function ReportBuilderPage() {
  const [reportBlocks, setReportBlocks] = useState<ReportBlock[]>([]);
  const [editingBlock, setEditingBlock] = useState<ReportBlock | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estados para filtros (mockados para demonstração)
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('last_7_days');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Configuração dos sensores para dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddBlock = useCallback((type: ReportBlockType) => {
    let newBlock: ReportBlock;
    const commonProps = {
      id: nanoid(),
      type,
      title: `Novo ${type.replace('_', ' ')}`,
      layout: {
        width: 'w-full',
        height: 'h-auto',
        padding: 'p-6',
        alignment: 'left',
        marginTop: 'mt-0',
        marginBottom: 'mb-6',
      },
      backgroundColor: '#2C2C3E',
      textColor: '#E0E0F0',
      borderRadius: 'rounded-lg',
      boxShadow: 'shadow-md',
      description: '',
    };

    switch (type) {
      case ReportBlockType.METRIC:
        newBlock = {
          ...commonProps,
          metricKey: 'totalLeads',
          unit: '',
          isCurrency: false,
          percentageChange: null,
          accentColor: '#8A2BE2',
          icon: 'FiUsers',
        } as MetricBlock;
        break;
      case ReportBlockType.CHART:
        newBlock = {
          ...commonProps,
          chartType: ChartType.LINE,
          dataKey: 'value',
          dataLabel: 'Valor',
          xAxisKey: 'date',
          yAxisKey: 'value',
          lineColor: '#00BFFF',
          barColor: '#6A5ACD',
          pieColors: ['#8A2BE2', '#6A5ACD', '#3CB371', '#FFD700', '#FF4500'],
          gradientStartColor: '#00BFFF',
          gradientEndColor: '#8A2BE2',
          showLegend: true,
          showTooltip: true,
        } as ChartBlock;
        break;
      case ReportBlockType.TEXT:
        newBlock = {
          ...commonProps,
          content: 'Este é um novo bloco de texto. Edite para adicionar seu conteúdo.',
          fontSize: 'text-base',
          fontWeight: 'font-normal',
        } as TextBlock;
        break;
      case ReportBlockType.IMAGE:
        newBlock = {
          ...commonProps,
          // Ajustado o placeholder para um mais simples e robusto
          imageUrl: 'https://placehold.co/600x300/404058/A0A0C0?text=IMAGEM+AQUI',
          altText: 'Placeholder de imagem',
          objectFit: 'contain',
        } as ImageBlock;
        break;
      case ReportBlockType.TABLE:
        newBlock = {
          ...commonProps,
          tableData: [],
          columns: [],
          showHeaders: true,
          stripedRows: true,
        } as TableBlock;
        break;
      case ReportBlockType.GROUP:
        newBlock = {
          ...commonProps,
          blocks: [],
          groupLayout: 'column',
          gap: '4',
          title: 'Novo Grupo de Blocos',
          backgroundColor: '#1C1C2C',
          borderRadius: 'rounded-xl',
          boxShadow: 'shadow-lg',
        } as GroupBlock;
        break;
      case ReportBlockType.PAGE_BREAK:
        newBlock = {
          ...commonProps,
          title: undefined,
          backgroundColor: undefined,
          textColor: undefined,
          description: undefined,
          layout: {
            width: 'w-full',
            height: 'h-auto',
            padding: 'p-0',
            marginTop: 'my-8',
            marginBottom: 'my-8',
            alignment: 'center',
          }
        } as PageBreakBlock;
        break;
      default:
        console.error('Tipo de bloco desconhecido:', type);
        return;
    }
    setReportBlocks(prev => [...prev, newBlock]);
    toast.success(`Bloco "${newBlock.title || newBlock.type.replace('_', ' ')}" adicionado!`);
  }, []);

  const handleEditBlock = useCallback((blockId: string) => {
    const blockToEdit = reportBlocks.find(block => block.id === blockId);
    if (blockToEdit) {
      setEditingBlock(blockToEdit);
      setIsEditModalOpen(true);
    }
  }, [reportBlocks]);

  const handleSaveEditedBlock = useCallback((updatedBlock: ReportBlock) => {
    setReportBlocks(prev =>
      prev.map(block => (block.id === updatedBlock.id ? updatedBlock : block))
    );
    setEditingBlock(null);
    setIsEditModalOpen(false);
    toast.success('Bloco atualizado com sucesso!');
  }, []);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    setReportBlocks(prev => {
      const blockToDuplicate = prev.find(block => block.id === blockId);
      if (blockToDuplicate) {
        const duplicatedBlock = JSON.parse(JSON.stringify(blockToDuplicate));
        duplicatedBlock.id = nanoid();
        duplicatedBlock.title = `Cópia de ${duplicatedBlock.title || duplicatedBlock.type.replace('_', ' ')}`;
        const index = prev.findIndex(block => block.id === blockId);
        return [
          ...prev.slice(0, index + 1),
          duplicatedBlock,
          ...prev.slice(index + 1),
        ];
      }
      return prev;
    });
    toast.info('Bloco duplicado!');
  }, []);

  const handleDeleteBlock = useCallback((blockId: string) => {
    setReportBlocks(prev => prev.filter(block => block.id !== blockId));
    toast.error('Bloco removido!');
  }, []);

  const handleMoveBlockUp = useCallback((blockId: string) => {
    setReportBlocks(prev => {
      const index = prev.findIndex(block => block.id === blockId);
      if (index > 0) {
        return arrayMove(prev, index, index - 1);
      }
      return prev;
    });
  }, []);

  const handleMoveBlockDown = useCallback((blockId: string) => {
    setReportBlocks(prev => {
      const index = prev.findIndex(block => block.id === blockId);
      if (index < prev.length - 1) {
        return arrayMove(prev, index, index + 1);
      }
      return prev;
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.data.current?.type === 'block-library-item' && over?.id === 'report-canvas-droppable') {
      const blockTypeToAdd = active.data.current.blockType as ReportBlockType;
      handleAddBlock(blockTypeToAdd);
      toast.success(`Bloco "${blockTypeToAdd.replace('_', ' ')}" adicionado via arrastar!`);
      return;
    }

    if (active.id !== over?.id && over?.id !== 'report-canvas-droppable') {
      setReportBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  }, [handleAddBlock]);

  // --- Implementação da Exportação de PDF Híbrida ---
  const handleExportPdf = useCallback(async () => {
    toast.info('Gerando PDF... Isso pode levar alguns segundos para blocos complexos.', { duration: 5000 });

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 30;
    let currentY = margin;

    const addNewPage = () => {
      pdf.addPage();
      currentY = margin;
    };

    const hexToRgb = (hex: string) => {
      const cleanHex = hex.startsWith('#') ? hex.substring(1) : hex;
      const fullHex = cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex;
      
      const bigint = parseInt(fullHex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return [r, g, b];
    };

    for (const block of reportBlocks) {
      console.log(`Processando bloco: ${block.id}, Tipo: ${block.type}`);
      const blockElement = document.getElementById(block.id);
      
      if (!blockElement) {
        console.warn(`Elemento DOM para o bloco ${block.id} não encontrado. Pulando este bloco na exportação.`);
        toast.error(`Bloco "${block.title || block.type}" não encontrado no DOM. Pode não aparecer no PDF.`);
        continue;
      }

      const blockControlButtons = blockElement.querySelector('.block-controls');
      if (blockControlButtons) {
        (blockControlButtons as HTMLElement).style.display = 'none';
        console.log(`Controles do bloco ${block.id} ocultados.`);
      }

      if (block.type === ReportBlockType.PAGE_BREAK) {
        addNewPage();
        console.log('Adicionando quebra de página.');
      } else if (block.type === ReportBlockType.TEXT) {
        const textBlock = block as TextBlock;
        const textContent = textBlock.content || '';
        const textColor = textBlock.textColor || '#E0E0F0';
        const fontSizeTailwind = textBlock.fontSize || 'text-base';
        
        const fontSizeMap: { [key: string]: number } = {
          'text-xs': 9, 'text-sm': 10, 'text-base': 12, 'text-lg': 14, 'text-xl': 16,
          'text-2xl': 18, 'text-3xl': 24, 'text-4xl': 32, 'text-5xl': 40, 'text-6xl': 48,
        };
        const fontSizePt = fontSizeMap[fontSizeTailwind] || 12;

        const fontWeightMap: { [key: string]: string } = {
          'font-thin': 'normal', 'font-extralight': 'normal', 'font-light': 'normal',
          'font-normal': 'normal', 'font-medium': 'normal', 'font-semibold': 'bold',
          'font-bold': 'bold', 'font-extrabold': 'bold', 'font-black': 'bold',
        };
        const fontWeight = fontWeightMap[textBlock.fontWeight || 'font-normal'] || 'normal';

        pdf.setFont(pdf.getFont().fontName, fontWeight);
        pdf.setFontSize(fontSizePt);
        const [r, g, b] = hexToRgb(textColor);
        pdf.setTextColor(r, g, b);

        const maxWidth = pdfWidth - 2 * margin;
        const textLines = pdf.splitTextToSize(textContent, maxWidth);
        const lineHeight = fontSizePt * 1.2;
        const textHeight = textLines.length * lineHeight;

        if (currentY + textHeight > pdfHeight - margin) {
          addNewPage();
        }
        pdf.text(textLines, margin, currentY);
        currentY += textHeight + 20;
        console.log(`Bloco de Texto ${block.id} adicionado. Nova Y: ${currentY}`);
      } else if (block.type === ReportBlockType.IMAGE) {
        const imageBlock = block as ImageBlock;
        const imageUrl = imageBlock.imageUrl;
        if (imageUrl) {
          try {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageUrl;

            await new Promise((resolve, reject) => {
              img.onload = () => {
                console.log(`Imagem ${imageUrl} carregada com sucesso.`);
                resolve(null);
              };
              img.onerror = (e) => {
                console.error('Erro ao carregar imagem para PDF:', imageUrl, e);
                reject(new Error('Falha ao carregar imagem.'));
              };
            });

            const imgWidthPdf = pdfWidth - 2 * margin;
            const imgHeightPdf = (img.height * imgWidthPdf) / img.width;

            if (currentY + imgHeightPdf > pdfHeight - margin) {
              addNewPage();
            }
            pdf.addImage(img, 'PNG', margin, currentY, imgWidthPdf, imgHeightPdf);
            currentY += imgHeightPdf + 20;
            console.log(`Bloco de Imagem ${block.id} adicionado. Nova Y: ${currentY}`);
          } catch (imgError) {
            console.error('Erro ao adicionar imagem ao PDF:', imageUrl, imgError);
            toast.error(`Falha ao adicionar imagem ao PDF: ${imageUrl}. Tentando renderizar como imagem HTML.`);
            currentY = await renderComplexBlock(blockElement, pdf, currentY, pdfWidth, pdfHeight, margin);
            console.log(`Bloco de Imagem ${block.id} (fallback) adicionado. Nova Y: ${currentY}`);
          }
        } else {
          console.warn(`Bloco de Imagem ${block.id} sem URL. Pulando.`);
        }
      } else {
        currentY = await renderComplexBlock(blockElement, pdf, currentY, pdfWidth, pdfHeight, margin);
        console.log(`Bloco Complexo ${block.id} adicionado. Nova Y: ${currentY}`);
      }

      if (blockControlButtons) {
        (blockControlButtons as HTMLElement).style.display = 'flex';
        console.log(`Controles do bloco ${block.id} restaurados.`);
      }
    }

    pdf.save('relatorio-personalizado.pdf');
    toast.success('PDF exportado com sucesso!', { duration: 3000 });
  }, [reportBlocks]);

  const renderComplexBlock = async (element: HTMLElement, pdf: jsPDF, initialY: number, pdfWidth: number, pdfHeight: number, margin: number): Promise<number> => {
    try {
      console.log(`Renderizando bloco complexo ${element.id} com html2canvas. Largura/Altura do elemento: ${element.offsetWidth}x${element.offsetHeight}`);
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: null,
      });

      if (canvas.width === 0 || canvas.height === 0) {
        console.error(`html2canvas gerou um canvas vazio para o elemento ${element.id}. Largura: ${canvas.width}, Altura: ${canvas.height}`);
        toast.error(`Falha na renderização do bloco (ID: ${element.id}). Canvas vazio.`);
        return initialY;
      }

      const imgData = canvas.toDataURL('image/png');
      const imgWidthPdf = pdfWidth - 2 * margin;
      const imgHeightPdf = (canvas.height * imgWidthPdf) / canvas.width;

      let yPos = initialY;
      if (yPos + imgHeightPdf > pdfHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.addImage(imgData, 'PNG', margin, yPos, imgWidthPdf, imgHeightPdf);
      console.log(`html2canvas para ${element.id} concluído. Imagem adicionada ao PDF. Nova Y: ${yPos + imgHeightPdf}`);

      return yPos + imgHeightPdf;
    } catch (error) {
      console.error('Erro ao renderizar bloco complexo com html2canvas:', element.id, error);
      toast.error(`Falha ao renderizar bloco complexo (ID: ${element.id}). Erro: ${error instanceof Error ? error.message : String(error)}`);
      return initialY;
    }
  };

  const handleSaveTemplate = () => toast.info('Funcionalidade "Salvar Template" em desenvolvimento!');
  const handleLoadTemplate = () => toast.info('Funcionalidade "Carregar Template" em desenvolvimento!');
  const handleGenerateShareLink = () => toast.info('Funcionalidade "Gerar Link Compartilhável" em desenvolvimento!');

  const mockClinics = useMemo(() => [
    { value: '', label: 'Todas as Clínicas' },
    { value: 'clinic-a', label: 'Clínica Alpha' },
    { value: 'clinic-b', label: 'Clínica Beta' },
    { value: 'clinic-c', label: 'Clínica Gama' },
  ], []);

  return (
    <div className="flex h-screen bg-[#10101A] text-white font-sans overflow-hidden">
      {/* Sidebar de Blocos */}
      <BlockLibrary onAddBlock={handleAddBlock} />

      {/* Área Principal do Construtor */}
      <div className="flex-1 flex flex-col">
        {/* Barra de Ferramentas Superior - Redesenhada e Otimizada */}
        <header className="bg-[#1C1C2C] p-4 md:p-6 border-b border-[#2A2A3A] shadow-xl z-20">
          {/* Primeira linha: Título e Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#E0E0F0] whitespace-nowrap flex-shrink-0">Construtor de Relatórios</h1>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto flex-grow">
              <Button variant="secondary" onClick={handleSaveTemplate} className="flex items-center bg-[#3A3A4E] hover:bg-[#4A4A5E] text-white rounded-lg shadow-md px-4 py-2 text-sm md:text-base whitespace-nowrap">
                <FiSave className="mr-2 h-4 w-4" /> Salvar
              </Button>
              <Button variant="secondary" onClick={handleLoadTemplate} className="flex items-center bg-[#3A3A4E] hover:bg-[#4A4A5E] text-white rounded-lg shadow-md px-4 py-2 text-sm md:text-base whitespace-nowrap">
                <FiLayout className="mr-2 h-4 w-4" /> Carregar
              </Button>
              <Button variant="primary" onClick={handleExportPdf} className="flex items-center bg-[#8A2BE2] hover:bg-[#6A5ACD] text-white rounded-lg shadow-md px-4 py-2 text-sm md:text-base whitespace-nowrap">
                <FiDownload className="mr-2 h-4 w-4" /> Exportar PDF
              </Button>
              <Button variant="outline" onClick={handleGenerateShareLink} className="flex items-center border-[#8A2BE2] text-[#8A2BE2] hover:bg-[#8A2BE2] hover:text-white rounded-lg shadow-md px-4 py-2 text-sm md:text-base whitespace-nowrap">
                <FiShare2 className="mr-2 h-4 w-4" /> Compartilhar
              </Button>
            </div>
          </div>

          {/* Segunda linha: Filtros e Pesquisa - Agora com espaçamento e linha mais evidentes */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mt-6 pt-6 border-t border-[#2A2A3A]">
            <FiSliders className="text-[#8A2BE2] text-xl md:text-2xl hidden sm:block" title="Filtros" />
            {/* Seletor de Clínicas */}
            <Select
              id="clinic-filter"
              name="clinic-filter"
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              options={mockClinics}
              className="w-full sm:w-[180px] lg:w-[200px] bg-[#2A2A3A] border-[#3A3A4E] text-[#E0E0F0] rounded-lg h-11 px-4 text-base focus:ring-[#8A2BE2] focus:border-transparent"
            />

            {/* Filtro por Período */}
            <Select
              id="date-range-filter"
              name="date-range-filter"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={[
                { value: 'last_7_days', label: 'Últimos 7 dias' },
                { value: 'last_30_days', label: 'Últimos 30 dias' },
                { value: 'this_month', label: 'Este Mês' },
                { value: 'last_month', label: 'Mês Passado' },
                { value: 'custom', label: 'Período Personalizado' },
              ]}
              className="w-full sm:w-[180px] lg:w-[200px] bg-[#2A2A3A] border-[#3A3A4E] text-[#E0E0F0] rounded-lg h-11 px-4 text-base focus:ring-[#8A2BE2] focus:border-transparent"
            />

            {/* Barra de Pesquisa */}
            <div className="relative w-full sm:w-[250px] lg:w-[300px] flex-shrink-0">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0C0] text-xl" />
              <Input
                type="text"
                placeholder="Pesquisar no relatório..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 bg-[#2A2A3A] border-[#3A3A4E] text-[#E0E0F0] rounded-lg focus:ring-[#8A2BE2] h-11 text-base"
              />
            </div>
          </div>
        </header>

        {/* Canvas do Relatório */}
        <div id="report-canvas-content" className="flex-1 p-8 bg-[#10101A] overflow-y-auto custom-scrollbar">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <div id="report-canvas-droppable" className="min-h-full">
              <SortableContext
                items={reportBlocks.map(block => block.id)}
                strategy={verticalListSortingStrategy}
              >
                <ReportCanvas
                  blocks={reportBlocks}
                  setBlocks={setReportBlocks}
                  onEditBlock={handleEditBlock}
                  onDuplicateBlock={handleDuplicateBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onMoveBlockUp={handleMoveBlockUp}
                  onMoveBlockDown={handleMoveBlockDown}
                />
              </SortableContext>
            </div>
          </DndContext>
        </div>
      </div>

      {/* Modal de Edição de Bloco */}
      {isEditModalOpen && (
        <EditBlockModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          block={editingBlock}
          onSave={handleSaveEditedBlock}
        />
      )}
    </div>
  );
}
