import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFonts } from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { router } from "expo-router";

const UserRegister = () => {
  const [fontsLoaded, fontError] = useFonts({
    "Kanit-Bold": require("./../assets/fonts/Kanit-Bold.ttf"),
    "Kanit-Regular": require("./../assets/fonts/Kanit-Regular.ttf"),
    "Kanit-Italic": require("./../assets/fonts/Kanit-Italic.ttf"),
    "Kanit-Light": require("./../assets/fonts/Kanit-Light.ttf"),
  });
 const port = 101
  const backendUrl = `http://192.168.0.${port}:8000/signup`;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  if (!fontsLoaded && fontError) {
    console.log(fontError);
    return null;
  }

  const SignupSchema = Yup.object().shape({
    callUpNo: Yup.string().required("Call Up No. is required"),
    lastName: Yup.string(),
    firstName: Yup.string(),
    middleName: Yup.string(),
    telephoneNo: Yup.string().required("Telephone No. is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password is too short - should be 6 chars minimum.")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const handleSignup = (values) => {
    axios.post(backendUrl, values)
      .then((response) => {
        if(response.status === 201){
            router.push("fee");
        }else{
            router.push("signin");
        }
      })
      .catch((error) => {
        console.error(error);
       
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container} 
      behavior="padding"
      >
      <Text style={styles.title}>Registration</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        <Formik
          initialValues={{
            callUpNo: "",
            lastName: "",
            firstName: "",
            middleName: "",
            telephoneNo: "",
            email: "",
            password: "",
            confirmPassword: "",
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
                <Text style={styles.label}>Call Up No.</Text>
                <Text style={styles.asterisk}>*</Text>
              </View>
              <TextInput
                placeholder="Enter your call up No."
                style={styles.input}
                placeholderTextColor={"#A2A4A3"}
                cursorColor={"#000"}
                onChangeText={handleChange("callUpNo")}
                onBlur={handleBlur("callUpNo")}
                value={values.callUpNo}
                keyboardType="number-pad"
                maxLength={12}
                autofocus
              />
              {errors.callUpNo && touched.callUpNo && (
                <Text style={styles.errorText}>{errors.callUpNo}</Text>
              )}

              <View style={styles.labelContainer}>
                <Text style={styles.label}>Last Name</Text>
              </View>
              <TextInput
                placeholder="Enter your Last Name"
                style={styles.input}
                placeholderTextColor={"#A2A4A3"}
                cursorColor={"#000"}
                onChangeText={handleChange("lastName")}
                onBlur={handleBlur("lastName")}
                value={values.lastName}
              />
              {errors.lastName && touched.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}

              <View style={styles.labelContainer}>
                <Text style={styles.label}>First Name</Text>
              </View>
              <TextInput
                placeholder="Enter your First Name"
                style={styles.input}
                placeholderTextColor={"#A2A4A3"}
                cursorColor={"#000"}
                onChangeText={handleChange("firstName")}
                onBlur={handleBlur("firstName")}
                value={values.firstName}
              />
              {errors.firstName && touched.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}

              <View style={styles.labelContainer}>
                <Text style={styles.label}>Middle Name</Text>
              </View>
              <TextInput
                placeholder="Enter your Middle Name"
                style={styles.input}
                placeholderTextColor={"#A2A4A3"}
                cursorColor={"#000"}
                onChangeText={handleChange("middleName")}
                onBlur={handleBlur("middleName")}
                value={values.middleName}
              />
              {errors.middleName && touched.middleName && (
                <Text style={styles.errorText}>{errors.middleName}</Text>
              )}

              <View style={styles.labelContainer}>
                <Text style={styles.label}>Telephone No.</Text>
                <Text style={styles.asterisk}>*</Text>
              </View>
              <TextInput
                placeholder="Enter your Telephone No."
                style={styles.input}
                placeholderTextColor={"#A2A4A3"}
                cursorColor={"#000"}
                onChangeText={handleChange("telephoneNo")}
                onBlur={handleBlur("telephoneNo")}
                keyboardType="phone-pad"
                value={values.telephoneNo}
                maxLength={11}
                clearButtonMode="always"
              />
              {errors.telephoneNo && touched.telephoneNo && (
                <Text style={styles.errorText}>{errors.telephoneNo}</Text>
              )}

              <View style={styles.labelContainer}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.asterisk}>*</Text>
              </View>
              <TextInput
                placeholder="Enter your Email"
                style={styles.input}
                placeholderTextColor={"#A2A4A3"}
                cursorColor={"#000"}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
              />
              {errors.email && touched.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

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
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
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
              {errors.password && touched.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

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
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                />
                <TouchableOpacity
                  onPress={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                >
                  <Ionicons
                    name={confirmPasswordVisible ? "eye-off" : "eye"}
                    size={20}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && touched.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              <TouchableOpacity
                style={{ marginVertical: 10, marginBottom: 100, width: "100%" }}
                onPress={handleSubmit}
              >
                <Text style={styles.signupbtn}>Submit</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
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
                     