import Link from 'next/link';
import { Button } from './components/ui/custom-elements';
import { SparklesIcon } from 'lucide-react'; 

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900 animate-fade-in">
      {/* Animação de fade-in para a página inteira */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-scale-up-hover {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .animate-scale-up-hover:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="w-full max-w-lg mx-auto text-center bg-white p-8 rounded-xl shadow-2xl border border-gray-100 animate-scale-up-hover">
        <div className="space-y-8">
          {/* Logo MyBimed - Simples e Profissional */}
          <div className="flex items-center justify-center mb-6">
            <SparklesIcon className="h-10 w-10 text-indigo-600 mr-3" />
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
              MyBimed
            </h1>
          </div>

          {/* Título e Descrição */}
          <div className="space-y-4">
            <p className="text-xl text-gray-700 leading-relaxed">
              Sua plataforma inteligente para gestão e otimização de marketing em clínicas médicas.
            </p>
            <p className="text-md text-gray-500">
              Transforme dados em resultados e impulsione o crescimento da sua clínica.
            </p>
          </div>

          {/* Botões Principais */}
          <div className="flex flex-col space-y-4 mt-8">
            <Button asChild className="w-full py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out animate-scale-up-hover">
              <Link href="/auth/login">
                Acessar o Sistema
              </Link>
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">
                  Ou
                </span>
              </div>
            </div>

            <Button variant="outline" asChild className="w-full py-3 text-lg font-semibold border-indigo-500 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out animate-scale-up-hover">
              <Link href="/privacy-policy.html">
                Política de Privacidade
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full py-3 text-lg font-semibold border-indigo-500 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out animate-scale-up-hover">
              <Link href="/terms-of-service.html">
                Termos de Responsabilidade
              </Link>
            </Button>
          </div>
        </div>

        {/* Rodapé */}
        <footer className="mt-12 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MyBimed. Todos os direitos reservados.</p>
        </footer>
      </div>
    </main>
  );
}
