// src/app/types/report-builders.ts

// Enum para os tipos de bloco
export enum ReportBlockType {
  METRIC = 'METRIC',
  CHART = 'CHART',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  TABLE = 'TABLE',
  GROUP = 'GROUP',
  PAGE_BREAK = 'PAGE_BREAK',
}

// Interfaces base para propriedades comuns a todos os blocos
export interface BaseBlock {
  id: string; // ID único para o bloco
  type: ReportBlockType;
  title?: string;
  description?: string;
  // Propriedades de layout e estilo que podem ser comuns
  layout?: {
    width?: string; // Ex: 'w-full', 'w-1/2', 'w-1/3' (Tailwind classes)
    height?: string; // CORRIGIDO: Adicionado height
    alignment?: 'left' | 'center' | 'right';
    marginTop?: string; // Ex: 'mt-4' (Tailwind class)
    marginBottom?: string; // Ex: 'mb-4' (Tailwind class)
    padding?: string; // CORRIGIDO: Adicionado padding
  };
  backgroundColor?: string; // Ex: '#1C1C2C' (hex) ou 'bg-gray-800' (Tailwind class)
  textColor?: string; // Ex: '#E0E0F0' (hex) ou 'text-white' (Tailwind class)
  borderRadius?: string; // CORRIGIDO: Adicionado borderRadius
  boxShadow?: string; // CORRIGIDO: Adicionado boxShadow
}

// --- Interfaces para Tipos Específicos de Bloco ---

// Bloco de Métrica (KPI)
export interface MetricBlock extends BaseBlock {
  type: ReportBlockType.METRIC;
  // CORRIGIDO: Adicionado 'impressions' e 'clicks' e 'conversions'
  metricKey: 'totalLeads' | 'cpl' | 'roi' | 'totalAppointments' | 'ctr' | 'totalInvestment' | 'totalSales' | 'impressions' | 'clicks' | 'conversions'; // Chave da métrica
  unit?: string;
  isCurrency?: boolean;
  percentageChange?: number | null;
  accentColor?: string; // Cor de destaque para o card da métrica (hex)
  icon?: string; // Nome do ícone (ex: 'FiUsers', 'FiDollarSign' - string para mapeamento)
}

// Bloco de Gráfico
export enum ChartType {
  LINE = 'LINE',
  BAR = 'BAR',
  PIE = 'PIE',
  AREA = 'AREA',
  RADAR = 'RADAR',
  STACKED_BAR = 'STACKED_BAR',
  DUAL_LINE = 'DUAL_LINE',
  FUNNEL = 'FUNNEL',
}

export interface ChartBlock extends BaseBlock {
  type: ReportBlockType.CHART;
  chartType: ChartType;
  dataKey: string | string[]; // Chave(s) para os dados do gráfico
  dataLabel?: string | string[]; // CORRIGIDO: dataLabel pode ser string ou array de strings
  // Opções específicas do gráfico
  xAxisKey?: string;
  yAxisKey?: string;
  lineColor?: string; // Para gráficos de linha/área (hex)
  barColor?: string; // Para gráficos de barra (hex)
  pieColors?: string[]; // Para gráficos de pizza (array de hex)
  gradientStartColor?: string; // Para gradientes (hex)
  gradientEndColor?: string; // Para gradientes (hex)
  showLegend?: boolean; // CORRIGIDO: Adicionado showLegend
  showTooltip?: boolean; // CORRIGIDO: Adicionado showTooltip
  // Filtros internos do bloco (opcional, para dados que podem ser filtrados no próprio bloco)
  filterBy?: 'campaign' | 'creative' | 'specialty' | 'clinic' | 'channel';
  filterValue?: string;
}

// Bloco de Texto
export interface TextBlock extends BaseBlock {
  type: ReportBlockType.TEXT;
  content: string; // Conteúdo do texto
  fontSize?: string; // Ex: 'text-lg', 'text-xl' (Tailwind class)
  fontWeight?: string; // Ex: 'font-bold', 'font-normal' (Tailwind class)
}

// Bloco de Imagem
export interface ImageBlock extends BaseBlock {
  type: ReportBlockType.IMAGE;
  imageUrl: string; // URL da imagem
  altText?: string;
  // CORRIGIDO: width e height movidos para layout em BaseBlock para consistência
  // width?: string; // Largura da imagem (ex: 'w-full', 'w-1/2')
  // height?: string; // Altura da imagem (ex: 'h-auto', 'h-64')
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'; // Tailwind object-fit
}

// Bloco de Tabela
export interface TableBlock extends BaseBlock {
  type: ReportBlockType.TABLE;
  tableData: unknown[]; // Usado 'unknown[]' para ser mais seguro que 'any[]'
  columns: { header: string; accessor: string; format?: 'currency' | 'percent' | 'number' }[]; // Definição das colunas
  // Opções específicas da tabela
  showHeaders?: boolean;
  stripedRows?: boolean;
}

// Bloco de Grupo (contém outros blocos)
export interface GroupBlock extends BaseBlock {
  type: ReportBlockType.GROUP;
  blocks: ReportBlock[]; // Array de blocos aninhados
  groupLayout?: 'row' | 'column'; // Como os blocos internos são organizados ('flex-row' ou 'flex-col')
  gap?: string; // Espaçamento entre os blocos no grupo (ex: 'gap-4', 'space-y-4')
}

// Bloco de Quebra de Página
export interface PageBreakBlock extends BaseBlock {
  type: ReportBlockType.PAGE_BREAK;
  // Não precisa de propriedades adicionais, é apenas um marcador visual
}

// Tipo união para todos os blocos possíveis
export type ReportBlock =
  | MetricBlock
  | ChartBlock
  | TextBlock
  | ImageBlock
  | TableBlock
  | GroupBlock
  | PageBreakBlock;

// --- NOVAS INTERFACES COMPARTILHADAS ---

// Interface para as propriedades comuns que todos os blocos renderizáveis recebem
export interface CommonBlockRenderProps {
  onEdit: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onMoveUp: (blockId: string) => void;
  onMoveDown: (blockId: string) => void;
  isDragging?: boolean; // CORRIGIDO: 'isDragging' agora existe aqui
}

// Define um tipo auxiliar para as props de cada componente de bloco
// Inclui as CommonBlockRenderProps
export type BlockComponentProps<T extends ReportBlock> = {
  block: T;
} & CommonBlockRenderProps;


// Interface para o Relatório completo
export interface ReportTemplate {
  id?: string; // ID do template (se salvo)
  name: string;
  description?: string;
  blocks: ReportBlock[];
  globalSettings?: {
    theme: 'light' | 'dark';
    brandingLogoUrl?: string;
    agencyName?: string;
    reportTitle?: string;
  };
}
