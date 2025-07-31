import { CampaignData, CreativeData, EvolutionData, OriginData, LeadTypeDistributionData, ROIHistoryData, InstagramInsightData, InstagramPostInteraction, ConversionFunnelData, ClinicOverviewData as BackendClinicOverviewData } from '@/app/lib/dashboard';

export type EditableField =
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

// Tipos para os gráficos
export const PRIMARY_ACCENT = '#4F46E5';
export const SECONDARY_ACCENT = '#10B981';
export const SUCCESS_COLOR = '#16A34A';
export const WARNING_COLOR = '#F59E0B';
export const ERROR_COLOR = '#EF4444';
export const INFO_COLOR = '#3B82F6';

export const PIE_CHART_COLORS = [
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

export const GRADIENT_BAR_PRIMARY_START = '#6366F1';
export const GRADIENT_BAR_PRIMARY_END = '#4F46E5';

export const GRADIENT_BAR_SECONDARY_START = '#F87171';
export const GRADIENT_BAR_SECONDARY_END = '#EF4444';

export const GRADIENT_AREA_START = '#A78BFA';
export const GRADIENT_AREA_END = '#8B5CF6';

