import { API_PREFIX, apiClient } from "./apiConfig";

export type ReservationPayload = {
  customerId: string;
  tourPackageId: string;
  bookingDate: string;
  bookingType: "P" | "V";
  status: "P" | "C" | "R";
  isPaid: boolean;
  details: {
    quantity: number;
    unitPrice: number;
    serviceExtra: string;
  }[];
};

export const getReservations = async () => {
  const response = await apiClient.get(`${API_PREFIX}/booking`);
  return response.data;
};

export const createReservation = async (reservation: ReservationPayload) => {
  const response = await apiClient.post(
    `${API_PREFIX}/booking/transaction`,
    reservation,
  );
  return response.data;
};

export const deleteReservation = async (id: string) => {
  const response = await apiClient.patch(`${API_PREFIX}/booking/delete/${id}`);
  return response.data;
};

export const restoreReservation = async (id: string) => {
  const response = await apiClient.patch(`${API_PREFIX}/booking/restore/${id}`);
  return response.data;
};
