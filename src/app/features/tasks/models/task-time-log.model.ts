/**
 * Time log entries for a task — one row per "Log Time" submission, rather than the task just
 * carrying a single running `loggedHours` number with no history/description. Backend endpoint
 * (POST/GET /tasks/{id}/time-logs) doesn't exist yet — see PartNineBEChannges.md. The task's own
 * `loggedHours` total (task.model.ts) keeps being the sum the Time Tracking sidebar reads; the
 * backend is expected to keep that in sync whenever a log entry is added, same as today.
 */
export interface TaskTimeLogDto {
  id:           number;
  taskId:       number;
  employeeId:   number;
  employeeName: string;
  hours:        number;
  minutes:      number;
  description:  string;
  loggedAt:     string;
}

export interface LogTaskTimeDto {
  hours:       number;
  minutes:     number;
  description: string;
}
