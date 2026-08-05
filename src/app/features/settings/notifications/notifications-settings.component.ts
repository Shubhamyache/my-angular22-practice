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

/** Seed defaults — used until GET /users/me/notification-preferences (§6) exists; matches the
 *  defaults documented in FeaturesToImplement.md §6 exactly, so nothing changes here once the
 *  backend seeds real per-user rows. */
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
  protected readonly saving  = signal(false);
  protected readonly saved   = signal(false);
  /** True once GET is confirmed missing — see FeaturesToImplement.md §6. */
  protected readonly backendMissing = signal(false);

  ngOnInit(): void {
    this.notificationPreferencesService.getPreferences().subscribe({
      next: dtos => {
        this.prefs.update(list =>
          list.map(p => {
            const dto = dtos.find(d => d.eventKey === p.id);
            return dto ? { ...p, email: dto.email, inApp: dto.inApp } : p;
          })
        );
      },
      error: () => this.backendMissing.set(true)
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
      error: () => {
        this.backendMissing.set(true);
        this.saving.set(false);
      }
    });
  }
}
