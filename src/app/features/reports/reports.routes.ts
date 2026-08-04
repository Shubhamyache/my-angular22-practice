import { Routes } from '@angular/router';

export const REPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./report-viewer/report-viewer.component').then(c => c.ReportViewerComponent)
  }
];
