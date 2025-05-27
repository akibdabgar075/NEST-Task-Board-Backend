export interface TaskRows {
  task_id: number;
  user_id: number;
  list_name: string;
  task_position: number;
  card_id: number | null;
  created_by: number | null;
  card_title: string | null;
  card_description: string | null;
  due_date: Date | null;
  priority: string | null;
  status: string | null;
  card_position: number | null;
  assignee_to: number | null;
}

export interface TaskCardResult {
  task_id: number;
  user_id: number;
  list_name: string;
  position: number;
  cards: {
    card_id: number;
    created_by: number | null;
    title: string | null;
    description: string | null;
    due_date: Date | null;
    priority: string | null;
    status: string | null;
    assignee_to: number | null;
    position: number | null;
  }[];
}
