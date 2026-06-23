import { Picker } from "@react-native-picker/picker";
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

import { getApiErrorMessage } from "../service/apiConfig";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  restoreCustomer,
  updateCustomer,
} from "../service/customerApi";

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    documentType: "",
    nroDocument: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    documentType: "",
    nroDocument: "",
    phone: "",
    email: "",
  });

  const getId = (item: any) => item.id || item._id;

  const validateOnlyLetters = (value: string) => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value);
  };

  const handleFirstNameChange = (value: string) => {
    setForm({ ...form, firstName: value });

    if (!validateOnlyLetters(value)) {
      setErrors({
        ...errors,
        firstName: "No se puede escribir números en el nombre",
      });
    } else {
      setErrors({
        ...errors,
        firstName: "",
      });
    }
  };

  const handleLastNameChange = (value: string) => {
    setForm({ ...form, lastName: value });

    if (!validateOnlyLetters(value)) {
      setErrors({
        ...errors,
        lastName: "No se puede escribir números en el apellido",
      });
    } else {
      setErrors({
        ...errors,
        lastName: "",
      });
    }
  };

  const loadCustomers = useCallback(async () => {
    try {
      const data = await getCustomers(!showDeleted);
      setCustomers(data);
    } catch (error: any) {
      console.log("ERROR AL CARGAR CLIENTES:", error);
      showMessage(
        "Error",
        getApiErrorMessage(error, "No se pudieron cargar los clientes"),
      );
    }
  }, [showDeleted]);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers]),
  );

  const normalizeSearch = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredCustomers = customers.filter((customer) => {
    const query = normalizeSearch(searchText.trim());

    if (!query) return true;

    const searchable = normalizeSearch(
      `${customer.firstName || ""} ${customer.lastName || ""} ${
        customer.documentType || ""
      } ${customer.nroDocument || ""} ${customer.phone || ""} ${
        customer.email || ""
      }`,
    );

    return searchable.includes(query);
  });

  const registerConsultation = (customer: any) => {
    setRecentCustomers((current) => {
      const customerId = getId(customer);
      const withoutRepeated = current.filter((item) => getId(item) !== customerId);
      return [customer, ...withoutRepeated].slice(0, 5);
    });

    showMessage(
      "Consulta registrada",
      `${customer.firstName} ${customer.lastName}\nDocumento: ${customer.nroDocument}\nTelefono: ${customer.phone}\nCorreo: ${customer.email}`,
    );
  };

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

    setErrors({
      firstName: "",
      lastName: "",
      documentType: "",
      nroDocument: "",
      phone: "",
      email: "",
    });
  };

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      documentType: "",
      nroDocument: "",
      phone: "",
      email: "",
    };

    let isValid = true;

    if (!form.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio";
      isValid = false;
    } else if (!validateOnlyLetters(form.firstName)) {
      newErrors.firstName = "No se puede escribir números en el nombre";
      isValid = false;
    } else if (form.firstName.trim().length < 3) {
      newErrors.firstName = "El nombre debe tener al menos 3 caracteres";
      isValid = false;
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
      isValid = false;
    } else if (!validateOnlyLetters(form.lastName)) {
      newErrors.lastName = "No se puede escribir números en el apellido";
      isValid = false;
    } else if (form.lastName.trim().length < 3) {
      newErrors.lastName = "El apellido debe tener al menos 3 caracteres";
      isValid = false;
    }

    if (!form.documentType.trim()) {
      newErrors.documentType = "Seleccione un tipo de documento";
      isValid = false;
    }

    if (!form.nroDocument.trim()) {
      newErrors.nroDocument = "El número de documento es obligatorio";
      isValid = false;
    } else if (
      form.documentType === "DNI" &&
      !/^\d{8}$/.test(form.nroDocument)
    ) {
      newErrors.nroDocument = "El DNI debe tener exactamente 8 dígitos";
      isValid = false;
    } else if (
      form.documentType === "CE" &&
      !/^\d{9,12}$/.test(form.nroDocument)
    ) {
      newErrors.nroDocument = "El CE debe tener entre 9 y 12 dígitos";
      isValid = false;
    }

    if (!form.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
      isValid = false;
    } else if (!/^\d{9}$/.test(form.phone)) {
      newErrors.phone = "El teléfono debe contener exactamente 9 dígitos";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) {
      newErrors.email = "El correo es obligatorio";
      isValid = false;
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Ingrese un correo electrónico válido";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      showMessage("Validación", "Corrige los campos marcados en rojo");
    }

    return isValid;
  };

  const saveCustomer = async () => {
    if (!validateForm()) return;

    try {
      const customerData = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        documentType: form.documentType.trim(),
        nroDocument: form.nroDocument.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        estado: true,
      };

      if (editingId) {
        await updateCustomer(editingId, customerData);
        showMessage("Éxito", "Cliente actualizado correctamente");
      } else {
        await createCustomer(customerData);
        showMessage("Éxito", "Cliente registrado correctamente");
      }

      clearForm();
      await loadCustomers();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo guardar el cliente";

      showMessage("Error", message);
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
      showMessage("Error", "No se encontró el ID del cliente");
      return;
    }

    const confirmar =
      Platform.OS === "web"
        ? window.confirm("¿Deseas eliminar este cliente?")
        : true;

    if (!confirmar) return;

    try {
      await deleteCustomer(id);
      await loadCustomers();
      showMessage("Eliminado", "Cliente eliminado correctamente");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo eliminar el cliente";

      showMessage("Error", message);
    }
  };

  const restoreCustomerHandler = async (id: string) => {
    if (!id) {
      showMessage("Error", "No se encontró el ID del cliente");
      return;
    }

    try {
      await restoreCustomer(id);
      await loadCustomers();
      showMessage("Restaurado", "Cliente restaurado correctamente");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo restaurar el cliente";

      showMessage("Error", message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {showDeleted ? "Clientes Eliminados" : "Clientes Activos"}
      </Text>

      {!showDeleted && (
        <>
          <View style={styles.searchBox}>
            <Text style={styles.searchTitle}>Busqueda inteligente</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, documento, telefono o correo"
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
            />
            <Text style={styles.searchHelp}>
              Resultados: {filteredCustomers.length} de {customers.length}
            </Text>
          </View>

          {recentCustomers.length > 0 && (
            <View style={styles.historyBox}>
              <Text style={styles.searchTitle}>Historial de consultas</Text>
              {recentCustomers.map((customer) => (
                <TouchableOpacity
                  key={String(getId(customer))}
                  style={styles.historyItem}
                  onPress={() => registerConsultation(customer)}
                >
                  <Text style={styles.historyName}>
                    {customer.firstName} {customer.lastName}
                  </Text>
                  <Text style={styles.historyDetail}>
                    {customer.nroDocument} - {customer.phone}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TextInput
            style={[styles.input, errors.firstName ? styles.inputError : null]}
            placeholder="Nombre"
            value={form.firstName}
            onChangeText={handleFirstNameChange}
          />
          {errors.firstName ? (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          ) : null}

          <TextInput
            style={[styles.input, errors.lastName ? styles.inputError : null]}
            placeholder="Apellido"
            value={form.lastName}
            onChangeText={handleLastNameChange}
          />
          {errors.lastName ? (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          ) : null}

          <View
            style={[
              styles.pickerContainer,
              errors.documentType ? styles.inputError : null,
            ]}
          >
            <Picker
              selectedValue={form.documentType}
              onValueChange={(value) => {
                setForm({
                  ...form,
                  documentType: value,
                  nroDocument: "",
                });

                setErrors({
                  ...errors,
                  documentType: "",
                  nroDocument: "",
                });
              }}
            >
              <Picker.Item label="Seleccione documento" value="" />
              <Picker.Item label="DNI" value="DNI" />
              <Picker.Item label="CE - Carnet de Extranjería" value="CE" />
            </Picker>
          </View>
          {errors.documentType ? (
            <Text style={styles.errorText}>{errors.documentType}</Text>
          ) : null}

          <TextInput
            style={[
              styles.input,
              errors.nroDocument ? styles.inputError : null,
            ]}
            placeholder={
              form.documentType === "DNI"
                ? "Número de DNI"
                : form.documentType === "CE"
                  ? "Número de Carnet de Extranjería"
                  : "Número documento"
            }
            value={form.nroDocument}
            keyboardType="numeric"
            maxLength={form.documentType === "DNI" ? 8 : 12}
            onChangeText={(v) => {
              setForm({
                ...form,
                nroDocument: v.replace(/[^0-9]/g, ""),
              });
              setErrors({ ...errors, nroDocument: "" });
            }}
          />
          {errors.nroDocument ? (
            <Text style={styles.errorText}>{errors.nroDocument}</Text>
          ) : null}

          <TextInput
            style={[styles.input, errors.phone ? styles.inputError : null]}
            placeholder="Teléfono"
            value={form.phone}
            keyboardType="phone-pad"
            maxLength={9}
            onChangeText={(v) => {
              setForm({
                ...form,
                phone: v.replace(/[^0-9]/g, ""),
              });
              setErrors({ ...errors, phone: "" });
            }}
          />
          {errors.phone ? (
            <Text style={styles.errorText}>{errors.phone}</Text>
          ) : null}

          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            placeholder="Correo"
            value={form.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(v) => {
              setForm({ ...form, email: v });
              setErrors({ ...errors, email: "" });
            }}
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}

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
        data={filteredCustomers}
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
                    style={styles.consult}
                    onPress={() => registerConsultation(item)}
                  >
                    <Text style={styles.actionText}>Consultar</Text>
                  </TouchableOpacity>

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
  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#FF8C1A",
  },
  searchTitle: {
    color: "#0B1F5B",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: "#F3F6FA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8E0EC",
  },
  searchHelp: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 8,
  },
  historyBox: {
    backgroundColor: "#EEF6FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  historyItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  historyName: {
    color: "#0B1F5B",
    fontWeight: "bold",
  },
  historyDetail: {
    color: "#334155",
    marginTop: 2,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#fff",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#fff",
    overflow: "hidden",
  },
  inputError: {
    borderColor: "#D32F2F",
    borderWidth: 2,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#0B1F5B",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 5,
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
  consult: {
    flex: 1,
    backgroundColor: "#0B1F5B",
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
