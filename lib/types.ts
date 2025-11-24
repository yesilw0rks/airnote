export interface Note {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  tags: string[];
  space: string;
  created_at: string;
  updated_at: string;
}

export type ViewMode = 'list' | 'detail' | 'edit' | 'create';
