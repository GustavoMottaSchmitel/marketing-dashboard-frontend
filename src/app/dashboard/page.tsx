'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, ChangeEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Select, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Card, Input } from '@/app/components/ui/custom-elements';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area,
} from 'recharts';
import { FiFilter, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiInfo, FiCheckCircle, FiSearch, FiXCircle, FiDollarSign, FiUsers, FiPercent, FiZap, FiEye, FiMousePointer, FiActivity, FiEdit, FiSave } from 'react-icons/fi';

import { cn, debounce } from '@/app/lib/utils';
import { getDashboardData as fetchRealDashboardData, DashboardDataDTO, EvolutionData, ClinicOverviewData as BackendClinicOverviewData, CampaignData, CreativeData, OriginData, LeadTypeDistributionData, ROIHistoryData, InstagramInsightData, InstagramPostInteraction, ConversionFunnelData } from '../lib/dashboard';
import { getClinicas, PaginatedClinicasResponse } from '../lib/clinicas';
import { AdvancedFilterModal } from './_components/AdvancedFilterModal';

const mockClinicas = [
  { value: '1', label: 'Clínica Alpha (Mock)' },
  { value: '2', label: 'Clínica Beta (Mock)' },
  { value: '3', label: 'Clínica Gama (Mock)' },
];

const PRIMARY_ACCENT = '#4F46E5';
const SECONDARY_ACCENT = '#10B981';
const SUCCESS_COLOR = '#16A34A';
const WARNING_COLOR = '#F59E0B';
const ERROR_COLOR = '#EF4444';
const INFO_COLOR = '#3B82F6';

const PIE_CHART_COLORS = [
  PRIMARY_ACCENT,
  SECONDARY_ACCENT,
  SUCCESS_COLOR,
  WARNING_COLOR,
  ERROR_COLOR,
  INFO_COLOR,
  '#8B5CF6',
  '#06B6D4',
  '#F97316',
  '#EC4899',
];

const GRADIENT_BAR_PRIMARY_START = '#6366F1';
const GRADIENT_BAR_PRIMARY_END = '#4F46E5';

const GRADIENT_BAR_SECONDARY_START = '#F87171';
const GRADIENT_BAR_SECONDARY_END = '#EF4444';

const GRADIENT_AREA_START = '#A78BFA';
const GRADIENT_AREA_END = '#8B5CF6';

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

type EditableField =
  | { dataIndex: number; key: keyof CampaignData; dataType: 'campaignsData'; label: string; type?: string; }
  | { dataIndex: number; key: keyof CreativeData; dataType: 'creativesData'; label: string; type?: string; }
  | { dataIndex: number; key: keyof EvolutionData; dataType: 'leadsEvolution'; label: string; type?: string; }
  | { dataIndex: number; key: keyof EvolutionData; dataType: 'salesEvolution'; label: string; type?: string; }
  | { dataIndex: number; key: keyof OriginData; dataType: 'originData'; label: string; type?: string; }
  | { dataIndex: number; key: keyof LeadTypeDistributionData; dataType: 'leadTypeDistribution'; label: string; type?: string; }
  | { dataIndex: number; key: keyof ROIHistoryData; dataType: 'roiHistory'; label: string; type?: string; }
  | { dataIndex: number; key: keyof InstagramInsightData; dataType: 'instagramInsights'; label: string; type?: string; }
  | { dataIndex: number; key: keyof InstagramPostInteraction; dataType: 'instagramPostInteractions'; label: string; type?: string; }
  | { dataIndex: number; key: keyof ConversionFunnelData; dataType: 'conversionFunnel'; label: string; type?: string; }
  | { dataIndex: number; key: keyof BackendClinicOverviewData; dataType: 'clinicsOverview'; label: string; type?: string; };

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
  isEditMode?: boolean;
  onDataChange: (field: EditableField, value: string) => void;
  dataToEditKeys?: EditableField[];
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '', description, isEditMode, onDataChange, dataToEditKeys }) => (
  <Card className={cn("p-6 flex flex-col rounded-lg shadow-md bg-white border border-gray-200", className)}>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
    <div className="flex-1 min-h-[250px] flex items-center justify-center">
      {children}
    </div>
    {isEditMode && onDataChange && dataToEditKeys && (
      <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Editar Dados (Mocked)</h4>
        {dataToEditKeys.map((editField, idx) => (
          <div key={`${editField.dataIndex}-${String(editField.key)}-${editField.dataType}-${idx}`} className="flex items-center space-x-2 mb-1">
            <label htmlFor={`edit-${String(editField.key)}-${editField.dataIndex}-${editField.dataType}`} className="text-gray-600 text-sm w-28">{editField.label}:</label>
            <Input
              id={`edit-${String(editField.key)}-${editField.dataIndex}-${editField.dataType}`}
              type={editField.type || "number"}
              placeholder="Valor"
              onChange={(e) => onDataChange(editField, e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-md px-2 py-1"
            />
          </div>
        ))}
        <p className="text-xs text-gray-500 mt-2">
          Os dados serão resetados ao sair do &apos;EDIT MODE&apos;.
        </p>
      </div>
    )}
  </Card>
);

// Removida a interface DashboardPageProps, pois isEditMode será um estado interno
export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicIdFromUrl = searchParams.get('clinicId');

  const [isEditMode, setIsEditMode] = useState<boolean>(false); // Estado interno para o modo de edição

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

  const [dashboardData, setDashboardData] = useState<DashboardDataDTO | null>(null);
  const [editableDashboardData, setEditableDashboardData] = useState<DashboardDataDTO | null>(null);

  useEffect(() => {
    if (isEditMode && dashboardData) {
      setEditableDashboardData(JSON.parse(JSON.stringify(dashboardData)));
    } else if (!isEditMode) {
      setEditableDashboardData(null);
    }
  }, [isEditMode, dashboardData]);

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

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const currentDashboardData = isEditMode && editableDashboardData ? editableDashboardData : dashboardData;

  const campaignOptions = useMemo(() => {
    if (!currentDashboardData) return [];
    return [{ value: '', label: 'Todas as Campanhas' }, ...currentDashboardData.campaignsData.map(c => ({ value: String(c.id), label: c.name }))];
  }, [currentDashboardData]);

  const creativeOptions = useMemo(() => {
    if (!currentDashboardData) return [];
    return [{ value: '', label: 'Todos os Criativos' }, ...currentDashboardData.creativesData.map(c => ({ value: String(c.id), label: c.name }))];
  }, [currentDashboardData]);

  const leadsEvolutionFiltered = useMemo(() => getFilteredEvolutionData(currentDashboardData?.leadsEvolution || [], startDate, endDate), [currentDashboardData?.leadsEvolution, startDate, endDate, getFilteredEvolutionData]);
  const salesEvolutionFiltered = useMemo(() => getFilteredEvolutionData(currentDashboardData?.salesEvolution || [], startDate, endDate), [currentDashboardData?.salesEvolution, startDate, endDate, getFilteredEvolutionData]);
  const filteredCampaignsData = useMemo(() => {
    return (currentDashboardData?.campaignsData || []).filter(campaign =>
      selectedCampaign ? String(campaign.id) === selectedCampaign : true
    );
  }, [currentDashboardData?.campaignsData, selectedCampaign]);
  const filteredCreativesData = useMemo(() => {
    return (currentDashboardData?.creativesData || []).filter(creative =>
      selectedCreative ? String(creative.id) === selectedCreative : true
    );
  }, [currentDashboardData?.creativesData, selectedCreative]);

  const originDataFiltered = useMemo(() => currentDashboardData?.originData || [], [currentDashboardData?.originData]);
  const leadTypeDistributionData = useMemo(() => currentDashboardData?.leadTypeDistribution || [], [currentDashboardData?.leadTypeDistribution]);
  const roiHistoryData = useMemo(() => currentDashboardData?.roiHistory || [], [currentDashboardData?.roiHistory]);
  const instagramInsightsData = useMemo(() => currentDashboardData?.instagramInsights || [], [currentDashboardData?.instagramInsights]);
  const instagramPostInteractionsData = useMemo(() => currentDashboardData?.instagramPostInteractions || [], [currentDashboardData?.instagramPostInteractions]);
  const conversionFunnelData = useMemo(() => currentDashboardData?.conversionFunnel || [], [currentDashboardData?.conversionFunnel]);

  const overviewMetricsMapped = useMemo(() => {
    if (!currentDashboardData) return null;

    const totalInvestment = (currentDashboardData.overviewMetrics.meta_totalInvestment || 0) + (currentDashboardData.overviewMetrics.google_totalInvestment || 0);
    const totalSalesValue = salesEvolutionFiltered.reduce((sum, item) => sum + item.value, 0);
    const totalLeadsValue = leadsEvolutionFiltered.reduce((sum, item) => sum + item.value, 0);

    const totalViews = (currentDashboardData.overviewMetrics.meta_totalImpressions || 0) + (currentDashboardData.overviewMetrics.google_totalImpressions || 0);
    const totalClicks = currentDashboardData.overviewMetrics.google_totalClicks || 0;
    const avgCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return {
      investmentTotal: totalInvestment,
      conversionsTotal: currentDashboardData.googleAnalyticsDataDTO?.sessions || 0,
      conversionRateTotal: currentDashboardData.googleAnalyticsDataDTO?.bounceRate ? (100 - currentDashboardData.googleAnalyticsDataDTO.bounceRate * 100) : 0,
      revenueTotal: totalSalesValue,
      roi: totalInvestment > 0 ? (totalSalesValue / totalInvestment) : 0,
      impressionsTotal: totalViews,
      totalLeads: totalLeadsValue,
      leadsByChannel: originDataFiltered,
      totalAppointments: 0,
      totalSales: totalSalesValue,
      bestCampaign: currentDashboardData.campaignsData.length > 0 ? currentDashboardData.campaignsData.reduce((prev, current) => (prev.leads > current.leads ? prev : current)).name : 'N/A',
      cpl: totalLeadsValue > 0 ? totalInvestment / totalLeadsValue : 0,
      cpc: (currentDashboardData.overviewMetrics.google_totalClicks || 0) > 0 ? currentDashboardData.overviewMetrics.google_totalInvestment / currentDashboardData.overviewMetrics.google_totalClicks : 0,
      ctr: avgCTR,
      cpv: 0,
      estimatedRevenue: totalSalesValue * 1.1,
    };
  }, [currentDashboardData, leadsEvolutionFiltered, salesEvolutionFiltered, originDataFiltered]);

  const clinicsComparisonData = useMemo(() => {
    if (!currentDashboardData) return [];
    return (currentDashboardData.clinicsOverview || []).map((clinic: BackendClinicOverviewData) => ({
      subject: clinic.name,
      cpl: clinic.cpl / 10,
      cpc: clinic.cpc / 5,
      conversionRate: parseFloat(clinic.performanceChange),
      roi: (clinic.recentLeads / (clinic.cpl * clinic.recentLeads)) * 100,
      leads: clinic.recentLeads / 100,
      fullMark: 100
    })).filter(item => !isNaN(item.cpl) && isFinite(item.cpl));
  }, [currentDashboardData]);

  const clinicsOverviewForTable = useMemo(() => currentDashboardData?.clinicsOverview || [], [currentDashboardData]);

  const handleEditableDataChange = useCallback(
    (
      field: EditableField,
      newValue: string
    ) => {
      if (!editableDashboardData) return;

      setEditableDashboardData(prevData => {
        if (!prevData) return null;

        const updatedData = { ...prevData };
        const parsedValue = parseFloat(newValue);
        const valueToSet: string | number = isNaN(parsedValue) ? newValue : parsedValue;

        switch (field.dataType) {
          case 'campaignsData': {
            const targetArray = [...updatedData.campaignsData];
            const currentElement = targetArray[field.dataIndex];
            if (currentElement) {
              targetArray[field.dataIndex] = {
                ...currentElement,
                [field.key]: valueToSet,
              } as CampaignData;
              updatedData.campaignsData = targetArray;
            }
            break;
          }
          case 'creativesData': {
            const targetArray = [...updatedData.creativesData];
            const currentElement = targetArray[field.dataIndex];
            if (currentElement) {
              targetArray[field.dataIndex] = {
                ...currentElement,
                [field.key]: valueToSet,
              } as CreativeData;
              updatedData.creativesData = targetArray;
            }
            break;
          }
          case 'leadsEvolution': {
            const targetArray = [...updatedData.leadsEvolution];
            const currentElement = targetArray[field.dataIndex];
            if (currentElement) {
              targetArray[field.dataIndex] = {
                ...currentElement,
                [field.key]: valueToSet,
              } as EvolutionData;
              updatedData.leadsEvolution = targetArray;
            }
            break;
          }
          case 'salesEvolution': {
            const targetArray = [...updatedData.salesEvolution];
            const currentElement = targetArray[field.dataIndex];
            if (currentElement) {
              targetArray[field.dataIndex] = {
                ...currentElement,
                [field.key]: valueToSet,
              } as EvolutionData;
              updatedData.salesEvolution = targetArray;
            }
            break;
          }
          case 'originData': {
            const targetArray = [...updatedData.originData];
            const currentElement = targetArray[field.dataIndex];
            if (currentElement) {
              targetArray[field.dataIndex] = {
                ...currentElement,
                [field.key]: valueToSet,
              } as OriginData;
              updatedData.originData = targetArray;
            }
            break;
          }
          case 'leadTypeDistribution': {
            const targetArray = [...updatedData.leadTypeDistribution];
            const currentElement = targetArray[field.dataIndex];
            if (currentElement) {
              targetArray[field.dataIndex] = {
                ...currentElement,
                [field.key]: valueToSet,
              } as LeadTypeDistributionData;
              updatedData.leadTypeDistribution = targetArray;
            }
            break;
          }
          case 'roiHistory': {
            const targetArray = [...updatedData.roiHistory];
            const currentElement = targetArray[field.dataIndex];
            if (currentElement) {
              targetArray[field.dataIndex] = {
                ...currentElement,
                [field.key]: valueToSet,
              } as ROIHistoryData;
              updatedData.roiHistory = targetArray;
            }
            break;
          }
          case 'instagramInsights': {
            const targetArray = [...updatedData.instagramInsights];
            const currentElement = targetArray[field.dataIndex];
            if (currentElement) {
              targetArray[field.dataIndex] = {
                ...currentElement,
                [field.key]: valueToSet,
              } as InstagramInsightData;
              updatedData.instagramInsights = targetArray;
            }
            break;
          }
          case 'instagramPostInteractions': {
            const targetArray = [...updatedData.instagramPostInteractions];
            const currentElement = targetArray[field.dataIndex];
            if (currentElement) {
              targetArray[field.dataIndex] = {
                ...currentElement,
                [field.key]: valueToSet,
              } as InstagramPostInteraction;
              updatedData.instagramPostInteractions = targetArray;
            }
            break;
          }
          case 'conversionFunnel': {
            const targetArray = [...updatedData.conversionFunnel];
            const currentElement = targetArray[field.dataIndex];
            if (currentElement) {
              targetArray[field.dataIndex] = {
                ...currentElement,
                [field.key]: valueToSet,
              } as ConversionFunnelData;
              updatedData.conversionFunnel = targetArray;
            }
            break;
          }
          case 'clinicsOverview': {
            const targetArray = [...updatedData.clinicsOverview];
            const currentElement = targetArray[field.dataIndex];
            if (currentElement) {
              targetArray[field.dataIndex] = {
                ...currentElement,
                [field.key]: valueToSet,
              } as BackendClinicOverviewData;
              updatedData.clinicsOverview = targetArray;
            }
            break;
          }
          default:
            const _exhaustiveCheck: never = field;
            return _exhaustiveCheck;
        }

        return updatedData;
      });
    },
    [editableDashboardData]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Carregando Dashboard...</p>
          <p className="text-sm text-gray-600">Buscando os dados mais recentes da sua clínica.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-red-500 p-8">
        <Card className="p-8 border border-red-400 rounded-lg shadow-md text-center bg-white">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Erro ao Carregar Dashboard</h2>
          <p className="mb-4 text-gray-700">{error}</p>
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

  if (!currentDashboardData || !selectedClinicaFilter) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900">
        <div className="text-center">
          <p className="text-xl font-semibold">Nenhum dado disponível para a clínica selecionada.</p>
          <p className="text-sm text-gray-600">Verifique se o ID da clínica está correto e se os dados foram ingeridos pelo backend.</p>
          {clinicasOptions.length > 0 && (
            <p className="mt-4 text-sm text-gray-600">
              Selecione uma clínica:
              <Select
                options={clinicasOptions}
                value={selectedClinicaFilter || ''}
                onChange={handleClinicaChange}
                className="mt-2 mx-auto bg-white border border-gray-300 text-gray-900"
              />
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-8 bg-gray-50 min-h-screen text-gray-900">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Dashboard de Marketing</h1>
          <p className="text-gray-600 mt-2 text-lg">Visão Geral de Performance da Empresa</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

          <div className="relative w-full md:w-48" ref={clinicSearchRef}>
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar Clínica"
              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 py-2 px-3 rounded-lg text-sm font-medium shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              value={clinicSearchTerm}
              onChange={(e) => {
                setClinicSearchTerm(e.target.value);
                setShowClinicSearchDropdown(true);
              }}
              onFocus={() => setShowClinicSearchDropdown(true)}
            />
            {showClinicSearchDropdown && clinicSearchTerm.length > 0 && (
              <Card className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {clinicasOptions
                  .filter(option => option.value !== '' && option.label.toLowerCase().includes(clinicSearchTerm.toLowerCase()))
                  .map(option => (
                    <div
                      key={option.value}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => handleSelectClinicFromSearch(option.value, option.label)}
                    >
                      {option.label}
                    </div>
                  ))}
                {clinicasOptions.filter(option => option.value !== '' && option.label.toLowerCase().includes(clinicSearchTerm.toLowerCase())).length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500">Nenhuma clínica encontrada.</div>
                )}
              </Card>
            )}
          </div>

          <Select
            options={clinicasOptions}
            value={selectedClinicaFilter || ''}
            onChange={handleClinicaChange}
            className="w-full md:w-48 bg-white border-gray-300 text-gray-900"
          />

          <Button
            onClick={() => setIsAdvancedFilterModalOpen(true)}
            variant="outline"
            className="flex items-center px-4 py-2 rounded-lg"
          >
            <FiFilter className="mr-2" /> Mais Filtros
          </Button>

          {/* Botão para alternar o modo de edição */}
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant="outline"
            className={cn("flex items-center px-4 py-2 rounded-lg transition-colors duration-200", {
              'bg-indigo-600 text-white hover:bg-indigo-700': isEditMode,
              'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300': !isEditMode,
            })}
          >
            {isEditMode ? <FiSave className="mr-2" /> : <FiEdit className="mr-2" />}
            {isEditMode ? 'Salvar Edições (Mocked)' : 'Modo de Edição'}
          </Button>
        </div>
      </div>

      <section className="space-y-10">

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Métricas Principais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <MetricCard title="Investimento Total" value={overviewMetricsMapped?.investmentTotal || 0} isCurrency percentageChange={-2.5} accentColor={ERROR_COLOR} icon={FiDollarSign} />
            <MetricCard title="Total de Leads" value={overviewMetricsMapped?.totalLeads || 0} percentageChange={8.0} accentColor={PRIMARY_ACCENT} icon={FiUsers} />
            <MetricCard title="Faturamento Total" value={overviewMetricsMapped?.revenueTotal || 0} isCurrency percentageChange={12.0} accentColor={SUCCESS_COLOR} icon={FiDollarSign} />
            <MetricCard title="Taxa de Conversão" value={overviewMetricsMapped?.conversionRateTotal || 0} unit="%" percentageChange={-0.2} accentColor={SECONDARY_ACCENT} icon={FiPercent} />
            <MetricCard title="ROI" value={overviewMetricsMapped?.roi || 0} percentageChange={-0.4} accentColor={WARNING_COLOR} icon={FiZap} />
            <MetricCard title="Impressões Totais" value={overviewMetricsMapped?.impressionsTotal || 0} percentageChange={5.0} accentColor={INFO_COLOR} icon={FiEye} />
            <MetricCard title="Cliques Totais" value={overviewMetricsMapped?.conversionsTotal || 0} percentageChange={10.3} accentColor={PRIMARY_ACCENT} icon={FiMousePointer} />
            <MetricCard title="CTR Médio" value={overviewMetricsMapped?.ctr || 0} unit="%" percentageChange={1.2} accentColor={SUCCESS_COLOR} icon={FiActivity} />
            <MetricCard title="CPL Médio" value={overviewMetricsMapped?.cpl || 0} isCurrency percentageChange={-1.5} accentColor={ERROR_COLOR} icon={FiDollarSign} />
            <MetricCard title="CPC Médio" value={overviewMetricsMapped?.cpc || 0} isCurrency percentageChange={-0.5} accentColor={WARNING_COLOR} icon={FiDollarSign} />
          </div>
        </div>

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
            >
              {filteredCampaignsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredCampaignsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="leadsBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GRADIENT_BAR_PRIMARY_START} stopOpacity={0.9}/>
                        <stop offset="95%" stopColor={GRADIENT_BAR_PRIMARY_END} stopOpacity={0.3}/>
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
            >
              {filteredCampaignsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredCampaignsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cplBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GRADIENT_BAR_SECONDARY_START} stopOpacity={0.9}/>
                        <stop offset="95%" stopColor={GRADIENT_BAR_SECONDARY_END} stopOpacity={0.3}/>
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de CPL por campanha disponível.</div>
              )}
            </ChartCard>

            <ChartCard
              title="Leads por Tipo e Campanha"
              description="Canais preferidos dos leads por campanha."
              className="lg:col-span-1"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={leadTypeDistributionData.length > 0 ? [{ dataIndex: 0, key: 'leads', label: `${leadTypeDistributionData[0]?.type || '1º Tipo'}:`, dataType: 'leadTypeDistribution' }] : []}
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de leads por tipo disponível.</div>
              )}
            </ChartCard>

            <ChartCard
              title="Desempenho por Criativo"
              description="Cliques, leads e conversão por criativo."
              className="lg:col-span-2"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={filteredCreativesData.length > 0 ? [
                { dataIndex: 0, key: 'clicks', label: 'Cliques (1º Criativo)', dataType: 'creativesData' },
                { dataIndex: 0, key: 'leads', label: 'Leads (1º Criativo)', dataType: 'creativesData' },
                { dataIndex: 0, key: 'conversionRate', label: 'Conversão (1º Criativo)', dataType: 'creativesData' },
                { dataIndex: 0, key: 'ctr', label: 'CTR (1º Criativo)', dataType: 'creativesData' },
              ] : []}
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
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de criativo disponível.</div>
              )}
            </ChartCard>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Gráficos de Linha e Outros</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartCard
              title="Evolução de Leads"
              description="Tendência de leads ao longo do tempo."
              className="lg:col-span-1"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={leadsEvolutionFiltered.length > 0 ? [{ dataIndex: 0, key: 'value', label: 'Leads (1º Dia)', dataType: 'leadsEvolution' }] : []}
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de evolução de leads disponível.</div>
              )}
            </ChartCard>

            <ChartCard
              title="Evolução de Vendas"
              description="Tendência de vendas ao longo do tempo."
              className="lg:col-span-1"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={salesEvolutionFiltered.length > 0 ? [{ dataIndex: 0, key: 'value', label: 'Vendas (1º Dia)', dataType: 'salesEvolution' }] : []}
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de evolução de vendas disponível.</div>
              )}
            </ChartCard>

            <ChartCard
              title="Investimento vs. Leads"
              description="Comparativo de investimento e leads gerados ao longo do tempo."
              className="lg:col-span-1"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={leadsEvolutionFiltered.length > 0 && salesEvolutionFiltered.length > 0 ? [
                { dataIndex: 0, key: 'value', label: 'Leads (1º Dia)', dataType: 'leadsEvolution' },
                { dataIndex: 0, key: 'value', label: 'Investimento (1º Dia)', dataType: 'salesEvolution' }
              ] : []}
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de investimento vs. leads disponível.</div>
              )}
            </ChartCard>

            <ChartCard
              title="Distribuição de Origem dos Leads"
              description="Canais que mais geram leads."
              className="lg:col-span-1"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={originDataFiltered.length > 0 ? [{ dataIndex: 0, key: 'value', label: `${originDataFiltered[0]?.name || '1º Canal'}:`, dataType: 'originData' }] : []}
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de origem de leads disponível.</div>
              )}
            </ChartCard>

            <ChartCard
              title="Evolução da Taxa de Conversão"
              description="Tendência da taxa de conversão ao longo do tempo."
              className="lg:col-span-1"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={leadsEvolutionFiltered.length > 0 ? [{ dataIndex: 0, key: 'value', label: 'Leads (1º Dia)', dataType: 'leadsEvolution' }] : []}
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de taxa de conversão disponível.</div>
              )}
            </ChartCard>

            <ChartCard
              title="Funil de Conversão"
              description="Visualização do funil de marketing e vendas."
              className="lg:col-span-1"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={conversionFunnelData.length > 0 ? [{ dataIndex: 0, key: 'value', label: `${conversionFunnelData[0]?.stage || '1º Estágio'}:`, dataType: 'conversionFunnel' }] : []}
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de funil de conversão disponível.</div>
              )}
            </ChartCard>

            <ChartCard
              title="Evolução de ROI"
              description="Histórico do Retorno sobre Investimento."
              className="lg:col-span-1"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={roiHistoryData.length > 0 ? [
                { dataIndex: 0, key: 'roi', label: 'ROI Real (1º Dia)', dataType: 'roiHistory' },
                { dataIndex: 0, key: 'estimatedRoi', label: 'ROI Estimado (1º Dia)', dataType: 'roiHistory' },
              ] : []}
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de ROI disponível.</div>
              )}
            </ChartCard>

            <ChartCard
              title="Comparar Desempenho entre Clínicas"
              description="Métricas comparativas entre clínicas."
              className="lg:col-span-1"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={clinicsComparisonData.length > 0 ? [
                { dataIndex: 0, key: 'cpl', label: 'CPL (1ª Clínica)', dataType: 'clinicsOverview' },
                { dataIndex: 0, key: 'cpc', label: 'CPC (1ª Clínica)', dataType: 'clinicsOverview' },
                { dataIndex: 0, key: 'performanceChange', label: 'Desempenho (1ª Clínica)', dataType: 'clinicsOverview' },
                { dataIndex: 0, key: 'recentLeads', label: 'Leads Recentes (1ª Clínica)', dataType: 'clinicsOverview' },
              ] : []}
            >
              {clinicsComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={clinicsComparisonData}>
                    <PolarGrid stroke="#E0E0E0" />
                    <PolarAngleAxis dataKey="subject" stroke="#6B7280" tick={{ fill: '#4B5563', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#E0E0E0" tick={false} axisLine={false} />
                    <Radar name={clinicasOptions.find(c => c.value === selectedClinicaFilter)?.label || 'Clínica Selecionada'} dataKey="cpl" stroke={PRIMARY_ACCENT} fill={PRIMARY_ACCENT} fillOpacity={0.6} />
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado para comparação de clínicas disponível.</div>
              )}
            </ChartCard>

            <ChartCard
              title="Engajamento do Perfil (Instagram)"
              description="Comparativo de métricas de interação no Instagram."
              className="lg:col-span-1"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={instagramInsightsData.length > 0 ? [{ dataIndex: 0, key: 'value', label: `${instagramInsightsData[0]?.metric || '1ª Métrica'}:`, dataType: 'instagramInsights' }] : []}
            >
              {instagramInsightsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={instagramInsightsData}>
                    <PolarGrid stroke="#E0E0E0" />
                    <PolarAngleAxis dataKey="metric" stroke="#6B7280" tick={{ fill: '#4B5563', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, Math.max(...instagramInsightsData.map(d => d.value)) * 1.1]} stroke="#E0E0E0" tick={false} axisLine={false} />
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de engajamento do Instagram disponível.</div>
              )}
            </ChartCard>

            <ChartCard
              title="Interações por Dia (Instagram)"
              description="Quantidade de interações em posts/stories por dia."
              className="lg:col-span-2"
              isEditMode={isEditMode}
              onDataChange={handleEditableDataChange}
              dataToEditKeys={instagramPostInteractionsData.length > 0 ? [
                { dataIndex: 0, key: 'likes', label: 'Curtidas (1º Dia)', dataType: 'instagramPostInteractions' },
                { dataIndex: 0, key: 'comments', label: 'Comentários (1º Dia)', dataType: 'instagramPostInteractions' },
              ] : []}
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
                <div className="text-center text-gray-500 flex items-center justify-center h-full">Nenhum dado de interação do Instagram disponível.</div>
              )}
            </ChartCard>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Alertas Recentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDashboardData.recentAlerts.length > 0 ? (
              currentDashboardData.recentAlerts.map(alert => (
                <Card key={alert.id} className={cn(`p-5 flex items-start gap-4 rounded-lg shadow-md`, {
                  'border-yellow-300 bg-yellow-50': alert.type === 'warning',
                  'border-blue-300 bg-blue-50': alert.type === 'info',
                  'border-green-300 bg-green-50': alert.type === 'success',
                  'border-red-300 bg-red-50': alert.type === 'error',
                }, 'text-gray-900')}>
                  <div className="flex-shrink-0 mt-1">
                    {alert.type === 'warning' && <FiAlertTriangle size={20} className="text-yellow-600" />}
                    {alert.type === 'info' && <FiInfo size={20} className="text-blue-600" />}
                    {alert.type === 'success' && <FiCheckCircle size={20} className="text-green-600" />}
                    {alert.type === 'error' && <FiXCircle size={20} className="text-red-600" />}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-800">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-1">Data: {new Date(alert.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10 col-span-full">
                <p className="text-lg">Nenhum alerta recente.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Tabelas e Detalhes</h2>
          <Card className="p-6 rounded-lg shadow-md bg-white border border-gray-200">
            {clinicsOverviewForTable.length > 0 ? (
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-200">
                    <TableHead className="text-gray-600">Nome da Clínica</TableHead>
                    <TableHead className="text-gray-600">Especialidades</TableHead>
                    <TableHead className="text-gray-600">Campanhas Ativas</TableHead>
                    <TableHead className="text-gray-600">Leads Recentes</TableHead>
                    <TableHead className="text-gray-600">Desempenho (vs Mês Ant.)</TableHead>
                    <TableHead className="text-gray-600">Alertas</TableHead>
                    <TableHead className="text-gray-600">CPL</TableHead>
                    <TableHead className="text-gray-600">CPC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinicsOverviewForTable.map((clinic: BackendClinicOverviewData, index: number) => (
                    <TableRow key={index} className="hover:bg-gray-50 border-gray-200 text-gray-800">
                      <TableCell className="font-medium">
                        {isEditMode ? (
                          <Input
                            type="text"
                            value={clinic.name}
                            onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'name', label: 'Nome da Clínica' }, e.target.value)}
                            className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                          />
                        ) : clinic.name}
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <Input
                            type="text"
                            value={clinic.specialties}
                            onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'specialties', label: 'Especialidades' }, e.target.value)}
                            className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                          />
                        ) : clinic.specialties}
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={clinic.activeCampaigns.toString()}
                            onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'activeCampaigns', label: 'Campanhas Ativas' }, e.target.value)}
                            className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                          />
                        ) : clinic.activeCampaigns}
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={clinic.recentLeads.toString()}
                            onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'recentLeads', label: 'Leads Recentes' }, e.target.value)}
                            className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                          />
                        ) : clinic.recentLeads}
                      </TableCell>
                      <TableCell className={`font-semibold ${parseFloat(clinic.performanceChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={clinic.performanceChange}
                            onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'performanceChange', label: 'Desempenho' }, e.target.value)}
                            className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                          />
                        ) : (
                          <>
                            {parseFloat(clinic.performanceChange) >= 0 ? '▲' : '▼'} {clinic.performanceChange}%
                          </>
                        )}
                      </TableCell>
                      <TableCell className="text-red-500">
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={clinic.alerts?.toString() || ''}
                            onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'alerts', label: 'Alertas' }, e.target.value)}
                            className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                          />
                        ) : clinic.alerts?.toString() || '-'}
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={clinic.cpl.toString()}
                            onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'cpl', label: 'CPL' }, e.target.value)}
                            className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                          />
                        ) : clinic.cpl.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={clinic.cpc.toString()}
                            onChange={(e) => handleEditableDataChange({ dataType: 'clinicsOverview', dataIndex: index, key: 'cpc', label: 'CPC' }, e.target.value)}
                            className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-2 py-1 w-full"
                          />
                        ) : clinic.cpc.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-500 py-10">Nenhum dado de clínica disponível com os filtros selecionados.</div>
            )}
          </Card>
        </div>

      </section>

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
