import { Routes } from '@angular/router';

/**
 * TASKS feature routes — demonstrates nested child routes.
 *
 * /tasks         → TaskListComponent  (list view)
 * /tasks/board   → TaskBoardComponent (kanban view)
 *
 * Both live inside the same feature chunk that is lazy-loaded
 * when the user first navigates to /tasks.
 * After the initial load, switching between list and board
 * is instant — no network request needed.
 */
export const TASK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./task-list/task-list.component').then(c => c.TaskListComponent)
  },
  {
    path: 'board',
    loadComponent: () =>
      import('./task-board/task-board.component').then(c => c.TaskBoardComponent)
  }
];
