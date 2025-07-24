// src/app/types/alerts.ts
export interface AlertData {
  id: number; 
  type: string;
  message: string;
  date: string; 
  read: boolean;
  clinicaId?: number;
}

export interface PaginatedAlertsResponse {
  content: AlertData[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean; 
  empty: boolean;
}
