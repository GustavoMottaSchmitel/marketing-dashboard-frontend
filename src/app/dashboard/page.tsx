// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, ChangeEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Select, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Card, Input } from '@/app/components/ui/custom-elements';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area,
} from 'recharts';
import { FiFilter, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiInfo, FiCheckCircle, FiSearch, FiXCircle, FiDollarSign, FiUsers, FiPercent, FiZap, FiEye, FiMousePointer, FiActivity } from 'react-icons/fi';

import { cn, debounce } from '@/app/lib/utils';
import { getDashboardData as fetchRealDashboardData, DashboardDataDTO, EvolutionData, ClinicOverviewData as BackendClinicOverviewData } from '../lib/dashboard';
import { getClinicas, PaginatedClinicasResponse } from '../lib/clinicas';
import { AdvancedFilterModal } from './_components/AdvancedFilterModal';

// --- DADOS MOCKADOS PARA FILTROS (MANTIDOS PARA OPÇÕES DE DROPDOWN DE CLÍNICAS SE A API FALHAR) ---
const mockClinicas = [
  { value: '1', label: 'Clínica Alpha (Mock)' },
  { value: '2', label: 'Clínica Beta (Mock)' },
  { value: '3', label: 'Clínica Gama (Mock)' },
];

// --- NOVA PALETA DE CORES E GRADIENTES PARA GRÁFICOS ---
const PRIMARY_ACCENT = '#8A2BE2'; // Amethyst (Roxo principal)
const SECONDARY_ACCENT = '#00BFFF'; // Deep Sky Blue (Azul vibrante)
const SUCCESS_COLOR = '#32CD32'; // Lime Green (Verde para sucesso/crescimento)
const WARNING_COLOR = '#FFD700'; // Gold (Amarelo para atenção)
const ERROR_COLOR = '#FF4500'; // Orange Red (Laranja avermelhado para erro/negativo)
const INFO_COLOR = '#4682B4'; // SteelBlue (Azul para informações)

// Cores para gráficos de Pizza/Células
const PIE_CHART_COLORS = [
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

// Gradientes para Barras e Áreas
const GRADIENT_PRIMARY_START = PRIMARY_ACCENT;
const GRADIENT_PRIMARY_END = '#6A5ACD'; // Um roxo mais claro

const GRADIENT_SECONDARY_START = SECONDARY_ACCENT;

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
    <Card className="p-5 flex flex-col items-start justify-between rounded-lg shadow-xl relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 ease-out bg-[#1C1C2C] border border-[#3A3A4E]">
      <div className="flex items-center justify-between w-full mb-2">
        <p className="text-sm text-[#A0A0C0] font-medium uppercase tracking-wider">{title}</p>
        {IconComponent && <IconComponent size={20} className="text-opacity-70" style={{ color: accentColor }} />}
      </div>
      <h3 className="text-3xl font-extrabold text-[#E0E0F0] mt-1">
        {isCurrency ? `R$ ${formattedValue}` : formattedValue}
        {unit && <span className="text-lg font-normal ml-1">{unit}</span>}
      </h3>
      {percentageChange !== null && (
        <p className={`text-sm mt-2 flex items-center gap-1 ${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {percentageChange >= 0 ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
          {Math.abs(percentageChange).toFixed(1)}%
        </p>
      )}
      <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ backgroundColor: accentColor }}></div>
    </Card>
  );
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '', description }) => (
  <Card className={cn("p-6 flex flex-col rounded-lg shadow-xl bg-[#1C1C2C] border border-[#3A3A4E]", className)}>
    <h3 className="text-xl font-semibold text-[#E0E0F0] mb-2">{title}</h3>
    {description && <p className="text-sm text-[#A0A0C0] mb-4">{description}</p>}
    <div className="flex-1 min-h-[250px] flex items-center justify-center">
      {children}
    </div>
  </Card>
);

type DashboardTab = 'overview' | 'campaigns' | 'leads-conversions' | 'creatives-ads' | 'instagram' | 'comparisons' | 'clinics-specialties';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicIdFromUrl = searchParams.get('clinicId');

  const [clinicasOptions, setClinicasOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedClinicaFilter, setSelectedClinicaFilter] = useState<string | null>(clinicIdFromUrl);
  const [clinicSearchTerm, setClinicSearchTerm] = useState<string>('');
  const [debouncedClinicSearchTerm, setDebouncedClinicSearchTerm] = useState<string>('');
  const [showClinicSearchDropdown, setShowClinicSearchDropdown] = useState(false);
  const clinicSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedClinicSearchTerm(clinicSearchTerm);
    }, 300);

    handler();

    return () => {
      handler.cancel();
    };
  }, [clinicSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clinicSearchRef.current && !clinicSearchRef.current.contains(event.target as Node)) {
        setShowClinicSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedCreative, setSelectedCreative] = useState('');

  const [isAdvancedFilterModalOpen, setIsAdvancedFilterModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const [dashboardData, setDashboardData] = useState<DashboardDataDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getFilteredEvolutionData = useCallback((data: EvolutionData[], start: string, end: string) => {
    if (!data || data.length === 0) return [];
    if (!start && !end) return data;

    const startDateObj = start ? new Date(start + 'T00:00:00') : null;
    const endDateObj = end ? new Date(end + 'T23:59:59') : null;

    return data.filter(item => {
      const itemDate = new Date(item.date + 'T00:00:00');
      if (startDateObj && itemDate < startDateObj) return false;
      if (endDateObj && itemDate > endDateObj) return false;
      return true;
    });
  }, []);

  const loadDashboardData = useCallback(async () => {
    if (!selectedClinicaFilter) {
      setLoading(false);
      setDashboardData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchRealDashboardData(
        selectedClinicaFilter,
        startDate,
        endDate,
        selectedCampaign,
        selectedCreative
      );
      setDashboardData(data);
    } catch (err: unknown) {
      console.error("Erro ao buscar dados do dashboard:", err);
      if (err instanceof Error) {
        setError(err.message || "Ocorreu um erro ao carregar os dados do dashboard.");
      } else {
        setError("Ocorreu um erro desconhecido ao carregar os dados do dashboard.");
      }
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedClinicaFilter, startDate, endDate, selectedCampaign, selectedCreative]);

  useEffect(() => {
    const loadClinicas = async () => {
      try {
        const response: PaginatedClinicasResponse = await getClinicas(0, 20, debouncedClinicSearchTerm);
        const options = response.content.map(clinica => ({
          value: String(clinica.id),
          label: clinica.name,
        }));
        setClinicasOptions([{ value: '', label: 'Todas as Clínicas' }, ...options]);

        if (!clinicIdFromUrl && options.length > 0) {
          setSelectedClinicaFilter(options[0].value);
          router.replace(`/dashboard?clinicId=${options[0].value}`);
        } else if (clinicIdFromUrl && !options.some(opt => opt.value === clinicIdFromUrl)) {
          setSelectedClinicaFilter('');
          router.replace('/dashboard');
        } else if (clinicIdFromUrl) {
          setSelectedClinicaFilter(clinicIdFromUrl);
        }
      } catch (err: unknown) {
        console.error("Erro ao carregar lista de clínicas:", err);
        setClinicasOptions([{ value: '', label: 'Todas as Clínicas' }, ...mockClinicas]);
      }
    };
    loadClinicas();
  }, [clinicIdFromUrl, router, debouncedClinicSearchTerm]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleClinicaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newClinicId = e.target.value;
    setSelectedClinicaFilter(newClinicId);
    if (newClinicId) {
      router.replace(`/dashboard?clinicId=${newClinicId}`);
    } else {
      router.replace('/dashboard');
    }
  };

  const handleSelectClinicFromSearch = (clinicaId: string, clinicaName: string) => {
    setSelectedClinicaFilter(clinicaId);
    setClinicSearchTerm(clinicaName);
    setShowClinicSearchDropdown(false);
    router.replace(`/dashboard?clinicId=${clinicaId}`);
  };

  const handleApplyAdvancedFilters = (start: string, end: string, campaign: string, creative: string) => {
    setStartDate(start);
    setEndDate(end);
    setSelectedCampaign(campaign);
    setSelectedCreative(creative);
  };

  const campaignOptions = useMemo(() => {
    if (!dashboardData) return [];
    return [{ value: '', label: 'Todas as Campanhas' }, ...dashboardData.campaignsData.map(c => ({ value: String(c.id), label: c.name }))];
  }, [dashboardData]);

  const creativeOptions = useMemo(() => {
    if (!dashboardData) return [];
    return [{ value: '', label: 'Todos os Criativos' }, ...dashboardData.creativesData.map(c => ({ value: String(c.id), label: c.name }))];
  }, [dashboardData]);

  const leadsEvolutionFiltered = useMemo(() => {
    if (!dashboardData) return [];
    return getFilteredEvolutionData(dashboardData.leadsEvolution, startDate, endDate);
  }, [dashboardData, startDate, endDate, getFilteredEvolutionData]);

  const salesEvolutionFiltered = useMemo(() => {
    if (!dashboardData) return [];
    return getFilteredEvolutionData(dashboardData.salesEvolution, startDate, endDate);
  }, [dashboardData, startDate, endDate, getFilteredEvolutionData]);

  const filteredCampaignsData = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.campaignsData.filter(campaign =>
      selectedCampaign ? String(campaign.id) === selectedCampaign : true
    );
  }, [dashboardData, selectedCampaign]);

  const filteredCreativesData = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.creativesData.filter(creative =>
      selectedCreative ? String(creative.id) === selectedCreative : true
    );
  }, [dashboardData, selectedCreative]);

  const originDataFiltered = useMemo(() => dashboardData?.originData || [], [dashboardData?.originData]);

  const leadTypeDistributionData = useMemo(() => dashboardData?.leadTypeDistribution || [], [dashboardData?.leadTypeDistribution]);
  const roiHistoryData = useMemo(() => dashboardData?.roiHistory || [], [dashboardData?.roiHistory]);
  const instagramInsightsData = useMemo(() => dashboardData?.instagramInsights || [], [dashboardData?.instagramInsights]);
  const instagramPostInteractionsData = useMemo(() => dashboardData?.instagramPostInteractions || [], [dashboardData?.instagramPostInteractions]);
  const conversionFunnelData = useMemo(() => dashboardData?.conversionFunnel || [], [dashboardData?.conversionFunnel]);

  const overviewMetricsMapped = useMemo(() => {
    if (!dashboardData) return null;

    const totalInvestment = (dashboardData.overviewMetrics.meta_totalInvestment || 0) + (dashboardData.overviewMetrics.google_totalInvestment || 0);
    const totalSalesValue = salesEvolutionFiltered.reduce((sum, item) => sum + item.value, 0);
    const totalLeadsValue = leadsEvolutionFiltered.reduce((sum, item) => sum + item.value, 0);

    const totalViews = (dashboardData.overviewMetrics.meta_totalImpressions || 0) + (dashboardData.overviewMetrics.google_totalImpressions || 0);
    const totalClicks = dashboardData.overviewMetrics.google_totalClicks || 0;
    const avgCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return {
      investmentTotal: totalInvestment,
      conversionsTotal: dashboardData.googleAnalyticsDataDTO?.sessions || 0,
      conversionRateTotal: dashboardData.googleAnalyticsDataDTO?.bounceRate ? (100 - dashboardData.googleAnalyticsDataDTO.bounceRate * 100) : 0,
      revenueTotal: totalSalesValue,
      roi: totalInvestment > 0 ? (totalSalesValue / totalInvestment) : 0,
      impressionsTotal: totalViews,
      totalLeads: totalLeadsValue,
      leadsByChannel: originDataFiltered,
      totalAppointments: 0,
      totalSales: totalSalesValue,
      bestCampaign: dashboardData.campaignsData.length > 0 ? dashboardData.campaignsData.reduce((prev, current) => (prev.leads > current.leads ? prev : current)).name : 'N/A',
      cpl: totalLeadsValue > 0 ? totalInvestment / totalLeadsValue : 0,
      cpc: (dashboardData.overviewMetrics.google_totalClicks || 0) > 0 ? dashboardData.overviewMetrics.google_totalInvestment / dashboardData.overviewMetrics.google_totalClicks : 0,
      ctr: avgCTR,
      cpv: 0,
      estimatedRevenue: totalSalesValue * 1.1,
    };
  }, [dashboardData, leadsEvolutionFiltered, salesEvolutionFiltered, originDataFiltered]);

  const clinicsComparisonData = useMemo(() => {
    if (!overviewMetricsMapped) return [];
    return [
      { subject: 'CPL', A: overviewMetricsMapped.cpl / 10, fullMark: 10 },
      { subject: 'CPC', A: overviewMetricsMapped.cpc / 5, fullMark: 10 },
      { subject: 'Conversão', A: overviewMetricsMapped.conversionRateTotal, fullMark: 100 },
      { subject: 'ROI', A: overviewMetricsMapped.roi * 10, fullMark: 100 },
      { subject: 'Leads', A: overviewMetricsMapped.totalLeads / 100, fullMark: 100 },
    ].filter(item => !isNaN(item.A) && isFinite(item.A));
  }, [overviewMetricsMapped]);

  const clinicsOverviewForTable = useMemo(() => dashboardData?.clinicsOverview || [], [dashboardData?.clinicsOverview]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Carregando Dashboard...</p>
          <p className="text-sm text-gray-400">Buscando os dados mais recentes da sua clínica.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-400 font-sans p-8">
        <Card className="p-8 border border-red-700 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Erro ao Carregar Dashboard</h2>
          <p className="mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Tentar Novamente
          </Button>
        </Card>
      </div>
    );
  }

  if (!dashboardData || !selectedClinicaFilter) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white font-sans">
        <div className="text-center">
          <p className="text-xl font-semibold">Nenhum dado disponível para a clínica selecionada.</p>
          <p className="text-sm text-gray-400">Verifique se o ID da clínica está correto e se os dados foram ingeridos pelo backend.</p>
          {clinicasOptions.length > 0 && (
            <p className="mt-4 text-sm text-gray-400">
              Selecione uma clínica:
              <Select
                options={clinicasOptions}
                value={selectedClinicaFilter || ''}
                onChange={handleClinicaChange}
                className="mt-2 mx-auto"
              />
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-8 bg-gray-900 min-h-screen text-white font-sans">

      {/* Dashboard Header and Filters */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#404058]">
        <div>
          <h1 className="text-4xl font-extrabold text-white">Dashboard de Marketing</h1>
          <p className="text-gray-400 mt-2 text-lg">Visão Geral de Performance da Empresa</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

          {/* Pesquisa de Clínica com Dropdown */}
          <div className="relative w-full md:w-48" ref={clinicSearchRef}>
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0C0]" />
            <Input
              placeholder="Pesquisar Clínica"
              className="pl-10 bg-[#2C2C3E] border-[#404058] text-[#E0E0F0] placeholder:text-[#A0A0C0] py-2 px-3 rounded-lg text-sm font-medium shadow-md focus:ring-[#8A2BE2] h-10"
              value={clinicSearchTerm}
              onChange={(e) => {
                setClinicSearchTerm(e.target.value);
                setShowClinicSearchDropdown(true);
              }}
              onFocus={() => setShowClinicSearchDropdown(true)}
            />
            {showClinicSearchDropdown && clinicSearchTerm.length > 0 && (
              <Card className="absolute z-10 mt-1 w-full bg-[#2C2C3E] border border-[#404058] rounded-md shadow-lg max-h-60 overflow-y-auto">
                {clinicasOptions
                  .filter(option => option.value !== '' && option.label.toLowerCase().includes(clinicSearchTerm.toLowerCase()))
                  .map(option => (
                    <div
                      key={option.value}
                      className="px-4 py-2 text-sm text-[#E0E0F0] hover:bg-[#404058] cursor-pointer transition-colors"
                      onClick={() => handleSelectClinicFromSearch(option.value, option.label)}
                    >
                      {option.label}
                    </div>
                  ))}
                {clinicasOptions.filter(option => option.value !== '' && option.label.toLowerCase().includes(clinicSearchTerm.toLowerCase())).length === 0 && (
                  <div className="px-4 py-2 text-sm text-[#A0A0C0]">Nenhuma clínica encontrada.</div>
                )}
              </Card>
            )}
          </div>

          {/* Dropdown de Seleção de Clínica (mantido para seleção direta) */}
          <Select
            options={clinicasOptions}
            value={selectedClinicaFilter || ''}
            onChange={handleClinicaChange}
            className="w-full md:w-48"
          />

          {/* Botão para abrir o modal de filtros avançados */}
          <Button
            onClick={() => setIsAdvancedFilterModalOpen(true)}
            variant="outline"
            className="flex items-center px-4 py-2 rounded-lg"
          >
            <FiFilter className="mr-2" /> Mais Filtros
          </Button>
        </div>
      </div>

      {/* Tabs for Dashboard Sections - Centralized */}

      <div className="flex justify-center border-b border-[#404058] mb-8 overflow-x-auto">
        <button
          className={cn(
            "px-4 py-3 text-sm md:text-lg font-semibold whitespace-nowrap transition-colors duration-200 ease-in-out",
            activeTab === 'overview' ? "text-[#8A2BE2] border-b-2 border-[#8A2BE2]" : "text-gray-400 hover:text-white"
          )}
          onClick={() => setActiveTab('overview')}
        >
          Visão Geral
        </button>
        <button
          className={cn(
            "px-4 py-3 text-sm md:text-lg font-semibold whitespace-nowrap transition-colors duration-200 ease-in-out",
            activeTab === 'campaigns' ? "text-[#8A2BE2] border-b-2 border-[#8A2BE2]" : "text-gray-400 hover:text-white"
          )}
          onClick={() => setActiveTab('campaigns')}
        >
          Campanhas Ativas
        </button>
        <button
          className={cn(
            "px-4 py-3 text-sm md:text-lg font-semibold whitespace-nowrap transition-colors duration-200 ease-in-out",
            activeTab === 'leads-conversions' ? "text-[#8A2BE2] border-b-2 border-[#8A2BE2]" : "text-gray-400 hover:text-white"
          )}
          onClick={() => setActiveTab('leads-conversions')}
        >
          Leads & Conversões
        </button>
        <button
          className={cn(
            "px-4 py-3 text-sm md:text-lg font-semibold whitespace-nowrap transition-colors duration-200 ease-in-out",
            activeTab === 'creatives-ads' ? "text-[#8A2BE2] border-b-2 border-[#8A2BE2]" : "text-gray-400 hover:text-white"
          )}
          onClick={() => setActiveTab('creatives-ads')}
        >
          Criativos & Anúncios
        </button>
        <button
          className={cn(
            "px-4 py-3 text-sm md:text-lg font-semibold whitespace-nowrap transition-colors duration-200 ease-in-out",
            activeTab === 'instagram' ? "text-[#8A2BE2] border-b-2 border-[#8A2BE2]" : "text-gray-400 hover:text-white"
          )}
          onClick={() => setActiveTab('instagram')}
        >
          Instagram Insights
        </button>
        <button
          className={cn(
            "px-4 py-3 text-sm md:text-lg font-semibold whitespace-nowrap transition-colors duration-200 ease-in-out",
            activeTab === 'comparisons' ? "text-[#8A2BE2] border-b-2 border-[#8A2BE2]" : "text-gray-400 hover:text-white"
          )}
          onClick={() => setActiveTab('comparisons')}
        >
          Comparações
        </button>
        <button
          className={cn(
            "px-4 py-3 text-sm md:text-lg font-semibold whitespace-nowrap transition-colors duration-200 ease-in-out",
            activeTab === 'clinics-specialties' ? "text-[#8A2BE2] border-b-2 border-[#8A2BE2]" : "text-gray-400 hover:text-white"
          )}
          onClick={() => setActiveTab('clinics-specialties')}
        >
          Clínicas & Especialidades
        </button>
      </div>

      {/* Content based on active tab */}

      {activeTab === 'overview' && overviewMetricsMapped && (
        <section className="space-y-10">

          {/* VISÃO GERAL – MÉTRICAS PRINCIPAIS */}

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Métricas Principais</h2>
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

          {/* GRÁFICOS DE VISÃO GERAL */}

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Gráficos de Visão Geral</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <ChartCard title="Evolução de Leads" description="Tendência de leads ao longo do tempo." className="lg:col-span-1">
                {leadsEvolutionFiltered.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leadsEvolutionFiltered} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
                      <XAxis dataKey="date" stroke="#A0A0C0" tickLine={false} axisLine={false} />
                      <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                        contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        itemStyle={{ color: '#a0aec0' }}
                        formatter={(value: number) => `${value.toLocaleString('pt-BR')} Leads`}
                      />
                      <Line type="monotone" dataKey="value" stroke={SECONDARY_ACCENT} strokeWidth={3} dot={{ stroke: SECONDARY_ACCENT, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                      <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de evolução de leads disponível.</div>
                )}
              </ChartCard>

              <ChartCard title="Evolução de Vendas" description="Tendência de vendas ao longo do tempo." className="lg:col-span-1">
                {salesEvolutionFiltered.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesEvolutionFiltered} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
                      <XAxis dataKey="date" stroke="#A0A0C0" tickLine={false} axisLine={false} />
                      <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} tickFormatter={(value: number) => `R$ ${value.toFixed(0)}`} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                        contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        itemStyle={{ color: '#a0aec0' }}
                        formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`}
                      />
                      <Line type="monotone" dataKey="value" stroke={SUCCESS_COLOR} strokeWidth={3} dot={{ stroke: SUCCESS_COLOR, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                      <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de evolução de vendas disponível.</div>
                )}
              </ChartCard>

              {/* Gráfico de Linha Dupla: Investimento x Leads ao longo do tempo */}
              <ChartCard title="Investimento vs. Leads" description="Comparativo de investimento e leads gerados ao longo do tempo." className="lg:col-span-1">
                {leadsEvolutionFiltered.length > 0 && salesEvolutionFiltered.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leadsEvolutionFiltered.map((lead, index) => ({
                      date: lead.date,
                      leads: lead.value,
                      investment: salesEvolutionFiltered[index]?.value / 100 || 0,
                    }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
                      <XAxis dataKey="date" stroke="#A0A0C0" tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" stroke={ERROR_COLOR} tickLine={false} axisLine={false} tickFormatter={(value: number) => `R$ ${value.toFixed(0)}`} />
                      <YAxis yAxisId="right" orientation="right" stroke={PRIMARY_ACCENT} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                        contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        itemStyle={{ color: '#a0aec0' }}
                        formatter={(value: number, name: string) => {
                          if (name === 'investment') return `Investimento: R$ ${value.toFixed(2).replace('.', ',')}`;
                          if (name === 'leads') return `Leads: ${value.toLocaleString('pt-BR')}`;
                          return value;
                        }}
                      />
                      <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                      <Line yAxisId="left" type="monotone" dataKey="investment" name="Investimento" stroke={ERROR_COLOR} strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke={PRIMARY_ACCENT} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de investimento vs. leads disponível.</div>
                )}
              </ChartCard>
            </div>
          </div>

          {/* Alertas Recentes (dados reais) */}

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Alertas Recentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.recentAlerts.length > 0 ? (
                dashboardData.recentAlerts.map(alert => (
                  <Card key={alert.id} className={cn(`p-5 flex items-start gap-4 rounded-lg shadow-xl`, {
                    'border-yellow-500 bg-yellow-900/20': alert.type === 'warning',
                    'border-blue-500 bg-blue-900/20': alert.type === 'info',
                    'border-green-500 bg-green-900/20': alert.type === 'success',
                    'border-red-500 bg-red-900/20': alert.type === 'error',
                  }, 'text-white')}>
                    <div className="flex-shrink-0 mt-1">
                      {alert.type === 'warning' && <FiAlertTriangle size={20} className="text-yellow-400" />}
                      {alert.type === 'info' && <FiInfo size={20} className="text-blue-400" />}
                      {alert.type === 'success' && <FiCheckCircle size={20} className="text-green-400" />}
                      {alert.type === 'error' && <FiXCircle size={20} className="text-red-500" />}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white">{alert.message}</p>
                      <p className="text-sm text-gray-400 mt-1">Data: {new Date(alert.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center text-gray-400 py-10 col-span-full">
                  <p className="text-lg">Nenhum alerta recente.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'campaigns' && (
        <section className="space-y-10">
          <h2 className="text-2xl font-bold text-white">Campanhas Ativas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Gráfico de Barras: Campanhas vs Resultados (Leads) */}
            <ChartCard title="Leads por Campanha" description="Distribuição de leads pelas campanhas ativas." className="lg:col-span-1">
              {filteredCampaignsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredCampaignsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="leadsBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GRADIENT_PRIMARY_START} stopOpacity={0.9}/>
                        <stop offset="95%" stopColor={GRADIENT_PRIMARY_END} stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
                    <XAxis dataKey="name" stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number) => `${value.toLocaleString('pt-BR')} Leads`}
                    />
                    <Bar dataKey="leads" fill="url(#leadsBarGradient)" radius={[5, 5, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de campanha disponível.</div>
              )}
            </ChartCard>

            {/* Gráfico de Barras: Campanhas vs Resultados (Custo por Lead) */}
            <ChartCard title="Custo por Lead por Campanha" description="Custo médio por lead para cada campanha." className="lg:col-span-1">
              {filteredCampaignsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredCampaignsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cplBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ERROR_COLOR} stopOpacity={0.9}/>
                        <stop offset="95%" stopColor={WARNING_COLOR} stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
                    <XAxis dataKey="name" stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} tickFormatter={(value: number) => `R$ ${value.toFixed(0)}`} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`}
                    />
                    <Bar dataKey="cpl" fill="url(#cplBarGradient)" radius={[5, 5, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de CPL por campanha disponível.</div>
              )}
            </ChartCard>

            {/* Gráfico de Colunas Empilhadas: Campanhas X Tipos de Leads */}
            <ChartCard title="Leads por Tipo e Campanha" description="Canais preferidos dos leads por campanha." className="lg:col-span-1">
              {leadTypeDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leadTypeDistributionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
                    <XAxis dataKey="type" stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number) => `${value.toLocaleString('pt-BR')} Leads`}
                    />
                    <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                    {/* Usando cores da nova paleta para as barras empilhadas */}
                    <Bar dataKey="leads" stackId="a" fill={PRIMARY_ACCENT} name="Leads" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de leads por tipo disponível.</div>
              )}
            </ChartCard>
          </div>
        </section>
      )}

      {activeTab === 'leads-conversions' && (
        <section className="space-y-10">
          <h2 className="text-2xl font-bold text-white">Leads e Conversões</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Gráfico de Linhas: Evolução Diária ou Semanal de Leads */}
            <ChartCard title="Evolução Diária de Leads" description="Tendência de leads ao longo do tempo." className="lg:col-span-1">
              {leadsEvolutionFiltered.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={leadsEvolutionFiltered} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
                    <XAxis dataKey="date" stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number) => `${value.toLocaleString('pt-BR')} Leads`}
                    />
                    <Line type="monotone" dataKey="value" stroke={SECONDARY_ACCENT} strokeWidth={3} dot={{ stroke: SECONDARY_ACCENT, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de evolução de leads disponível.</div>
              )}
            </ChartCard>

            {/* Gráfico de Pizza: Distribuição de Origem dos Leads */}
            <ChartCard title="Distribuição de Origem dos Leads" description="Canais que mais geram leads." className="lg:col-span-1">
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
                      stroke="#2C2C3E"
                      paddingAngle={5}
                    >
                      {originDataFiltered.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} stroke={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number) => `${value.toLocaleString('pt-BR')} Leads`}
                    />
                    <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de origem de leads disponível.</div>
              )}
            </ChartCard>

            {/* Gráfico de Área: Evolução de Taxa de Conversão */}
            <ChartCard title="Evolução da Taxa de Conversão" description="Tendência da taxa de conversão ao longo do tempo." className="lg:col-span-1">
              {leadsEvolutionFiltered.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={leadsEvolutionFiltered.map(item => ({
                    date: item.date,
                    conversionRate: Math.min(100, (item.value / 100) + (Math.random() * 10))
                  }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
                    <XAxis dataKey="date" stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value.toFixed(0)}%`} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Area type="monotone" dataKey="conversionRate" stroke={GRADIENT_SECONDARY_START} fillOpacity={0.6} fill={`url(#conversionAreaGradient)`} />
                    <defs>
                      <linearGradient id="conversionAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GRADIENT_SECONDARY_START} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={GRADIENT_PRIMARY_END} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de taxa de conversão disponível.</div>
              )}
            </ChartCard>

            {/* Funil de Conversão */}
            <ChartCard title="Funil de Conversão" description="Visualização do funil de marketing e vendas." className="lg:col-span-1">
              {conversionFunnelData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={conversionFunnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404058" horizontal={false} />
                    <XAxis type="number" stroke="#A0A0C0" tickLine={false} axisLine={false} hide />
                    <YAxis type="category" dataKey="stage" stroke="#A0A0C0" tickLine={false} axisLine={false} width={100} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number) => `${value.toLocaleString('pt-BR')}`}
                    />
                    <Bar dataKey="value" fill={GRADIENT_PRIMARY_START} barSize={40} radius={[0, 10, 10, 0]}>
                      {conversionFunnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de funil de conversão disponível.</div>
              )}
            </ChartCard>
          </div>
        </section>
      )}

      {activeTab === 'creatives-ads' && (
        <section className="space-y-10">
          <h2 className="text-2xl font-bold text-white">Criativos e Anúncios</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Gráfico de Barras Horizontais: Desempenho por Criativo */}
            <ChartCard title="Desempenho por Criativo" description="Cliques, leads e conversão por criativo." className="lg:col-span-2">
              {filteredCreativesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={filteredCreativesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404058" horizontal={false} />
                    <XAxis type="number" stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#A0A0C0" tickLine={false} axisLine={false} width={120} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'ctr' || name === 'conversionRate') return `${value.toFixed(2)}%`;
                        return value.toLocaleString('pt-BR');
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                    <Bar dataKey="clicks" fill={SECONDARY_ACCENT} name="Cliques" radius={[0, 5, 5, 0]} />
                    <Bar dataKey="leads" fill={SUCCESS_COLOR} name="Leads" radius={[0, 5, 5, 0]} />
                    <Bar dataKey="conversionRate" fill={PRIMARY_ACCENT} name="Conversão (%)" radius={[0, 5, 5, 0]} />
                    <Bar dataKey="ctr" fill={WARNING_COLOR} name="CTR (%)" radius={[0, 5, 5, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de criativo disponível.</div>
              )}
            </ChartCard>
          </div>
        </section>
      )}

      {activeTab === 'instagram' && (
        <section className="space-y-10">
          <h2 className="text-2xl font-bold text-white">Instagram Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Gráfico de Radar: Comparativo de Engajamento */}
            <ChartCard title="Engajamento do Perfil" description="Comparativo de métricas de interação no Instagram." className="lg:col-span-1">
              {instagramInsightsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={instagramInsightsData}>
                    <PolarGrid stroke="#404058" />
                    <PolarAngleAxis dataKey="metric" stroke="#A0A0C0" tick={{ fill: '#a0aec0', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, Math.max(...instagramInsightsData.map(d => d.value)) * 1.1]} stroke="#404058" tick={false} axisLine={false} />
                    <Radar name="Métricas" dataKey="value" stroke={PRIMARY_ACCENT} fill={PRIMARY_ACCENT} fillOpacity={0.6} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number) => value.toLocaleString('pt-BR')}
                    />
                    <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de engajamento do Instagram disponível.</div>
              )}
            </ChartCard>

            {/* Gráfico de Colunas por Dia: Interações por Post/Stories */}
            <ChartCard title="Interações por Dia" description="Quantidade de interações em posts/stories por dia." className="lg:col-span-2">
              {instagramPostInteractionsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={instagramPostInteractionsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
                    <XAxis dataKey="date" stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number) => value.toLocaleString('pt-BR')}
                    />
                    <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                    <Bar dataKey="likes" stackId="a" fill={PRIMARY_ACCENT} name="Curtidas" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="comments" stackId="a" fill={SECONDARY_ACCENT} name="Comentários" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="saves" stackId="a" fill={SUCCESS_COLOR} name="Salvos" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="shares" stackId="a" fill={WARNING_COLOR} name="Compartilhamentos" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de interações do Instagram disponível.</div>
              )}
            </ChartCard>
          </div>
        </section>
      )}

      {activeTab === 'comparisons' && (
        <section className="space-y-10">
          <h2 className="text-2xl font-bold text-white">Comparações entre Períodos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Gráfico de Linha com Tendência: ROI estimado ao longo dos meses */}
            <ChartCard title="Evolução do ROI" description="ROI real vs. estimado ao longo do tempo." className="lg:col-span-2">
              {roiHistoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={roiHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404058" vertical={false} />
                    <XAxis dataKey="date" stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <YAxis stroke="#A0A0C0" tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number) => value.toFixed(2)}
                    />
                    <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="roi" name="ROI Real" stroke={SUCCESS_COLOR} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="estimatedRoi" name="ROI Estimado" stroke={PRIMARY_ACCENT} strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado de ROI disponível.</div>
              )}
            </ChartCard>

            {/* Gráfico de Radar: Comparar Desempenho entre Clínicas */}
            <ChartCard title="Comparar Desempenho entre Clínicas" description="Métricas comparativas entre clínicas." className="lg:col-span-1">
              {clinicsComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={clinicsComparisonData}>
                    <PolarGrid stroke="#404058" />
                    <PolarAngleAxis dataKey="subject" stroke="#A0A0C0" tick={{ fill: '#a0aec0', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#404058" tick={false} axisLine={false} />
                    <Radar name={clinicasOptions.find(c => c.value === selectedClinicaFilter)?.label || 'Clínica Selecionada'} dataKey="A" stroke={PRIMARY_ACCENT} fill={PRIMARY_ACCENT} fillOpacity={0.6} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                      labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#a0aec0' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'CPL') return `R$ ${(value * 10).toFixed(2)}`;
                        if (name === 'CPC') return `R$ ${(value * 5).toFixed(2)}`;
                        if (name === 'Conversão') return `${value.toFixed(1)}%`;
                        if (name === 'ROI') return `${(value / 10).toFixed(2)}`;
                        if (name === 'Leads') return `${(value * 100).toLocaleString('pt-BR')}`;
                        return value.toLocaleString('pt-BR');
                      }}
                    />
                    <Legend wrapperStyle={{ color: '#a0aec0', paddingTop: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-[#A0A0C0] flex items-center justify-center h-full">Nenhum dado para comparação de clínicas disponível.</div>
              )}
            </ChartCard>
          </div>
        </section>
      )}

      {activeTab === 'clinics-specialties' && (
        <section className="space-y-10">
          <h2 className="text-2xl font-bold text-white">Clínicas e Especialidades</h2>
          <div className="grid grid-cols-1 gap-6">
            {/* POR CLÍNICA (dados reais, se existirem, ou mockados) */}
            <Card className="p-6 rounded-lg shadow-xl bg-[#1C1C2C] border border-[#3A3A4E]">
              {clinicsOverviewForTable.length > 0 ? (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-[#3A3A4E] hover:bg-[#4A4A5E]">
                      <TableHead className="text-[#A0A0C0]">Nome da Clínica</TableHead>
                      <TableHead className="text-[#A0A0C0]">Especialidades</TableHead>
                      <TableHead className="text-[#A0A0C0]">Campanhas Ativas</TableHead>
                      <TableHead className="text-[#A0A0C0]">Leads Recentes</TableHead>
                      <TableHead className="text-[#A0A0C0]">Desempenho (vs Mês Ant.)</TableHead>
                      <TableHead className="text-[#A0A0C0]">Alertas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinicsOverviewForTable.map((clinic: BackendClinicOverviewData, index: number) => (
                      <TableRow key={index} className="hover:bg-[#2C2C3E] border-[#404058]">
                        <TableCell className="font-medium text-white">{clinic.name}</TableCell>
                        <TableCell className="text-[#E0E0F0]">{clinic.specialties}</TableCell>
                        <TableCell className="text-[#E0E0F0]">{clinic.activeCampaigns}</TableCell>
                        <TableCell className="text-[#E0E0F0]">{clinic.recentLeads}</TableCell>
                        <TableCell className={`font-semibold ${parseFloat(clinic.performanceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {parseFloat(clinic.performanceChange) >= 0 ? '▲' : '▼'} {clinic.performanceChange}%
                        </TableCell>
                        <TableCell className="text-red-500">{clinic.alerts?.toString() || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-[#A0A0C0] py-10">Nenhum dado de clínica disponível com os filtros selecionados.</div>
              )}
            </Card>
          </div>
        </section>
      )}

      {/* Modal de Filtros Avançados */}

      <AdvancedFilterModal
        isOpen={isAdvancedFilterModalOpen}
        onClose={() => setIsAdvancedFilterModalOpen(false)}
        onApplyFilters={handleApplyAdvancedFilters}
        initialStartDate={startDate}
        initialEndDate={endDate}
        initialCampaignId={selectedCampaign}
        initialCreativeId={selectedCreative}
        campaignOptions={campaignOptions}
        creativeOptions={creativeOptions}
      />
    </div>
  );
}
