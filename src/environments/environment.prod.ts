export const environment = {
  production: true,
  // Fill in once the backend is deployed. Production also requires the backend to add
  // AddCors/UseCors allow-listing this app's origin (UIIntegrationInfo.md §2/§18) — there is
  // no dev-proxy equivalent workaround in a production build.
  apiUrl: 'https://api.yourcompany.com/api/v1',
  // Same origin as apiUrl but WITHOUT the /api/v1 suffix — static uploads (avatars,
  // PartTwoUIIntegration.md §2) are served from the backend's root, not under /api/v1.
  backendOrigin: 'https://api.yourcompany.com',
  version: '1.0.0',
  appName: 'Employee Management System'
};
