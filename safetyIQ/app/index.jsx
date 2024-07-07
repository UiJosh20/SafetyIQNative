import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import CourseDetail from "../Components/CourseDetail";
import UserLogin from "../Components/UserLogin";

export default function index() {
  return (
    <View style={styles.container}>
      <UserLogin />
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
