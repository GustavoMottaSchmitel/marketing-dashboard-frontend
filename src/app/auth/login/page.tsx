'use client'; // Marcar como Client Component para animações e interatividade

import { Suspense } from 'react';
import { LoginForm } from '../../components/auth/LoginForm';
import Link from 'next/link'; // Para os links de registro/esqueceu a senha
import Image from 'next/image'; // Para a imagem de fundo otimizada

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Imagem de Fundo - Ajustada para ser mais sutil e profissional */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://placehold.co/1920x1080/E0E7FF/3F51B5?text=Fundo+Clinica+Moderna" // Placeholder: substitua por uma imagem real de clínica/médico
          alt="Fundo de Clínica Moderna"
          layout="fill"
          objectFit="cover"
          quality={80}
          className="opacity-60 mix-blend-multiply" // Opacidade e blend para um efeito mais suave
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100 opacity-80"></div> {/* Gradiente de overlay */}
      </div>

      {/* Container Principal do Formulário */}
      <div className="relative z-10 w-full max-w-xl p-10 bg-white rounded-xl shadow-2xl border border-gray-100 transform transition-all duration-500 ease-in-out scale-100 hover:scale-[1.01] animate-fade-in-up">
        {/* Animações CSS */}
        <style jsx>{`
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Cabeçalho do Formulário */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">MyBimed</h1>
          <p className="text-lg text-gray-600">
            Bem-vindo de volta! Acesse sua conta.
          </p>
        </div>

        {/* Formulário de Login */}
        <Suspense fallback={
          <div className="text-center text-gray-500 py-8">Carregando formulário de login...</div>
        }>
          <LoginForm />
        </Suspense>

        {/* Opções Adicionais */}
        <div className="mt-8 text-center text-gray-600 space-y-3">
          <p>
            <Link href="/auth/forgot-password" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200">
              Esqueceu sua senha?
            </Link>
          </p>
          <p>
            Não tem uma conta?{' '}
            <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200">
              Registre-se agora!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
