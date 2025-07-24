// src/app/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Função genérica para fazer requisições GET para a API.
 * @param {string} path O caminho do endpoint da API (ex: '/auth/login', '/clinicas').
 * @returns {Promise<T>} Uma promessa que resolve para os dados da resposta, onde T é o tipo esperado.
 */
export async function get<T = unknown>(path: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ocorreu um erro na requisição GET.');
    }

    return await response.json() as T; // Cast para o tipo genérico T
  } catch (error) {
    console.error(`Erro na requisição GET para ${path}:`, error);
    throw error;
  }
}

/**
 * Função genérica para fazer requisições POST para a API.
 * @param {string} path O caminho do endpoint da API (ex: '/auth/register', '/auth/login').
 * @param {unknown} data O corpo da requisição a ser enviado como JSON. Use 'unknown' para flexibilidade.
 * @returns {Promise<T | number>} Uma promessa que resolve para os dados da resposta (tipo T) ou o status HTTP se não for JSON.
 */
export async function post<T = unknown>(path: string, data: unknown): Promise<T | number> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ocorreu um erro na requisição POST.');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T; // Cast para o tipo genérico T
    }
    return response.status;
  } catch (error) {
    console.error(`Erro na requisição POST para ${path}:`, error);
    throw error;
  }
}

/**
 * Função genérica para fazer requisições PUT para a API.
 * @param {string} path O caminho do endpoint da API.
 * @param {unknown} [data] O corpo da requisição a ser enviado como JSON (opcional). Use 'unknown' para flexibilidade.
 * @returns {Promise<T | number>} Uma promessa que resolve para os dados da resposta (tipo T) ou o status HTTP se não for JSON.
 */
export async function put<T = unknown>(path: string, data: unknown = {}): Promise<T | number> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ocorreu um erro na requisição PUT.');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T; // Cast para o tipo genérico T
    }
    return response.status;
  } catch (error) {
    console.error(`Erro na requisição PUT para ${path}:`, error);
    throw error;
  }
}

/**
 * Função genérica para fazer requisições DELETE para a API.
 * @param {string} path O caminho do endpoint da API.
 * @returns {Promise<void>} Uma promessa que resolve quando a operação é concluída.
 */
export async function del(path: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ocorreu um erro na requisição DELETE.');
    }
    return;
  } catch (error) {
    console.error(`Erro na requisição DELETE para ${path}:`, error);
    throw error;
  }
}
