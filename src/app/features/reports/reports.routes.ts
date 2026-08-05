import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const REPORT_ROUTES: Routes = [
  {
    // Employee role has zero access to the Reports controller (UIIntegrationInfo.md §4/§13).
    path: '',
    data: { roles: ['Admin', 'HR', 'Manager'] },
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./report-viewer/report-viewer.component').then(c => c.ReportViewerComponent)
  }
];
