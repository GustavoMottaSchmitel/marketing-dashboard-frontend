'use client';

import { Suspense } from 'react';
import { LoginForm } from '../../components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950">
      <div className="relative z-10 w-full max-w-5xl min-h-[600px] flex bg-white rounded-2xl shadow-3xl border border-gray-700 overflow-hidden animate-fade-in-scale">
        <style jsx>{`
          .shadow-3xl {
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
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

        <div className="relative flex-1 hidden md:flex items-center justify-center bg-gray-800">
          <Image
            src="/assets/image_4904e3.jpg"
            alt="Ilustração de Gestão de Dados Médicos"
            layout="fill"
            objectFit="cover"
            quality={90}
            className="opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 opacity-50"></div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">MyBimed</h1>
            <p className="text-lg text-gray-600">
              Acesse sua plataforma de gestão.
            </p>
          </div>

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
