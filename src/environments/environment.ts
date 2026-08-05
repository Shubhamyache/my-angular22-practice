export const environment = {
  production: false,
  // Routed through the Angular CLI dev-server proxy (see proxy.conf.json) rather than the
  // backend's real https://localhost:7048 origin directly — the backend has no CORS middleware
  // configured yet (UIIntegrationInfo.md §2/§18), so same-origin via the proxy is the only way
  // the browser will allow these calls in local dev.
  apiUrl: '/api/v1',
  // Origin that serves static uploads (avatars — PartTwoUIIntegration.md §2). proxy.conf.json
  // now also proxies /uploads, so avatarUrl (a relative "/uploads/avatars/..." path) can be used
  // directly in <img [src]> without prefixing in dev. backendOrigin exists mainly so the same
  // <img [src]="backendOrigin + avatarUrl"> expression also works unchanged in prod, where
  // there's no dev-proxy and avatarUrl must be resolved against the real backend origin.
  backendOrigin: '',
  version: '1.0.0',
  appName: 'Employee Management System'
};
