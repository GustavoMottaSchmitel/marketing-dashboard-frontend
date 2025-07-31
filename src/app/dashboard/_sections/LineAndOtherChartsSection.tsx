// src/app/dashboard/_sections/LineAndOtherChartsSection.tsx

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, BarChart, Bar } from 'recharts';
import { ChartCard } from '@/app/dashboard/_sections/ChartCard';
import { EditableField, PRIMARY_ACCENT, SECONDARY_ACCENT, SUCCESS_COLOR, WARNING_COLOR, ERROR_COLOR, PIE_CHART_COLORS, GRADIENT_AREA_START, GRADIENT_AREA_END } from '@/app/types/dashboard'; // Removido INFO_COLOR
import {
  EvolutionData, OriginData, ROIHistoryData, InstagramInsightData,
  InstagramPostInteraction, ConversionFunnelData, DashboardDataDTO, ClinicOverviewData as BackendClinicOverviewData
} from '@/app/lib/dashboard';

interface LineAndOtherChartsSectionProps {
  isEditMode: boolean;
  isViewMode: boolean;
  handleEditableDataChange: (field: EditableField, value: string) => void;
  onExpandChart: (type: string, data: unknown, title: string) => void; // Alterado para unknown
  leadsEvolutionFiltered: EvolutionData[];
  salesEvolutionFiltered: EvolutionData[];
  originDataFiltered: OriginData[];
  roiHistoryData: ROIHistoryData[];
  instagramInsightsData: InstagramInsightData[];
  instagramPostInteractionsData: InstagramPostInteraction[];
  conversionFunnelData: ConversionFunnelData[];
  clinicsComparisonData: {
    subject: string; cpl: number; cpc: number; conversionRate: number; roi: number; leads: number; fullMark: number;
  }[];
  clinicIdFromUrl: string | null;
  currentDashboardDataForDisplay: DashboardDataDTO;
}

export const LineAndOtherChartsSection: React.FC<LineAndOtherChartsSectionProps> = ({
  isEditMode,
  isViewMode,
  handleEditableDataChange,
  onExpandChart,
  leadsEvolutionFiltered,
  salesEvolutionFiltered,
  originDataFiltered,
  roiHistoryData,
  instagramInsightsData,
  instagramPostInteractionsData,
  conversionFunnelData,
  clinicsComparisonData,
  clinicIdFromUrl,
  currentDashboardDataForDisplay,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Gráficos de Linha e Outros</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard
          title="Evolução de Leads"
          description="Tendência de leads ao longo do tempo."
          className="lg:col-span-1"
          isEditMode={isEditMode}
          onDataChange={handleEditableDataChange}
          dataToEditKeys={leadsEvolutionFiltered.length > 0 ? [{ dataIndex: 0, key: 'value', label: 'Leads (1ª Campanha)', dataType: 'leadsEvolution' }] : []}
          isViewMode={isViewMode}
          chartType="LeadsEvolutionLineChart"
          chartData={leadsEvolutionFiltered}
          onExpandChart={onExpandChart}
        >
          {leadsEvolutionFiltered.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsEvolutionFiltered} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                  itemStyle={{ color: '#4B5563' }}
                  formatter={(value: number) => `${value.toLocaleString('pt-BR')} Leads`}
                />
                <Line type="monotone" dataKey="value" stroke={SECONDARY_ACCENT} strokeWidth={3} dot={{ stroke: SECONDARY_ACCENT, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
          )}
        </ChartCard>

        <ChartCard
          title="Evolução de Vendas"
          description="Tendência de vendas ao longo do tempo."
          className="lg:col-span-1"
          isEditMode={isEditMode}
          onDataChange={handleEditableDataChange}
          dataToEditKeys={salesEvolutionFiltered.length > 0 ? [{ dataIndex: 0, key: 'value', label: 'Vendas (1ª Campanha)', dataType: 'salesEvolution' }] : []}
          isViewMode={isViewMode}
          chartType="SalesEvolutionLineChart"
          chartData={salesEvolutionFiltered}
          onExpandChart={onExpandChart}
        >
          {salesEvolutionFiltered.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesEvolutionFiltered} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" tickLine={false} axisLine={false} tickFormatter={(value: number) => `R$ ${value.toFixed(0)}`} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                  itemStyle={{ color: '#4B5563' }}
                  formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`}
                />
                <Line type="monotone" dataKey="value" stroke={SUCCESS_COLOR} strokeWidth={3} dot={{ stroke: SUCCESS_COLOR, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
          )}
        </ChartCard>

        <ChartCard
          title="Investimento vs. Leads"
          description="Comparativo de investimento e leads gerados ao longo do tempo."
          className="lg:col-span-1"
          isEditMode={isEditMode}
          onDataChange={handleEditableDataChange}
          dataToEditKeys={leadsEvolutionFiltered.length > 0 && salesEvolutionFiltered.length > 0 ? [
            { dataIndex: 0, key: 'value', label: 'Leads (1ª Campanha)', dataType: 'leadsEvolution' },
            { dataIndex: 0, key: 'value', label: 'Investimento (1ª Campanha)', dataType: 'salesEvolution' }
          ] : []}
          isViewMode={isViewMode}
          chartType="InvestmentLeadsLineChart"
          chartData={leadsEvolutionFiltered.map((lead, index) => ({
            date: lead.date,
            leads: lead.value,
            investment: salesEvolutionFiltered[index]?.value / 100 || 0,
          }))}
          onExpandChart={onExpandChart}
        >
          {leadsEvolutionFiltered.length > 0 && salesEvolutionFiltered.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsEvolutionFiltered.map((lead, index) => ({
                date: lead.date,
                leads: lead.value,
                investment: salesEvolutionFiltered[index]?.value / 100 || 0,
              }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          ) : (
            <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
          )}
        </ChartCard>

        <ChartCard
          title="Distribuição de Origem dos Leads"
          description="Canais que mais geram leads."
          className="lg:col-span-1"
          isEditMode={isEditMode}
          onDataChange={handleEditableDataChange}
          dataToEditKeys={originDataFiltered.length > 0 ? [{ dataIndex: 0, key: 'value', label: `${originDataFiltered[0]?.name || '1º Canal'}:`, dataType: 'originData' }] : []}
          isViewMode={isViewMode}
          chartType="OriginDistributionPieChart"
          chartData={originDataFiltered}
          onExpandChart={onExpandChart}
        >
          {originDataFiltered.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={originDataFiltered}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  stroke="#F0F0F0"
                  paddingAngle={5}
                >
                  {originDataFiltered.map((entry, index) => (
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
          ) : (
            <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
          )}
        </ChartCard>

        <ChartCard
          title="Evolução da Taxa de Conversão"
          description="Tendência da taxa de conversão ao longo do tempo."
          className="lg:col-span-1"
          isEditMode={isEditMode}
          onDataChange={handleEditableDataChange}
          dataToEditKeys={leadsEvolutionFiltered.length > 0 ? [{ dataIndex: 0, key: 'value', label: 'Leads (1ª Campanha)', dataType: 'leadsEvolution' }] : []}
          isViewMode={isViewMode}
          chartType="ConversionRateAreaChart"
          chartData={leadsEvolutionFiltered}
          onExpandChart={onExpandChart}
        >
          {leadsEvolutionFiltered.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadsEvolutionFiltered.map(item => ({
                date: item.date,
                conversionRate: Math.min(100, (item.value / 100) + (Math.random() * 10))
              }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value.toFixed(0)}%`} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                  itemStyle={{ color: '#4B5563' }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Area type="monotone" dataKey="conversionRate" stroke={GRADIENT_AREA_START} fillOpacity={0.6} fill={`url(#conversionAreaGradient)`} />
                <defs>
                  <linearGradient id="conversionAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GRADIENT_AREA_START} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={GRADIENT_AREA_END} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
          )}
        </ChartCard>

        <ChartCard
          title="Funil de Conversão"
          description="Visualização do funil de marketing e vendas."
          className="lg:col-span-1"
          isEditMode={isEditMode}
          onDataChange={handleEditableDataChange}
          dataToEditKeys={conversionFunnelData.length > 0 ? [{ dataIndex: 0, key: 'value', label: `${conversionFunnelData[0]?.stage || '1º Estágio'}:`, dataType: 'conversionFunnel' }] : []}
          isViewMode={isViewMode}
          chartType="FunnelBarChart"
          chartData={conversionFunnelData}
          onExpandChart={onExpandChart}
        >
          {conversionFunnelData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={conversionFunnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  {conversionFunnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
          )}
        </ChartCard>

        <ChartCard
          title="Evolução de ROI"
          description="Histórico do Retorno sobre Investimento."
          className="lg:col-span-1"
          isEditMode={isEditMode}
          onDataChange={handleEditableDataChange}
          dataToEditKeys={roiHistoryData.length > 0 ? [
            { dataIndex: 0, key: 'roi', label: 'ROI Real (1ª Campanha)', dataType: 'roiHistory' },
            { dataIndex: 0, key: 'estimatedRoi', label: 'ROI Estimado (1ª Campanha)', dataType: 'roiHistory' },
          ] : []}
          isViewMode={isViewMode}
          chartType="ROIHistoryLineChart"
          chartData={roiHistoryData}
          onExpandChart={onExpandChart}
        >
          {roiHistoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roiHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value.toFixed(0)}%`} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                  itemStyle={{ color: '#4B5563' }}
                  formatter={(value: number) => value.toFixed(2)}
                />
                <Legend wrapperStyle={{ color: '#4B5563', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="roi" name="ROI Real" stroke={SUCCESS_COLOR} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="estimatedRoi" name="ROI Estimado" stroke={PRIMARY_ACCENT} strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
          )}
        </ChartCard>

        <ChartCard
          title="Comparar Desempenho entre Clínicas"
          description="Métricas comparativas entre clínicas."
          className="lg:col-span-1"
          isEditMode={isEditMode}
          onDataChange={handleEditableDataChange}
          dataToEditKeys={clinicsComparisonData.length > 0 ? [
            { dataIndex: 0, key: 'cpl', label: 'CPL (1ª Campanha)', dataType: 'clinicsOverview' },
            { dataIndex: 0, key: 'cpc', label: 'CPC (1ª Campanha)', dataType: 'clinicsOverview' },
            { dataIndex: 0, key: 'performanceChange', label: 'Desempenho (1ª Campanha)', dataType: 'clinicsOverview' },
            { dataIndex: 0, key: 'recentLeads', label: 'Leads Recentes (1ª Campanha)', dataType: 'clinicsOverview' },
          ] : []}
          isViewMode={isViewMode}
          chartType="ClinicsComparisonRadarChart"
          chartData={clinicsComparisonData}
          onExpandChart={onExpandChart}
        >
          {clinicsComparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={clinicsComparisonData}>
                <PolarGrid stroke="#E0E0E0" />
                <PolarAngleAxis dataKey="subject" stroke="#6B7280" tick={{ fill: '#4B5563', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, Math.max(...clinicsComparisonData.map((d: { cpl: number }) => d.cpl * 10 || 0)) * 1.1]} stroke="#E0E0E0" tick={false} axisLine={false} />
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
          ) : (
            <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
          )}
        </ChartCard>

        <ChartCard
          title="Engajamento do Perfil (Instagram)"
          description="Comparativo de métricas de interação no Instagram."
          className="lg:col-span-1"
          isEditMode={isEditMode}
          onDataChange={handleEditableDataChange}
          dataToEditKeys={instagramInsightsData.length > 0 ? [{ dataIndex: 0, key: 'value', label: `${instagramInsightsData[0]?.metric || '1ª Campanha'}:`, dataType: 'instagramInsights' }] : []}
          isViewMode={isViewMode}
          chartType="InstagramEngagementRadarChart"
          chartData={instagramInsightsData}
          onExpandChart={onExpandChart}
        >
          {instagramInsightsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={instagramInsightsData}>
                <PolarGrid stroke="#E0E0E0" />
                <PolarAngleAxis dataKey="metric" stroke="#6B7280" tick={{ fill: '#4B5563', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, Math.max(...instagramInsightsData.map((d: InstagramInsightData) => d.value)) * 1.1]} stroke="#E0E0E0" tick={false} axisLine={false} />
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
          ) : (
            <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
          )}
        </ChartCard>

        <ChartCard
          title="Interações por Dia (Instagram)"
          description="Quantidade de interações em posts/stories por dia."
          className="lg:col-span-2"
          isEditMode={isEditMode}
          onDataChange={handleEditableDataChange}
          dataToEditKeys={instagramPostInteractionsData.length > 0 ? [
            { dataIndex: 0, key: 'likes', label: 'Curtidas (1ª Campanha)', dataType: 'instagramPostInteractions' },
            { dataIndex: 0, key: 'comments', label: 'Comentários (1ª Campanha)', dataType: 'instagramPostInteractions' },
          ] : []}
          isViewMode={isViewMode}
          chartType="InstagramInteractionsBarChart"
          chartData={instagramPostInteractionsData}
          onExpandChart={onExpandChart}
        >
          {instagramPostInteractionsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={instagramPostInteractionsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                  itemStyle={{ color: '#4B5563' }}
                  formatter={(value: number) => value.toLocaleString('pt-BR')}
                />
                <Legend wrapperStyle={{ color: '#4B5563', paddingTop: '10px' }} />
                <Bar dataKey="likes" stackId="a" fill={PRIMARY_ACCENT} name="Curtidas" radius={[5, 5, 0, 0]} />
                <Bar dataKey="comments" stackId="a" fill={SECONDARY_ACCENT} name="Comentários" radius={[5, 5, 0, 0]} />
                <Bar dataKey="saves" stackId="a" fill={SUCCESS_COLOR} name="Salvos" radius={[5, 5, 0, 0]} />
                <Bar dataKey="shares" stackId="a" fill={WARNING_COLOR} name="Compartilhamentos" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};
