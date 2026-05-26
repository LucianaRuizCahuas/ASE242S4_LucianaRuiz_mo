import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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

import {
    createTour,
    deleteTour,
    getTours,
    restoreTour,
    updateTour,
} from "../service/tourApi";

export default function ToursScreen() {
  const [tours, setTours] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

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

  const loadTours = async () => {
    try {
      const data = await getTours(showDeleted ? "I" : "A");
      setTours(data);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los tours");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTours();
    }, [showDeleted]),
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

  const saveTour = async () => {
    try {
      const tourData = {
        packageName: form.packageName,
        description: form.description,
        price: Number(form.price),
        startDate: form.startDate,
        endDate: form.endDate,
        ubigeoCode: form.ubigeoCode,
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
      Alert.alert("Éxito", "Tour guardado correctamente");
    } catch {
      Alert.alert("Error", "No se pudo guardar el tour");
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
      Alert.alert("Error", "No se encontró el ID del tour");
      return;
    }

    const confirmar =
      Platform.OS === "web"
        ? window.confirm("¿Deseas eliminar este tour?")
        : true;

    if (!confirmar) return;

    try {
      await deleteTour(id);
      await loadTours();
      Alert.alert("Eliminado", "Tour eliminado correctamente");
    } catch {
      Alert.alert("Error", "No se pudo eliminar el tour");
    }
  };

  const restoreTourHandler = async (id: string) => {
    if (!id) {
      Alert.alert("Error", "No se encontró el ID del tour");
      return;
    }

    try {
      await restoreTour(id);
      await loadTours();
      Alert.alert("Restaurado", "Tour restaurado correctamente");
    } catch {
      Alert.alert("Error", "No se pudo restaurar el tour");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {showDeleted ? "Tours Eliminados" : "Tour Packages"}
      </Text>

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
            placeholder="Descripción"
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
              <Text style={styles.buttonText}>Cancelar edición</Text>
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
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.packageName}</Text>
            <Text>{item.description}</Text>
            <Text>Inicio: {String(item.startDate)}</Text>
            <Text>Fin: {String(item.endDate)}</Text>
            <Text>Ubigeo: {item.ubigeoCode}</Text>
            <Text>Driver ID: {item.driverId}</Text>
            <Text>Estado: {item.state}</Text>
            <Text style={styles.price}>S/ {String(item.price)}</Text>

            <View style={styles.actions}>
              {!showDeleted ? (
                <>
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
        )}
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
    borderRadius: 12,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#0B1F5B" },
  price: { color: "#FF8C1A", fontWeight: "bold", fontSize: 17 },
  actions: { flexDirection: "row", gap: 10, marginTop: 10 },
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
