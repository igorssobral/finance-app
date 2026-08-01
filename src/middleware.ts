import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login", "/registro", "/esqueci-senha"];
const ADMIN_ONLY_ROUTES = ["/configuracoes/usuarios", "/configuracoes/auditoria"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  // Não autenticado tentando acessar rota privada -> redireciona para login
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Autenticado tentando acessar login/registro -> manda para o dashboard
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  // Áreas restritas a Administrador (ex: gestão de usuários da família, auditoria)
  const isAdminRoute = ADMIN_ONLY_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route),
  );
  if (isAdminRoute && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  // Convidados têm acesso somente leitura — bloqueia rotas de escrita conhecidas
  const isMutationRoute = nextUrl.pathname.match(
    /\/(transacoes|categorias|contas|cartoes|metas|investimentos|orcamentos)\/(novo|editar)/,
  );
  if (isMutationRoute && req.auth?.user?.role === "GUEST") {
    return NextResponse.redirect(new URL("/dashboard?erro=sem-permissao", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Ignora arquivos estáticos, assets do Next, rotas de API e os arquivos
  // públicos do PWA (manifest.json, sw.js) — nenhum deles deve passar pela
  // checagem de autenticação de página.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};