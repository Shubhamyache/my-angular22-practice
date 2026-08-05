/** PartTwoUIIntegration.md §10. Render `text` as plain text — no server-side HTML
 *  sanitization is applied, so treat it as untrusted user input (no innerHTML). */
export interface TaskCommentDto {
  id: number;
  taskId: number;
  authorId: number;
  authorName: string;
  text: string;
  createdAt: string;
  /** Not yet returned by the backend — see PartFourBEChanges.md. Optimistically populated
   *  client-side from the mention picker on the comment the current user just posted, so their
   *  own mentions render highlighted immediately without waiting on a page reload. */
  mentionedEmployeeIds?: number[];
}

/**
 * PartFourBEChanges.md — `mentionedEmployeeIds` is a NEW field this backend endpoint doesn't
 * accept yet (today's contract is just `{ text: string }`, PartTwoUIIntegration.md §10). Sent
 * regardless: an unrecognized JSON property is normally ignored by ASP.NET's default model
 * binder rather than rejected, so this is forward-compatible and harmless to send today — the
 * mention autocomplete UI works right now, only the "send an email to the mentioned employee"
 * side effect is waiting on the backend to read this field.
 */
export interface CreateTaskCommentDto {
  text: string;
  mentionedEmployeeIds?: number[];
}
