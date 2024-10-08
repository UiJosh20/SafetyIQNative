import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  Pressable,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useRouter } from "expo-router";
import * as Yup from "yup";
import { Formik } from "formik";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserLogin = () => {
  const backendUrl = "https://safetyiqnativebackend.onrender.com/login";
  const [ids, setID] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    "Kanit-Bold": require("./../assets/fonts/Kanit-Bold.ttf"),
    "Kanit-Regular": require("./../assets/fonts/Kanit-Regular.ttf"),
    "Kanit-Italic": require("./../assets/fonts/Kanit-Italic.ttf"),
    "Kanit-Light": require("./../assets/fonts/Kanit-Light.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  const LoginSchema = Yup.object().shape({
    identifier: Yup.string().required("Call Up No/FRP No is required"),
    password: Yup.string()
      .min(6, "Password is too short - should be 6 chars minimum.")
      .required("Password is required"),
  });

  const handleLogin = (values) => {
    setIsLoading(true);
    setTimeout(() => {
      axios
        .post(backendUrl, values)
        .then((response) => {
          if (response.data.message === "Login successful") {
            const firstName = response.data.user.firstName;
            const lastName = response.data.user.lastName;
            let userInfo = { firstName, lastName };
            const userId = response.data.user.user_id;

            const token = response.data.token;
            AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
            AsyncStorage.setItem("token", token);
            AsyncStorage.setItem("userId", JSON.stringify(userId))
              .then(() => {
                setIsLoading(false);
                router.replace("dashboard");
              })
              .catch((error) => {
                console.log("Failed to store user ID", error);
                setIsLoading(false);
              });
          } else {
            setIsLoading(false);
            router.push("index");
          }
        })
        .catch((error) => {
          if (error.message == "Request failed with status code 401") {
            Alert.alert("Invalid Login details, please check your details");
          }

          setIsLoading(false);
        });
    }, 2000);
  };

  const toggleSwitch = () => setIsSwitchOn((previousState) => !previousState);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Text style={styles.title}>Sign in to your account</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        <Formik
          initialValues={{
            identifier: "",
            password: "",
          }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Call Up No/FRP No</Text>
                <Text style={styles.asterisk}>*</Text>
              </View>
              <TextInput
                placeholder="Enter your Call Up No/FRP No."
                style={styles.input}
                placeholderTextColor={"#A2A4A3"}
                cursorColor={"#000"}
                onChangeText={handleChange("identifier")}
                onBlur={handleBlur("identifier")}
                value={values.identifier}
                keyboardType="number-pad"
                maxLength={12}
                autoFocus
              />
              {errors.identifier && touched.identifier && (
                <Text style={styles.errorText}>{errors.identifier}</Text>
              )}

              <View style={styles.labelContainer}>
                <Text style={styles.label}>Password</Text>
                <Text style={styles.asterisk}>*</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="********"
                  style={[styles.input, styles.passwordInput]}
                  placeholderTextColor={"#A2A4A3"}
                  cursorColor={"#000"}
                  secureTextEntry={!passwordVisible}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Ionicons
                    name={passwordVisible ? "eye" : "eye-off"}
                    size={20}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && touched.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <View style={styles.switchContainer}>
                <Switch
                  onValueChange={toggleSwitch}
                  value={isSwitchOn}
                  trackColor={{ false: "#ebebeb", true: "#02A652" }}
                  thumbColor={isSwitchOn ? "#ffff" : "grey"}
                  ios_backgroundColor="#3e3e3e"
                />
                <Text style={styles.switchText}>Remember me</Text>
              </View>
              <TouchableOpacity
                style={styles.signupButton}
                onPress={handleSubmit}
                disabled={isLoading} // Disable button when loading
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signupButtonText}>Sign in</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </Formik>
        <Pressable>
          <Text style={styles.forgotPasswordText}>Forgot the password?</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("course")}
          style={styles.signupLinkContainer}
        >
          <Text style={styles.signupLinkText}>
            Don’t have an account?{" "}
            <Text style={styles.signupLinkBoldText}>Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserLogin;

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
    marginVertical: 5,
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
    fontWeight: "bold",
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBEBEB",
    borderRadius: 10,
    paddingHorizontal: 17,
  },
  passwordInput: {
    flex: 1,
  },
  signupButton: {
    marginBottom: 10,
    width: "100%",
    backgroundColor: "#C30000",
    borderRadius: 10,
    marginTop: 20,
    padding: 7,
  },
  signupButtonText: {
    fontFamily: "Kanit-Regular",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    paddingVertical: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    marginRight: 100,
  },
  switchText: {
    fontFamily: "Kanit-Regular",
    fontSize: 14,
  },
  forgotPasswordText: {
    color: "#F6432C",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    marginTop: 20,
  },
  signupLinkContainer: {
    marginTop: 20,
  },
  signupLinkText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    color: "#222222",
  },
  signupLinkBoldText: {
    color: "#02A652",
    fontFamily: "Kanit-Bold",
  },
});
