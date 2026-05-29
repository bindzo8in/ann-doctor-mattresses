// lib/route-matcher.ts

export function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(route + "/");
}

export function matchesExactRoute(pathname: string, route: string) {
  return pathname === route;
}
