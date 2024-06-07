import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, Modal, TextComponent } from "react-native";
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
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleBankTransfer = () => {
    setModalVisible(true);
  };

  const handleDone = () => {
   
    Alert.alert(
      "Transfer Verification",
      "Bank transfer verification is not implemented."
    );
    setModalVisible(false);
  };


  const debitpay = () => {
    Alert.alert("Service is not available at this time");
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
        <TouchableOpacity style={styles.paybtn} onPress={handleBankTransfer}>
          <Text style={styles.paybtntext}>Bank Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.paybtn]} onPress={debitpay}>
          <Text style={styles.paybtntext}>Debit Card</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.title}>Payment</Text>
          <Text style={styles.courseDetail3}>
            Pay access fee and receive log in details
          </Text>
          <Text style={styles.modalText}>First Bank</Text>
          <Text style={styles.modalText1}>FRP Training</Text>
          <Text style={styles.modalText2}>234567800</Text>
          <Text style={{fontFamily: "Kanit-Light", fontSize: 12, color: "#C30000"}}>Click on Done after making transfer</Text>
          <TouchableOpacity style={styles.paybtn1} onPress={handleDone}>
            <Text style={styles.paybtntext1}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ProgramFee;

const styles = StyleSheet.create({
  title: {
    fontFamily: "Kanit-Bold",
    fontSize: 24,
    textAlign: "center",
    marginVertical: 15,
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
  courseDetail3: {
    fontFamily: "Kanit-Light",
    fontSize: 14,
    color: "#6A6A6A",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 40,
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

  paybtntext1: {
    color: "#fff",
    fontFamily: "Kanit-Bold",
    fontSize: 18,
    textAlign: "center",
  },
  paymentbtn: {
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

  paybtn1: {
    width: "100%",
    padding: 10,
    marginTop: 30,
    backgroundColor: "#C30000",
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

  modalView: {
    backgroundColor: "white",
    height: "100%",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontFamily: "Kanit-Regular",
    fontSize: 16,
    marginBottom: 5,
  },
  modalText1: {
    fontFamily: "Kanit-Regular",
    fontSize: 20,
  },
  modalText2: {
    fontFamily: "Kanit-Bold",
    fontSize: 32,
    marginBottom: 5,
  },
});
