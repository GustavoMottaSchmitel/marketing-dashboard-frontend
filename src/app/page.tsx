'use client';

import Link from 'next/link';
import { Button } from './components/ui/custom-elements';
import { SparklesIcon } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white overflow-hidden">
      <div className="absolute inset-0 z-0" style={{
        background: 'radial-gradient(circle at center, rgba(60, 0, 100, 0.3) 0%, rgba(0, 0, 0, 0.7) 70%, rgba(0, 0, 0, 0.9) 100%)',
      }}></div>
      <div className="absolute inset-0 z-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }}></div>

      <style jsx>{`
        .shadow-4xl {
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pop-on-hover {
          transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        }
        .animate-pop-on-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 35px 70px rgba(0, 0, 0, 0.35);
        }
        .animate-pulse-subtle {
          animation: pulseSubtle 2s infinite ease-in-out;
        }
        @keyframes pulseSubtle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-2xl mx-auto text-center bg-white p-10 rounded-3xl shadow-4xl border border-indigo-300 animate-fade-in-up animate-pop-on-hover">
        <div className="space-y-8">
          <div className="flex items-center justify-center mb-6">
            <SparklesIcon className="h-16 w-16 text-indigo-700 mr-4 animate-pulse-subtle" />
            <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              MyBimed
            </h1>
          </div>

          <div className="space-y-4">
            <p className="text-2xl text-gray-700 leading-relaxed font-semibold">
              Sua plataforma inteligente para gestão e otimização de marketing em clínicas médicas.
            </p>
            <p className="text-lg text-gray-600">
              Transforme dados em resultados e impulsione o crescimento da sua clínica com insights poderosos.
            </p>
          </div>

          <div className="flex flex-col space-y-4 mt-10">
            <Button asChild className="w-full py-4 text-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out animate-pop-on-hover">
              <Link href="/auth/login">
                Acessar o Sistema Agora
              </Link>
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-white px-3 text-gray-500 font-medium">
                  Informações Legais
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 justify-center">
              <Button variant="outline" asChild className="flex-1 py-3 text-lg font-semibold border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out animate-pop-on-hover">
                <Link href="/privacy-policy.html">
                  Política de Privacidade
                </Link>
              </Button>

              <Button variant="outline" asChild className="flex-1 py-3 text-lg font-semibold border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out animate-pop-on-hover">
                <Link href="/terms-of-service.html">
                  Termos de Responsabilidade
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MyBimed. Todos os direitos reservados.</p>
        </footer>
      </div>
    </main>
  );
}
