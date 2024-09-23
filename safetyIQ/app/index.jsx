import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import UserLogin from "../Components/UserLogin";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Index() {
  const [isSplash, setIsSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        // User is logged in, navigate to the dashboard
        router.replace("/dashboard"); // Update the path to your dashboard route
      } else {
        // User is not logged in, show login
        setIsSplash(false);
      }
    };

    setIsSplash(true);
    setTimeout(() => {
      checkLoginStatus();
    }, 3500);
  }, []);

  return (
    <View style={styles.container}>
      {isSplash ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size={50} color={"#c30000"} />
        </View>
      ) : (
        <UserLogin />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
    width: "100%",
    backgroundColor: "#fff",
  },
});
