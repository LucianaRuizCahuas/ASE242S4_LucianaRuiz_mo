import axios from "axios";

const API = "http://192.168.1.53:8086/v1/api/customer";

export const getCustomers = async (estado: boolean = true) => {
  const response = await axios.get(`${API}/state/${estado}`);
  return response.data;
};

export const createCustomer = async (customer: any) => {
  const response = await axios.post(API, customer);
  return response.data;
};

export const updateCustomer = async (id: string, customer: any) => {
  const response = await axios.put(`${API}/${id}`, customer);
  return response.data;
};

export const deleteCustomer = async (id: string) => {
  const response = await axios.patch(`${API}/delete/${id}`);
  return response.data;
};

export const restoreCustomer = async (id: string) => {
  const response = await axios.patch(`${API}/restore/${id}`);
  return response.data;
};
