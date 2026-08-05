import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NotificationPreferencesService } from '../services/notification-preferences.service';
import { NotificationPreferenceDto } from '../models/settings.model';

interface NotificationPref {
  id:      string;
  label:   string;
  detail:  string;
  email:   boolean;
  inApp:   boolean;
}

/** Initial render state before GET resolves — matches the backend's own self-seeding defaults
 *  exactly (PartTwoUIIntegration.md §6), so there's no visible flash/mismatch on first load. */
const DEFAULT_PREFS: NotificationPref[] = [
  { id: 'newEmp',    label: 'New Employee Added',     detail: 'When HR adds a new employee record',        email: true,  inApp: true  },
  { id: 'payroll',   label: 'Payroll Processed',      detail: 'When monthly payroll run completes',        email: true,  inApp: true  },
  { id: 'taskAssign',label: 'Task Assigned to You',   detail: 'When a task is assigned to your account',  email: false, inApp: true  },
  { id: 'projDue',   label: 'Project Due Soon',       detail: 'Projects ending within 7 days',            email: true,  inApp: true  },
  { id: 'rptReady',  label: 'Report Ready',           detail: 'When a generated report is available',     email: false, inApp: true  },
  { id: 'security',  label: 'Security Alerts',        detail: 'Unusual login activity or password change', email: true,  inApp: true  }
];

@Component({
  selector: 'app-notifications-settings',
  standalone: true,
  templateUrl: './notifications-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsSettingsComponent implements OnInit {
  private readonly notificationPreferencesService = inject(NotificationPreferencesService);

  protected readonly prefs   = signal<NotificationPref[]>(DEFAULT_PREFS);
  protected readonly loading = signal(true);
  protected readonly saving  = signal(false);
  protected readonly saved   = signal(false);
  protected readonly error   = signal<string | null>(null);

  ngOnInit(): void {
    this.notificationPreferencesService.getPreferences().subscribe({
      next: dtos => {
        this.prefs.update(list =>
          list.map(p => {
            const dto = dtos.find(d => d.eventKey === p.id);
            return dto ? { ...p, email: dto.email, inApp: dto.inApp } : p;
          })
        );
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  toggle(id: string, field: 'email' | 'inApp'): void {
    this.prefs.update(list =>
      list.map(p => p.id === id ? { ...p, [field]: !p[field] } : p)
    );
  }

  save(): void {
    this.saving.set(true);
    this.saved.set(false);

    const dtos: NotificationPreferenceDto[] = this.prefs().map(p => ({
      eventKey: p.id, email: p.email, inApp: p.inApp
    }));

    this.notificationPreferencesService.updatePreferences(dtos).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.saving.set(false);
      }
    });
  }
}
