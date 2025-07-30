// src/app/lib/clinicas.ts

import { get, post, put, del } from './api';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Clinica, PaginatedClinicasResponse, Especialidade } from '../types/clinicas';

// --- DADOS MOCKADOS PARA TESTE DO EDITOR ---
export const MOCKED_CLINIC_ID_NUMERIC = 99999;
export const MOCKED_CLINIC_NAME = 'Clínica de Teste (Editor)';

const mockClinicaForEditor: Clinica = {
  id: MOCKED_CLINIC_ID_NUMERIC,
  name: MOCKED_CLINIC_NAME,
  cnpj: '00.000.000/0001-00',
  email: 'editor@clinicateste.com',
  telephone: '(11) 1234-5678',
  cellphone: '(11) 98765-4321',
  city: 'São Paulo',
  state: 'SP',
  metaAdsId: 'mock_meta_ads_id_123',
  instagramId: 'mock_instagram_id_456',
  logoUrl: 'https://placehold.co/100x100/A78BFA/ffffff?text=LOGO',
  especialidades: [
    { id: 10, nome: 'Odontologia Geral', color: '#4F46E5' },
    { id: 11, nome: 'Estética Dental', color: '#10B981' },
  ],
  ativo: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultMockClinicas: Clinica[] = [
  {
    id: 1, name: 'Clínica Central', cnpj: '11.111.111/0001-11', email: 'central@clinica.com',
    telephone: '(21) 1111-1111', cellphone: '(21) 91111-1111', city: 'Rio de Janeiro', state: 'RJ',
    metaAdsId: 'meta_central_1', instagramId: 'insta_central_1', logoUrl: null,
    especialidades: [{ id: 1, nome: 'Geral', color: '#000000' }], ativo: true, createdAt: '2023-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 2, name: 'Clínica Zona Sul', cnpj: '22.222.222/0001-22', email: 'zonasul@clinica.com',
    telephone: '(11) 2222-2222', cellphone: '(11) 92222-2222', city: 'São Paulo', state: 'SP',
    metaAdsId: 'meta_zonasul_1', instagramId: 'insta_zonasul_1', logoUrl: null,
    especialidades: [{ id: 2, nome: 'Estética', color: '#000000' }], ativo: true, createdAt: '2023-02-01T10:00:00Z', updatedAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 3, name: 'Clínica Norte', cnpj: '33.333.333/0001-33', email: 'norte@clinica.com',
    telephone: '(31) 3333-3333', cellphone: '(31) 93333-3333', city: 'Belo Horizonte', state: 'MG',
    metaAdsId: 'meta_norte_1', instagramId: 'insta_norte_1', logoUrl: null,
    especialidades: [{ id: 3, nome: 'Pediatria', color: '#000000' }], ativo: false, createdAt: '2023-03-01T10:00:00Z', updatedAt: '2024-03-01T10:00:00Z'
  },
  mockClinicaForEditor,
];

/**
 * Busca clínicas paginadas do backend.
 * @param page Número da página (base 0)
 * @param size Quantidade de itens por página
 * @param searchTerm Termo de busca opcional para filtrar clínicas por nome, email, cidade, etc.
 * @param state Filtro por estado (sigla)
 * @param specialty Filtro por ID de especialidade
 * @param status Filtro por status ('Ativo' ou 'Inativo')
 * @returns Promise<PaginatedClinicasResponse> Resposta paginada de clínicas
 */
export const getClinicas = (
  page: number,
  size: number,
  searchTerm?: string,
  state?: string,
  specialty?: string,
  status?: string
): Promise<PaginatedClinicasResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  if (searchTerm) {
    queryParams.append('searchTerm', searchTerm);
  }
  if (state) {
    queryParams.append('state', state);
  }
  if (specialty) {
    queryParams.append('specialty', specialty);
  }
  if (status) {
    queryParams.append('status', status);
  }

  const path = `/clinicas?${queryParams.toString()}`;

  return get(path)
    .then(data => {
      const realResponse = data as PaginatedClinicasResponse;
      const combinedContent = [...realResponse.content];
      const isMockClinicIncluded = combinedContent.some(c => c.id === MOCKED_CLINIC_ID_NUMERIC);
      const isMockClinicMatchingSearch = mockClinicaForEditor.name.toLowerCase().includes(searchTerm?.toLowerCase() || '');

      if (!isMockClinicIncluded && isMockClinicMatchingSearch) {
        combinedContent.push(mockClinicaForEditor);
      }

      return {
        content: combinedContent,
        totalElements: realResponse.totalElements + (isMockClinicIncluded ? 0 : (isMockClinicMatchingSearch ? 1 : 0)),
        totalPages: realResponse.totalPages,
        size: realResponse.size,
        number: realResponse.number,
        first: realResponse.first,
        last: realResponse.last,
        empty: combinedContent.length === 0,
      };
    })
    .catch(error => {
      console.error('Erro ao buscar clínicas da API, retornando dados mockados:', error);
      const filteredMockClinicas = defaultMockClinicas.filter(clinica =>
        (typeof clinica.name === 'string' && clinica.name.toLowerCase().includes(searchTerm?.toLowerCase() || ''))
      );

      return {
        content: filteredMockClinicas,
        last: true,
        totalPages: 1,
        totalElements: filteredMockClinicas.length,
        size: filteredMockClinicas.length,
        number: 0,
        first: true,
        empty: filteredMockClinicas.length === 0,
      };
    });
};

export const saveClinica = (clinicaData: Clinica): Promise<Clinica> => {
  const method = clinicaData.id ? 'PUT' : 'POST';
  const path = clinicaData.id ? `/clinicas/${clinicaData.id}` : `/clinicas`;

  const dataToSend = {
    ...clinicaData,
    especialidades: clinicaData.especialidades.map(e => ({ id: e.id, nome: e.nome, color: e.color })),
  };

  let promise;
  if (method === 'POST') {
    promise = post(path, dataToSend);
  } else { // method === 'PUT'
    promise = put(path, dataToSend);
  }

  return promise
    .then(data => data as Clinica)
    .catch(error => {
      console.error('Erro ao salvar clínica:', error);
      console.log("Simulando salvamento da clínica (API falhou):", clinicaData);
      return { ...clinicaData, updatedAt: new Date().toISOString() };
    });
};

export const deleteClinica = (id: number): Promise<void> => {
  const path = `/clinicas/${id}`;

  return del(path)
    .then(() => {
      console.log("Clínica deletada com sucesso (ou simulado).");
    })
    .catch(error => {
      console.error('Erro ao deletar clínica:', error);
      console.log("Simulando deleção da clínica com ID (API falhou):", id);
    });
};

export type { PaginatedClinicasResponse, Clinica };
