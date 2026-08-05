/**
 * PartTwoUIIntegration.md §9. `link` is a relative Angular route to deep-link to on click
 * (e.g. "/tasks/42"), or null for notifications with no natural destination.
 *
 * Known gap (see PartThreeBEChangesNeeded.md): the backend's Notification entity has an
 * internal severity field (Success/Danger/Warning/Info) that isn't exposed on this DTO yet, so
 * there's no signal here to color-code notifications by severity — every notification renders
 * uniformly for now.
 */
export interface NotificationDto {
  id: number;
  eventKey: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListFilter {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}
