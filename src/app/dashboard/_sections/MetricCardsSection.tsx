'use client';

import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers, FiPercent, FiZap, FiEye, FiMousePointer, FiActivity } from 'react-icons/fi';
import { Card } from '@/app/components/ui/custom-elements'; 

const PRIMARY_ACCENT = '#4F46E5';
const SECONDARY_ACCENT = '#10B981';
const SUCCESS_COLOR = '#16A34A';
const WARNING_COLOR = '#F59E0B';
const ERROR_COLOR = '#EF4444';
const INFO_COLOR = '#3B82F6';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  percentageChange?: number | null;
  isCurrency?: boolean;
  accentColor?: string;
  icon?: React.ElementType;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit = '', percentageChange = null, isCurrency = false, accentColor = 'transparent', icon: IconComponent }) => {
  const formattedValue = typeof value === 'number'
    ? value.toLocaleString('pt-BR', { minimumFractionDigits: isCurrency ? 2 : 0, maximumFractionDigits: isCurrency ? 2 : 0 })
    : value;

  return (
    <Card className="p-5 flex flex-col items-start justify-between rounded-lg shadow-md relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 ease-out bg-white border border-gray-200">
      <div className="flex items-center justify-between w-full mb-2">
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{title}</p>
        {IconComponent && <IconComponent size={20} className="text-opacity-70" style={{ color: accentColor }} />}
      </div>
      <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
        {isCurrency ? `R$ ${formattedValue}` : formattedValue}
        {unit && <span className="text-lg font-normal ml-1">{unit}</span>}
      </h3>
      {percentageChange !== null && (
        <p className={`text-sm mt-2 flex items-center gap-1 ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {percentageChange >= 0 ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
          {Math.abs(percentageChange).toFixed(1)}%
        </p>
      )}
      <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ backgroundColor: accentColor }}></div>
    </Card>
  );
};

interface MetricCardsSectionProps {
  overviewMetricsMapped: {
    investmentTotal: number;
    totalLeads: number;
    revenueTotal: number;
    conversionRateTotal: number;
    roi: number;
    impressionsTotal: number;
    conversionsTotal: number; 
    ctr: number;
    cpl: number;
    cpc: number;
  } | null;
}

export const MetricCardsSection: React.FC<MetricCardsSectionProps> = ({ overviewMetricsMapped }) => {
  if (!overviewMetricsMapped) {
    return null; 
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Métricas Principais</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <MetricCard title="Investimento Total" value={overviewMetricsMapped.investmentTotal} isCurrency percentageChange={-2.5} accentColor={ERROR_COLOR} icon={FiDollarSign} />
        <MetricCard title="Total de Leads" value={overviewMetricsMapped.totalLeads} percentageChange={8.0} accentColor={PRIMARY_ACCENT} icon={FiUsers} />
        <MetricCard title="Faturamento Total" value={overviewMetricsMapped.revenueTotal} isCurrency percentageChange={12.0} accentColor={SUCCESS_COLOR} icon={FiDollarSign} />
        <MetricCard title="Taxa de Conversão" value={overviewMetricsMapped.conversionRateTotal} unit="%" percentageChange={-0.2} accentColor={SECONDARY_ACCENT} icon={FiPercent} />
        <MetricCard title="ROI" value={overviewMetricsMapped.roi} percentageChange={-0.4} accentColor={WARNING_COLOR} icon={FiZap} />
        <MetricCard title="Impressões Totais" value={overviewMetricsMapped.impressionsTotal} percentageChange={5.0} accentColor={INFO_COLOR} icon={FiEye} />
        <MetricCard title="Cliques Totais" value={overviewMetricsMapped.conversionsTotal} percentageChange={10.3} accentColor={PRIMARY_ACCENT} icon={FiMousePointer} />
        <MetricCard title="CTR Médio" value={overviewMetricsMapped.ctr} unit="%" percentageChange={1.2} accentColor={SUCCESS_COLOR} icon={FiActivity} />
        <MetricCard title="CPL Médio" value={overviewMetricsMapped.cpl} isCurrency percentageChange={-1.5} accentColor={ERROR_COLOR} icon={FiDollarSign} />
        <MetricCard title="CPC Médio" value={overviewMetricsMapped.cpc} isCurrency percentageChange={-0.5} accentColor={WARNING_COLOR} icon={FiDollarSign} />
      </div>
    </div>
  );
};
