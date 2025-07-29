'use client';

import { Suspense } from 'react';
import { LoginForm } from '../../components/auth/LoginForm';
import Image from 'next/image'; 

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50">
      
      {/* Container Principal do Card de Login - Layout de Duas Colunas */}

      <div className="relative z-10 w-full max-w-5xl min-h-[600px] flex bg-white rounded-2xl shadow-3xl border border-blue-200 overflow-hidden animate-fade-in-scale">
        
        {/* Animações CSS */}

        <style jsx>{`
          .shadow-3xl {
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); /* Sombra mais profunda */
          }
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

        {/* Coluna Esquerda: Imagem/Ilustração Grande */}

        <div className="relative flex-1 hidden md:flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <Image
            src="/assets/clinicmedic.jpg" 
            alt="Ilustração de Gestão de Dados Médicos"
            layout="fill"
            objectFit="cover" 
            quality={90}
            className="opacity-90" 
          />
          {/* Overlay sutil para garantir legibilidade do texto se houver */}

          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 opacity-20"></div>
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
