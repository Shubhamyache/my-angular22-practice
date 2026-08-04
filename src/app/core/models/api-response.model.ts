export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
  errors?: string[];
}

export interface PagedResponse<T> extends ApiResponse<T[]> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
