import { Component, signal } from '@angular/core';

interface NotificationPref {
  id:      string;
  label:   string;
  detail:  string;
  email:   boolean;
  inApp:   boolean;
}

@Component({
  selector: 'app-notifications-settings',
  standalone: true,
  template: `
    <h5 class="fw-bold mb-1">Notification Preferences</h5>
    <p class="text-muted small mb-4">Choose what you want to be notified about</p>

    <div class="table-responsive">
      <table class="table align-middle">
        <thead class="table-light">
          <tr>
            <th>Event</th>
            <th class="text-center">Email</th>
            <th class="text-center">In-App</th>
          </tr>
        </thead>
        <tbody>
          @for (pref of prefs(); track pref.id) {
            <tr>
              <td>
                <div class="fw-semibold small">{{ pref.label }}</div>
                <small class="text-muted">{{ pref.detail }}</small>
              </td>
              <td class="text-center">
                <div class="form-check d-flex justify-content-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    [checked]="pref.email"
                    (change)="toggle(pref.id, 'email')" />
                </div>
              </td>
              <td class="text-center">
                <div class="form-check d-flex justify-content-center">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    [checked]="pref.inApp"
                    (change)="toggle(pref.id, 'inApp')" />
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <button class="btn btn-primary mt-2">Save Preferences</button>
  `
})
export class NotificationsSettingsComponent {
  protected readonly prefs = signal<NotificationPref[]>([
    { id: 'newEmp',    label: 'New Employee Added',     detail: 'When HR adds a new employee record',        email: true,  inApp: true  },
    { id: 'payroll',   label: 'Payroll Processed',      detail: 'When monthly payroll run completes',        email: true,  inApp: true  },
    { id: 'taskAssign',label: 'Task Assigned to You',   detail: 'When a task is assigned to your account',  email: false, inApp: true  },
    { id: 'projDue',   label: 'Project Due Soon',       detail: 'Projects ending within 7 days',            email: true,  inApp: true  },
    { id: 'rptReady',  label: 'Report Ready',           detail: 'When a generated report is available',     email: false, inApp: true  },
    { id: 'security',  label: 'Security Alerts',        detail: 'Unusual login activity or password change', email: true,  inApp: true  }
  ]);

  toggle(id: string, field: 'email' | 'inApp'): void {
    this.prefs.update(list =>
      list.map(p => p.id === id ? { ...p, [field]: !p[field] } : p)
    );
  }
}
