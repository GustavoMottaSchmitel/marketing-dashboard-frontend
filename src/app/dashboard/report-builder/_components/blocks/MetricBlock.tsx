  // src/app/dashboard/report-builder/_components/blocks/MetricBlock.tsx
  'use client';

  import React from 'react';
  import { MetricBlock as MetricBlockType, CommonBlockRenderProps } from '@/app/types/report-builders';
  import { FiUsers, FiDollarSign, FiPercent, FiZap, FiTarget, FiEye, FiMousePointer, FiTrendingUp, FiTrendingDown, FiBarChart, FiActivity, FiArrowUpCircle, FiArrowDownCircle } from 'react-icons/fi';
  import { cn } from '@/app/lib/utils';

  interface MetricBlockProps extends CommonBlockRenderProps {
    block: MetricBlockType;
  }

  // Mapeamento de ícones (adicionado mais alguns para maior flexibilidade)
  const IconMap: { [key: string]: React.ElementType } = {
    FiUsers,
    FiDollarSign,
    FiPercent,
    FiZap,
    FiTarget,
    FiEye,
    FiMousePointer,
    FiBarChart, // Exemplo de ícone para "impressions" ou "clicks"
    FiActivity, // Exemplo para "conversions"
    FiArrowUpCircle, // Para tendências positivas
    FiArrowDownCircle, // Para tendências negativas
  };

  // Nova paleta de cores para os acentos dos cards de métrica
  const METRIC_ACCENT_COLORS = {
    totalLeads: '#8A2BE2', // Roxo
    cpl: '#FF4500', // Laranja avermelhado
    roi: '#32CD32', // Verde
    totalAppointments: '#00BFFF', // Azul
    ctr: '#FFD700', // Amarelo
    totalInvestment: '#FF7F00', // Laranja
    totalSales: '#00FFFF', // Ciano
    impressions: '#4682B4', // SteelBlue
    clicks: '#6A5ACD', // Roxo claro
    conversions: '#DA70D6', // Orquídea
  };

  export const MetricBlock: React.FC<MetricBlockProps> = ({ block, isDragging }) => {
    // Tenta obter o ícone do mapa, ou usa um padrão se não encontrado
    const IconComponent = block.icon ? IconMap[block.icon] : (block.metricKey ? IconMap[block.metricKey] : FiTarget); // Fallback para FiTarget

    // Dados mockados para demonstração (simulando que podem ser filtrados)
    const mockValues = {
      totalLeads: 12345,
      cpl: 15.75,
      roi: 3.2,
      totalAppointments: 876,
      ctr: 5.8,
      totalInvestment: 25000.00,
      totalSales: 80000.00,
      impressions: 150000,
      clicks: 8500,
      conversions: 120,
    };
    
    // Usa o valor mockado correspondente à metricKey ou 0 se não encontrado
    const mockValue = mockValues[block.metricKey as keyof typeof mockValues] || 0;

    const formattedValue = typeof mockValue === 'number'
      ? mockValue.toLocaleString('pt-BR', { minimumFractionDigits: block.isCurrency ? 2 : 0, maximumFractionDigits: block.isCurrency ? 2 : 0 })
      : mockValue;

    // Usa a cor de acento definida no bloco, ou uma cor do mapa de acentos, ou um padrão
    const accentColor = block.accentColor || METRIC_ACCENT_COLORS[block.metricKey as keyof typeof METRIC_ACCENT_COLORS] || '#8A2BE2';

    return (
      <div
        className={cn(
          "flex flex-col items-start justify-between p-6 rounded-lg relative overflow-hidden", // Padding aumentado, relative para a barra de acento
          block.backgroundColor || 'bg-[#1A1A2A]', // Fundo padrão
          block.textColor || 'text-[#E0E0F0]', // Cor do texto padrão
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
          minHeight: block.layout?.height || '150px', // Altura mínima para métricas
        }}
      >
        {/* Barra de acento na parte inferior */}
        <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ backgroundColor: accentColor }}></div>

        <div className="flex items-center justify-between w-full mb-2">
          <p className={cn(
            "text-sm font-medium uppercase tracking-wider",
            block.textColor ? `text-[${block.textColor}] opacity-70` : 'text-[#A0A0C0]'
          )}>
            {block.title || (block.metricKey ? block.metricKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : 'Métrica')}
          </p>
          {IconComponent && <IconComponent size={24} className="text-opacity-80" style={{ color: accentColor }} />}
        </div>
        <h3 className={cn(
          "text-4xl font-extrabold mt-1",
          block.textColor || 'text-[#E0E0F0]'
        )}>
          {block.isCurrency ? `R$ ${formattedValue}` : formattedValue}
          {block.unit && <span className={cn("text-xl font-normal ml-1", block.textColor ? `text-[${block.textColor}] opacity-80` : 'text-[#A0A0C0]')}>{block.unit}</span>}
        </h3>
        {block.percentageChange != null && (
          <p className={cn(
            `text-base mt-2 flex items-center gap-1 font-semibold`,
            block.percentageChange >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {block.percentageChange >= 0 ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
            {Math.abs(block.percentageChange).toFixed(1)}%
          </p>
        )}
        {block.description && (
          <p className={cn(
            "text-xs mt-2 leading-tight",
            block.textColor ? `text-[${block.textColor}] opacity-80` : 'text-[#A0A0C0]'
          )}>
            {block.description}
          </p>
        )}
      </div>
    );
  };
