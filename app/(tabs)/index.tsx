import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  return (
    <>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require("../../assets/images/nueva.png")}
        style={styles.background}
        resizeMode="stretch"
      >
        <View style={styles.overlay}>
          <View style={styles.logoBox}>
            <View style={styles.logoCircle}>
              <Ionicons name="bus" size={42} color="#fff" />
            </View>

            <Text style={styles.logoText}>Angoma</Text>
            <Text style={styles.logoSubText}>TOURS</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>
              Descubre, disfruta{"\n"}y vive experiencias{" "}
              <Text style={styles.highlight}>únicas</Text>
            </Text>

            <Text style={styles.subtitle}>
              Turismo seguro en Cañete y Huancayo con la mejor atención.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(tabs)/tours")}
            >
              <View style={styles.buttonLeft}>
                <Ionicons name="briefcase" size={34} color="#fff" />
                <Text style={styles.primaryText}>Ver Tours</Text>
              </View>
              <Ionicons name="chevron-forward" size={30} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/(tabs)/customers")}
            >
              <View style={styles.buttonLeft}>
                <Ionicons name="people" size={36} color="#fff" />
                <Text style={styles.secondaryText}>Ver Clientes</Text>
              </View>
              <Ionicons name="chevron-forward" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={42}
                color="#FF8C1A"
              />
              <Text style={styles.featureText}>Viajes Seguros</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.featureItem}>
              <Ionicons name="headset-outline" size={42} color="#FF8C1A" />
              <Text style={styles.featureText}>Atención 24/7</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.featureItem}>
              <Ionicons name="star-outline" size={42} color="#FF8C1A" />
              <Text style={styles.featureText}>
                Experiencias{"\n"}Inolvidables
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(5, 14, 45, 0.25)",
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 35,
    justifyContent: "space-between",
  },

  logoBox: {
    alignItems: "center",
  },

  logoCircle: {
    width: 105,
    height: 105,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: "#FF9F1C",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(11,31,91,0.25)",
  },

  logoText: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "900",
    marginTop: 8,
    letterSpacing: 1,
  },

  logoSubText: {
    color: "#FF9F1C",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 10,
    marginLeft: 10,
  },

  content: {
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 43,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 54,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },

  highlight: {
    color: "#FF9F1C",
  },

  subtitle: {
    color: "#fff",
    fontSize: 22,
    lineHeight: 34,
    textAlign: "center",
    marginTop: 18,
    marginBottom: 34,
    maxWidth: 650,
  },

  primaryButton: {
    width: "100%",
    maxWidth: 570,
    backgroundColor: "#FF9F1C",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    shadowColor: "#FF9F1C",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    elevation: 6,
  },

  secondaryButton: {
    width: "100%",
    maxWidth: 570,
    backgroundColor: "rgba(5, 22, 70, 0.88)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  buttonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },

  primaryText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },

  secondaryText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },

  features: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  featureItem: {
    flex: 1,
    alignItems: "center",
  },

  featureText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },

  divider: {
    width: 1,
    height: 70,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
});
