import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  Image,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const CourseReading = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examMessage, setExamMessage] = useState("");
  const [inputValue, setInputValue] = useState(""); // Input value for Introduction modal
  const [noteInputValue, setNoteInputValue] = useState(""); // Separate input for Read Note modal
  const [inputBorderColor, setInputBorderColor] = useState("#c30000"); // Border color state
  const [correctNote, setCorrectNote] = useState(""); // State to hold the correct read_note
  const [correctTopic, setCorrectTopic] = useState(""); // State to hold the correct read_note
  const { course } = useRoute().params;

  useEffect(() => {
    const fetchUserID = async () => {
      try {
        const result = await AsyncStorage.getItem("userId");
        setUserId(JSON.parse(result));
      } catch (err) {
        console.log(err);
      }
    };
    fetchUserID();
  }, []);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://safetyiqnativebackend.onrender.com/read`,
        {
          params: { currentTopic: course },
        }
      );
      setResources(response.data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [course]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchResources();
  };

  const showExamAvailability = () => {
    const examStartHour = 15;
    const currentHour = new Date().getHours();
    const remainingHours = examStartHour - currentHour;
    setExamMessage(
      remainingHours > 0
        ? `Your test will start in ${remainingHours} hour${
            remainingHours > 1 ? "s" : ""
          }.`
        : "Your test is already available."
    );
    setShowExamModal(true);
  };

  const handleNextPress = async () => {
    // Check if the input matches any resource description
    const matchedResource = resources.find(
      (resource) =>
        inputValue.trim().toLowerCase() ===
        resource.read_description.trim().toLowerCase()
    );

    if (matchedResource) {
      // Input is correct, clear the input and proceed to show the read_note modal
      setCorrectNote(matchedResource.read_note); // Set the correct note
      setCorrectTopic(matchedResource.read_title); // Set the correct topic
      setInputValue(""); // Clear the input field after a correct answer
      setShowNoteModal(true); // Show the read note modal
    } else {
      // Input is incorrect
      Alert.alert("Error", "Your answer is incorrect. Please try again.");
    }
  };

  const handleInputChange = (text) => {
    setInputValue(text);
  };

  const handleNoteInputChange = (text) => {
    setNoteInputValue(text); // Separate handler for the input in the Read Note modal
  };


   const handleNextPressFinish = async () => {
     Alert.alert("Confirm", "Are you sure you have read the topic?", [
       {
         text: "Yes, I have",
         onPress: async () => {
           try {
             const response = await axios.post(
               "http://192.168.0.103:8000/completeCourse",
               {
                 userId,
                 courseName: course,
               }
             );
             if (response.status === 201) {
               console.log("Course marked as completed successfully.");
                showExamAvailability();
             }
           } catch (error) {
             console.error("Error saving completed course:", error);
             Alert.alert("Error", "Failed to mark the course as completed.");
           }
         },
       },
       { text: "No, I haven't", style: "cancel" },
     ]);
   };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#c30000" />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {resources.map((resource, index) => (
            <View key={index} style={styles.resourceContainer}>
              <Image
                source={{ uri: resource.read_image }}
                style={styles.image}
              />
              <Text style={styles.resourceTitle}>{resource.read_title}</Text>
              <Text style={styles.resourceContent}>
                Time: {resource.read_duration}
              </Text>
              <View style={{ flexDirection: "column", marginTop: 50 }}>
                <Text style={{ fontSize: 17, fontWeight: "bold" }}>
                  Description
                </Text>
                <Text style={styles.resourceContent}>
                  {resource.read_description}
                </Text>
              </View>
            </View>
          ))}
          <Pressable
            style={styles.nextbtn}
            onPress={() => setShowIntroModal(true)}
          >
            <Text style={styles.nextbtntext}>Next</Text>
          </Pressable>
        </ScrollView>
      )}

      <Modal
        visible={showIntroModal}
        animationType="slide"
        onRequestClose={() => setShowIntroModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={{ paddingHorizontal: 20 }}>
            <Text
              style={{ textAlign: "center", fontWeight: "bold", fontSize: 22 }}
            >
              Introduction
            </Text>
            {resources.map((resource, index) => (
              <View key={index} style={{ marginVertical: 20 }}>
                <Text style={styles.resourceContent}>
                  {resource.read_description}
                </Text>
              </View>
            ))}

            <View style={styles.typeCard}>
              <Text>Fill in the sentence above</Text>
              <TextInput
                style={[styles.input, { borderBottomColor: inputBorderColor }]} // Dynamic border color
                value={inputValue}
                onChangeText={handleInputChange}
              />
            </View>
          </View>
        </View>

        <Pressable
          style={[
            styles.finishButton,
            { backgroundColor: inputValue ? "#c30000" : "#ccc" }, // Change color based on input
          ]}
          onPress={inputValue ? handleNextPress : null} // Disable onPress if inputValue is empty
        >
          <Text style={styles.finishButtonText}>
            {inputValue ? "Read" : "Enter answer to proceed"}
          </Text>
        </Pressable>
      </Modal>

      {/* Modal for showing the read note */}
      <Modal
        visible={showNoteModal}
        animationType="slide"
        onRequestClose={() => setShowNoteModal(false)}
      >
        <Text style={styles.modalTitle}>{correctTopic}</Text>
        <ScrollView style={styles.modalContainer1}>
          <Text style={styles.resourceContent}>{correctNote}</Text>
          <View style={styles.typeCard1}>
            <Text>
              Importance of first aid that deals with preventing fatalities
            </Text>
            <TextInput
              style={[styles.input, { borderBottomColor: inputBorderColor }]} // Dynamic border color
              value={noteInputValue}
              onChangeText={handleNoteInputChange} // Separate input for the note modal
            />
          </View>
        </ScrollView>
        <Pressable
          style={[
            styles.finishButton,
            { backgroundColor: noteInputValue.trim() ? "#c30000" : "#ccc" }, // Gray background when no input
          ]}
          onPress={() => {
            if (noteInputValue.trim().toLowerCase() === "preserving life") {
              handleNextPressFinish();
              setNoteInputValue(""); // Clear the input after submission
            } else {
              Alert.alert(
                "Incorrect",
                "The answer is incorrect. Please try again."
              );
            }
          }}
          disabled={!noteInputValue.trim()} // Disable if input is empty
        >
          <Text style={styles.finishButtonText}>
            {noteInputValue.trim() ? "Finish" : "Enter answer to proceed"}
          </Text>
        </Pressable>
      </Modal>

          {/* exam modal */}
      <Modal
        visible={showExamModal}
        animationType="slide"
        onRequestClose={() => setShowExamModal(false)}
      >
        <View style={styles.modalContainer1}>

          <View style={styles.greencard}>
          <Text style={styles.modalTitle1}>{examMessage}</Text>
          </View>
          <Pressable
            onPress={() => {
              setShowExamModal(false);
              router.replace("dashboard");
            }}
            style={styles.finishButton1}
          >
            <Text style={styles.finishButtonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>

    </View>
  );
};

export default CourseReading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  resourceContainer: {
    marginBottom: 16,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
  },
  resourceContent: {
    fontSize: 17,
    lineHeight: 30,
  },
  image: {
    width: "100%",
    height: 200,
  },
  nextbtn: {
    padding: 15,
    backgroundColor: "#c30000",
    width: "100%",
    borderRadius: 30,
    marginTop: 250,
  },
  nextbtntext: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
  },
  modalContainer1: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  finishButton: {
    padding: 15,
    width: "100%",
    position: "absolute",
    bottom: 0,
    backgroundColor: "#c30000", // Ensure the button is red
  },
  finishButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
  typeCard: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "white",
    padding: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 10,
  },
  typeCard1: {
    marginTop: 15,
    marginBottom: 160,
    backgroundColor: "white",
    padding: 20,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 10,
  },
  input: {
    borderBottomWidth: 2,
    marginTop: 20,
    borderBottomColor: "#c30000", // Default red border color
  },
});

// First aid is the initial assistance or treatment given to someone who has been injured or suddenly taken ill.
