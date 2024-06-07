import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProgramFee = () => {
  const [fontsLoaded, fontError] = useFonts({
    "Kanit-Bold": require("./../assets/fonts/Kanit-Bold.ttf"),
    "Kanit-Regular": require("./../assets/fonts/Kanit-Regular.ttf"),
    "Kanit-Italic": require("./../assets/fonts/Kanit-Italic.ttf"),
    "Kanit-Light": require("./../assets/fonts/Kanit-Light.ttf"),
  });

  const [courseName, setCourseName] = useState("");
  const [coursePrice, setCoursePrice] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("courseName")
      .then((savedCourseName) => {
        if (savedCourseName) {
          setCourseName(savedCourseName);
        }
        return AsyncStorage.getItem("coursePrice");
      })
      .then((savedCoursePrice) => {
        if (savedCoursePrice) {
          setCoursePrice(savedCoursePrice);
        }
      })
      .catch((error) => {
        console.error("Failed to load the course details:", error);
      });
  }, []);

  if (!fontsLoaded && fontError) {
    console.log(fontError);
    return null;
  }

  return (
    <View>
      <Text style={styles.title}>Program Fee</Text>

      <View style={styles.coursecon}>
        <Text style={styles.courseDetail}>
          Your program fee is {coursePrice} Your login details will forwarded
          after payment.
        </Text>
        <Text style={styles.courseDetail2}>
          You can pay through any of the payment options below:
        </Text>
      </View>

      <View style={styles.paymentbtn}>
        <TouchableOpacity style={styles.paybtn}>
          <Text style={styles.paybtntext}>Bank Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.paybtn]}>
          <Text style={styles.paybtntext}>Debit Card</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProgramFee;

const styles = StyleSheet.create({
  title: {
    fontFamily: "Kanit-Bold",
    fontSize: 24,
    textAlign: "center",
    marginVertical: 20,
  },
  courseDetail: {
    fontFamily: "Kanit-Light",
    fontSize: 12,
    color: "#6A6A6A",
  },
  courseDetail2: {
    fontFamily: "Kanit-Light",
    fontSize: 12,
    color: "#6A6A6A",
    marginVertical: 10,
  },
  coursecon: {
    marginTop: 10,
    paddingHorizontal: 17,
  },
  paybtntext: {
    color: "#C30000",
    fontFamily: "Kanit-Bold",
    fontSize: 18,
    textAlign: "center",
  },
  paymentbtn:{
    paddingHorizontal: 17,
    marginTop: 30,
  },
  paybtn: {
    width: "100%",
    padding: 10,
    marginVertical: 7,
    backgroundColor: "#fff", 
    borderRadius: 5, 
    shadowColor: "#000",
    shadowOffset: {
      width: 0, 
      height: 2, 
    },
    shadowOpacity: 0.5, 
    shadowRadius: 7, 
    elevation: 7,
  },
});
