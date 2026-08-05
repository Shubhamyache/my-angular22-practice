export const environment = {
  production: false,
  // Routed through the Angular CLI dev-server proxy (see proxy.conf.json) rather than the
  // backend's real https://localhost:7048 origin directly — the backend has no CORS middleware
  // configured yet (UIIntegrationInfo.md §2/§18), so same-origin via the proxy is the only way
  // the browser will allow these calls in local dev.
  apiUrl: '/api/v1',
  version: '1.0.0',
  appName: 'Employee Management System'
};
