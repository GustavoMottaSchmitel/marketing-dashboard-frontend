// src/app/dashboard/_components/ExpandedChartModal.tsx

import React from 'react';
import { Card, Button } from '@/app/components/ui/custom-elements';
import { X } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area,
} from 'recharts';
import {
  PRIMARY_ACCENT, SECONDARY_ACCENT, SUCCESS_COLOR, WARNING_COLOR, ERROR_COLOR, INFO_COLOR,
  PIE_CHART_COLORS, GRADIENT_BAR_PRIMARY_START, GRADIENT_BAR_PRIMARY_END,
  GRADIENT_BAR_SECONDARY_START, GRADIENT_BAR_SECONDARY_END, GRADIENT_AREA_START, GRADIENT_AREA_END
} from '@/app/types/dashboard';
import {
  CampaignData, CreativeData, EvolutionData, OriginData, LeadTypeDistributionData,
  ROIHistoryData, InstagramInsightData, InstagramPostInteraction, ConversionFunnelData,
  ClinicOverviewData as BackendClinicOverviewData, DashboardDataDTO
} from '@/app/lib/dashboard';

interface ExpandedChartModalProps {
  expandedChart: { type: string; data: unknown; title: string; } | null;
  onClose: () => void;
  clinicIdFromUrl: string | null;
  currentDashboardDataForDisplay: DashboardDataDTO;
}

export const ExpandedChartModal: React.FC<ExpandedChartModalProps> = ({ expandedChart, onClose, clinicIdFromUrl, currentDashboardDataForDisplay }) => {
  if (!expandedChart) return null;

  const { type, data, title } = expandedChart;

  // Função para renderizar os tooltips e legends de forma consistente
  const renderChartElements = (chartType: string) => (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={chartType !== 'CreativePerformanceBarChart' && chartType !== 'FunnelBarChart'} horizontal={chartType === 'CreativePerformanceBarChart' || chartType === 'FunnelBarChart'} />
      {chartType !== 'PieChart' && chartType !== 'RadarChart' && chartType !== 'FunnelBarChart' && (
        <XAxis dataKey={chartType.includes('Evolution') || chartType.includes('Interactions') || chartType.includes('ROIHistory') ? 'date' : (chartType === 'OriginDistributionPieChart' ? 'name' : 'name')} stroke="#6B7280" tickLine={false} axisLine={false} />
      )}
      {chartType !== 'PieChart' && (
        <YAxis stroke="#6B7280" tickLine={false} axisLine={false}
          tickFormatter={(value: number) => {
            if (chartType === 'CPLByCampaignBarChart' || chartType === 'SalesEvolutionLineChart' || chartType === 'InvestmentLeadsLineChart') return `R$ ${value.toFixed(0)}`;
            if (chartType === 'ConversionRateAreaChart' || chartType === 'ROIHistoryLineChart') return `${value.toFixed(0)}%`;
            return value.toLocaleString('pt-BR');
          }}
        />
      )}
      <Tooltip
        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
        contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
        itemStyle={{ color: '#4B5563' }}
        formatter={(value: number, name: string) => {
          if (name === 'ctr' || name === 'conversionRate' || chartType === 'ConversionRateAreaChart' || chartType === 'ROIHistoryLineChart') return `${value.toFixed(2)}%`;
          if (name === 'cpl' || name === 'investment' || chartType === 'CPLByCampaignBarChart' || chartType === 'SalesEvolutionLineChart') return `R$ ${value.toFixed(2).replace('.', ',')}`;
          return value.toLocaleString('pt-BR');
        }}
      />
      {(chartType !== 'PieChart' && chartType !== 'RadarChart' && chartType !== 'FunnelBarChart') && (
        <Legend wrapperStyle={{ color: '#4B5563', paddingTop: '10px' }} />
      )}
    </>
  );

  // Renderiza o componente do gráfico com base no tipo
  const renderChartContent = () => {
    switch (type) {
      case 'LeadsByCampaignBarChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data as CampaignData[]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="leadsBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GRADIENT_BAR_PRIMARY_START} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={GRADIENT_BAR_PRIMARY_END} stopOpacity={0.3} />
                </linearGradient>
              </defs>
              {renderChartElements(type)}
              <Bar dataKey="leads" fill="url(#leadsBarGradient)" radius={[5, 5, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'CPLByCampaignBarChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data as CampaignData[]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cplBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GRADIENT_BAR_SECONDARY_START} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={GRADIENT_BAR_SECONDARY_END} stopOpacity={0.3} />
                </linearGradient>
              </defs>
              {renderChartElements(type)}
              <Bar dataKey="cpl" fill="url(#cplBarGradient)" radius={[5, 5, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'LeadTypeDistributionBarChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data as LeadTypeDistributionData[]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {renderChartElements(type)}
              <Bar dataKey="leads" stackId="a" fill={PRIMARY_ACCENT} name="Leads" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'CreativePerformanceBarChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data as CreativeData[]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis type="number" stroke="#6B7280" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#6B7280" tickLine={false} axisLine={false} width={120} />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                itemStyle={{ color: '#4B5563' }}
                formatter={(value: number, name: string) => {
                  if (name === 'ctr' || name === 'conversionRate') return `${value.toFixed(2)}%`;
                  return value.toLocaleString('pt-BR');
                }}
              />
              <Legend wrapperStyle={{ color: '#4B5563', paddingTop: '10px' }} />
              <Bar dataKey="clicks" fill={SECONDARY_ACCENT} name="Cliques" radius={[0, 5, 5, 0]} />
              <Bar dataKey="leads" fill={SUCCESS_COLOR} name="Leads" radius={[0, 5, 5, 0]} />
              <Bar dataKey="conversionRate" fill={PRIMARY_ACCENT} name="Conversão (%)" radius={[0, 5, 5, 0]} />
              <Bar dataKey="ctr" fill={WARNING_COLOR} name="CTR (%)" radius={[0, 5, 5, 0]} />
              <Bar dataKey="views" fill={INFO_COLOR} name="Views" radius={[0, 5, 5, 0]} />
              <Bar dataKey="cpl" fill={ERROR_COLOR} name="CPL" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'LeadsEvolutionLineChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data as EvolutionData[]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              {renderChartElements(type)}
              <Line type="monotone" dataKey="value" stroke={SECONDARY_ACCENT} strokeWidth={3} dot={{ stroke: SECONDARY_ACCENT, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'SalesEvolutionLineChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data as EvolutionData[]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              {renderChartElements(type)}
              <Line type="monotone" dataKey="value" stroke={SUCCESS_COLOR} strokeWidth={3} dot={{ stroke: SUCCESS_COLOR, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'InvestmentLeadsLineChart':
        // A data aqui é um array de objetos com 'date', 'leads', 'investment'
        const investmentLeadsData = data as { date: string; leads: number; investment: number; }[];
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={investmentLeadsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="date" stroke="#6B7280" tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke={ERROR_COLOR} tickLine={false} axisLine={false} tickFormatter={(value: number) => `R$ ${value.toFixed(0)}`} />
              <YAxis yAxisId="right" orientation="right" stroke={PRIMARY_ACCENT} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                itemStyle={{ color: '#4B5563' }}
                formatter={(value: number, name: string) => {
                  if (name === 'investment') return `Investimento: R$ ${value.toFixed(2).replace('.', ',')}`;
                  if (name === 'leads') return `Leads: ${value.toLocaleString('pt-BR')}`;
                  return value;
                }}
              />
              <Legend wrapperStyle={{ color: '#4B5563', paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="investment" name="Investimento" stroke={ERROR_COLOR} strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke={PRIMARY_ACCENT} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'OriginDistributionPieChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data as OriginData[]}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                stroke="#F0F0F0"
                paddingAngle={5}
              >
                {(data as OriginData[]).map((entry: OriginData, index: number) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} stroke={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                itemStyle={{ color: '#4B5563' }}
                formatter={(value: number) => `${value.toLocaleString('pt-BR')} Leads`}
              />
              <Legend wrapperStyle={{ color: '#4B5563', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'ConversionRateAreaChart':
        // A data aqui é um array de EvolutionData que será mapeado para incluir conversionRate
        const conversionRateData = (data as EvolutionData[]).map((item: EvolutionData) => ({
          date: item.date,
          conversionRate: Math.min(100, (item.value / 100) + (Math.random() * 10))
        }));
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={conversionRateData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              {renderChartElements(type)}
              <Area type="monotone" dataKey="conversionRate" stroke={GRADIENT_AREA_START} fillOpacity={0.6} fill={`url(#conversionAreaGradient)`} />
              <defs>
                <linearGradient id="conversionAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GRADIENT_AREA_START} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={GRADIENT_AREA_END} stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'FunnelBarChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data as ConversionFunnelData[]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis type="number" stroke="#6B7280" tickLine={false} axisLine={false} hide />
              <YAxis type="category" dataKey="stage" stroke="#6B7280" tickLine={false} axisLine={false} width={100} />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                itemStyle={{ color: '#4B5563' }}
                formatter={(value: number) => `${value.toLocaleString('pt-BR')}`}
              />
              <Bar dataKey="value" fill={PRIMARY_ACCENT} barSize={40} radius={[0, 10, 10, 0]}>
                {(data as ConversionFunnelData[]).map((entry: ConversionFunnelData, index: number) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'ROIHistoryLineChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data as ROIHistoryData[]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              {renderChartElements(type)}
              <Line type="monotone" dataKey="roi" name="ROI Real" stroke={SUCCESS_COLOR} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="estimatedRoi" name="ROI Estimado" stroke={PRIMARY_ACCENT} strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'ClinicsComparisonRadarChart':
        // A data aqui é um array de objetos com subject, cpl, cpc, conversionRate, roi, leads, fullMark
        const clinicsRadarData = data as { subject: string; cpl: number; cpc: number; conversionRate: number; roi: number; leads: number; fullMark: number; }[];
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={clinicsRadarData}>
              <PolarGrid stroke="#E0E0E0" />
              <PolarAngleAxis dataKey="subject" stroke="#6B7280" tick={{ fill: '#4B5563', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, Math.max(...clinicsRadarData.map((d: { cpl: number }) => d.cpl * 10 || 0)) * 1.1]} stroke="#E0E0E0" tick={false} axisLine={false} />
              <Radar name={currentDashboardDataForDisplay?.clinicsOverview.find((c: BackendClinicOverviewData) => c.id === parseInt(clinicIdFromUrl || '0'))?.name || 'Clínica Selecionada'} dataKey="cpl" stroke={PRIMARY_ACCENT} fill={PRIMARY_ACCENT} fillOpacity={0.6} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                itemStyle={{ color: '#4B5563' }}
                formatter={(value: number, name: string) => {
                  if (name === 'CPL') return `R$ ${(value * 10).toFixed(2)}`;
                  if (name === 'CPC') return `R$ ${(value * 5).toFixed(2)}`;
                  if (name === 'Conversão') return `${value.toFixed(1)}%`;
                  if (name === 'ROI') return `${(value / 10).toFixed(2)}`;
                  if (name === 'Leads') return `${(value * 100).toLocaleString('pt-BR')}`;
                  return value.toLocaleString('pt-BR');
                }}
              />
              <Legend wrapperStyle={{ color: '#4B5563', paddingTop: '10px' }} />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'InstagramEngagementRadarChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data as InstagramInsightData[]}>
              <PolarGrid stroke="#E0E0E0" />
              <PolarAngleAxis dataKey="metric" stroke="#6B7280" tick={{ fill: '#4B5563', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, Math.max(...(data as InstagramInsightData[]).map((d: InstagramInsightData) => d.value)) * 1.1]} stroke="#E0E0E0" tick={false} axisLine={false} />
              <Radar name="Métricas" dataKey="value" stroke={PRIMARY_ACCENT} fill={PRIMARY_ACCENT} fillOpacity={0.6} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                itemStyle={{ color: '#4B5563' }}
                formatter={(value: number) => value.toLocaleString('pt-BR')}
              />
              <Legend wrapperStyle={{ color: '#4B5563', paddingTop: '10px' }} />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'InstagramInteractionsBarChart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data as InstagramPostInteraction[]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              {renderChartElements(type)}
              <Bar dataKey="likes" stackId="a" fill={PRIMARY_ACCENT} name="Curtidas" radius={[5, 5, 0, 0]} />
              <Bar dataKey="comments" stackId="a" fill={SECONDARY_ACCENT} name="Comentários" radius={[5, 5, 0, 0]} />
              <Bar dataKey="saves" stackId="a" fill={SUCCESS_COLOR} name="Salvos" radius={[5, 5, 0, 0]} />
              <Bar dataKey="shares" stackId="a" fill={WARNING_COLOR} name="Compartilhamentos" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="text-center text-gray-500">Tipo de gráfico não suportado para expansão.</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[100]">
      <Card className="relative p-6 bg-white rounded-lg shadow-2xl w-11/12 h-5/6 max-w-4xl max-h-[90vh] flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200 z-50"
          aria-label="Fechar"
        >
          <X className="h-6 w-6" />
        </Button>
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{title}</h3>
        <div className="flex-1 min-h-0">
          {renderChartContent()}
        </div>
      </Card>
    </div>
  );
};
