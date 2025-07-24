// src/app/components/auth/LoginForm.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { Button, Input, Label } from '@/app/components/ui/custom-elements';
import { toast } from 'sonner';
import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';

// Interface para o erro de redirecionamento do Next.js
// Isso permite verificar a propriedade 'digest' de forma tipada.
interface NextRedirectError extends Error {
  digest?: string;
}

const NEXT_REDIRECT_ERROR_CODE = 'NEXT_REDIRECT';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginAction(email, password);
      toast.success('Login realizado com sucesso!');

      const callbackUrl = searchParams.get('callbackUrl');
      if (callbackUrl) {
        router.push(decodeURIComponent(callbackUrl));
      } else {
        router.push('/dashboard');
      }

    } catch (error: unknown) {
      // CORREÇÃO: Verificação de tipo mais robusta para NextRedirectError
      if (error instanceof Error && (error as NextRedirectError).digest?.includes(NEXT_REDIRECT_ERROR_CODE)) {
        // Redirecionamento Next.js detectado, relança o erro para ser tratado pelo Next.js
        throw error;
      }
      
      // Se não for um redirecionamento, trata o erro
      console.error('Erro no login:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
      } else {
        toast.error('Erro desconhecido ao fazer login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seuemail@exemplo.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link href="/forgot-password" className="font-medium text-[#8A2BE2] hover:text-[#6A5ACD]">
            Esqueceu a senha?
          </Link>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading} variant="primary">
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
