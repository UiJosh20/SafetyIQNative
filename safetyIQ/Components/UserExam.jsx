import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserExam = () => {
  const [examQuestions, setExamQuestions] = useState([]);
   const [ids, setID] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState({});
  const route = useRoute();
  const { course_name } = route.params; // Get the course/topic the user just finished reading
   AsyncStorage.getItem("userId")
     .then((result) => {
       let parsedID = JSON.parse(result);
       setID(parsedID);
     })
     .catch((err) => {
       console.log(err);
     });

  useEffect(() => {
    fetchExamQuestions();
  }, []);

  const fetchExamQuestions = () => {
    axios
      .get(`https://safetyiqnativebackend.onrender.com/examQuestions`, {
        params: { course_name },
      })
      .then((response) => {
        setExamQuestions(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching exam questions:", error);
        setLoading(false); // Ensure loading is stopped in case of error
      });
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswer((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

const handleSubmitExam = () => {
  // Show confirmation dialog before submitting
  Alert.alert(
    "Submit Exam",
    "Are you sure you want to submit your exam?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Submit",
        onPress: () => {
          axios
            .post(`https://safetyiqnativebackend.onrender.com/submitExam`, {
              selectedAnswers: selectedAnswer,
              ids,
              course_name,
            })
            .then((response) => {
              const scores = response.data; // Retrieve the score from the response
              console.log("Exam submitted successfully:", scores);

              // Show the score immediately in the alert
              Alert.alert(
                "Submitted successfully",
                `You would be redirected to your dashboard for your score`
              );

              // Optionally store the score in AsyncStorage
              AsyncStorage.setItem("score", JSON.stringify(scores));

              // Optionally, navigate to the dashboard after showing the score
              setTimeout(() => {
                router.replace({
                  pathname: "/dashboard",
                });
              }, 2000);
            })
            .catch((error) => {
              console.error("Error submitting exam", error);
            });
        },
      },
    ],
    { cancelable: true }
  );
};


  if (loading) {
    return <ActivityIndicator size="large" color="#c30000" />;
  }

  return (

    <>
      <Text style={styles.title}>Exam for {course_name}</Text>
    <ScrollView contentContainerStyle={styles.container}>
      {examQuestions.map((question, i) => (
        <View key={question._id} style={styles.questionContainer}>
          <Text style={styles.questionText}>{i+1}. {question.question}</Text>
          {question.options.map((option, idx) => (
            <Pressable
              key={idx}
              style={styles.radioButtonContainer}
              onPress={() => handleAnswerSelect(question._id, option)}
            >
              <View style={styles.radioCircle}>
                {selectedAnswer[question._id] === option && (
                  <View style={styles.selectedRb} />
                )}
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <Pressable style={styles.submitButton} onPress={handleSubmitExam}>
        <Text style={styles.submitButtonText}>Submit Exam</Text>
      </Pressable>
    </ScrollView>
    </>
  );
};

export default UserExam;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  questionContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#c30000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#c30000",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#c30000",
    paddingBottom: 30,
    paddingTop:20,
    marginTop: 50,
    position: "relative",
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
});
