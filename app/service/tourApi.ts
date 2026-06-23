import { API_PREFIX, apiClient } from "./apiConfig";

export const getTours = async (state: string = "A") => {
  const response = await apiClient.get(`${API_PREFIX}/tour-packages/state/${state}`);
  return response.data;
};

export const createTour = async (tour: any) => {
  const response = await apiClient.post(`${API_PREFIX}/tour-packages`, tour);
  return response.data;
};

export const updateTour = async (id: string, tour: any) => {
  const response = await apiClient.put(`${API_PREFIX}/tour-packages/${id}`, tour);
  return response.data;
};

export const deleteTour = async (id: string) => {
  const response = await apiClient.patch(`${API_PREFIX}/tour-packages/delete/${id}`);
  return response.data;
};

export const restoreTour = async (id: string) => {
  const response = await apiClient.patch(`${API_PREFIX}/tour-packages/restore/${id}`);
  return response.data;
};
