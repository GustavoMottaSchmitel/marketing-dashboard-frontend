// src/app/auth/login/page.tsx
import { Suspense } from 'react'; // Importar Suspense
import { LoginForm } from '../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">MyBimed</h1>
          <p className="mt-2 text-gray-400">
            Acesse o sistema de gestão de clínicas
          </p>
        </div>
        {/* Envolver LoginForm em um Suspense boundary */}
        <Suspense fallback={
          <div className="text-center text-gray-400">Carregando formulário...</div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
