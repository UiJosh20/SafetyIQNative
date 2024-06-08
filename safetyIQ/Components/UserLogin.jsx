import { Button, ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router'
import { useFonts } from '@expo-google-fonts/inter';
import * as Yup from "yup";
import { Formik } from 'formik';
import { Ionicons } from "@expo/vector-icons";
import axios from 'axios';

const UserLogin = () => {
 const [fontsLoaded, fontError] = useFonts({
   "Kanit-Bold": require("./../assets/fonts/Kanit-Bold.ttf"),
   "Kanit-Regular": require("./../assets/fonts/Kanit-Regular.ttf"),
   "Kanit-Italic": require("./../assets/fonts/Kanit-Italic.ttf"),
   "Kanit-Light": require("./../assets/fonts/Kanit-Light.ttf"),
 });

 const backendUrl = "http://192.168.0.101:8000/signup";
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
             />
             {errors.callUpNo && touched.callUpNo && (
               <Text style={styles.errorText}>{errors.callUpNo}</Text>
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


             <TouchableOpacity
               style={{ marginVertical: 10, marginBottom: 100, width: "100%" }}
               onPress={handleSubmit}
             >
               <Text style={styles.signupbtn}>Sign in</Text>
             </TouchableOpacity>
           </>
         )}
       </Formik>
     </ScrollView>
   </View>
 );
}

export default UserLogin

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
          