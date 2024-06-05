import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { useFonts } from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";

const UserRegister = () => {
  const [fontsLoaded, fontError] = useFonts({
    "Kanit-Bold": require("./../assets/fonts/Kanit-Bold.ttf"),
    "Kanit-Regular": require("./../assets/fonts/Kanit-Regular.ttf"),
    "Kanit-Italic": require("./../assets/fonts/Kanit-Italic.ttf"),
    "Kanit-Light": require("./../assets/fonts/Kanit-Light.ttf"),
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  if (!fontsLoaded && fontError) {
    console.log(fontError);
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Call Up No.</Text>
          <Text style={styles.asterisk}>*</Text>
        </View>
        <TextInput
          placeholder="Enter your call up No."
          style={styles.input}
          placeholderTextColor={"#A2A4A3"}
          cursorColor={"#000"}
        />

        <View style={styles.labelContainer}>
          <Text style={styles.label}>Last Name</Text>
        </View>
        <TextInput
          placeholder="Enter your Last Name"
          style={styles.input}
          placeholderTextColor={"#A2A4A3"}
          cursorColor={"#000"}
        />

        <View style={styles.labelContainer}>
          <Text style={styles.label}>First Name</Text>
        </View>
        <TextInput
          placeholder="Enter your First Name"
          style={styles.input}
          placeholderTextColor={"#A2A4A3"}
          cursorColor={"#000"}
        />

        <View style={styles.labelContainer}>
          <Text style={styles.label}>Middle Name</Text>
        </View>
        <TextInput
          placeholder="Enter your Middle Name"
          style={styles.input}
          placeholderTextColor={"#A2A4A3"}
          cursorColor={"#000"}
        />

        <View style={styles.labelContainer}>
          <Text style={styles.label}>Telephone No.</Text>
          <Text style={styles.asterisk}>*</Text>
        </View>
        <TextInput
          placeholder="Enter your Telephone No."
          style={styles.input}
          placeholderTextColor={"#A2A4A3"}
          cursorColor={"#000"}
        />

        <View style={styles.labelContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.asterisk}>*</Text>
        </View>
        <TextInput
          placeholder="Enter your Email"
          style={styles.input}
          placeholderTextColor={"#A2A4A3"}
          cursorColor={"#000"}
        />

        <View style={styles.labelContainer}>
          <Text style={styles.label}>Password</Text>
          <Text style={styles.asterisk}>*</Text>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="********"
            style={[styles.input2, styles.passwordInput]}
            placeholderTextColor={"#A2A4A3"}
            cursorColor={"#000"}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.labelContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <Text style={styles.asterisk}>*</Text>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="********"
            style={[styles.input2, styles.passwordInput]}
            placeholderTextColor={"#A2A4A3"}
            cursorColor={"#000"}
            secureTextEntry={!confirmPasswordVisible}
          />
          <TouchableOpacity
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            <Ionicons
              name={confirmPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{ marginVertical: 10, marginBottom: 100, width: "100%" }}
        >
          <Text style={styles.signupbtn}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default UserRegister;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Kanit-Bold",
    fontSize: 24,
    textAlign: "center",
  },
  label: {
    fontFamily: "Kanit-Regular",
    fontSize: 14,
    marginVertical: 10,
    color: "#222222",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  asterisk: {
    color: "red",
    fontSize: 14,
    marginLeft: 5,
  },
  input: {
    backgroundColor: "#EBEBEB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 8,
    fontFamily: "Kanit-Regular",
    fontSize: 14,
    borderRadius: 10,
    color: "#000",
  },
  input2: {
    backgroundColor: "#EBEBEB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontFamily: "Kanit-Regular",
    fontSize: 14,
    borderRadius: 10,
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBEBEB",
    borderRadius: 10,
    // marginBottom: 8,
    paddingHorizontal: 17,
  },
  passwordInput: {
    flex: 1,
    // padding: 10,
  },
  signupbtn: {
    fontFamily: "Kanit-Regular",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    paddingVertical: 10,
    backgroundColor: "#C30000",
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
  },
});
