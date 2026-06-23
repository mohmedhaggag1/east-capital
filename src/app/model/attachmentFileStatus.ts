export class AttachmentFileStatus {
  id?: number = 0;
  file_id?: number = 0;
  is_review?: boolean | false;
  review_username?: string = '';
  review_timestamp?: string = '';
  is_lock?: boolean | false;
  lock_username?: string = '';
  lock_timestamp?: string = '';
  notes?: string = '';
}