import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getApiErrorMessage } from "../service/apiConfig";
import { login } from "../service/authApi";

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState("");

  const validateForm = () => {
    if (!username.trim()) {
      showMessage("Validacion", "Ingresa tu usuario o correo registrado");
      return false;
    }

    if (password.trim().length < 4) {
      showMessage("Validacion", "La clave debe tener al menos 4 caracteres");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const loginData = await login({
        usernameOrEmail: username.trim(),
        password: password.trim(),
      });

      const displayName =
        loginData?.user?.name ||
        loginData?.user?.username ||
        loginData?.username ||
        loginData?.email ||
        username.trim();

      setSessionUser(displayName);
      showMessage("Bienvenido", "Inicio de sesion correcto");
      router.push("/(tabs)/tours");
    } catch (error: any) {
      showMessage(
        "Error",
        getApiErrorMessage(
          error,
          "No se pudo iniciar sesion. Usa un usuario registrado en el backend.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={38} color="#fff" />
        </View>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Angoma Tours</Text>
      </View>

      {sessionUser ? (
        <View style={styles.sessionBox}>
          <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
          <Text style={styles.sessionText}>Sesion activa: {sessionUser}</Text>
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Usuario o correo registrado"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Clave"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading ? styles.disabledButton : null]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Ionicons name="log-in" size={20} color="#fff" />
        <Text style={styles.buttonText}>
          {loading ? "Validando..." : "Ingresar"}
        </Text>
      </TouchableOpacity>

      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>Acceso del backend</Text>
        <Text style={styles.demoText}>
          Ingresa con un usuario registrado. Despues del login, el token o la
          cookie de sesion se enviara automaticamente al consultar datos.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FA",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#0B1F5B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    color: "#0B1F5B",
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: "#FF8C1A",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  sessionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EAF7EC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  sessionText: {
    color: "#225B27",
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D8E0EC",
    padding: 14,
    marginBottom: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0B1F5B",
    borderRadius: 10,
    padding: 14,
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "900",
  },
  demoBox: {
    backgroundColor: "#FFF7EC",
    borderLeftWidth: 5,
    borderLeftColor: "#FF8C1A",
    borderRadius: 8,
    padding: 12,
    marginTop: 18,
  },
  demoTitle: {
    color: "#0B1F5B",
    fontWeight: "900",
    marginBottom: 4,
  },
  demoText: {
    color: "#334155",
  },
});
