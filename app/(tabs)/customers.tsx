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

import { useFocusEffect } from "expo-router";

import {
    createCustomer,
    deleteCustomer,
    getCustomers,
    restoreCustomer,
    updateCustomer,
} from "../service/customerApi";

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    documentType: "",
    nroDocument: "",
    phone: "",
    email: "",
  });

  const getId = (item: any) => item.id || item._id;

  const loadCustomers = async () => {
    try {
      const data = await getCustomers(!showDeleted);
      setCustomers(data);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los clientes");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [showDeleted]),
  );

  const clearForm = () => {
    setEditingId(null);
    setForm({
      firstName: "",
      lastName: "",
      documentType: "",
      nroDocument: "",
      phone: "",
      email: "",
    });
  };

  const saveCustomer = async () => {
    try {
      const customerData = {
        ...form,
        estado: true,
      };

      if (editingId) {
        await updateCustomer(editingId, customerData);
      } else {
        await createCustomer(customerData);
      }

      clearForm();
      loadCustomers();
      Alert.alert("Éxito", "Cliente guardado correctamente");
    } catch {
      Alert.alert("Error", "No se pudo guardar el cliente");
    }
  };

  const editCustomer = (item: any) => {
    setEditingId(getId(item));

    setForm({
      firstName: item.firstName || "",
      lastName: item.lastName || "",
      documentType: item.documentType || "",
      nroDocument: item.nroDocument || "",
      phone: item.phone || "",
      email: item.email || "",
    });
  };

  const removeCustomer = async (id: string) => {
    if (!id) {
      Alert.alert("Error", "No se encontró el ID del cliente");
      return;
    }

    const confirmar =
      Platform.OS === "web"
        ? window.confirm("¿Deseas eliminar este cliente?")
        : true;

    if (!confirmar) return;

    try {
      console.log("ELIMINANDO ID:", id);

      await deleteCustomer(id);

      await loadCustomers();

      Alert.alert("Eliminado", "Cliente eliminado correctamente");
    } catch (error) {
      console.log("ERROR AL ELIMINAR:", error);
      Alert.alert("Error", "No se pudo eliminar el cliente");
    }
  };

  const restoreCustomerHandler = async (id: string) => {
    if (!id) {
      Alert.alert("Error", "No se encontró el ID del cliente");
      return;
    }

    try {
      await restoreCustomer(id);
      loadCustomers();
      Alert.alert("Restaurado", "Cliente restaurado correctamente");
    } catch {
      Alert.alert("Error", "No se pudo restaurar el cliente");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {showDeleted ? "Clientes Eliminados" : "Clientes Activos"}
      </Text>

      {!showDeleted && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={form.firstName}
            onChangeText={(v) => setForm({ ...form, firstName: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="Apellido"
            value={form.lastName}
            onChangeText={(v) => setForm({ ...form, lastName: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="Tipo documento"
            value={form.documentType}
            onChangeText={(v) => setForm({ ...form, documentType: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="Número documento"
            value={form.nroDocument}
            onChangeText={(v) => setForm({ ...form, nroDocument: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="Correo"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />

          <TouchableOpacity style={styles.button} onPress={saveCustomer}>
            <Text style={styles.buttonText}>
              {editingId ? "Actualizar Cliente" : "Registrar Cliente"}
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
        style={showDeleted ? styles.button : styles.restoreButton}
        onPress={() => {
          clearForm();
          setShowDeleted(!showDeleted);
        }}
      >
        <Text style={styles.buttonText}>
          {showDeleted ? "Ver clientes activos" : "Ver clientes eliminados"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={customers}
        keyExtractor={(item) => String(getId(item))}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.firstName} {item.lastName}
            </Text>

            <Text>Documento: {item.documentType}</Text>
            <Text>N°: {item.nroDocument}</Text>
            <Text>Teléfono: {item.phone}</Text>
            <Text>Correo: {item.email}</Text>

            <View style={styles.actions}>
              {!showDeleted ? (
                <>
                  <TouchableOpacity
                    style={styles.edit}
                    onPress={() => editCustomer(item)}
                  >
                    <Text style={styles.actionText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.delete}
                    onPress={() => removeCustomer(getId(item))}
                  >
                    <Text style={styles.actionText}>Eliminar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.restore}
                  onPress={() => restoreCustomerHandler(getId(item))}
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F6FA",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0B1F5B",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#0B1F5B",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  restoreButton: {
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#777",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0B1F5B",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  edit: {
    flex: 1,
    backgroundColor: "#1976D2",
    padding: 10,
    borderRadius: 8,
  },
  delete: {
    flex: 1,
    backgroundColor: "#D32F2F",
    padding: 10,
    borderRadius: 8,
  },
  restore: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 8,
  },
  actionText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
