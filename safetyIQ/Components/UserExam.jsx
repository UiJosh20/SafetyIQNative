import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { router } from "expo-router";

const UserExam = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpFromEmail, setOtpFromEmail] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleSendOTP = () => {
    if (validatePhoneNumber(phoneNumber)) {
      setLoading(true);
      axios
        .post("https://safetyiqnativebackend.onrender.com/examOTP", {
          phoneNumber,
        })
        .then((response) => {
          setLoading(false);
          setOtpSent(true);
          setError("");
        })
        .catch((error) => {
          setLoading(false);
          alert("Error sending OTP, please try again.");
        });
    } else {
      setError("Please enter a valid phone number");
    }
  };

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^[0-9]{11}$/;
    return phoneRegex.test(number);
  };

  const handleResendOTP = () => {
    setOtpSent(false);
    setPhoneNumber("");
    setOtp(new Array(4).fill(""));
  };

  const handleOtpInput = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Once all 4 digits are filled, auto-submit the OTP
    if (newOtp.join("").length === 4) {
      verifyOtp(newOtp.join(""), phoneNumber);
    }
  };

  const verifyOtp = (otp, phoneNumber) => {
    setLoading(true);
    axios
      .post("https://safetyiqnativebackend.onrender.com/verifyOtp", {
        otp,
        phoneNumber,
      })
      .then((response) => {
        setLoading(false);
        setShowCountdown(true); // Show the countdown modal
        setCountdown(5); // Reset countdown to 5
        startCountdown();
      })
      .catch((error) => {
        setLoading(false);
        alert("Invalid OTP, please try again.");
      });
  };

  const startCountdown = () => {
    let timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          // Navigate to test screen after countdown completes
          router.replace("test")
          // You can call your navigation logic here to go to the test screen
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (otpFromEmail) {
      setOtp(otpFromEmail.split(""));
      verifyOtp(otpFromEmail, phoneNumber);
    }
  }, [otpFromEmail]);

  return (
    <View style={styles.container}>
      {!otpSent ? (
        <>
          <Text style={styles.title}>Exam OTP</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={11}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size={23} />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <Modal transparent={true} visible={otpSent}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter OTP</Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    style={styles.otpInput}
                    keyboardType="numeric"
                    maxLength={1}
                    onChangeText={(value) => handleOtpInput(value, index)}
                    value={digit}
                    autoFocus={index === 0}
                  />
                ))}
              </View>

              <TouchableOpacity onPress={handleResendOTP}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Countdown Modal */}
      <Modal transparent={true} visible={showCountdown}>
        <View style={styles.modalContainer1}>
          <View style={styles.modalContent1}>
            <Text style={styles.countdownText}>
              Your test will start in {countdown} seconds
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    width: "100%",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: "100%",
    marginBottom: 10,
    color: "#000",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#c30000",
    marginBottom: 10,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white", // Translucent background
  },

  modalContainer1: {
    flex: 1,
    alignItems: "center",
    justifyContent:"center",
    backgroundColor: "white", // Translucent background
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },

  modalContent1: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    justifyContent: "center",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    width: "17%", // Width for each OTP input box
    textAlign: "center",
    fontSize: 20,
    padding: 10,
    color: "#000",
  },
  resendLink: {
    marginTop: 20,
    color: "#c30000",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  countdownText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "green",
  },
});

export default UserExam;

// const { course_name } = route.params; // Get the course/topic the user just finished reading
// AsyncStorage.getItem("userId")
//   .then((result) => {
//     let parsedID = JSON.parse(result);
//     setID(parsedID);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// useEffect(() => {
//   fetchExamQuestions();
// }, []);

// const fetchExamQuestions = () => {
//   axios
//     .get(`https://safetyiqnativebackend.onrender.com/examQuestions`, {
//       params: { course_name },
//     })
//     .then((response) => {
//       setExamQuestions(response.data);
//       setLoading(false);
//     })
//     .catch((error) => {
//       console.error("Error fetching exam questions:", error);
//       setLoading(false); // Ensure loading is stopped in case of error
//     });
// };

// const handleAnswerSelect = (questionId, answer) => {
//   setSelectedAnswer((prevAnswers) => ({
//     ...prevAnswers,
//     [questionId]: answer,
//   }));
// };

// const handleSubmitExam = () => {
//   // Show confirmation dialog before submitting
//   Alert.alert(
//     "Submit Exam",
//     "Are you sure you want to submit your exam?",
//     [
//       {
//         text: "Cancel",
//         style: "cancel",
//       },
//       {
//         text: "Submit",
//         onPress: () => {
//           axios
//             .post(`https://safetyiqnativebackend.onrender.com/submitExam`, {
//               selectedAnswers: selectedAnswer,
//               ids,
//               course_name,
//             })
//             .then((response) => {
//               const scores = response.data; // Retrieve the score from the response
//               console.log("Exam submitted successfully:", scores);

//               // Show the score immediately in the alert
//               Alert.alert(
//                 "Submitted successfully",
//                 `You would be redirected to your dashboard for your score`
//               );

//               // Optionally store the score in AsyncStorage
//               AsyncStorage.setItem("score", JSON.stringify(scores));

//               // Optionally, navigate to the dashboard after showing the score
//               setTimeout(() => {
//                 router.replace({
//                   pathname: "/dashboard",
//                 });
//               }, 2000);
//             })
//             .catch((error) => {
//               console.error("Error submitting exam", error);
//             });
//         },
//       },
//     ],
//     { cancelable: true }
//   );
// };
