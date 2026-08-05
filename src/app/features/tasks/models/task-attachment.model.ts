/** PartTwoUIIntegration.md §11. No `downloadUrl` field — attachments are deliberately not
 *  served via static files (unlike avatars), so the same task-visibility check applies to
 *  downloads. Always call the download endpoint directly (TaskAttachmentService.download()). */
export interface TaskAttachmentDto {
  id: number;
  taskId: number;
  fileName: string;
  fileSizeBytes: number;
  contentType: string;
  uploadedById: number;
  uploadedByName: string;
  uploadedAt: string;
}
