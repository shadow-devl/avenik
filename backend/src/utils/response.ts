import { Response } from 'express';

/** Standard success response */
export function success<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/** Paginated success response */
export function paginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): void {
  res.status(200).json({
    success: true,
    message: 'Success',
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
}

/** Standard error response */
export function error(
  res: Response,
  message: string = 'Error',
  statusCode: number = 500,
  errors?: Record<string, string[]>
): void {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}
