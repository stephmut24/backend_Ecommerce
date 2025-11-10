export interface BaseResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export interface PaginatedResponse {
  success: boolean;
  message: string;
  data: any[];
  pageNumber: number;
  pageSize: number;
  totalSize: number;
  errors?: string[];
}

export const createResponse = (
  success: boolean,
  message: string,
  data?: any,
  errors?: string[]
): BaseResponse => ({
  success,
  message,
  data,
  errors,
});

export const createPaginatedResponse = (
  success: boolean,
  message: string,
  data: any[],
  pageNumber: number,
  pageSize: number,
  totalSize: number,
  errors?: string[]
): PaginatedResponse => ({
  success,
  message,
  data,
  pageNumber,
  pageSize,
  totalSize,
  errors,
});