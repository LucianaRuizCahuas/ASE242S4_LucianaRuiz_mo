import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { useState } from 'react';

export default function TourPackageCRUD() {
  const [packages, setPackages] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 🔹 Modelo EXACTO del backend (en inglés)
  const [form, setForm] = useState({
    packageName: '',
    description: '',
    price: '',
    startDate: '',
    endDate: '',
    ubigeoCode: '',
    driverId: '',
    state: 'A',
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const clearForm = () => {
    setForm({
      packageName: '',
      description: '',
      price: '',
      startDate: '',
      endDate: '',
      ubigeoCode: '',
      driverId: '',
      state: 'A',
    });
    setEditingIndex(null);
  };

  const savePackage = () => {
    if (!form.packageName || !form.price) {
      Alert.alert('Error', 'El nombre del paquete y el precio son obligatorios');
      return;
    }

    if (editingIndex !== null) {
      const updated = [...packages];
      updated[editingIndex] = form;
      setPackages(updated);
      Alert.alert('Actualizado', 'Paquete actualizado correctamente');
    } else {
      setPackages([...packages, form]);
      Alert.alert('Guardado', 'Paquete creado correctamente');
    }

    clearForm();
  };

  const editPackage = (index: number) => {
    setForm(packages[index]);
    setEditingIndex(index);
  };

  const deletePackage = (index: number) => {
    const updated = packages.filter((_, i) => i !== index);
    setPackages(updated);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gestión de Paquetes Turísticos</Text>

      {/* 🔹 FORMULARIO EN ESPAÑOL */}
      <Text style={styles.label}>Nombre del Paquete</Text>
      <TextInput
        style={styles.input}
        value={form.packageName}
        onChangeText={(text) => handleChange('packageName', text)}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        value={form.description}
        onChangeText={(text) => handleChange('description', text)}
      />

      <Text style={styles.label}>Precio (S/)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.price}
        onChangeText={(text) => handleChange('price', text)}
      />

      <Text style={styles.label}>Fecha de Inicio (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={form.startDate}
        onChangeText={(text) => handleChange('startDate', text)}
      />

      <Text style={styles.label}>Fecha de Fin (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={form.endDate}
        onChangeText={(text) => handleChange('endDate', text)}
      />

      <Text style={styles.label}>Código Ubigeo</Text>
      <TextInput
        style={styles.input}
        value={form.ubigeoCode}
        onChangeText={(text) => handleChange('ubigeoCode', text)}
      />

      <Text style={styles.label}>ID del Conductor</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.driverId}
        onChangeText={(text) => handleChange('driverId', text)}
      />

      <TouchableOpacity style={styles.button} onPress={savePackage}>
        <Text style={styles.buttonText}>
          {editingIndex !== null ? 'Actualizar Paquete' : 'Guardar Paquete'}
        </Text>
      </TouchableOpacity>

      {/* 🔹 LISTADO */}
      <Text style={styles.subtitle}>Paquetes Registrados</Text>

      <FlatList
        data={packages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.packageName}</Text>
            <Text>Precio: S/ {item.price}</Text>
            <Text>Ubigeo: {item.ubigeoCode}</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => editPackage(index)}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deletePackage(index)}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f2f2f2' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
  label: { fontWeight: '600', marginTop: 10 },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#0077b6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  editBtn: {
    backgroundColor: '#f4a261',
    padding: 8,
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#e63946',
    padding: 8,
    borderRadius: 6,
  },
});