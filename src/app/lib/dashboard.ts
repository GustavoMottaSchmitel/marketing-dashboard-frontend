// src/app/lib/dashboard.ts

// Importa as funções de requisição HTTP que criamos em src/app/lib/api.js
// ASSUMindo que api.js e dashboard.ts estão no mesmo diretório src/app/lib
import { get } from './api';

// ====================================================================================
// Interfaces (MANTIDAS - Elas definem a estrutura dos dados esperados da API)
// ====================================================================================

export interface OverviewMetricsDTO {
  meta_totalInvestment: number;
  meta_totalImpressions: number;
  google_totalInvestment: number;
  google_totalImpressions: number;
  google_totalClicks: number;
}

export interface CampaignData {
  id: number;
  name: string;
  status: 'Ativa' | 'Inativa';
  investment: number;
  leads: number;
  cpl: number;
  bestCreative: string;
  roi: number;
}

export interface CreativeData {
  id: number;
  name: string;
  views: number;
  clicks: number;
  ctr: number;
  leads: number;
  cpl: number;
  conversionRate: number;
}

export interface AlertData {
  id: number; // <--- CORREÇÃO AQUI: Mudado de 'string' para 'number'
  message: string;
  type: 'warning' | 'info' | 'success' | 'error';
  date: string; // YYYY-MM-DD ou ISO string
  read: boolean;
}

export interface EvolutionData {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface OriginData {
  name: string;
  value: number;
}

export interface RegionData {
  name: string;
  value: number;
}

export interface GoogleAnalyticsOverviewData {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  bounceRate: number; // 0 to 1
}

export interface ClinicOverviewData {
  id: number;
  name: string;
  specialties: string;
  activeCampaigns: number;
  recentLeads: number;
  performanceChange: string; // e.g., "+5.2%"
  alerts: number;
  // --- ADICIONADO: CPL e CPC para a comparação de clínicas ---
  cpl: number; // Custo por Lead da clínica
  cpc: number; // Custo por Clique da clínica
}

export interface LeadTypeDistributionData {
  type: string;
  leads: number;
  campaignName?: string;
}

export interface ROIHistoryData {
  date: string;
  roi: number;
  estimatedRoi: number;
}

export interface InstagramInsightData {
  metric: string;
  value: number;
}

export interface InstagramPostInteraction {
  date: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
}

export interface ConversionFunnelData {
  stage: string;
  value: number;
}
  
export interface DashboardDataDTO {
  overviewMetrics: OverviewMetricsDTO;
  campaignsData: CampaignData[];
  creativesData: CreativeData[];
  recentAlerts: AlertData[];
  leadsEvolution: EvolutionData[];
  salesEvolution: EvolutionData[];
  originData: OriginData[];
  regionData: RegionData[];
  googleAnalyticsDataDTO: GoogleAnalyticsOverviewData;
  clinicsOverview: ClinicOverviewData[]; // Esta é a interface que foi atualizada
  leadTypeDistribution: LeadTypeDistributionData[];
  roiHistory: ROIHistoryData[];
  instagramInsights: InstagramInsightData[];
  instagramPostInteractions: InstagramPostInteraction[];
  conversionFunnel: ConversionFunnelData[];
}

// ====================================================================================
// Função para Buscar Dados do Dashboard da API Real
// ====================================================================================

/**
 * Busca os dados completos do dashboard da API real.
 * @param {string} clinicId O ID da clínica para filtrar os dados.
 * @param {string} [startDate] Data de início para o filtro (YYYY-MM-DD).
 * @param {string} [endDate] Data de fim para o filtro (YYYY-MM-DD).
 * @param {string} [campaignId] ID da campanha para filtro.
 * @param {string} [creativeId] ID do criativo para filtro.
 * @returns {Promise<DashboardDataDTO>} Uma promessa que resolve para os dados do dashboard.
 */
export const getDashboardData = async (
  clinicId: string,
  startDate?: string,
  endDate?: string,
  campaignId?: string,
  creativeId?: string
): Promise<DashboardDataDTO> => {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (campaignId) queryParams.append('campaignId', campaignId);
  if (creativeId) queryParams.append('creativeId', creativeId);
  let path = `/dashboard/${clinicId}`;
  if (queryParams.toString()) {
    path += `?${queryParams.toString()}`;
  }

  try {
    const data = await get(path);
    return data as DashboardDataDTO; 
  } catch (error) {
    console.error('Falha ao buscar dados do dashboard da API:', error);
    throw error; 
  }
};
