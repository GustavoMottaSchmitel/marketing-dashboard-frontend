// src/app/dashboard/_sections/BarChartsSection.tsx

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartCard } from '@/app/dashboard/_sections/ChartCard';
import { EditableField, PRIMARY_ACCENT, SECONDARY_ACCENT, SUCCESS_COLOR, WARNING_COLOR, ERROR_COLOR, INFO_COLOR, GRADIENT_BAR_PRIMARY_START, GRADIENT_BAR_PRIMARY_END, GRADIENT_BAR_SECONDARY_START, GRADIENT_BAR_SECONDARY_END } from '@/app/types/dashboard';
import { CampaignData, CreativeData, LeadTypeDistributionData } from '@/app/lib/dashboard';

interface BarChartsSectionProps {
    isEditMode: boolean;
    isViewMode: boolean;
    handleEditableDataChange: (field: EditableField, value: string) => void;
    onExpandChart: (type: string, data: unknown, title: string) => void; // Alterado para unknown
    filteredCampaignsData: CampaignData[];
    filteredCreativesData: CreativeData[];
    leadTypeDistributionData: LeadTypeDistributionData[];
}

export const BarChartsSection: React.FC<BarChartsSectionProps> = ({
    isEditMode,
    isViewMode,
    handleEditableDataChange,
    onExpandChart,
    filteredCampaignsData,
    filteredCreativesData,
    leadTypeDistributionData,
}) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gráficos de Barras</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <ChartCard
                    title="Leads por Campanha"
                    description="Distribuição de leads pelas campanhas ativas."
                    className="lg:col-span-1"
                    isEditMode={isEditMode}
                    onDataChange={handleEditableDataChange}
                    dataToEditKeys={filteredCampaignsData.length > 0 ? [{ dataIndex: 0, key: 'leads', label: 'Leads (1ª Campanha)', dataType: 'campaignsData' }] : []}
                    isViewMode={isViewMode}
                    chartType="LeadsByCampaignBarChart"
                    chartData={filteredCampaignsData}
                    onExpandChart={onExpandChart}
                >
                    {filteredCampaignsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredCampaignsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="leadsBarGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={GRADIENT_BAR_PRIMARY_START} stopOpacity={0.9} />
                                        <stop offset="95%" stopColor={GRADIENT_BAR_PRIMARY_END} stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                                <XAxis dataKey="name" stroke="#6B7280" tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#4B5563' }}
                                    formatter={(value: number) => `${value.toLocaleString('pt-BR')} Leads`}
                                />
                                <Bar dataKey="leads" fill="url(#leadsBarGradient)" radius={[5, 5, 0, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
                    )}
                </ChartCard>

                <ChartCard
                    title="Custo por Lead por Campanha"
                    description="Custo médio por lead para cada campanha."
                    className="lg:col-span-1"
                    isEditMode={isEditMode}
                    onDataChange={handleEditableDataChange}
                    dataToEditKeys={filteredCampaignsData.length > 0 ? [{ dataIndex: 0, key: 'cpl', label: 'CPL (1ª Campanha)', dataType: 'campaignsData' }] : []}
                    isViewMode={isViewMode}
                    chartType="CPLByCampaignBarChart"
                    chartData={filteredCampaignsData}
                    onExpandChart={onExpandChart}
                >
                    {filteredCampaignsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredCampaignsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="cplBarGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={GRADIENT_BAR_SECONDARY_START} stopOpacity={0.9} />
                                        <stop offset="95%" stopColor={GRADIENT_BAR_SECONDARY_END} stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                                <XAxis dataKey="name" stroke="#6B7280" tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" tickLine={false} axisLine={false} tickFormatter={(value: number) => `R$ ${value.toFixed(0)}`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#4B5563' }}
                                    formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`}
                                />
                                <Bar dataKey="cpl" fill="url(#cplBarGradient)" radius={[5, 5, 0, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
                    )}
                </ChartCard>

                <ChartCard
                    title="Leads por Tipo e Campanha"
                    description="Canais preferidos dos leads por campanha."
                    className="lg:col-span-1"
                    isEditMode={isEditMode}
                    onDataChange={handleEditableDataChange}
                    dataToEditKeys={leadTypeDistributionData.length > 0 ? [{ dataIndex: 0, key: 'leads', label: `${leadTypeDistributionData[0]?.type || '1º Tipo'}:`, dataType: 'leadTypeDistribution' }] : []}
                    isViewMode={isViewMode}
                    chartType="LeadTypeDistributionBarChart"
                    chartData={leadTypeDistributionData}
                    onExpandChart={onExpandChart}
                >
                    {leadTypeDistributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={leadTypeDistributionData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                                <XAxis dataKey="type" stroke="#6B7280" tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#4B5563' }}
                                    formatter={(value: number) => `${value.toLocaleString('pt-BR')} Leads`}
                                />
                                <Legend wrapperStyle={{ color: '#4B5563', paddingTop: '10px' }} />
                                <Bar dataKey="leads" stackId="a" fill={PRIMARY_ACCENT} name="Leads" radius={[5, 5, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
                    )}
                </ChartCard>

                <ChartCard
                    title="Desempenho por Criativo"
                    description="Cliques, leads e conversão por criativo."
                    className="lg:col-span-2"
                    isEditMode={isEditMode}
                    onDataChange={handleEditableDataChange}
                    dataToEditKeys={filteredCreativesData.length > 0 ? [
                        { dataIndex: 0, key: 'clicks', label: 'Cliques (1ª Campanha)', dataType: 'creativesData' },
                        { dataIndex: 0, key: 'leads', label: 'Leads (1ª Campanha)', dataType: 'creativesData' },
                        { dataIndex: 0, key: 'conversionRate', label: 'Conversão (1ª Campanha)', dataType: 'creativesData' },
                        { dataIndex: 0, key: 'ctr', label: 'CTR (1ª Campanha)', dataType: 'creativesData' },
                        { dataIndex: 0, key: 'views', label: 'Views (1ª Campanha)', dataType: 'creativesData' },
                        { dataIndex: 0, key: 'cpl', label: 'CPL (1ª Campanha)', dataType: 'creativesData' },
                    ] : []}
                    isViewMode={isViewMode}
                    chartType="CreativePerformanceBarChart"
                    chartData={filteredCreativesData}
                    onExpandChart={onExpandChart}
                >
                    {filteredCreativesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={filteredCreativesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    ) : (
                        <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
                    )}
                </ChartCard>
            </div>
        </div>
    );
};
