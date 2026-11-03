/**
 * Base URL used for links in outgoing emails. Set APP_URL in production
 * (e.g. https://hackday.example.com) — behind a proxy the request URL can be
 * an internal address.
 */
export function getLoginUrl(request: Request): string {
  const base = (process.env.APP_URL || new URL(request.url).origin).replace(/\/+$/, '');
  return `${base}/login`;
}
