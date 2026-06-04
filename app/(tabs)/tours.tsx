import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createTour,
  deleteTour,
  getTours,
  restoreTour,
  updateTour,
} from "../service/tourApi";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Destination = Coordinates & {
  name: string;
  keywords: string[];
};

const DESTINATIONS: Destination[] = [
  {
    name: "Lunahuana",
    latitude: -12.9608,
    longitude: -76.1425,
    keywords: ["lunahuana", "lunahuaná"],
  },
  {
    name: "Cerro Azul",
    latitude: -13.0276,
    longitude: -76.4786,
    keywords: ["cerro azul"],
  },
  {
    name: "San Vicente de Canete",
    latitude: -13.0751,
    longitude: -76.3853,
    keywords: ["canete", "cañete", "san vicente", "1505"],
  },
  {
    name: "Huancayo",
    latitude: -12.0651,
    longitude: -75.2049,
    keywords: ["huancayo", "1201"],
  },
  {
    name: "Azpitia",
    latitude: -12.6039,
    longitude: -76.5891,
    keywords: ["azpitia"],
  },
  {
    name: "Mala",
    latitude: -12.6583,
    longitude: -76.6308,
    keywords: ["mala"],
  },
];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getTourDestination = (item: any) => {
  const searchable = normalizeText(
    `${item.packageName || ""} ${item.description || ""} ${
      item.ubigeoCode || ""
    }`,
  );

  return DESTINATIONS.find((destination) =>
    destination.keywords.some((keyword) =>
      searchable.includes(normalizeText(keyword)),
    ),
  );
};

const calculateDistanceKm = (origin: Coordinates, destination: Coordinates) => {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const getErrorMessage = (error: any, fallback: string) => {
  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data;

  if (typeof backendMessage === "string") {
    return backendMessage;
  }

  return error?.message || fallback;
};

export default function ToursScreen() {
  const [tours, setTours] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState(
    "Activa tu ubicacion para calcular distancias.",
  );

  const [form, setForm] = useState({
    packageName: "",
    description: "",
    price: "",
    startDate: "",
    endDate: "",
    ubigeoCode: "",
    driverId: "",
  });

  const getId = (item: any) => item.id || item._id;

  const requestUserLocation = async () => {
    try {
      setLocationStatus("Solicitando ubicacion...");
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationStatus("Permiso de ubicacion denegado.");
        showMessage(
          "Ubicacion",
          "Activa el permiso de ubicacion para calcular la distancia a cada tour.",
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setLocationStatus("Ubicacion lista para calcular distancias.");
    } catch {
      setLocationStatus("No se pudo obtener la ubicacion actual.");
      showMessage("Error", "No se pudo obtener la ubicacion actual");
    }
  };

  useEffect(() => {
    requestUserLocation();
  }, []);

  const loadTours = useCallback(async () => {
    try {
      const data = await getTours(showDeleted ? "I" : "A");
      setTours(data);
    } catch {
      showMessage("Error", "No se pudieron cargar los tours");
    }
  }, [showDeleted]);

  useFocusEffect(
    useCallback(() => {
      loadTours();
    }, [loadTours]),
  );

  const clearForm = () => {
    setEditingId(null);
    setForm({
      packageName: "",
      description: "",
      price: "",
      startDate: "",
      endDate: "",
      ubigeoCode: "",
      driverId: "",
    });
  };

  const validateTourForm = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!form.packageName.trim()) {
      showMessage("Validacion", "Ingresa el nombre del paquete");
      return false;
    }

    if (!form.description.trim()) {
      showMessage("Validacion", "Ingresa una descripcion del tour");
      return false;
    }

    if (!form.price.trim() || Number.isNaN(Number(form.price))) {
      showMessage("Validacion", "Ingresa un precio valido");
      return false;
    }

    if (!dateRegex.test(form.startDate.trim())) {
      showMessage("Validacion", "La fecha de inicio debe tener formato YYYY-MM-DD. Ejemplo: 2026-06-05");
      return false;
    }

    if (!dateRegex.test(form.endDate.trim())) {
      showMessage("Validacion", "La fecha de fin debe tener formato YYYY-MM-DD. Ejemplo: 2026-06-06");
      return false;
    }

    if (!form.ubigeoCode.trim()) {
      showMessage("Validacion", "Ingresa el ubigeo del destino");
      return false;
    }

    if (!form.driverId.trim() || Number.isNaN(Number(form.driverId))) {
      showMessage("Validacion", "Ingresa un Driver ID numerico");
      return false;
    }

    return true;
  };

  const saveTour = async () => {
    if (!validateTourForm()) return;

    try {
      const tourData = {
        packageName: form.packageName.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        startDate: form.startDate.trim(),
        endDate: form.endDate.trim(),
        ubigeoCode: form.ubigeoCode.trim(),
        driverId: Number(form.driverId),
        state: "A",
      };

      if (editingId) {
        await updateTour(editingId, tourData);
      } else {
        await createTour(tourData);
      }

      clearForm();
      await loadTours();
      showMessage("Exito", "Tour guardado correctamente");
    } catch (error: any) {
      showMessage("Error", getErrorMessage(error, "No se pudo guardar el tour"));
    }
  };

  const editTour = (item: any) => {
    setEditingId(getId(item));

    setForm({
      packageName: item.packageName || "",
      description: item.description || "",
      price: String(item.price || ""),
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      ubigeoCode: item.ubigeoCode || "",
      driverId: String(item.driverId || ""),
    });
  };

  const removeTour = async (id: string) => {
    if (!id) {
      showMessage("Error", "No se encontro el ID del tour");
      return;
    }

    const confirmar =
      Platform.OS === "web" ? window.confirm("Deseas eliminar este tour?") : true;

    if (!confirmar) return;

    try {
      await deleteTour(id);
      await loadTours();
      showMessage("Eliminado", "Tour eliminado correctamente");
    } catch {
      showMessage("Error", "No se pudo eliminar el tour");
    }
  };

  const restoreTourHandler = async (id: string) => {
    if (!id) {
      showMessage("Error", "No se encontro el ID del tour");
      return;
    }

    try {
      await restoreTour(id);
      await loadTours();
      showMessage("Restaurado", "Tour restaurado correctamente");
    } catch {
      showMessage("Error", "No se pudo restaurar el tour");
    }
  };

  const openRoute = async (item: any) => {
    const destination = getTourDestination(item);
    const destinationQuery = destination
      ? `${destination.latitude},${destination.longitude}`
      : encodeURIComponent(`${item.packageName || "Destino turistico"} Peru`);

    const originQuery = userLocation
      ? `&origin=${userLocation.latitude},${userLocation.longitude}`
      : "";

    const url = `https://www.google.com/maps/dir/?api=1${originQuery}&destination=${destinationQuery}&travelmode=driving`;
    await Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {showDeleted ? "Tours Eliminados" : "Tour Packages"}
      </Text>

      {!showDeleted && (
        <View style={styles.locationBox}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={22} color="#FF8C1A" />
            <Text style={styles.locationTitle}>Geolocalizacion AP8</Text>
          </View>
          <Text style={styles.locationText}>{locationStatus}</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={requestUserLocation}
          >
            <Ionicons name="navigate" size={18} color="#fff" />
            <Text style={styles.locationButtonText}>Actualizar ubicacion</Text>
          </TouchableOpacity>
        </View>
      )}

      {!showDeleted && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nombre del paquete"
            value={form.packageName}
            onChangeText={(v) => setForm({ ...form, packageName: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="Descripcion"
            value={form.description}
            onChangeText={(v) => setForm({ ...form, description: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="Precio"
            keyboardType="numeric"
            value={form.price}
            onChangeText={(v) => setForm({ ...form, price: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="Fecha inicio: 2026-05-26"
            value={form.startDate}
            onChangeText={(v) => setForm({ ...form, startDate: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="Fecha fin: 2026-05-28"
            value={form.endDate}
            onChangeText={(v) => setForm({ ...form, endDate: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="Ubigeo Code"
            value={form.ubigeoCode}
            onChangeText={(v) => setForm({ ...form, ubigeoCode: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="Driver ID"
            keyboardType="numeric"
            value={form.driverId}
            onChangeText={(v) => setForm({ ...form, driverId: v })}
          />

          <TouchableOpacity style={styles.button} onPress={saveTour}>
            <Text style={styles.buttonText}>
              {editingId ? "Actualizar tour" : "Registrar tour"}
            </Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity style={styles.cancelButton} onPress={clearForm}>
              <Text style={styles.buttonText}>Cancelar edicion</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <TouchableOpacity
        style={showDeleted ? styles.button : styles.deletedButton}
        onPress={() => {
          clearForm();
          setShowDeleted(!showDeleted);
        }}
      >
        <Text style={styles.buttonText}>
          {showDeleted ? "Ver tours activos" : "Ver tours eliminados"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={tours}
        keyExtractor={(item) => String(getId(item))}
        renderItem={({ item }) => {
          const destination = getTourDestination(item);
          const distance =
            userLocation && destination
              ? calculateDistanceKm(userLocation, destination)
              : null;

          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.packageName}</Text>
              <Text>{item.description}</Text>
              <Text>Inicio: {String(item.startDate)}</Text>
              <Text>Fin: {String(item.endDate)}</Text>
              <Text>Ubigeo: {item.ubigeoCode}</Text>
              <Text>Driver ID: {item.driverId}</Text>
              <Text>Estado: {item.state}</Text>
              <Text style={styles.price}>S/ {String(item.price)}</Text>

              <View style={styles.geoPanel}>
                <Text style={styles.geoTitle}>
                  Destino: {destination?.name || "Por definir"}
                </Text>
                <Text style={styles.geoText}>
                  {distance
                    ? `Distancia desde tu ubicacion: ${distance.toFixed(1)} km`
                    : "Distancia disponible para destinos registrados."}
                </Text>
              </View>

              <View style={styles.actions}>
                {!showDeleted ? (
                  <>
                    <TouchableOpacity
                      style={styles.route}
                      onPress={() => openRoute(item)}
                    >
                      <Text style={styles.actionText}>Ruta Maps</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.edit}
                      onPress={() => editTour(item)}
                    >
                      <Text style={styles.actionText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.delete}
                      onPress={() => removeTour(getId(item))}
                    >
                      <Text style={styles.actionText}>Eliminar</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.restore}
                    onPress={() => restoreTourHandler(getId(item))}
                  >
                    <Text style={styles.actionText}>Restaurar</Text>
                  </TouchableOpacity>
                )}
              </View>
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#0B1F5B",
    marginBottom: 12,
  },
  locationBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: "#FF8C1A",
    padding: 12,
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  locationTitle: {
    color: "#0B1F5B",
    fontSize: 17,
    fontWeight: "bold",
  },
  locationText: {
    color: "#334155",
    marginBottom: 10,
  },
  locationButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0B1F5B",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
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
  cancelButton: {
    backgroundColor: "#777",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#0B1F5B" },
  price: { color: "#FF8C1A", fontWeight: "bold", fontSize: 17 },
  geoPanel: {
    backgroundColor: "#EEF6FF",
    borderRadius: 8,
    marginTop: 10,
    padding: 10,
  },
  geoTitle: {
    color: "#0B1F5B",
    fontWeight: "bold",
  },
  geoText: {
    color: "#334155",
    marginTop: 2,
  },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  route: { flex: 1, backgroundColor: "#0B1F5B", padding: 10, borderRadius: 8 },
  edit: { flex: 1, backgroundColor: "#1976D2", padding: 10, borderRadius: 8 },
  delete: { flex: 1, backgroundColor: "#D32F2F", padding: 10, borderRadius: 8 },
  restore: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 8,
  },
  actionText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
