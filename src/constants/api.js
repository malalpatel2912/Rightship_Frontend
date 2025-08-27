export const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/upload`,
  EMPLOYEE: {
    GET: `${API_BASE_URL}/employee/get`,
    UPDATE: `${API_BASE_URL}/employee/update`,
  }
}; 