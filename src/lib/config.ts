/** Admin console route slug — resolved from env at build time.
 *  The placeholder default must never reach production; the real slug
 *  is set via VITE_ADMIN_ROUTE_SLUG and kept out of docs and chat logs. */
export const ADMIN_SLUG: string =
  import.meta.env.VITE_ADMIN_ROUTE_SLUG ?? "system-console";

export const ADMIN_ACCESS_PATH = `/${ADMIN_SLUG}/access`;
export const ADMIN_HOME_PATH = `/${ADMIN_SLUG}/dashboard`;

export const WHATSAPP_SUPPORT = "https://wa.me/15551234567?text=Hi%20GeoGrid%20support";

export const APP_NAME = "GeoGrid";