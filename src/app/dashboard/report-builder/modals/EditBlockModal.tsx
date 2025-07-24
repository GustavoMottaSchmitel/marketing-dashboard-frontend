// src/app/dashboard/report-builder/_components/modals/EditBlockModal.tsx
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { Card, Button, Input, Label, Select } from '@/app/components/ui/custom-elements';
import { ReportBlock, ReportBlockType, ChartType, MetricBlock, ChartBlock, TextBlock, ImageBlock, TableBlock, GroupBlock, BaseBlock } from '@/app/types/report-builders';

interface EditBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: ReportBlock | null;
  onSave: (updatedBlock: ReportBlock) => void;
}

export const EditBlockModal: React.FC<EditBlockModalProps> = ({ isOpen, onClose, block, onSave }) => {
  const [formData, setFormData] = useState<ReportBlock | null>(null);

  useEffect(() => {
    if (block) {
      // Deep copy para evitar mutação direta do objeto original
      setFormData(JSON.parse(JSON.stringify(block)));
    }
  }, [block]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const isCheckbox = e.target instanceof HTMLInputElement && e.target.type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    setFormData((prev: ReportBlock | null) => {
      if (!prev) return null;

      // Cria uma cópia profunda do estado anterior para garantir imutabilidade
      const newPrev: ReportBlock = JSON.parse(JSON.stringify(prev));

      // Lida com propriedades de layout aninhadas
      if (name.startsWith('layout.')) {
        const layoutProp = name.split('.')[1] as keyof BaseBlock['layout'];
        newPrev.layout = { ...(newPrev.layout || {}), [layoutProp]: value };
        return newPrev;
      }

      // Lida com propriedades comuns que são diretamente no nível raiz do bloco
      // Usamos if/else if para garantir tipagem explícita e evitar 'any' em atribuições dinâmicas.
      // A propriedade 'type' NÃO deve ser alterada via input, então não está incluída aqui.
      if (name === 'title') {
        newPrev.title = value;
      } else if (name === 'description') {
        newPrev.description = value;
      } else if (name === 'backgroundColor') {
        newPrev.backgroundColor = value;
      } else if (name === 'textColor') {
        newPrev.textColor = value;
      } else if (name === 'borderRadius') {
        newPrev.borderRadius = value;
      } else if (name === 'boxShadow') {
        newPrev.boxShadow = value;
      }

      // Lida com propriedades específicas do tipo de bloco
      switch (newPrev.type) {
        case ReportBlockType.METRIC:
          const metricBlock = newPrev as MetricBlock;
          if (name === 'isCurrency') {
            metricBlock.isCurrency = checked;
          } else if (name === 'percentageChange') {
            metricBlock.percentageChange = parseFloat(value);
          } else if (name === 'metricKey') {
            metricBlock.metricKey = value as MetricBlock['metricKey'];
          } else if (name === 'unit') {
            metricBlock.unit = value;
          } else if (name === 'accentColor') {
            metricBlock.accentColor = value;
          } else if (name === 'icon') {
            metricBlock.icon = value;
          }
          break;
        case ReportBlockType.CHART:
          const chartBlock = newPrev as ChartBlock;
          if (name === 'showLegend' || name === 'showTooltip') {
            chartBlock[name] = checked;
          } else if (name === 'chartType') {
            chartBlock.chartType = value as ChartType;
          } else if (name === 'dataKey') {
            chartBlock.dataKey = value.split(',').map(s => s.trim()).filter(s => s !== '');
          } else if (name === 'dataLabel') {
            chartBlock.dataLabel = value.includes(',') ? value.split(',').map(s => s.trim()).filter(s => s !== '') : value;
          } else if (name === 'pieColors') {
            chartBlock.pieColors = value.split(',').map(s => s.trim()).filter(s => s !== '');
          } else if (name === 'xAxisKey') {
            chartBlock.xAxisKey = value;
          } else if (name === 'yAxisKey') {
            chartBlock.yAxisKey = value;
          } else if (name === 'lineColor') {
            chartBlock.lineColor = value;
          } else if (name === 'barColor') {
            chartBlock.barColor = value;
          } else if (name === 'gradientStartColor') {
            chartBlock.gradientStartColor = value;
          } else if (name === 'gradientEndColor') {
            chartBlock.gradientEndColor = value;
          }
          break;
        case ReportBlockType.TEXT:
          const textBlock = newPrev as TextBlock;
          if (name === 'content') {
            textBlock.content = value;
          } else if (name === 'fontSize') {
            textBlock.fontSize = value;
          } else if (name === 'fontWeight') {
            textBlock.fontWeight = value;
          }
          break;
        case ReportBlockType.IMAGE:
          const imageBlock = newPrev as ImageBlock;
          if (name === 'objectFit') {
            imageBlock.objectFit = value as 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
          } else if (name === 'imageUrl') {
            imageBlock.imageUrl = value;
          } else if (name === 'altText') {
            imageBlock.altText = value;
          }
          break;
        case ReportBlockType.TABLE:
          const tableBlock = newPrev as TableBlock;
          if (name === 'showHeaders' || name === 'stripedRows') {
            tableBlock[name] = checked;
          }
          break;
        case ReportBlockType.GROUP:
          const groupBlock = newPrev as GroupBlock;
          if (name === 'groupLayout') {
            groupBlock.groupLayout = value as 'row' | 'column';
          } else if (name === 'gap') {
            groupBlock.gap = value;
          }
          break;
        case ReportBlockType.PAGE_BREAK:
          // Não há propriedades específicas para PageBreak
          break;
      }

      return newPrev;
    });
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen || !block || !formData) return null;

  const chartBlockFormData = formData.type === ReportBlockType.CHART ? formData : null;

  const dataKeyDisplayValue = chartBlockFormData && Array.isArray(chartBlockFormData.dataKey)
    ? chartBlockFormData.dataKey.join(', ')
    : chartBlockFormData?.dataKey || '';

  const dataLabelDisplayValue = chartBlockFormData && Array.isArray(chartBlockFormData.dataLabel)
    ? chartBlockFormData.dataLabel.join(', ')
    : chartBlockFormData?.dataLabel || '';

  const pieColorsDisplayValue = chartBlockFormData && Array.isArray(chartBlockFormData.pieColors)
    ? chartBlockFormData.pieColors.join(', ')
    : '';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="relative w-full max-w-3xl p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in bg-[#1A1A2A] border border-[#3A3A4E]">
        <h2 className="text-3xl font-bold text-[#E0E0F0] mb-6 border-b border-[#3A3A4E] pb-4">
          Editar Bloco: <span className="text-[#8A2BE2]">{formData.title || formData.type.replace('_', ' ')}</span>
        </h2>
        <button onClick={onClose} className="absolute top-6 right-6 text-[#A0A0C0] hover:text-white transition-colors">
          <FiX className="h-7 w-7" />
        </button>

        <div className="space-y-6">
          {/* Propriedades Comuns */}
          <section className="p-4 bg-[#2C2C3E] rounded-lg border border-[#404058]">
            <h3 className="text-xl font-semibold text-[#E0E0F0] mb-4">Propriedades Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="title" className="mb-1 block text-[#E0E0F0]">Título</Label>
                <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] placeholder-[#A0A0C0] focus:ring-[#8A2BE2]" />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="description" className="mb-1 block text-[#E0E0F0]">Descrição</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={3}
                  className="flex w-full rounded-md border border-[#404058] bg-[#2C2C3E] px-3 py-2 text-sm ring-offset-background placeholder:text-[#A0A0C0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A2BE2] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[#E0E0F0] transition-all duration-300 ease-in-out"
                />
              </div>
              <div>
                <Label htmlFor="backgroundColor" className="mb-1 block text-[#E0E0F0]">Cor de Fundo</Label>
                <Input id="backgroundColor" name="backgroundColor" type="color" value={formData.backgroundColor || '#2C2C3E'} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
              </div>
              <div>
                <Label htmlFor="textColor" className="mb-1 block text-[#E0E0F0]">Cor do Texto</Label>
                <Input id="textColor" name="textColor" type="color" value={formData.textColor || '#E0E0F0'} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
              </div>
              <div>
                <Label htmlFor="borderRadius" className="mb-1 block text-[#E0E0F0]">Borda Arredondada (Tailwind)</Label>
                <Input id="borderRadius" name="borderRadius" placeholder="ex: rounded-lg, rounded-full" value={formData.borderRadius || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
              </div>
              <div>
                <Label htmlFor="boxShadow" className="mb-1 block text-[#E0E0F0]">Sombra (Tailwind)</Label>
                <Input id="boxShadow" name="boxShadow" placeholder="ex: shadow-md, shadow-xl" value={formData.boxShadow || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
              </div>
            </div>
          </section>

          {/* Propriedades de Layout */}
          <section className="p-4 bg-[#2C2C3E] rounded-lg border border-[#404058]">
            <h3 className="text-xl font-semibold text-[#E0E0F0] mb-4">Configurações de Layout</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="layout.width" className="mb-1 block text-[#E0E0F0]">Largura (Tailwind)</Label>
                <Input id="layout.width" name="layout.width" placeholder="ex: w-full, w-1/2" value={formData.layout?.width || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
              </div>
              <div>
                <Label htmlFor="layout.height" className="mb-1 block text-[#E0E0F0]">Altura (Tailwind)</Label>
                <Input id="layout.height" name="layout.height" placeholder="ex: h-64, h-auto" value={formData.layout?.height || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
              </div>
              <div>
                <Label htmlFor="layout.padding" className="mb-1 block text-[#E0E0F0]">Padding (Tailwind)</Label>
                <Input id="layout.padding" name="layout.padding" placeholder="ex: p-4, px-2" value={formData.layout?.padding || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
              </div>
              <div>
                <Label htmlFor="layout.marginTop" className="mb-1 block text-[#E0E0F0]">Margem Superior (Tailwind)</Label>
                <Input id="layout.marginTop" name="layout.marginTop" placeholder="ex: mt-4" value={formData.layout?.marginTop || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
              </div>
              <div>
                <Label htmlFor="layout.marginBottom" className="mb-1 block text-[#E0E0F0]">Margem Inferior (Tailwind)</Label>
                <Input id="layout.marginBottom" name="layout.marginBottom" placeholder="ex: mb-4" value={formData.layout?.marginBottom || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
              </div>
              <div>
                <Label htmlFor="layout.alignment" className="mb-1 block text-[#E0E0F0]">Alinhamento</Label>
                <Select
                  id="layout.alignment"
                  name="layout.alignment"
                  value={formData.layout?.alignment || ''}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Padrão' },
                    { value: 'left', label: 'Esquerda' },
                    { value: 'center', label: 'Centro' },
                    { value: 'right', label: 'Direita' },
                  ]}
                  className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]"
                />
              </div>
            </div>
          </section>

          {/* Propriedades Específicas do Tipo de Bloco */}
          {formData.type === ReportBlockType.METRIC && (
            <section className="p-4 bg-[#2C2C3E] rounded-lg border border-[#404058]">
              <h3 className="text-xl font-semibold text-[#8A2BE2] mb-4">Configurações de Métrica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="metricKey" className="mb-1 block text-[#E0E0F0]">Métrica *</Label>
                  <Select
                    id="metricKey"
                    name="metricKey"
                    value={(formData as MetricBlock).metricKey || ''}
                    onChange={handleChange}
                    options={[
                      { value: 'totalLeads', label: 'Total de Leads' },
                      { value: 'cpl', label: 'Custo por Lead (CPL)' },
                      { value: 'roi', label: 'ROI Estimado' },
                      { value: 'totalAppointments', label: 'Total de Agendamentos' },
                      { value: 'ctr', label: 'CTR' },
                      { value: 'totalInvestment', label: 'Investimento Total' },
                      { value: 'totalSales', label: 'Vendas Totais' },
                      { value: 'impressions', label: 'Impressões' },
                      { value: 'clicks', label: 'Cliques' },
                      { value: 'conversions', label: 'Conversões' },
                    ]}
                    required
                    className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]"
                  />
                </div>
                <div>
                  <Label htmlFor="unit" className="mb-1 block text-[#E0E0F0]">Unidade (ex: %, R$)</Label>
                  <Input id="unit" name="unit" value={(formData as MetricBlock).unit || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="percentageChange" className="mb-1 block text-[#E0E0F0]">Variação Percentual (ex: 5.2, -1.3)</Label>
                  <Input id="percentageChange" name="percentageChange" type="number" step="0.1" value={(formData as MetricBlock).percentageChange || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="accentColor" className="mb-1 block text-[#E0E0F0]">Cor de Destaque</Label>
                  <Input id="accentColor" name="accentColor" type="color" value={(formData as MetricBlock).accentColor || '#8A2BE2'} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="icon" className="mb-1 block text-[#E0E0F0]">Ícone (Nome Fi*, ex: FiUsers)</Label>
                  <Input id="icon" name="icon" value={(formData as MetricBlock).icon || ''} onChange={handleChange} placeholder="FiUsers, FiDollarSign" className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="isCurrency"
                    name="isCurrency"
                    checked={(formData as MetricBlock).isCurrency || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#8A2BE2] border-[#404058] rounded focus:ring-[#8A2BE2] bg-[#2C2C3E] checked:bg-[#8A2BE2] checked:border-transparent"
                  />
                  <Label htmlFor="isCurrency" className="ml-2 text-[#E0E0F0]">É Moeda?</Label>
                </div>
              </div>
            </section>
          )}

          {formData.type === ReportBlockType.CHART && (
            <section className="p-4 bg-[#2C2C3E] rounded-lg border border-[#404058]">
              <h3 className="text-xl font-semibold text-[#8A2BE2] mb-4">Configurações de Gráfico</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chartType" className="mb-1 block text-[#E0E0F0]">Tipo de Gráfico *</Label>
                  <Select
                    id="chartType"
                    name="chartType"
                    value={(formData as ChartBlock).chartType || ''}
                    onChange={handleChange}
                    options={[
                      { value: ChartType.LINE, label: 'Linha' },
                      { value: ChartType.BAR, label: 'Barras' },
                      { value: ChartType.PIE, label: 'Pizza' },
                      { value: ChartType.AREA, label: 'Área' },
                      { value: ChartType.RADAR, label: 'Radar' },
                      { value: ChartType.STACKED_BAR, label: 'Barras Empilhadas' },
                      { value: ChartType.DUAL_LINE, label: 'Linha Dupla (2 Eixos Y)' },
                      { value: ChartType.FUNNEL, label: 'Funil' },
                    ]}
                    required
                    className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]"
                  />
                </div>
                <div>
                  <Label htmlFor="dataKey" className="mb-1 block text-[#E0E0F0]">Chave(s) dos Dados (separar por vírgula)</Label>
                  <Input id="dataKey" name="dataKey" value={dataKeyDisplayValue} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="dataLabel" className="mb-1 block text-[#E0E0F0]">Rótulo(s) da Legenda (separar por vírgula)</Label>
                  <Input id="dataLabel" name="dataLabel" value={dataLabelDisplayValue} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="xAxisKey" className="mb-1 block text-[#E0E0F0]">Chave do Eixo X</Label>
                  <Input id="xAxisKey" name="xAxisKey" value={(formData as ChartBlock).xAxisKey || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="yAxisKey" className="mb-1 block text-[#E0E0F0]">Chave do Eixo Y</Label>
                  <Input id="yAxisKey" name="yAxisKey" value={(formData as ChartBlock).yAxisKey || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="lineColor" className="mb-1 block text-[#E0E0F0]">Cor da Linha/Radar</Label>
                  <Input id="lineColor" name="lineColor" type="color" value={(formData as ChartBlock).lineColor || '#8A2BE2'} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="barColor" className="mb-1 block text-[#E0E0F0]">Cor da Barra/Funil</Label>
                  <Input id="barColor" name="barColor" type="color" value={(formData as ChartBlock).barColor || '#6A5ACD'} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="gradientStartColor" className="mb-1 block text-[#E0E0F0]">Cor Início Gradiente (Área)</Label>
                  <Input id="gradientStartColor" name="gradientStartColor" type="color" value={(formData as ChartBlock).gradientStartColor || '#00BFFF'} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="gradientEndColor" className="mb-1 block text-[#E0E0F0]">Cor Fim Gradiente (Área)</Label>
                  <Input id="gradientEndColor" name="gradientEndColor" type="color" value={(formData as ChartBlock).gradientEndColor || '#8A2BE2'} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="pieColors" className="mb-1 block text-[#E0E0F0]">Cores da Pizza (separar por vírgula)</Label>
                  <Input
                    id="pieColors"
                    name="pieColors"
                    value={pieColorsDisplayValue}
                    onChange={handleChange}
                    className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]"
                  />
                </div>
                <div className="flex items-center space-x-4 md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showLegend"
                      name="showLegend"
                      checked={(formData as ChartBlock).showLegend || false}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#8A2BE2] border-[#404058] rounded focus:ring-[#8A2BE2] bg-[#2C2C3E] checked:bg-[#8A2BE2] checked:border-transparent"
                    />
                    <Label htmlFor="showLegend" className="ml-2 text-[#E0E0F0]">Mostrar Legenda</Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showTooltip"
                      name="showTooltip"
                      checked={(formData as ChartBlock).showTooltip || false}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#8A2BE2] border-[#404058] rounded focus:ring-[#8A2BE2] bg-[#2C2C3E] checked:bg-[#8A2BE2] checked:border-transparent"
                    />
                    <Label htmlFor="showTooltip" className="ml-2 text-[#E0E0F0]">Mostrar Tooltip</Label>
                  </div>
                </div>
              </div>
            </section>
          )}

          {formData.type === ReportBlockType.TEXT && (
            <section className="p-4 bg-[#2C2C3E] rounded-lg border border-[#404058]">
              <h3 className="text-xl font-semibold text-[#8A2BE2] mb-4">Configurações de Texto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="content" className="mb-1 block text-[#E0E0F0]">Conteúdo do Texto *</Label>
                  <textarea
                    id="content"
                    name="content"
                    value={(formData as TextBlock).content || ''}
                    onChange={handleChange}
                    rows={6}
                    required
                    className="flex w-full rounded-md border border-[#404058] bg-[#2C2C3E] px-3 py-2 text-sm ring-offset-background placeholder:text-[#A0A0C0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A2BE2] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[#E0E0F0] transition-all duration-300 ease-in-out"
                  />
                </div>
                <div>
                  <Label htmlFor="fontSize" className="mb-1 block text-[#E0E0F0]">Tamanho da Fonte (Tailwind)</Label>
                  <Input id="fontSize" name="fontSize" placeholder="ex: text-lg, text-xl" value={(formData as TextBlock).fontSize || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="fontWeight" className="mb-1 block text-[#E0E0F0]">Peso da Fonte (Tailwind)</Label>
                  <Input id="fontWeight" name="fontWeight" placeholder="ex: font-bold, font-normal" value={(formData as TextBlock).fontWeight || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
              </div>
            </section>
          )}

          {formData.type === ReportBlockType.IMAGE && (
            <section className="p-4 bg-[#2C2C3E] rounded-lg border border-[#404058]">
              <h3 className="text-xl font-semibold text-[#8A2BE2] mb-4">Configurações de Imagem</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="imageUrl" className="mb-1 block text-[#E0E0F0]">URL da Imagem *</Label>
                  <Input id="imageUrl" name="imageUrl" value={(formData as ImageBlock).imageUrl || ''} onChange={handleChange} required className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="altText" className="mb-1 block text-[#E0E0F0]">Texto Alternativo</Label>
                  <Input id="altText" name="altText" value={(formData as ImageBlock).altText || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
                <div>
                  <Label htmlFor="objectFit" className="mb-1 block text-[#E0E0F0]">Ajuste da Imagem</Label>
                  <Select
                    id="objectFit"
                    name="objectFit"
                    value={(formData as ImageBlock).objectFit || ''}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Padrão' },
                      { value: 'cover', label: 'Cover' },
                      { value: 'contain', label: 'Contain' },
                      { value: 'fill', label: 'Fill' },
                      { value: 'none', label: 'None' },
                      { value: 'scale-down', label: 'Scale Down' },
                    ]}
                    className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]"
                  />
                </div>
              </div>
            </section>
          )}

          {formData.type === ReportBlockType.TABLE && (
            <section className="p-4 bg-[#2C2C3E] rounded-lg border border-[#404058]">
              <h3 className="text-xl font-semibold text-[#8A2BE2] mb-4">Configurações de Tabela</h3>
              <p className="text-sm text-[#A0A0C0] mb-4">Para editar dados e colunas da tabela, o backend deve fornecer uma API ou seria necessário um editor de JSON aqui.</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showHeaders"
                    name="showHeaders"
                    checked={(formData as TableBlock).showHeaders || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#8A2BE2] border-[#404058] rounded focus:ring-[#8A2BE2] bg-[#2C2C3E] checked:bg-[#8A2BE2] checked:border-transparent"
                  />
                  <Label htmlFor="showHeaders" className="ml-2 text-[#E0E0F0]">Mostrar Cabeçalhos</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="stripedRows"
                    name="stripedRows"
                    checked={(formData as TableBlock).stripedRows || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#8A2BE2] border-[#404058] rounded focus:ring-[#8A2BE2] bg-[#2C2C3E] checked:bg-[#8A2BE2] checked:border-transparent"
                  />
                  <Label htmlFor="stripedRows" className="ml-2 text-[#E0E0F0]">Linhas Zebradas</Label>
                </div>
              </div>
            </section>
          )}

          {formData.type === ReportBlockType.GROUP && (
            <section className="p-4 bg-[#2C2C3E] rounded-lg border border-[#404058]">
              <h3 className="text-xl font-semibold text-[#8A2BE2] mb-4">Configurações de Grupo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="groupLayout" className="mb-1 block text-[#E0E0F0]">Layout do Grupo</Label>
                  <Select
                    id="groupLayout"
                    name="groupLayout"
                    value={(formData as GroupBlock).groupLayout || ''}
                    onChange={handleChange}
                    options={[
                      { value: 'column', label: 'Coluna (Vertical)' },
                      { value: 'row', label: 'Linha (Horizontal)' },
                    ]}
                    className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]"
                  />
                </div>
                <div>
                  <Label htmlFor="gap" className="mb-1 block text-[#E0E0F0]">Espaçamento (Tailwind, ex: 4, 6)</Label>
                  <Input id="gap" name="gap" placeholder="ex: 4" value={(formData as GroupBlock).gap || ''} onChange={handleChange} className="bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] focus:ring-[#8A2BE2]" />
                </div>
              </div>
              <p className="text-sm text-[#A0A0C0] mt-4">Para editar os blocos dentro do grupo, edite o bloco de grupo e adicione/remova blocos diretamente no código ou implemente um editor de blocos aninhados.</p>
            </section>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-[#3A3A4E]">
            <Button type="button" variant="outline" onClick={onClose} className="border-[#A0A0C0] text-[#A0A0C0] hover:bg-[#404058] hover:text-white rounded-lg shadow-md transition-all duration-200">
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={handleSave} className="bg-[#8A2BE2] hover:bg-[#6A5ACD] text-white rounded-lg shadow-md transition-all duration-200">
              <FiSave className="mr-2" /> Salvar Alterações
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
