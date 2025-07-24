// src/app/lib/alerts.ts

import { get, put } from './api'; 
import { PaginatedAlertsResponse } from '@/app/types/alerts';

/**
 * Busca alertas paginados da API.
 * @param {number} page Número da página (base 0).
 * @param {number} size Tamanho da página.
 * @param {string} searchTerm Termo de busca opcional.
 * @returns {Promise<PaginatedAlertsResponse>} Uma promessa que resolve para a resposta paginada de alertas.
 */
export async function getAlerts(page: number = 0, size: number = 10, searchTerm: string = ''): Promise<PaginatedAlertsResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  if (searchTerm) {
    queryParams.append('searchTerm', searchTerm);
  }

  const path = `/alerts?${queryParams.toString()}`;

  try {
    const data = await get(path);
    return data as PaginatedAlertsResponse;
  } catch (error) {
    console.error('Falha ao buscar alertas:', error);
    throw error; 
  }
}

/**
 * Marca um alerta como lido na API.
 * @param {string} alertId O ID do alerta a ser marcado como lido.
 * @returns {Promise<void>} Uma promessa que resolve quando a operação é concluída.
 */
export async function markAlertAsRead(alertId: number): Promise<void> {
  const path = `/alerts/${alertId}/read`;

  try {
    await put(path, {});
  } catch (error) {
    console.error('Falha ao marcar alerta como lido:', error);
    throw error; 
  }
}
