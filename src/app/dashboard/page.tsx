'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Card } from '@/app/components/ui/custom-elements';
import {
  getDashboardData as fetchRealDashboardData,
  DashboardDataDTO,
  EvolutionData,
  CampaignData, // Importado
  CreativeData, // Importado
  OriginData, // Importado
  LeadTypeDistributionData, // Importado
  ROIHistoryData, // Importado
  InstagramInsightData, // Importado
  InstagramPostInteraction, // Importado
  ConversionFunnelData, // Importado
  ClinicOverviewData as BackendClinicOverviewData, // Importado
} from '../lib/dashboard';
import { getClinicas, MOCKED_CLINIC_ID_NUMERIC, MOCKED_CLINIC_NAME, Clinica } from '../lib/clinicas';
import { useDashboardMode } from '@/app/contexts/DashboardModeContext';
import { EditableField } from '@/app/types/dashboard';

// Importando os novos componentes
import { MetricCardsSection } from './_sections/MetricCardsSection';
import { DashboardFilters } from './_sections/DashboardFilters';
import { BarChartsSection } from './_sections/BarChartsSection';
import { LineAndOtherChartsSection } from './_sections/LineAndOtherChartsSection';
import { RecentAlertsSection } from './_sections/RecentAlertsSection';
import { ClinicsOverviewTable } from './_sections/ClinicsOverviewTable';
import { ExpandedChartModal } from './_sections/ExpandedChartModal';

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
    { date: '2022-03-04', likes: 300, comments: 25, saves: 10, shares: 4 },
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

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // Estado para o gráfico expandido no modal
  const [expandedChart, setExpandedChart] = useState<{ type: string; data: unknown; title: string; } | null>(null);

  const handleExpandChart = useCallback((type: string, data: unknown, title: string) => {
    setExpandedChart({ type, data, title });
  }, []);

  const handleCloseExpandedChart = useCallback(() => {
    setExpandedChart(null);
  }, []);

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
              (targetArray[field.dataIndex] as CampaignData) = {
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
              (targetArray[field.dataIndex] as CreativeData) = {
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
              (targetArray[field.dataIndex] as EvolutionData) = {
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
              (targetArray[field.dataIndex] as EvolutionData) = {
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
              (targetArray[field.dataIndex] as OriginData) = {
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
              (targetArray[field.dataIndex] as LeadTypeDistributionData) = {
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
              (targetArray[field.dataIndex] as ROIHistoryData) = {
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
              (targetArray[field.dataIndex] as InstagramInsightData) = {
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
              (targetArray[field.dataIndex] as InstagramPostInteraction) = {
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
              (targetArray[field.dataIndex] as ConversionFunnelData) = {
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
              (targetArray[field.dataIndex] as BackendClinicOverviewData) = {
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
    })).filter((item: { cpl: number }) => !isNaN(item.cpl) && isFinite(item.cpl));
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
      <DashboardFilters
        isViewMode={isViewMode}
        selectedClinicaFilter={selectedClinicaFilter}
        handleClinicChange={handleClinicChange}
        clinicas={clinicas}
        startDate={startDate}
        handleStartDateChange={handleStartDateChange}
        endDate={endDate}
        handleEndDateChange={handleEndDateChange}
        selectedCampaign={selectedCampaign}
        handleCampaignChange={handleCampaignChange}
        campaignOptions={campaignOptions}
        selectedCreative={selectedCreative}
        handleCreativeChange={handleCreativeChange}
        creativeOptions={creativeOptions}
      />

      <section className="space-y-10">
        <MetricCardsSection overviewMetricsMapped={overviewMetricsMapped} />

        <BarChartsSection
          isEditMode={isEditMode}
          isViewMode={isViewMode}
          handleEditableDataChange={handleEditableDataChange}
          onExpandChart={handleExpandChart}
          filteredCampaignsData={filteredCampaignsData}
          filteredCreativesData={filteredCreativesData}
          leadTypeDistributionData={leadTypeDistributionData}
        />

        <LineAndOtherChartsSection
          isEditMode={isEditMode}
          isViewMode={isViewMode}
          handleEditableDataChange={handleEditableDataChange}
          onExpandChart={handleExpandChart}
          leadsEvolutionFiltered={leadsEvolutionFiltered}
          salesEvolutionFiltered={salesEvolutionFiltered}
          originDataFiltered={originDataFiltered}
          roiHistoryData={roiHistoryData}
          instagramInsightsData={instagramInsightsData}
          instagramPostInteractionsData={instagramPostInteractionsData}
          conversionFunnelData={conversionFunnelData}
          clinicsComparisonData={clinicsComparisonData}
          clinicIdFromUrl={clinicIdFromUrl}
          currentDashboardDataForDisplay={currentDashboardDataForDisplay as DashboardDataDTO}
        />

        <RecentAlertsSection recentAlerts={currentDashboardDataForDisplay.recentAlerts} />

        <ClinicsOverviewTable
          clinicsOverviewForTable={clinicsOverviewForTable}
          isEditMode={isEditMode}
          handleEditableDataChange={handleEditableDataChange}
        />
      </section>

      {/* Modal de Gráfico Expandido */}

      <ExpandedChartModal
        expandedChart={expandedChart}
        onClose={handleCloseExpandedChart}
        clinicIdFromUrl={clinicIdFromUrl}
        currentDashboardDataForDisplay={currentDashboardDataForDisplay as DashboardDataDTO}
      />
    </div>
  );
}
