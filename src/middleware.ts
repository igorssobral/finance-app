import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login", "/registro", "/esqueci-senha", "/manifest.json"];
const PUBLIC_PREFIXES = ["/api/auth", "/.well-known", "/icons"];
const ADMIN_ONLY_ROUTES = ["/configuracoes/usuarios", "/configuracoes/auditoria"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isPublicRoute =
    PUBLIC_ROUTES.some((route) => nextUrl.pathname === route || nextUrl.pathname.startsWith(route)) ||
    PUBLIC_PREFIXES.some((prefix) => nextUrl.pathname.startsWith(prefix)) ||
    ["/sw.js", "/favicon.ico"].includes(nextUrl.pathname);

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
  // Ignora arquivos estáticos, assets públicos e manifests do app
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|webp|ico|json|js|css|txt)$).*)"],
};
