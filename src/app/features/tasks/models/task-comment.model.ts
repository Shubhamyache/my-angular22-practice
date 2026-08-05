/** PartTwoUIIntegration.md §10. Render `text` as plain text — no server-side HTML
 *  sanitization is applied, so treat it as untrusted user input (no innerHTML). */
export interface TaskCommentDto {
  id: number;
  taskId: number;
  authorId: number;
  authorName: string;
  text: string;
  createdAt: string;
}
