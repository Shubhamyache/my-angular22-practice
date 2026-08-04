import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

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
  templateUrl: './notifications-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
