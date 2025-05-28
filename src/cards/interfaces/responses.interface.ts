export interface BaseResponse<T> {
  message: string;
  data: T;
}
export interface DeleteCardData {
  cardId: number;
}

export type DeleteCardResponse = BaseResponse<DeleteCardData>;

export interface CreateCardResponseData {
  card_id: number;
  title: string;
  task_id: number;
  position: number;
}

export type CreateCardResponse = BaseResponse<CreateCardResponseData>;

export interface UpdateCardResponseData {
  card_id: number;
  title: string;
  status?: string | null;
  position: number;
  taskId?: number | null;
  priority?: string | null;
  assigned_to?: number | null;
}
