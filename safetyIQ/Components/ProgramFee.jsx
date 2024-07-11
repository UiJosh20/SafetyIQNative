import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

const ProgramFee = () => {
  const [fontsLoaded, fontError] = useFonts({
    "Kanit-Bold": require("./../assets/fonts/Kanit-Bold.ttf"),
    "Kanit-Regular": require("./../assets/fonts/Kanit-Regular.ttf"),
    "Kanit-Italic": require("./../assets/fonts/Kanit-Italic.ttf"),
    "Kanit-Light": require("./../assets/fonts/Kanit-Light.ttf"),
  });

  const [firstName, setFirstName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [userReference, setReference] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAmount, setUserAmount] = useState("");
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [verificationNumber, setVerificationNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const port = 100;
  const payInit = `http://192.168.0.${port}:8000/paystackinit`;
  const verifyPay = `http://192.168.0.${port}:8000/paystackverify`;
  useEffect(() => {
    AsyncStorage.multiGet(["firstName", "courseName", "coursePrice", "email"])
    .then(([firstName, courseName, coursePrice, email]) => {
      if (firstName[1]) setFirstName(firstName[1]);
      if (courseName[1]) setCourseName(courseName[1]);
      if (coursePrice[1]) setCoursePrice(coursePrice[1]);
      if (email[1]) setUserEmail(email[1]);
    })
      .catch((error) => {
        console.error("Failed to load the details from storage:", error);
      });
  }, []);

  if (!fontsLoaded) {
    if (fontError) {
      console.log(fontError);
    }
    return null;
  }

  const handleBankTransfer = () => {
    setModalVisible(true);
  };

  const handlePayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      axios
        .post(payInit, {
          amount: coursePrice * 100,
          email: userEmail,
        })
        .then((response) => {
          console.log(response.data);
          if (
            response.data &&
            response.data.data &&
            response.data.data.authorization_url
          ) {
            const { authorization_url, reference } = response.data.data;
            Linking.openURL(authorization_url);
            setReference(reference);
            setPaymentInitiated(true);
          } else {
            Alert.alert("Error", "Failed to get authorization URL.");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          Alert.alert(
            "Error",
            "An error occurred while initializing the payment."
          );
          setIsLoading(false);
        });
    }, 2000);
  };

  const handleVerifyPayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      axios
        .get(verifyPay, {
          params: {
            reference: userReference,
          },
        })
        .then((verifyResponse) => {
          if (verifyResponse.data) {
            const verificationNumber = verifyResponse.data.frpnum;
            setVerificationNumber(verificationNumber);
            Alert.alert("Success", `Payment verified successfully.`);
            setModalVisible(false);
            setPaymentInitiated(false);
            router.push("login");
          } else {
            Alert.alert("Error", "Payment verification failed.");
            setPaymentInitiated(false);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
        });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Program Fee</Text>

      <View style={styles.messageContainer}>
        <Text style={styles.message}>Hello {firstName},</Text>
        <Text style={styles.message}>
          Your record is successfully received for enrollment on the{" "}
          {courseName} training.
        </Text>
        <Text style={styles.message}>
          The {courseName} training fee is {coursePrice}.
        </Text>
        <Text style={styles.message}>
          Please make payment through any of the payment options below to
          receive your login details and join your batch's study group.
        </Text>
      </View>

      <View style={styles.paymentbtn}>
        <TouchableOpacity style={styles.paybtn} onPress={handleBankTransfer}>
          <Text style={styles.paybtntext}>Paystack</Text>
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
            Pay access fee and receive login details
          </Text>
          <TextInput
            placeholder="Email Address"
            value={userEmail}
            editable={false}
            style={styles.input}
          />
          <TextInput
            placeholder="Amount to be paid"
            value={coursePrice}
            editable={false} // Disable input
            style={styles.input}
          />
          <Text
            style={{
              fontFamily: "Kanit-Light",
              fontSize: 12,
              color: "#C30000",
            }}
          >
            Click on verify after making payment
          </Text>
          {paymentInitiated ? (
            <TouchableOpacity
              style={styles.paybtn1}
              onPress={handleVerifyPayment}
            >
              <Text style={styles.paybtntext1}>Verify Payment</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.paybtn1} onPress={handlePayment}>
              <Text style={styles.paybtntext1}>Pay</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      {isLoading && (
        <Modal
          transparent={true}
          animationType="none"
          visible={isLoading}
          onRequestClose={() => setIsLoading(false)}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C30000" />
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ProgramFee;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontFamily: "Kanit-Bold",
    fontSize: 24,
    textAlign: "center",
    marginVertical: 15,
  },
  messageContainer: {
    marginTop: 10,
    width: "100%",
    paddingHorizontal: 9,
    textAlign: "justify",
  },
  message: {
    fontFamily: "Kanit-Regular",
    fontSize: 13,
    color: "#222",
    marginBottom: 10,
  },
  courseDetail3: {
    fontFamily: "Kanit-Light",
    fontSize: 14,
    color: "#6A6A6A",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 40,
  },
  paymentbtn: {
    paddingHorizontal: 17,
    marginTop: 30,
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
  input: {
    fontFamily: "Kanit-Regular",
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: "#6A6A6A",
    marginBottom: 15,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
