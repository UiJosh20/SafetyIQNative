import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import * as Yup from "yup";
import { Formik } from "formik";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useFonts } from "expo-font";

const UserLogin = () => {
  const [fontsLoaded] = useFonts({
    "Kanit-Bold": require("./../assets/fonts/Kanit-Bold.ttf"),
    "Kanit-Regular": require("./../assets/fonts/Kanit-Regular.ttf"),
    "Kanit-Italic": require("./../assets/fonts/Kanit-Italic.ttf"),
    "Kanit-Light": require("./../assets/fonts/Kanit-Light.ttf"),
  });

  const backendUrl = "http://192.168.0.101:8000/signup";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  if (!fontsLoaded) {
    return null;
  }

  const SignupSchema = Yup.object().shape({
    callUpNo: Yup.string().required("Call Up No. is required"),
    password: Yup.string()
      .min(6, "Password is too short - should be 6 chars minimum.")
      .required("Password is required"),
  });

  const handleSignup = (values) => {
    axios
      .post(backendUrl, values)
      .then((response) => {
        if (response.status === 201) {
          router.push("fee");
        } else {
          router.push("signin");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const toggleSwitch = () => setIsSwitchOn((previousState) => !previousState);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in to your account</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Formik
          initialValues={{
            callUpNo: "",
            password: "",
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSignup}
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
                onChangeText={handleChange("callUpNo")}
                onBlur={handleBlur("callUpNo")}
                value={values.callUpNo}
                keyboardType="number-pad"
              />
              {errors.callUpNo && touched.callUpNo && (
                <Text style={styles.errorText}>{errors.callUpNo}</Text>
              )}

              <View style={styles.labelContainer1}>
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

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 10,
                  marginRight: 100,
                }}
              >
                <Switch
                  onValueChange={toggleSwitch}
                  value={isSwitchOn}
                  trackColor={{ false: "#ebebeb", true: "#02A652" }}
                  thumbColor={isSwitchOn ? "#ffff" : "grey"}
                  ios_backgroundColor="#3e3e3e"
                  style={{ marginTop: 10, marginBottom: 10 }}
                />
                <Text style={{ fontFamily: "Kanit-Regular", fontSize: 14 }}>
                  Remember me
                </Text>
              </View>
              <TouchableOpacity
                style={{ marginBottom: 10, width: "100%" }}
                onPress={handleSubmit}
              >
                <Text style={styles.signupbtn}>Sign in</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
        <Pressable>
          <Text
            style={{
              color: "#F6432C",
              textAlign: "center",
              fontSize: 16,
              fontFamily: "Kanit-Regular",
              marginTop: 20,
            }}
          >
            Forgot the password?
          </Text>
        </Pressable>
        <Pressable onPress={()=>{router.push('course')}} style={{ marginTop: 20 }}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              fontFamily: "Kanit-Regular",
              color: "#222222",
            }}
          >
            Don’t have an account?{" "}
            <Text style={{ color: "#02A652", fontFamily: 'Kanit-Bold' }}>Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </View>
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
    marginTop: 20,
  },
  labelContainer1: {
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
    paddingHorizontal: 17,
  },
  passwordInput: {
    flex: 1,
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
});
