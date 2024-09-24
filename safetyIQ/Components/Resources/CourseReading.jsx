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
  TextInput,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const CourseReading = () => {
  const [resources, setResources] = useState([]);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false); // New state for the exam modal
  const [selectedResource, setSelectedResource] = useState(null);
  const [examMessage, setExamMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [inputWord, setInputWord] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const route = useRoute();
  const { course } = route.params;
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("userId")
      .then((userId) => {
        if (userId) {
          setUserId(userId);
          fetchResources();
        }
      })
      .catch((error) => {
        console.log("Error fetching user ID: ", error);
      });
  }, [course]);

  const fetchResources = () => {
    setLoading(true);
    axios
      .get(`https://safetyiqnativebackend.onrender.com/read`, {
        params: { currentTopic: course },
      })
      .then((response) => {
        setResources(response.data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error("Error fetching resources:", error);
        setLoading(false);
        setRefreshing(false);
      });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchResources();
  };

  const handleKeywordSubmit = () => {
    const requiredWord = "Important";
    if (inputWord.toLowerCase() === requiredWord.toLowerCase()) {
      setShowKeywordModal(false);
      router.replace({
        pathname: "/exam",
        params: { course_name: course },
      });
    } else {
      Alert.alert(
        "Error",
        "Incorrect word. Please enter 'Important' to proceed."
      );
    }
  };

  const handleKeywordPrompt = () => {
    setShowKeywordModal(true);
  };

  const handleNextPress = () => {
    Alert.alert("Confirm", "Are you sure you have read the topic?", [
      {
        text: "Yes, I have",
        onPress: async () => {
          try {
            // Close note modal and show exam availability
            setShowNoteModal(false);

            // Send the completed course data to the backend
            const response = await axios.post(
              "https://safetyiqnativebackend.onrender.com/completeCourse",
              {
                userId: userId, // Assuming you have userId stored in state
                courseName: course, // Send the course details
              }
            );

            // Show success message or log response
            if (response.status === 200) {
              console.log("Course marked as completed successfully.");
            }

            // Show exam availability modal
            showExamAvailability();
          } catch (error) {
            console.error("Error saving completed course:", error);
            Alert.alert("Error", "Failed to mark the course as completed.");
          }
        },
      },
      {
        text: "No, I haven't",
        style: "cancel",
      },
    ]);
  };

  const handleShowNoteModal = (resource) => {
    setSelectedResource(resource);
    setShowNoteModal(true);
  };

  const showExamAvailability = () => {
    const examStartHour = 15; // Assuming test starts at 3 PM
    const currentHour = new Date().getHours();
    const remainingHours = examStartHour - currentHour;

    if (remainingHours > 0) {
      setShowExamModal(true);
      setExamMessage(
        `The test for this topic will start in ${remainingHours} hour${
          remainingHours > 1 ? "s" : ""
        }.`
      );
    } else {
      setExamMessage("The test for this topic is already available.");
    }
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
                {resource.read_description}
              </Text>
              <Text style={styles.resourceContent}>
                <Text style={styles.resourceContent}>
                  Time:
                  {resource.read_duration}
                </Text>
              </Text>
            </View>
          ))}
          <Pressable style={styles.nextbtn} onPress={handleShowNoteModal}>
            <Text style={styles.nextbtntext}>Read</Text>
          </Pressable>
          {matchedKeywords.length > 0 && (
            <Text style={styles.resourceContent}>
              Matched keywords: {matchedKeywords.join(", ")}
            </Text>
          )}
          <Modal
            visible={showNoteModal}
            animationType="slide"
            onRequestClose={() => setShowNoteModal(false)}
          >
            <View style={styles.modalContainer}>
              {resources.map((resource, index) => (
                <View key={index}>
                  <Text style={styles.modalTitle}>{resource.read_title}</Text>
                </View>
              ))}

              <ScrollView showsVerticalScrollIndicator={false}>
                {resources.map((resource, index) => (
                  <View key={index}>
                    <Text style={styles.resourceContent}>
                      {resource.read_note}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <Pressable style={styles.finishButton} onPress={handleNextPress}>
                <Text style={styles.finishButtonText}>Finish</Text>
              </Pressable>
            </View>
          </Modal>

          <Modal
            visible={showExamModal}
            animationType="slide"
            onRequestClose={() => setShowExamModal(false)}
          >
            <View style={styles.modalContainer1}>
              <View
                style={{
                  backgroundColor: "white",
                  width: "100%",
                  padding: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 20,
                }}
              >
                <Text style={styles.modalTitle1}>{examMessage}</Text>
                <Pressable onPress={() => {setShowExamModal(false); router.replace("dashboard") }} style={styles.finishButton}>
                  <Text style={styles.finishButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </ScrollView>
      )}
    </View>
  );
};

export default CourseReading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    width: "100%",
  },
  resourceContainer: {
    marginBottom: 16,
  },
  resourceTitle: {
    fontSize: 18,
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
    paddingVertical: 100,
  },
  nextbtn: {
    padding: 15,
    backgroundColor: "#c30000",
    width: "100%",
    borderRadius: 30,
    marginVertical: 20,
  },
  nextbtntext: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },

  modalContainer1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  modalTitle1: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalContent: {
    fontSize: 18,
    lineHeight: 24,
  },
  finishButton: {
    padding: 15,
    backgroundColor: "#c30000",
    width: "100%",
    borderRadius: 30,
    marginVertical: 20,
  },
  finishButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginVertical: 20,
    width: "100%",
  },
});
