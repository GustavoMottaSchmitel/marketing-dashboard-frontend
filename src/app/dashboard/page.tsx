'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Select, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Card, Input } from '@/app/components/ui/custom-elements';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area,
} from 'recharts';
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiXCircle } from 'react-icons/fi';

import { cn } from '@/app/lib/utils';
import { getDashboardData as fetchRealDashboardData, DashboardDataDTO, EvolutionData, ClinicOverviewData as BackendClinicOverviewData, CampaignData, CreativeData, OriginData, LeadTypeDistributionData, ROIHistoryData, InstagramInsightData, InstagramPostInteraction, ConversionFunnelData } from '../lib/dashboard';
import { getClinicas, MOCKED_CLINIC_ID_NUMERIC, MOCKED_CLINIC_NAME, Clinica } from '../lib/clinicas';

import { MetricCardsSection } from './_sections/MetricCardsSection';
import { useDashboardMode } from '@/app/contexts/DashboardModeContext'; // Importar o hook do contexto

// --- DADOS MOCKADOS PARA TESTE DO EDITOR ---
const generateMockDashboardData = (): DashboardDataDTO => ({
  overviewMetrics: {
    meta_totalInvestment: 15000,
    google_totalInvestment: 8000,
    meta_totalImpressions: 1200000,
    google_totalImpressions: 800000,
    google_totalClicks: 50000,
  },
  googleAnalyticsDataDTO: {
    sessions: 75000,
    bounceRate: 0.35,
    totalUsers: 100000,
    newUsers: 25000,
  },
  campaignsData: [
    { id: 1, name: 'Campanha Primavera', leads: 2500, cpl: 6.0, roi: 2.5, status: 'Ativa', investment: 10000, bestCreative: 'Criativo A' },
    { id: 2, name: 'Campanha Verão', leads: 3200, cpl: 4.5, roi: 3.1, status: 'Ativa', investment: 12000, bestCreative: 'Criativo B' },
    { id: 3, name: 'Campanha Outono', leads: 1800, cpl: 7.2, roi: 1.8, status: 'Inativa', investment: 8000, bestCreative: 'Criativo C' },
    { id: 4, name: 'Campanha Inverno', leads: 2000, cpl: 5.8, roi: 2.0, status: 'Ativa', investment: 9000, bestCreative: 'Criativo D' },
  ],
  creativesData: [
    { id: 101, name: 'Banner Sorriso', clicks: 15000, leads: 800, conversionRate: 5.3, ctr: 1.2, views: 100000, cpl: 18.75 },
    { id: 102, name: 'Vídeo Clareamento', clicks: 22000, leads: 1200, conversionRate: 5.5, ctr: 1.5, views: 150000, cpl: 18.33 },
    { id: 103, name: 'Post Implante', clicks: 8000, leads: 400, conversionRate: 5.0, ctr: 0.8, views: 50000, cpl: 20.00 },
  ],
  leadsEvolution: [
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-08', value: 120 },
    { date: '2024-01-15', value: 150 },
    { date: '2024-01-22', value: 130 },
    { date: '2024-01-29', value: 160 },
    { date: '2024-02-05', value: 180 },
    { date: '2024-02-12', value: 200 },
  ],
  salesEvolution: [
    { date: '2024-01-01', value: 5000 },
    { date: '2024-01-08', value: 6000 },
    { date: '2024-01-15', value: 7500 },
    { date: '2024-01-22', value: 6800 },
    { date: '2024-01-29', value: 8000 },
    { date: '2024-02-05', value: 9000 },
    { date: '2024-02-12', value: 10000 },
  ],
  originData: [
    { name: 'Google Ads', value: 4000 },
    { name: 'Meta Ads', value: 3500 },
    { name: 'Orgânico', value: 1500 },
    { name: 'Indicação', value: 1000 },
  ],
  leadTypeDistribution: [
    { type: 'Hot Leads', leads: 3000 },
    { type: 'Warm Leads', leads: 4000 },
    { type: 'Cold Leads', leads: 2000 },
  ],
  roiHistory: [
    { date: '2024-01-01', roi: 1.5, estimatedRoi: 1.7 },
    { date: '2024-01-15', roi: 1.8, estimatedRoi: 1.9 },
    { date: '2024-01-29', roi: 2.0, estimatedRoi: 2.1 },
    { date: '2024-02-12', roi: 2.2, estimatedRoi: 2.3 },
  ],
  instagramInsights: [
    { metric: 'Seguidores', value: 15000 },
    { metric: 'Alcance', value: 50000 },
    { metric: 'Impressões', value: 80000 },
    { metric: 'Engajamento', value: 5000 },
  ],
  instagramPostInteractions: [
    { date: '2024-03-01', likes: 200, comments: 15, saves: 5, shares: 2 },
    { date: '2024-03-02', likes: 250, comments: 20, saves: 8, shares: 3 },
    { date: '2024-03-03', likes: 180, comments: 10, saves: 3, shares: 1 },
    { date: '2024-03-04', likes: 300, comments: 25, saves: 10, shares: 4 },
  ],
  conversionFunnel: [
    { stage: 'Visitantes', value: 10000 },
    { stage: 'Leads', value: 3000 },
    { stage: 'Qualificados', value: 1500 },
    { stage: 'Oportunidades', value: 500 },
    { stage: 'Vendas', value: 200 },
  ],
  recentAlerts: [
    { id: 1, message: 'CPL da Campanha X aumentou 15%.', type: 'warning', date: '2024-07-25T10:00:00Z', read: false },
    { id: 2, message: 'Nova campanha "Sorriso Perfeito" lançada com sucesso.', type: 'success', date: '2024-07-24T14:30:00Z', read: true },
    { id: 3, message: 'Queda de 20% nas sessões do Google Analytics.', type: 'error', date: '2024-07-23T09:15:00Z', read: false },
  ],
  clinicsOverview: [
    { id: MOCKED_CLINIC_ID_NUMERIC, name: MOCKED_CLINIC_NAME, specialties: 'Mocked, Editor', activeCampaigns: 99, recentLeads: 999, performanceChange: '99.9', alerts: 99, cpl: 9.99, cpc: 0.99 },
    { id: 1, name: 'Clínica Central', specialties: 'Geral, Ortodontia', activeCampaigns: 5, recentLeads: 120, performanceChange: '5.2', alerts: 1, cpl: 5.50, cpc: 1.20 },
    { id: 2, name: 'Clínica Zona Sul', specialties: 'Estética, Implantes', activeCampaigns: 3, recentLeads: 80, performanceChange: '-2.1', alerts: 0, cpl: 6.10, cpc: 1.50 },
  ],
  regionData: [],
});
// --- FIM DADOS MOCKADOS ---

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

// Remova as props isViewMode, onToggleViewMode, isEditMode, onToggleEditMode
export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Use o hook do contexto para obter os estados e funções
  const { isViewMode, isEditMode } = useDashboardMode();

  const clinicIdFromUrl = searchParams.get('clinicId');
  const [selectedClinicaFilter, setSelectedClinicaFilter] = useState<string | null>(clinicIdFromUrl);
  const [startDate, setStartDate] = useState<string>(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState<string>(searchParams.get('endDate') || '');
  const [selectedCampaign, setSelectedCampaign] = useState(searchParams.get('campaignId') || '');
  const [selectedCreative, setSelectedCreative] = useState(searchParams.get('creativeId') || '');

  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loadingClinicas, setLoadingClinicas] = useState(true);

  const [dashboardData, setDashboardData] = useState<DashboardDataDTO | null>(null);
  const [editableDashboardData, setEditableDashboardData] = useState<DashboardDataDTO | null>(null);

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

  const handleClinicChange = useCallback((value: string) => {
    setSelectedClinicaFilter(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('clinicId', value);
    router.replace(`/dashboard?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newSearchParams.set('startDate', value);
    } else {
      newSearchParams.delete('startDate');
    }
    router.replace(`/dashboard?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  const handleEndDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newSearchParams.set('endDate', value);
    } else {
      newSearchParams.delete('endDate');
    }
    router.replace(`/dashboard?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  const handleCampaignChange = useCallback((value: string) => {
    setSelectedCampaign(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newSearchParams.set('campaignId', value);
    } else {
      newSearchParams.delete('campaignId');
    }
    router.replace(`/dashboard?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  const handleCreativeChange = useCallback((value: string) => {
    setSelectedCreative(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newSearchParams.set('creativeId', value);
    } else {
      newSearchParams.delete('creativeId');
    }
    router.replace(`/dashboard?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  const loadDashboardData = useCallback(() => {
    const currentClinicId = searchParams.get('clinicId');
    const currentStartDate = searchParams.get('startDate') || '';
    const currentEndDate = searchParams.get('endDate') || '';
    const currentCampaign = searchParams.get('campaignId') || '';
    const currentCreative = searchParams.get('creativeId') || '';

    if (!currentClinicId) {
      setLoading(false);
      setDashboardData(null);
      return;
    }

    setLoading(true);
    setError(null);

    if (parseInt(currentClinicId) === MOCKED_CLINIC_ID_NUMERIC) {
      setDashboardData(generateMockDashboardData());
      setLoading(false);
    } else {
      fetchRealDashboardData(
        currentClinicId,
        currentStartDate,
        currentEndDate,
        currentCampaign,
        currentCreative
      )
        .then(data => {
          setDashboardData(data);
        })
        .catch(err => {
          console.error("Erro ao buscar dados do dashboard:", err);
          if (err instanceof Error) {
            setError(err.message || "Ocorreu um erro ao carregar os dados do dashboard.");
          } else {
            setError("Ocorreu um erro desconhecido ao carregar os dados do dashboard.");
          }
          setDashboardData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [searchParams, setLoading, setError, setDashboardData]);

  const currentDashboardDataForDisplay = useMemo(() => {
    return isEditMode && editableDashboardData ? editableDashboardData : dashboardData;
  }, [isEditMode, editableDashboardData, dashboardData]);

  const leadsEvolutionFiltered = useMemo(() => getFilteredEvolutionData(currentDashboardDataForDisplay?.leadsEvolution || [], startDate, endDate), [currentDashboardDataForDisplay?.leadsEvolution, startDate, endDate, getFilteredEvolutionData]);
  const salesEvolutionFiltered = useMemo(() => getFilteredEvolutionData(currentDashboardDataForDisplay?.salesEvolution || [], startDate, endDate), [currentDashboardDataForDisplay?.salesEvolution, startDate, endDate, getFilteredEvolutionData]);

  const campaignOptions = useMemo(() => {
    const options = (currentDashboardDataForDisplay?.campaignsData || []).map(c => ({ value: String(c.id), label: c.name }));
    return [{ value: '', label: 'Todas as Campanhas' }, ...options];
  }, [currentDashboardDataForDisplay?.campaignsData]);

  const creativeOptions = useMemo(() => {
    const options = (currentDashboardDataForDisplay?.creativesData || []).map(c => ({ value: String(c.id), label: c.name }));
    return [{ value: '', label: 'Todos os Criativos' }, ...options];
  }, [currentDashboardDataForDisplay?.creativesData]);

  const filteredCampaignsData = useMemo(() => {
    return (currentDashboardDataForDisplay?.campaignsData || []).filter(campaign =>
      selectedCampaign ? String(campaign.id) === selectedCampaign : true
    );
  }, [currentDashboardDataForDisplay?.campaignsData, selectedCampaign]);
  const filteredCreativesData = useMemo(() => {
    return (currentDashboardDataForDisplay?.creativesData || []).filter(creative =>
      selectedCreative ? String(creative.id) === selectedCreative : true
    );
  }, [currentDashboardDataForDisplay?.creativesData, selectedCreative]);

  const originDataFiltered = useMemo(() => currentDashboardDataForDisplay?.originData || [], [currentDashboardDataForDisplay?.originData]);
  const leadTypeDistributionData = useMemo(() => currentDashboardDataForDisplay?.leadTypeDistribution || [], [currentDashboardDataForDisplay?.leadTypeDistribution]);
  const roiHistoryData = useMemo(() => currentDashboardDataForDisplay?.roiHistory || [], [currentDashboardDataForDisplay?.roiHistory]);
  const instagramInsightsData = useMemo(() => currentDashboardDataForDisplay?.instagramInsights || [], [currentDashboardDataForDisplay?.instagramInsights]);
  const instagramPostInteractionsData = useMemo(() => currentDashboardDataForDisplay?.instagramPostInteractions || [], [currentDashboardDataForDisplay?.instagramPostInteractions]);
  const conversionFunnelData = useMemo(() => currentDashboardDataForDisplay?.conversionFunnel || [], [currentDashboardDataForDisplay?.conversionFunnel]);

  const overviewMetricsMapped = useMemo(() => {
    if (!currentDashboardDataForDisplay) return null;

    const totalInvestment = (currentDashboardDataForDisplay.overviewMetrics.meta_totalInvestment || 0) + (currentDashboardDataForDisplay.overviewMetrics.google_totalInvestment || 0);
    const totalSalesValue = salesEvolutionFiltered.reduce((sum, item) => sum + item.value, 0);
    const totalLeadsValue = leadsEvolutionFiltered.reduce((sum, item) => sum + item.value, 0);

    const totalViews = (currentDashboardDataForDisplay.overviewMetrics.meta_totalImpressions || 0) + (currentDashboardDataForDisplay.overviewMetrics.google_totalImpressions || 0);
    const totalClicks = currentDashboardDataForDisplay.overviewMetrics.google_totalClicks || 0;
    const avgCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return {
      investmentTotal: totalInvestment,
      conversionsTotal: currentDashboardDataForDisplay.googleAnalyticsDataDTO?.sessions || 0,
      conversionRateTotal: currentDashboardDataForDisplay.googleAnalyticsDataDTO?.bounceRate ? (100 - currentDashboardDataForDisplay.googleAnalyticsDataDTO.bounceRate * 100) : 0,
      revenueTotal: totalSalesValue,
      roi: totalInvestment > 0 ? (totalSalesValue / totalInvestment) : 0,
      impressionsTotal: totalViews,
      totalLeads: totalLeadsValue,
      leadsByChannel: originDataFiltered,
      totalAppointments: 0,
      totalSales: totalSalesValue,
      bestCampaign: currentDashboardDataForDisplay.campaignsData.length > 0 ? currentDashboardDataForDisplay.campaignsData.reduce((prev, current) => (prev.leads > current.leads ? prev : current)).name : 'N/A',
      cpl: totalLeadsValue > 0 ? totalInvestment / totalLeadsValue : 0,
      cpc: (currentDashboardDataForDisplay.overviewMetrics.google_totalClicks || 0) > 0 ? currentDashboardDataForDisplay.overviewMetrics.google_totalInvestment / currentDashboardDataForDisplay.overviewMetrics.google_totalClicks : 0,
      ctr: avgCTR,
      cpv: 0,
      estimatedRevenue: totalSalesValue * 1.1,
    };
  }, [currentDashboardDataForDisplay, leadsEvolutionFiltered, salesEvolutionFiltered, originDataFiltered]);

  const clinicsComparisonData = useMemo(() => {
    if (!currentDashboardDataForDisplay) return [];
    return (currentDashboardDataForDisplay.clinicsOverview || []).map((clinic: BackendClinicOverviewData) => ({
      subject: clinic.name,
      cpl: clinic.cpl / 10, // Normalizando para o radar chart
      cpc: clinic.cpc / 5, // Normalizando para o radar chart
      conversionRate: parseFloat(clinic.performanceChange),
      roi: (clinic.recentLeads / (clinic.cpl * clinic.recentLeads)) * 100, // Exemplo de cálculo de ROI
      leads: clinic.recentLeads / 100, // Normalizando para o radar chart
      fullMark: 100
    })).filter(item => !isNaN(item.cpl) && isFinite(item.cpl));
  }, [currentDashboardDataForDisplay]);

  const clinicsOverviewForTable = useMemo(() => currentDashboardDataForDisplay?.clinicsOverview || [], [currentDashboardDataForDisplay]);


  useEffect(() => {
    setLoadingClinicas(true);
    getClinicas(0, 100)
      .then(response => {
        setClinicas(response.content);
        if (!clinicIdFromUrl && response.content.length > 0) {
          const initialClinicId = response.content.find(c => c.id === MOCKED_CLINIC_ID_NUMERIC)?.id.toString() || response.content[0].id.toString();
          setSelectedClinicaFilter(initialClinicId);
          router.replace(`/dashboard?clinicId=${initialClinicId}`);
        }
      })
      .catch(err => {
          console.error("Erro ao carregar clínicas:", err);
      })
      .finally(() => {
        setLoadingClinicas(false);
      });
  }, [router, searchParams, clinicIdFromUrl]);

  // Sincroniza editableDashboardData com dashboardData ao mudar o modo de edição
  useEffect(() => {
    if (isEditMode && dashboardData) {
      setEditableDashboardData(JSON.parse(JSON.stringify(dashboardData)));
    } else if (!isEditMode) {
      setEditableDashboardData(null);
    }
  }, [isEditMode, dashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);


  if (loading || loadingClinicas) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-900">
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-red-500 p-8">
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

  if (!currentDashboardDataForDisplay || !clinicIdFromUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-900">
        <div className="text-center">
          <p className="text-xl font-semibold">Nenhum dado disponível para a clínica selecionada.</p>
          <p className="text-sm text-gray-600">Selecione uma clínica no menu superior ou verifique se os dados foram ingeridos pelo backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 bg-gray-100 min-h-screen text-gray-900">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900">Dashboard de Marketing</h1>
        <p className="text-gray-600 mt-2 text-lg">Visão Geral de Performance da Empresa</p>
      </div>

      {/* Seção de Filtros */}
      <section className={cn("bg-white p-6 rounded-lg shadow-md border border-gray-200", isViewMode && "hidden")}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <label htmlFor="clinic-select" className="block text-sm font-medium text-gray-700 mb-1">Clínica</label>
            <Select
              id="clinic-select"
              value={selectedClinicaFilter || ''}
              onValueChange={handleClinicChange}
              options={clinicas.map(c => ({ value: String(c.id), label: c.name }))}
              placeholder="Selecione uma clínica"
            />
          </div>
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="campaign-select" className="block text-sm font-medium text-gray-700 mb-1">Campanha</label>
            <Select
              id="campaign-select"
              value={selectedCampaign}
              onValueChange={handleCampaignChange}
              options={campaignOptions}
              placeholder="Todas as Campanhas"
            />
          </div>
          <div>
            <label htmlFor="creative-select" className="block text-sm font-medium text-gray-700 mb-1">Criativo</label>
            <Select
              id="creative-select"
              value={selectedCreative}
              onValueChange={handleCreativeChange}
              options={creativeOptions}
              placeholder="Todos os Criativos"
            />
          </div>
        </div>
      </section>


      <section className="space-y-10">

        <MetricCardsSection overviewMetricsMapped={overviewMetricsMapped} />

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
            >
              {clinicsComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={clinicsComparisonData}>
                    <PolarGrid stroke="#E0E0E0" />
                    <PolarAngleAxis dataKey="subject" stroke="#6B7280" tick={{ fill: '#4B5563', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, Math.max(...clinicsComparisonData.map(d => d.cpl * 10 || 0)) * 1.1]} stroke="#E0E0E0" tick={false} axisLine={false} />
                    <Radar name={currentDashboardDataForDisplay?.clinicsOverview.find(c => c.id === parseInt(clinicIdFromUrl || '0'))?.name || 'Clínica Selecionada'} dataKey="cpl" stroke={PRIMARY_ACCENT} fill={PRIMARY_ACCENT} fillOpacity={0.6} />
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

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Alertas Recentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentDashboardDataForDisplay.recentAlerts.length > 0 ? (
              currentDashboardDataForDisplay.recentAlerts.map(alert => (
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
    </div>
  );
}
