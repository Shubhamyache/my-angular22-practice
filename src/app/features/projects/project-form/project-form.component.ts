/**
 * ═══════════════════════════════════════════════════════════════════
 * PROJECT FORM COMPONENT — Create & Edit with Reactive Forms
 * ═══════════════════════════════════════════════════════════════════
 *
 * REACTIVE FORMS EXPLAINED:
 * ──────────────────────────
 * Angular offers two form approaches:
 * 1. Template-Driven Forms (simpler, uses ngModel)
 * 2. Reactive Forms (more powerful, programmatic)
 *
 * We use REACTIVE FORMS because:
 * - More testable (can test without DOM)
 * - Type-safe with TypeScript
 * - Better for complex validation
 * - Easier to handle dynamic fields
 * - Predictable state management
 * - Enterprise-grade applications prefer this
 *
 * KEY CONCEPTS:
 * ──────────────
 * FormGroup    = Container for FormControls (represents entire form)
 * FormControl  = Single input field with value and validation
 * FormBuilder  = Helper service to create FormGroups
 * Validators   = Built-in or custom validation functions
 *
 * FORM STRUCTURE:
 * ────────────────
 *   form (FormGroup)
 *     ├── name (FormControl, required)
 *     ├── code (FormControl, required)
 *     ├── description (FormControl)
 *     ├── priority (FormControl, required)
 *     ├── managerId (FormControl, required)
 *     ├── startDate (FormControl, required)
 *     ├── endDate (FormControl, required)
 *     └── budget (FormControl, required, min: 1)
 *
 * VALIDATION:
 * ────────────
 * We use both built-in and custom validators:
 * - Validators.required     → Field must have value
 * - Validators.email        → Valid email format
 * - Validators.min(1)       → Number >= 1
 * - Validators.maxLength(n) → String length <= n
 * - Custom validators       → e.g., endDate > startDate
 *
 * TYPED FORMS (Angular 14+):
 * ───────────────────────────
 * FormGroup is now generic. We get IntelliSense and type checking:
 *
 *   form.get('name')?.value  // TypeScript knows this is string
 *
 * INTERVIEW QUESTIONS:
 * ─────────────────────
 * Q: "Reactive vs Template-Driven Forms?"
 * A: "Reactive: better for complex forms, testability, dynamic validation.
 *     Template-Driven: simpler, good for basic forms."
 *
 * Q: "Why use FormBuilder instead of new FormGroup()?"
 * A: "FormBuilder reduces boilerplate and provides cleaner syntax."
 *
 * Q: "How do you handle form validation errors?"
 * A: "Check control.invalid && control.touched, then display
 *     specific errors from control.errors object."
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { ProjectStore } from '../store/project.store';
import { CreateProjectDto, ProjectPriority } from '../models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './project-form.component.html'
})
export class ProjectFormComponent implements OnInit {
  // ═══════════════════════════════════════════════════════════════════
  // DEPENDENCY INJECTION
  // ═══════════════════════════════════════════════════════════════════
  private readonly fb             = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly store          = inject(ProjectStore);
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);

  // ═══════════════════════════════════════════════════════════════════
  // COMPONENT STATE
  // ═══════════════════════════════════════════════════════════════════
  protected readonly isEditMode = signal(false);
  protected readonly loading    = signal(false);
  protected readonly error      = signal<string | null>(null);
  private editId = 0;

  // Priority options for dropdown
  protected readonly priorities: ProjectPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  // Mock manager options (in real app, would come from API)
  protected readonly managers = [
    { id: 1, name: 'Sarah Johnson' },
    { id: 2, name: 'Michael Chen' },
    { id: 5, name: 'Jessica Martinez' },
    { id: 7, name: 'Amanda White' },
    { id: 10, name: 'Christopher Garcia' },
    { id: 13, name: 'Rachel Wilson' },
    { id: 16, name: 'Matthew Martinez' }
  ];

  // ═══════════════════════════════════════════════════════════════════
  // REACTIVE FORM DEFINITION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * FormBuilder creates FormGroup with less boilerplate.
   *
   * Syntax: [initialValue, validators]
   *
   * Alternative without FormBuilder:
   *   form = new FormGroup({
   *     name: new FormControl('', Validators.required),
   *     ...
   *   });
   */
  protected readonly form = this.fb.group({
    name:        ['', [Validators.required, Validators.maxLength(100)]],
    code:        ['', [Validators.required, Validators.maxLength(20)]],
    description: ['', Validators.maxLength(500)],
    priority:    ['Medium' as ProjectPriority, Validators.required],
    managerId:   [0, [Validators.required, Validators.min(1)]],
    startDate:   ['', Validators.required],
    endDate:     ['', Validators.required],
    budget:      [0, [Validators.required, Validators.min(1)]]
  });

  // ═══════════════════════════════════════════════════════════════════
  // LIFECYCLE HOOKS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * ngOnInit runs ONCE after component is created.
   *
   * Here we:
   * 1. Check if we're in edit mode (URL has :id param)
   * 2. If yes, fetch existing project and populate form
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editId = Number(id);
      this.loadProject();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Load project data for editing
   */
  private loadProject(): void {
    this.loading.set(true);
    this.projectService.getById(this.editId).subscribe({
      next: proj => {
        // patchValue updates only the fields we provide
        // setValue requires ALL fields
        this.form.patchValue({
          name:        proj.name,
          code:        proj.code,
          description: proj.description,
          priority:    proj.priority,
          managerId:   proj.managerId,
          startDate:   proj.startDate,
          endDate:     proj.endDate,
          budget:      proj.budget
        });
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  /**
   * Get a specific form control
   * Useful for template and validation checks
   */
  field(name: string) {
    return this.form.get(name);
  }

  /**
   * Check if field is invalid and has been touched
   * Used for showing validation errors in UI
   */
  isInvalid(name: string): boolean {
    const ctrl = this.field(name);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  /**
   * Get validation error message for a field
   */
  getErrorMessage(name: string): string {
    const ctrl = this.field(name);
    if (!ctrl || !ctrl.errors) return '';

    if (ctrl.errors['required']) return `${name} is required`;
    if (ctrl.errors['maxLength']) return `${name} is too long`;
    if (ctrl.errors['min']) return `${name} must be greater than 0`;
    if (ctrl.errors['email']) return 'Invalid email format';

    return 'Invalid value';
  }

  // ═══════════════════════════════════════════════════════════════════
  // FORM SUBMISSION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Handle form submission
   *
   * FLOW:
   * 1. Check if form is valid
   * 2. If not, mark all fields as touched (shows errors)
   * 3. Get form values with getRawValue()
   * 4. Build DTO (Data Transfer Object)
   * 5. Call service method (create or update)
   * 6. Update store
   * 7. Navigate back to list
   */
  onSubmit(): void {
    // Step 1: Validate
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Step 2: Get raw values
    // getRawValue() includes disabled fields
    // value only includes enabled fields
    const raw = this.form.getRawValue();

    // Step 3: Build DTO
    const dto: CreateProjectDto = {
      name:        raw.name        ?? '',
      code:        raw.code        ?? '',
      description: raw.description ?? '',
      priority:    raw.priority    ?? 'Medium',
      managerId:   raw.managerId   ?? 0,
      startDate:   raw.startDate   ?? '',
      endDate:     raw.endDate     ?? '',
      budget:      raw.budget      ?? 0
    };

    // Step 4: Determine operation (create vs update)
    const request$ = this.isEditMode()
      ? this.projectService.update(this.editId, dto)
      : this.projectService.create(dto);

    // Step 5: Execute and handle response
    request$.subscribe({
      next: project => {
        // Update store
        if (this.isEditMode()) {
          this.store.updateProject(project);
        } else {
          this.store.addProject(project);
        }

        // Navigate back to list
        this.router.navigate(['/projects']);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/projects']);
  }
}
