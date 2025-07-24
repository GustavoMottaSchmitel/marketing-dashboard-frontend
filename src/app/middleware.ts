// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de rotas que exigem autenticação
// Certifique-se de que todas as rotas do dashboard começam com /dashboard
const protectedRoutes = ['/dashboard'];

// Lista de rotas que devem ser acessíveis apenas por usuários NÃO autenticados
const publicOnlyRoutes = ['/', '/auth/login', '/sobre']; // Adicionado /sobre para sua rota pública

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;

  // Obtém o token dos cookies da requisição
  const token = request.cookies.get('token')?.value;

  // Consideramos o usuário autenticado se houver um token
  const isAuth = !!token;

  // Lógica para rotas que NÃO devem ser acessadas por usuários autenticados
  // Se o usuário está autenticado e tenta acessar uma rota pública (login, homepage),
  // redireciona para o dashboard.
  if (publicOnlyRoutes.includes(url) && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Lógica para rotas protegidas (que exigem autenticação)
  // Verifica se a URL atual começa com alguma das rotas protegidas
  const isProtectedRoute = protectedRoutes.some(route => url.startsWith(route));

  // Se a rota é protegida E o usuário NÃO está autenticado,
  // redireciona para a página de login, mantendo a URL original como callback.
  if (isProtectedRoute && !isAuth) {
    const callbackUrl = encodeURIComponent(url);
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url));
  }

  // Se nenhuma das condições de redirecionamento for atendida, continua a requisição normalmente
  return NextResponse.next();
}

// Configuração do matcher para definir quais rotas o middleware deve ser executado.
// Ele será executado em todas as rotas exceto as da lista.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)', // Aplica a todas as rotas exceto APIs, arquivos estáticos e de imagem do Next.js, e favicon.
    // O /sobre foi adicionado em publicOnlyRoutes e é uma rota regular, então será verificada.
  ],
};