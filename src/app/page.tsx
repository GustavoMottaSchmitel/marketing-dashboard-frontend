// src/app/page.tsx
import Link from 'next/link'
import { Button } from './components/ui/custom-elements';

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              MyBimed Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Gestão completa para sua clínica médica
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <Button asChild className="w-full" variant="primary">
              <Link href="/auth/login">
                Acessar o Sistema
              </Link>
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou
                </span>
              </div>
            </div>

            <Button variant="outline" asChild className="w-full">
              <Link href="/sobre">
                Conheça mais sobre
              </Link>
            </Button>
          </div>
        </div>

        <footer className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} MyBimed. Todos os direitos reservados.</p>
        </footer>
      </div>
    </main>
  );
}
