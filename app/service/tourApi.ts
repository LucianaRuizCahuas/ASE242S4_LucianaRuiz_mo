import axios from "axios";

const API = "http://192.168.1.53:8086/v1/api/tour-packages";

export const getTours = async (state: string = "A") => {
  const response = await axios.get(`${API}/state/${state}`);
  return response.data;
};

export const createTour = async (tour: any) => {
  const response = await axios.post(API, tour);
  return response.data;
};

export const updateTour = async (id: string, tour: any) => {
  const response = await axios.put(`${API}/${id}`, tour);
  return response.data;
};

export const deleteTour = async (id: string) => {
  const response = await axios.patch(`${API}/delete/${id}`);
  return response.data;
};

export const restoreTour = async (id: string) => {
  const response = await axios.patch(`${API}/restore/${id}`);
  return response.data;
};
