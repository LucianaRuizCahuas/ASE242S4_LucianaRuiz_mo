import { API_PREFIX, apiClient } from "./apiConfig";

export const getCustomers = async (estado: boolean = true) => {
  const response = await apiClient.get(`${API_PREFIX}/customer/state/${estado}`);
  return response.data;
};

export const createCustomer = async (customer: any) => {
  const response = await apiClient.post(`${API_PREFIX}/customer`, customer);
  return response.data;
};

export const updateCustomer = async (id: string, customer: any) => {
  const response = await apiClient.put(`${API_PREFIX}/customer/${id}`, customer);
  return response.data;
};

export const deleteCustomer = async (id: string) => {
  const response = await apiClient.patch(`${API_PREFIX}/customer/delete/${id}`);
  return response.data;
};

export const restoreCustomer = async (id: string) => {
  const response = await apiClient.patch(`${API_PREFIX}/customer/restore/${id}`);
  return response.data;
};
