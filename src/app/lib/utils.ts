// src/app/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes Tailwind CSS de forma segura
 * @param inputs Classes para combinar
 * @returns String de classes combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data para exibição
 * @param date Data em string, número ou objeto Date
 * @param options Opções de formatação
 * @returns Data formatada
 */
export function formatDate(
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }
) {
  return new Intl.DateTimeFormat('pt-BR', options).format(new Date(date));
}

/**
 * Formata um valor monetário
 * @param value Valor numérico
 * @returns String formatada em Real brasileiro
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Gera um ID único
 * @returns String com ID único
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Debounce para otimizar chamadas de função.
 * Retorna uma função debounced que também possui um método 'cancel' para limpar o timer pendente.
 * @param func Função a ser chamada
 * @param delay Tempo de espera em ms
 * @returns Função com debounce aplicado e método cancel
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
) {
  let timeoutId: NodeJS.Timeout | null = null;

  const debouncedFunction = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null; // Limpa o ID após a execução
    }, delay);
  }) as T & { cancel: () => void }; // Adiciona o tipo para a propriedade cancel

  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFunction;
}

/**
 * Remove acentos e caracteres especiais
 * @param str String de entrada
 * @returns String normalizada
 */
export function normalizeString(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Valida CNPJ
 * @param cnpj CNPJ a ser validado
 * @returns Boolean indicando se é válido
 */
export function validateCNPJ(cnpj: string) {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Validação dos dígitos verificadores
  const digits = cnpj.split('').map(Number);
  const calcDigit = (slice: number[]) => {
    let sum = 0;
    let pos = slice.length + 1;

    for (const num of slice) {
      sum += num * pos;
      pos--;
      if (pos < 2) pos = 9;
    }

    const result = 11 - (sum % 11);
    return result > 9 ? 0 : result;
  };

  const digit1 = calcDigit(digits.slice(0, 12));
  if (digit1 !== digits[12]) return false;

  const digit2 = calcDigit(digits.slice(0, 13));
  return digit2 === digits[13];
}

/**
 * Extrai erros de uma resposta da API
 * @param error Objeto de erro
 * @returns Mensagem de erro amigável
 */
export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Ocorreu um erro desconhecido';
}

/**
 * Converte um objeto em query string
 * @param params Objeto com parâmetros
 * @returns String de query
 */
export function objectToQueryString(params: Record<string, unknown>) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null) // Corrected: ignore the first element of the tuple
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`) // Ensure value is string for encodeURIComponent
    .join('&');
}

/**
 * Verifica se está em ambiente de desenvolvimento
 * @returns Boolean
 */
export function isDev() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Verifica se está em ambiente de produção
 * @returns Boolean
 */
export function isProd() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Capitaliza a primeira letra de uma string
 * @param str String de entrada
 * @returns String capitalizada
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Limpa e formata um número de telefone
 * @param phone Número de telefone
 * @returns Telefone formatado
 */
export function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

const SPECIALTY_COLOR_PALETTE = [
  '#FF6347', // Tomato
  '#4682B4', // SteelBlue
  '#3CB371', // MediumSeaGreen
  '#FFD700', // Gold
  '#9370DB', // MediumPurple
  '#20B2AA', // LightSeaGreen
  '#FF8C00', // DarkOrange
  '#87CEEB', // SkyBlue
  '#DA70D6', // Orchid
  '#7CFC00', // LawnGreen
  '#DC143C', // Crimson
  '#00CED1', // DarkTurquoise
  '#FF1493', // DeepPink
  '#6A5ACD', // SlateBlue
  '#ADFF2F', // GreenYellow
  '#BA55D3', // MediumOrchid
  '#48D1CC', // MediumTurquoise
  '#FF4500', // OrangeRed
];

/**
 * Gera uma cor consistente para uma especialidade com base em seu nome.
 * Usa um algoritmo de hash simples para mapear o nome a uma cor da paleta.
 * @param specialtyName Nome da especialidade
 * @returns Cor hexadecimal (string)
 */
export function getSpecialtyColor(specialtyName: string): string {
  if (!specialtyName) return '#A0A0C0';

  let hash = 0;
  for (let i = 0; i < specialtyName.length; i++) {
    hash = specialtyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SPECIALTY_COLOR_PALETTE.length;
  return SPECIALTY_COLOR_PALETTE[index];
}
