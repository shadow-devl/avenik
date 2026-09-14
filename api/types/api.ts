/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/** Paginated API response */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/** API error detail */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}
