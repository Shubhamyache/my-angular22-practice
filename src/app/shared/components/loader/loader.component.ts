import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status" style="width:2.5rem;height:2.5rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `
})
export class LoaderComponent {}
