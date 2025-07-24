// src/app/actions/auth.ts
'use server';

import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'next/navigation';

interface DecodedJwtPayload {
  sub: string;
  exp: number;
  name?: string;
  role?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface Session {
  user: User;
  token: string;
  expires: string;
}

// Interface para o erro de redirecionamento do Next.js
// Isso permite verificar a propriedade 'digest' de forma tipada.
interface NextRedirectError extends Error {
  digest?: string;
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
const NEXT_REDIRECT_ERROR_CODE = 'NEXT_REDIRECT';

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    console.log("[getServerSession] Nenhum token encontrado nos cookies.");
    return null;
  }

  try {
    const decoded: DecodedJwtPayload = jwtDecode<DecodedJwtPayload>(token);

    if (!decoded.sub || typeof decoded.sub !== 'string' || decoded.sub.trim() === '') {
      console.error("[getServerSession] Token decodificado está faltando 'sub' ou 'sub' está vazio/inválido.");
      await logoutAction();
      return null;
    }

    if (Date.now() >= decoded.exp * 1000) {
      console.warn('[getServerSession] Token expirado. Redirecionando para logout.');
      await logoutAction();
      return null;
    }

    console.log("[getServerSession] Token decodificado com sucesso para o usuário (sub):", decoded.sub);
    return {
      user: {
        id: decoded.sub,
        email: decoded.sub,
        name: decoded.name,
        role: decoded.role || 'user'
      },
      token,
      expires: new Date(decoded.exp * 1000).toISOString()
    };
  } catch (error: unknown) {
    console.error('[getServerSession] Falha ao decodificar token ou token inválido. Redirecionando para logout:', error);
    await logoutAction();
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  console.log("[getCurrentUser] Tentando obter a sessão do servidor...");
  const session = await getServerSession();
  if (session) {
    console.log("[getCurrentUser] Sessão encontrada para o usuário:", session.user.email);
  } else {
    console.log("[getCurrentUser] Nenhuma sessão encontrada.");
  }
  return session?.user || null;
}

export async function loginAction(email: string, password: string): Promise<Session> {
  if (!API_URL) {
    console.error('Erro de configuração: NEXT_PUBLIC_BACKEND_URL não está definida.');
    throw new Error('Configuração de API inválida. Contate o suporte.');
  }

  const loginEndpoint = `${API_URL}/api/auth/login`;

  try {
    const response = await fetch(loginEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorMessage = 'Credenciais inválidas.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e: unknown) {
        console.warn('Backend respondeu com erro, mas não foi possível ler o JSON da mensagem:', e);
        errorMessage = `Erro ${response.status}: ${response.statusText || 'Resposta inesperada do servidor'}`;
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    const token = responseBody.token;

    if (!token) {
      throw new Error('Token de autenticação não recebido na resposta do login.');
    }

    const decoded: DecodedJwtPayload = jwtDecode<DecodedJwtPayload>(token);

    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(decoded.exp * 1000),
      path: '/',
      sameSite: 'lax',
    });

    return {
      token,
      user: {
        id: decoded.sub,
        email: decoded.sub,
        name: decoded.name,
        role: decoded.role || 'user'
      },
      expires: new Date(decoded.exp * 1000).toISOString()
    };
  } catch (error: unknown) {
    console.error('Erro durante a operação de login:', error);
    // CORREÇÃO: Verificação de tipo mais robusta para NextRedirectError
    if (error instanceof Error && (error as NextRedirectError).digest?.includes(NEXT_REDIRECT_ERROR_CODE)) {
      throw error; // Relança o erro de redirecionamento do Next.js
    }
    if (error instanceof Error) {
      throw new Error(`Falha no login: ${error.message}`);
    }
    throw new Error('Falha desconhecida ao tentar login.');
  }
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete('token');
  redirect('/auth/login');
}

export async function refreshTokenAction(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    console.warn('Nenhum token encontrado para refresh.');
    return null;
  }

  const refreshEndpoint = `${API_URL}/api/auth/refresh`;

  try {
    const response = await fetch(refreshEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      let errorMessage = 'Falha ao refrescar o token.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e: unknown) {
        console.warn('Backend respondeu com erro no refresh, mas não foi possível ler o JSON da mensagem:', e);
        errorMessage = `Erro ${response.status}: ${response.statusText || 'Resposta inesperada do servidor'}`;
      }
      console.error('Erro ao refrescar token:', errorMessage);
      await logoutAction();
      return null;
    }

    const responseBody = await response.json();
    const newToken = responseBody.token;

    if (!newToken) {
      throw new Error('Novo token não recebido na resposta do refresh.');
    }

    const decoded: DecodedJwtPayload = jwtDecode<DecodedJwtPayload>(newToken);

    (await cookies()).set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(decoded.exp * 1000),
      path: '/',
      sameSite: 'lax',
    });

    return {
      token: newToken,
      user: {
        id: decoded.sub,
        email: decoded.sub,
        name: decoded.name,
        role: decoded.role || 'user'
      },
      expires: new Date(decoded.exp * 1000).toISOString()
    };
  } catch (error: unknown) {
    console.error('Token refresh falhou:', error);
    await logoutAction();
    return null;
  }
}
