import { Routes } from '@angular/router';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./project-list/project-list.component').then(c => c.ProjectListComponent)
  }
];
