interface BaseApiResponse {
  success: boolean;
}

interface SuccessApiResponse<T> extends BaseApiResponse {
  success: true;
  data: T;
}

interface ErrorApiResponse extends BaseApiResponse {
  success: false;
  error: string;
}

type ApiResponse<T> = SuccessApiResponse<T> | ErrorApiResponse;

export type { ApiResponse };
