// src/app/lib/clinicas.ts

import { get, post, put, del } from './api';

import { Clinica, PaginatedClinicasResponse } from '../types/clinicas';

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
export const getClinicas = async (
  page: number,
  size: number,
  searchTerm?: string,
  state?: string, // Adicionado
  specialty?: string, // Adicionado
  status?: string // Adicionado
): Promise<PaginatedClinicasResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  if (searchTerm) {
    queryParams.append('searchTerm', searchTerm);
  }
  if (state) { // Adiciona o filtro de estado
    queryParams.append('state', state);
  }
  if (specialty) { // Adiciona o filtro de especialidade
    queryParams.append('specialty', specialty);
  }
  if (status) { // Adiciona o filtro de status
    queryParams.append('status', status);
  }

  const path = `/clinicas?${queryParams.toString()}`;

  try {
    const data = await get(path);
    return data as PaginatedClinicasResponse;
  } catch (error) {
    console.error('Erro ao buscar clínicas:', error);
    throw error;
  }
};

// ... (saveClinica e deleteClinica permanecem inalteradas) ...

export const saveClinica = async (clinicaData: Clinica): Promise<Clinica> => {
  const method = clinicaData.id ? 'PUT' : 'POST';
  const path = clinicaData.id ? `/clinicas/${clinicaData.id}` : `/clinicas`;

  const dataToSend = {
    ...clinicaData,
    especialidades: clinicaData.especialidades.map(e => ({ id: e.id, nome: e.nome, color: e.color })),
  };

  try {
    let data;
    if (method === 'POST') {
      data = await post(path, dataToSend);
    } else { // method === 'PUT'
      data = await put(path, dataToSend);
    }
    return data as Clinica;
  } catch (error) {
    console.error('Erro ao salvar clínica:', error);
    throw error;
  }
};

export const deleteClinica = async (id: number): Promise<void> => {
  const path = `/clinicas/${id}`;

  try {
    await del(path);
  } catch (error) {
    console.error('Erro ao deletar clínica:', error);
    throw error;
  }
};
export type { PaginatedClinicasResponse, Clinica };
