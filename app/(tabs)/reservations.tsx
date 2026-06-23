import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getApiErrorMessage } from "../service/apiConfig";
import { getCustomers } from "../service/customerApi";
import {
  createReservation,
  deleteReservation,
  getReservations,
} from "../service/reservationApi";
import { getTours } from "../service/tourApi";

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const getId = (item: any) => String(item?.id || item?._id || "");

const getCustomerName = (customer: any) =>
  `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim();

const today = () => new Date().toISOString().slice(0, 10);

export default function ReservationsScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);

  const [form, setForm] = useState({
    customerId: "",
    tourPackageId: "",
    quantity: "1",
    bookingDate: today(),
    bookingType: "V",
    status: "P",
    isPaid: "false",
    serviceExtra: "",
  });

  const selectedTour = useMemo(
    () => tours.find((tour) => getId(tour) === form.tourPackageId),
    [form.tourPackageId, tours],
  );

  const unitPrice = Number(selectedTour?.price || 0);
  const quantity = Number(form.quantity || 0);
  const total = unitPrice * quantity;

  const loadData = useCallback(async () => {
    try {
      const [customerData, tourData, reservationData] = await Promise.all([
        getCustomers(true),
        getTours("A"),
        getReservations(),
      ]);

      setCustomers(customerData);
      setTours(tourData);
      setReservations(reservationData);
    } catch (error: any) {
      showMessage(
        "Error",
        getApiErrorMessage(
          error,
          "No se pudieron cargar los datos de reservas",
        ),
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const validateReservation = () => {
    if (!form.customerId) {
      showMessage("Validacion", "Selecciona un cliente");
      return false;
    }

    if (!form.tourPackageId) {
      showMessage("Validacion", "Selecciona un tour");
      return false;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      showMessage("Validacion", "La cantidad debe ser un numero entero mayor a cero");
      return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.bookingDate)) {
      showMessage("Validacion", "La fecha debe tener formato YYYY-MM-DD");
      return false;
    }

    return true;
  };

  const clearForm = () => {
    setForm({
      customerId: "",
      tourPackageId: "",
      quantity: "1",
      bookingDate: today(),
      bookingType: "V",
      status: "P",
      isPaid: "false",
      serviceExtra: "",
    });
  };

  const saveReservation = async () => {
    if (!validateReservation()) return;

    try {
      await createReservation({
        customerId: form.customerId,
        tourPackageId: form.tourPackageId,
        bookingDate: `${form.bookingDate}T00:00:00`,
        bookingType: form.bookingType as "P" | "V",
        status: form.status as "P" | "C" | "R",
        isPaid: form.isPaid === "true",
        details: [
          {
            quantity,
            unitPrice,
            serviceExtra: form.serviceExtra.trim(),
          },
        ],
      });

      clearForm();
      await loadData();
      showMessage(
        "Exito",
        "Booking registrado correctamente con cabecera y detalle.",
      );
    } catch (error: any) {
      showMessage(
        "Error",
        getApiErrorMessage(error, "No se pudo registrar la reserva"),
      );
    }
  };

  const removeReservation = async (id: string) => {
    if (!id) {
      showMessage("Error", "No se encontro el ID de la reserva");
      return;
    }

    const confirm =
      Platform.OS === "web"
        ? window.confirm("Deseas anular esta reserva?")
        : true;

    if (!confirm) return;

    try {
      await deleteReservation(id);
      await loadData();
      showMessage("Anulada", "Reserva anulada correctamente");
    } catch (error: any) {
      showMessage(
        "Error",
        getApiErrorMessage(error, "No se pudo anular la reserva"),
      );
    }
  };

  const findCustomer = (id: string) =>
    customers.find((customer) => getId(customer) === id);

  const findTour = (id: string) => tours.find((tour) => getId(tour) === id);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookings</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Transaccion booking</Text>
        <Text style={styles.infoText}>
          Registra una cabecera con cliente y tour, mas un detalle con cantidad,
          precio unitario y servicio extra. El backend calcula subtotal y total.
        </Text>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.customerId}
          onValueChange={(value) =>
            setForm({ ...form, customerId: String(value) })
          }
        >
          <Picker.Item label="Seleccione cliente" value="" />
          {customers.map((customer) => (
            <Picker.Item
              key={getId(customer)}
              label={`${getCustomerName(customer)} - ${customer.nroDocument || ""}`}
              value={getId(customer)}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.tourPackageId}
          onValueChange={(value) =>
            setForm({ ...form, tourPackageId: String(value) })
          }
        >
          <Picker.Item label="Seleccione tour" value="" />
          {tours.map((tour) => (
            <Picker.Item
              key={getId(tour)}
              label={`${tour.packageName || "Tour"} - S/ ${tour.price || 0}`}
              value={getId(tour)}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Cantidad"
          keyboardType="numeric"
          value={form.quantity}
          onChangeText={(value) =>
            setForm({
              ...form,
              quantity: value.replace(/[^0-9]/g, ""),
            })
          }
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Fecha YYYY-MM-DD"
          value={form.bookingDate}
          onChangeText={(value) => setForm({ ...form, bookingDate: value })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.pickerContainer, styles.rowInput]}>
          <Picker
            selectedValue={form.bookingType}
            onValueChange={(value) =>
              setForm({ ...form, bookingType: String(value) })
            }
          >
            <Picker.Item label="Virtual" value="V" />
            <Picker.Item label="Presencial" value="P" />
          </Picker>
        </View>

        <View style={[styles.pickerContainer, styles.rowInput]}>
          <Picker
            selectedValue={form.isPaid}
            onValueChange={(value) =>
              setForm({ ...form, isPaid: String(value) })
            }
          >
            <Picker.Item label="Pendiente de pago" value="false" />
            <Picker.Item label="Pagado" value="true" />
          </Picker>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Servicio extra (opcional)"
        value={form.serviceExtra}
        onChangeText={(value) => setForm({ ...form, serviceExtra: value })}
      />

      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total estimado</Text>
        <Text style={styles.totalValue}>S/ {total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={saveReservation}>
        <Text style={styles.buttonText}>Registrar booking</Text>
      </TouchableOpacity>

      <FlatList
        data={reservations}
        keyExtractor={(item) => getId(item)}
        renderItem={({ item }) => {
          const customer = findCustomer(String(item.customerId));
          const tour = findTour(String(item.tourPackageId));
          const firstDetail = item.details?.[0];
          const itemQuantity =
            firstDetail?.quantity ||
            item.quantity ||
            item.details?.reduce(
              (sum: number, detail: any) => sum + Number(detail.quantity || 0),
              0,
            );

          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {tour?.packageName || item.tourName || "Tour reservado"}
              </Text>
              <Text>
                Cliente: {getCustomerName(customer) || item.customerName || item.customerId}
              </Text>
              <Text>Cantidad: {String(itemQuantity || 0)}</Text>
              <Text>Tipo: {item.bookingType === "P" ? "Presencial" : "Virtual"}</Text>
              <Text>Estado: {String(item.status || "P")}</Text>
              <Text>Pagado: {item.isPaid ? "Si" : "No"}</Text>
              <Text>Fecha: {String(item.bookingDate || "")}</Text>
              <Text style={styles.totalValue}>
                Total: S/ {Number(item.totalAmount || 0).toFixed(2)}
              </Text>

              <TouchableOpacity
                style={styles.delete}
                onPress={() => removeReservation(getId(item))}
              >
                <Text style={styles.actionText}>Anular</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F3F6FA" },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0B1F5B",
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: "#fff",
    borderLeftWidth: 5,
    borderLeftColor: "#FF8C1A",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoTitle: {
    color: "#0B1F5B",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
  },
  infoText: {
    color: "#334155",
    lineHeight: 20,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  rowInput: {
    flex: 1,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  totalBox: {
    backgroundColor: "#EEF6FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  totalLabel: {
    color: "#334155",
    fontWeight: "800",
  },
  totalValue: {
    color: "#FF8C1A",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2,
  },
  button: {
    backgroundColor: "#0B1F5B",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  deletedButton: {
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    color: "#0B1F5B",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  delete: {
    backgroundColor: "#D32F2F",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  restore: {
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  actionText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
  },
});
