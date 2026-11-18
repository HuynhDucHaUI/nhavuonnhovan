/** Only redirect to a normalized path within the admin area on this origin. */
export function adminReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || /[\\\u0000-\u001f\u007f]/.test(value)) return "/admin";
  try {
    const origin = "https://admin.invalid";
    const url = new URL(value, origin);
    if (url.origin !== origin || !/^\/admin(?:\/|$)/.test(url.pathname) || /^\/admin\/login(?:\/|$)/.test(url.pathname) || /%(?:2f|5c|00|0a|0d)/i.test(url.pathname)) return "/admin";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return "/admin"; }
}
