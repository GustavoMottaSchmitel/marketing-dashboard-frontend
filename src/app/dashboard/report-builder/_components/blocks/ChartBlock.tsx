// src/app/dashboard/report-builder/_components/blocks/ChartBlock.tsx
'use client';

import React, { useMemo } from 'react'; // Removido useState, useEffect pois não são usados diretamente aqui
import { ChartBlock as ChartBlockType, ChartType, CommonBlockRenderProps } from '@/app/types/report-builders';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  CartesianGrid, Tooltip, Legend, XAxis, YAxis
} from 'recharts';
import { cn } from '@/app/lib/utils';

// --- NOVA PALETA DE CORES E GRADIENTES PARA GRÁFICOS (Consistente com DashboardPage) ---
const PRIMARY_ACCENT = '#8A2BE2'; // Amethyst (Roxo principal)
const SECONDARY_ACCENT = '#00BFFF'; // Deep Sky Blue (Azul vibrante)
const SUCCESS_COLOR = '#32CD32'; // Lime Green (Verde para sucesso/crescimento)
const WARNING_COLOR = '#FFD700'; // Gold (Amarelo para atenção)
const ERROR_COLOR = '#FF4500'; // Orange Red (Laranja avermelhado para erro/negativo)
const INFO_COLOR = '#4682B4'; // SteelBlue (Azul para informações)

const CHART_PALETTE = [
  PRIMARY_ACCENT,
  SUCCESS_COLOR,
  SECONDARY_ACCENT,
  WARNING_COLOR,
  ERROR_COLOR,
  INFO_COLOR,
  '#9370DB', // MediumPurple
  '#20B2AA', // LightSeaGreen
  '#FF8C00', // DarkOrange
  '#87CEEB', // SkyBlue
];

interface ChartBlockProps {
  block: ChartBlockType;
  onEdit: CommonBlockRenderProps['onEdit'];
  onDuplicate: CommonBlockRenderProps['onDuplicate'];
  onDelete: CommonBlockRenderProps['onDelete'];
  onMoveUp: CommonBlockRenderProps['onMoveUp'];
  onMoveDown: CommonBlockRenderProps['onMoveDown'];
  isDragging?: CommonBlockRenderProps['isDragging'];
}

// Dados mockados para gráficos (mais complexos para simular filtros)
const mockChartData = {
  LINE: [
    { date: '2023-01-01', clinic: 'clinic-a', value: 400 }, { date: '2023-01-08', clinic: 'clinic-a', value: 300 },
    { date: '2023-01-15', clinic: 'clinic-a', value: 500 }, { date: '2023-01-22', clinic: 'clinic-b', value: 450 },
    { date: '2023-01-29', clinic: 'clinic-b', value: 600 },
    { date: '2023-02-05', clinic: 'clinic-a', value: 550 }, { date: '2023-02-12', clinic: 'clinic-c', value: 700 },
  ],
  BAR: [
    { name: 'Campanha A', clinic: 'clinic-a', value: 120 }, { name: 'Campanha B', clinic: 'clinic-a', value: 80 },
    { name: 'Campanha C', clinic: 'clinic-b', value: 150 }, { name: 'Campanha D', clinic: 'clinic-c', value: 90 },
  ],
  PIE: [
    { name: 'Orgânico', clinic: 'clinic-a', value: 300 }, { name: 'Ads', clinic: 'clinic-a', value: 500 },
    { name: 'Referral', clinic: 'clinic-b', value: 200 },
  ],
  AREA: [
    { date: '2023-01-01', clinic: 'clinic-a', value: 10 }, { date: '2023-01-08', clinic: 'clinic-a', value: 12 },
    { date: '2023-01-15', clinic: 'clinic-b', value: 8 }, { date: '2023-01-22', clinic: 'clinic-c', value: 15 },
    { date: '2023-01-29', clinic: 'clinic-a', value: 11 },
  ],
  RADAR: [
    { subject: 'Engajamento', clinic: 'clinic-a', A: 80, fullMark: 100 },
    { subject: 'Alcance', clinic: 'clinic-a', A: 60, fullMark: 100 },
    { subject: 'Conversão', clinic: 'clinic-b', A: 75, fullMark: 100 },
    { subject: 'Custo', clinic: 'clinic-c', A: 40, fullMark: 100 },
  ],
  STACKED_BAR: [
    { name: 'Jan', clinic: 'clinic-a', whatsapp: 30, form: 20, dm: 10 },
    { name: 'Fev', clinic: 'clinic-a', whatsapp: 40, form: 25, dm: 15 },
    { name: 'Mar', clinic: 'clinic-b', whatsapp: 35, form: 18, dm: 12 },
  ],
  DUAL_LINE: [
    { date: '2023-01-01', clinic: 'clinic-a', leads: 100, investment: 500 },
    { date: '2023-01-08', clinic: 'clinic-a', leads: 120, investment: 600 },
    { date: '2023-01-15', clinic: 'clinic-b', leads: 90, investment: 450 },
    { date: '2023-01-22', clinic: 'clinic-c', leads: 150, investment: 700 },
    { date: '2023-01-29', clinic: 'clinic-a', leads: 130, investment: 650 },
  ],
  FUNNEL: [
    { stage: 'Impressões', clinic: 'clinic-a', value: 100000 },
    { stage: 'Cliques', clinic: 'clinic-a', value: 5000 },
    { stage: 'Leads', clinic: 'clinic-b', value: 500 },
    { stage: 'Agendamentos', clinic: 'clinic-c', value: 100 },
    { stage: 'Procedimentos', clinic: 'clinic-a', value: 50 },
  ],
};


export const ChartBlock: React.FC<ChartBlockProps> = ({ block }) => {
  const data = mockChartData[block.chartType as keyof typeof mockChartData] || [];

  const defaultLineColor = block.lineColor || PRIMARY_ACCENT;
  const defaultBarColor = block.barColor || PRIMARY_ACCENT;
  const defaultPieColors = block.pieColors && block.pieColors.length > 0 ? block.pieColors : CHART_PALETTE;
  const defaultGradientStart = block.gradientStartColor || PRIMARY_ACCENT;
  const defaultGradientEnd = block.gradientEndColor || SECONDARY_ACCENT;

  if (data.length === 0) {
    return (
      <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full min-h-[200px] bg-[#1A1A2A] rounded-lg border border-[#3A3A4E] p-4">
        Nenhum dado disponível para este gráfico.
      </div>
    );
  }

  const renderChart = () => {
    // Agora, o ResponsiveContainer é o elemento de nível superior retornado,
    // eliminando a necessidade de React.Fragment
    switch (block.chartType) {
      case ChartType.LINE:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
            <XAxis dataKey={block.xAxisKey || 'date'} stroke="#A0A0C0" tickLine={false} axisLine={false} />
            <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} />
            {block.showTooltip && <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              itemStyle={{ color: '#a0aec0' }}
            />}
            {block.showLegend && <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />}
            <Line
              type="monotone"
              dataKey={block.dataKey as string || 'value'}
              stroke={defaultLineColor}
              strokeWidth={3}
              dot={{ stroke: defaultLineColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
      case ChartType.BAR:
        return (
          <BarChart data={data}>
            <defs>
              <linearGradient id={`${block.id}-bar-gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={defaultGradientStart} stopOpacity={0.9}/>
                <stop offset="95%" stopColor={defaultGradientEnd} stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
            <XAxis dataKey={block.xAxisKey || 'name'} stroke="#A0A0C0" tickLine={false} axisLine={false} />
            <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} />
            {block.showTooltip && <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              itemStyle={{ color: '#a0aec0' }}
            />}
            {block.showLegend && <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />}
            <Bar dataKey={block.dataKey as string || 'value'} fill={`url(#${block.id}-bar-gradient)`} radius={[5, 5, 0, 0]} barSize={30} />
          </BarChart>
        );
      case ChartType.PIE:
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey={block.dataKey as string || 'value'}
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              stroke="#2C2C3E"
              paddingAngle={3}
            >
              {(data as any[]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={defaultPieColors[index % defaultPieColors.length]} stroke={defaultPieColors[index % defaultPieColors.length]} strokeWidth={1} />
              ))}
            </Pie>
            {block.showTooltip && <Tooltip
              contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              itemStyle={{ color: '#a0aec0' }}
            />}
            {block.showLegend && <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />}
          </PieChart>
        );
      case ChartType.AREA:
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`${block.id}-area-gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={defaultGradientStart} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={defaultGradientEnd} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
            <XAxis dataKey={block.xAxisKey || 'date'} stroke="#A0A0C0" tickLine={false} axisLine={false} />
            <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} />
            {block.showTooltip && <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              itemStyle={{ color: '#a0aec0' }}
            />}
            {block.showLegend && <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />}
            <Area
              type="monotone"
              dataKey={block.dataKey as string || 'value'}
              stroke={defaultLineColor}
              fillOpacity={0.6}
              fill={`url(#${block.id}-area-gradient)`}
              strokeWidth={2}
            />
          </AreaChart>
        );
      case ChartType.RADAR:
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#404058" />
            <PolarAngleAxis dataKey={block.xAxisKey || 'subject'} stroke="#A0A0C0" tick={{ fill: '#a0aec0', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, Math.max(...data.map((d: any) => d[block.dataKey as string || 'A'])) * 1.1]} stroke="#404058" tick={false} axisLine={false} />
            <Radar
              name={Array.isArray(block.dataLabel) ? block.dataLabel[0] : block.dataLabel || 'Valor'}
              dataKey={block.dataKey as string || 'A'}
              stroke={defaultLineColor}
              fill={defaultLineColor}
              fillOpacity={0.6}
            />
            {block.showTooltip && <Tooltip
              contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              itemStyle={{ color: '#a0aec0' }}
            />}
            {block.showLegend && <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />}
          </RadarChart>
        );
      case ChartType.STACKED_BAR:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
            <XAxis dataKey={block.xAxisKey || 'name'} stroke="#A0A0C0" tickLine={false} axisLine={false} />
            <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} />
            {block.showTooltip && <Tooltip
              contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              itemStyle={{ color: '#a0aec0' }}
            />}
            {block.showLegend && <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />}
            {(block.dataKey as string[] || []).map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={defaultPieColors[index % defaultPieColors.length]}
                name={key}
                radius={[5, 5, 0, 0]}
              />
            ))}
          </BarChart>
        );
      case ChartType.DUAL_LINE:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
            <XAxis dataKey={block.xAxisKey || 'date'} stroke="#A0A0C0" tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke={block.lineColor || PRIMARY_ACCENT} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke={block.barColor || SECONDARY_ACCENT} tickLine={false} axisLine={false} />
            {block.showTooltip && <Tooltip
              contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              itemStyle={{ color: '#a0aec0' }}
            />}
            {block.showLegend && <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />}
            <Line yAxisId="left" type="monotone" dataKey={(block.dataKey as string[])[0] || 'value1'} stroke={block.lineColor || PRIMARY_ACCENT} strokeWidth={2} dot={false} name={Array.isArray(block.dataLabel) && block.dataLabel.length > 0 ? block.dataLabel[0] : 'Linha 1'} />
            <Line yAxisId="right" type="monotone" dataKey={(block.dataKey as string[])[1] || 'value2'} stroke={block.barColor || SECONDARY_ACCENT} strokeWidth={2} dot={false} name={Array.isArray(block.dataLabel) && block.dataLabel.length > 1 ? block.dataLabel[1] : 'Linha 2'} />
          </LineChart>
        );
      case ChartType.FUNNEL:
        return (
          <BarChart layout="vertical" data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404058" horizontal={false} />
            <XAxis type="number" stroke="#A0A0C0" tickLine={false} axisLine={false} hide />
            <YAxis type="category" dataKey={block.xAxisKey || 'stage'} stroke="#A0A0C0" tickLine={false} axisLine={false} width={100} />
            {block.showTooltip && <Tooltip
              contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              itemStyle={{ color: '#a0aec0' }}
            />}
            <Bar dataKey={block.dataKey as string || 'value'} fill={defaultBarColor} barSize={40} radius={[0, 10, 10, 0]}>
              {(data as any[]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={defaultPieColors[index % defaultPieColors.length]} />
              ))}
            </Bar>
          </BarChart>
        );
      default:
        return <div className="text-center text-red-400">Tipo de gráfico desconhecido.</div>;
    }
  };

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col justify-between p-4",
        block.backgroundColor || 'bg-[#1A1A2A]',
        block.textColor || 'text-[#E0E0F0]',
        block.borderRadius || 'rounded-lg',
        block.boxShadow || 'shadow-md',
        block.layout?.width,
        block.layout?.height,
        block.layout?.padding,
        block.layout?.marginTop,
        block.layout?.marginBottom,
        block.layout?.alignment === 'center' && 'mx-auto',
        block.layout?.alignment === 'right' && 'ml-auto',
        block.layout?.alignment === 'left' && 'mr-auto',
      )}
      style={{
        minHeight: block.layout?.height || '300px', // Usar minHeight para garantir que o gráfico tenha espaço
        backgroundColor: block.backgroundColor,
        color: block.textColor,
      }}
    >
      {/* Título do Bloco */}
      <h4 className={cn(
        "text-lg font-semibold mb-2",
        block.textColor || 'text-[#E0E0F0]'
      )}>
        {block.title || 'Gráfico Personalizado'}
      </h4>

      {/* Descrição do Bloco (opcional) */}
      {block.description && (
        <p className={cn(
          "text-sm mb-4",
          block.textColor ? `text-[${block.textColor}] opacity-70` : 'text-[#A0A0C0]'
        )}>
          {block.description}
        </p>
      )}

      {/* Container Responsivo para o Gráfico */}
      {/* O ResponsiveContainer deve ser o único filho direto do div que o contém,
          e ele próprio já gerencia a largura e altura. */}
      <ResponsiveContainer width="100%" height="calc(100% - 60px)"> 
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};
