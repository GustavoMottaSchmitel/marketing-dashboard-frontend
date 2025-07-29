'use client'; // Mantido como Client Component

import { Suspense } from 'react';
import { LoginForm } from '@/app/components/auth/LoginForm';
import Image from 'next/image'; // Para a imagem de fundo otimizada

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white via-gray-50 to-blue-50">
      {/* Container Principal do Card de Login - Inspirado na imagem enviada */}
      <div className="relative z-10 w-full max-w-4xl min-h-[500px] flex bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-scale">
        {/* Animações CSS */}
        <style jsx>{`
          .animate-fade-in-scale {
            animation: fadeInScale 0.8s ease-out forwards;
            opacity: 0;
            transform: scale(0.95);
          }
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Coluna Esquerda: Imagem/Ilustração */}
        <div className="relative flex-1 hidden md:flex items-center justify-center p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
          <Image
            src="/assets/clinicmedic.jpg" // Caminho para a imagem que você enviou (coloque-a em public/assets/)
            alt="Ilustração de Gestão de Dados Médicos"
            layout="fill"
            objectFit="contain" 
            quality={90}
            className="p-8" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-40"></div> {/* Overlay sutil */}
        </div>

        {/* Coluna Direita: Formulário de Login */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">MyBimed</h1>
            <p className="text-lg text-gray-600">
              Acesse sua plataforma de gestão.
            </p>
          </div>

          {/* Formulário de Login */}
          <Suspense fallback={
            <div className="text-center text-gray-500 py-8">Carregando formulário de login...</div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
