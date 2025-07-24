// src/app/types/clinicas.ts

export interface Especialidade {
  id: number; 
  nome: string;
  color?: string; 
}

export interface Clinica {
  id: number; 
  name: string;
  cnpj: string;
  email: string;
  telephone?: string; 
  cellphone?: string;
  city?: string;
  state?: string; 
  metaAdsId: string | null;
  instagramId: string | null;
  logoUrl?: string | null;
  especialidades: Especialidade[]; 
  ativo: boolean; 
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedClinicasResponse {
  content: Clinica[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
