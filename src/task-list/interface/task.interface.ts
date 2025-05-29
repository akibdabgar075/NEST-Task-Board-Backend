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

export interface CreateTaskListResponse {
  message: string;
  data: {
    task_id: number;
    list_name: string;
    position: number;
  };
}

export interface TaskListItem {
  task_id: number;
  list_name: string;
  position: number;
}

export interface TaskListResponse {
  message: string;
  data: TaskListItem | TaskListItem[];
}

export interface DeleteTaskResponse {
  message: string;
  data: {
    task_id: number;
  };
}
export interface UpdatedCountResponse {
  updatedCount: number;
}

export interface UpdateTaskNameResponse {
  message: string;
  data: {
    task_id: number;
    list_name: string;
    position: number;
  };
}
export interface UpdateTaskPositionItem {
  task_id: number;
  position: number;
}

export interface UpdateTaskPositionsDto {
  tasks: UpdateTaskPositionItem[];
}
