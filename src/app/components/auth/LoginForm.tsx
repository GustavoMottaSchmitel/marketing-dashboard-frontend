'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { Button, Input, Label } from '@/app/components/ui/custom-elements';
import { toast } from 'sonner';
import { loginAction } from '@/app/actions/auth';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface NextRedirectError extends Error {
  digest?: string;
}

const NEXT_REDIRECT_ERROR_CODE = 'NEXT_REDIRECT';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      if (error instanceof Error && (error as NextRedirectError).digest?.includes(NEXT_REDIRECT_ERROR_CODE)) {
        throw error;
      }
      
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
        <Label htmlFor="email" className="text-gray-700">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seuemail@exemplo.com"
            className="bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-600 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-2.5 py-2.5"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-600 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 py-2.5"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
