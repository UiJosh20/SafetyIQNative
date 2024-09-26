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
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  const [showExamModal, setShowExamModal] = useState(false);
  const [examMessage, setExamMessage] = useState("");
  const { course } = useRoute().params;

  // Fetch user ID once
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

  // Fetch course resources
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

  const handleNextPress = async () => {
    Alert.alert("Confirm", "Are you sure you have read the topic?", [
      {
        text: "Yes, I have",
        onPress: async () => {
          setShowNoteModal(false);
          try {
            const response = await axios.post(
              "http://192.168.10.92:8000/completeCourse",
              {
                userId,
                courseName: course,
              }
            );
            if (response.status === 201) {
              console.log("Course marked as completed successfully.");
            }
            showExamAvailability();
          } catch (error) {
            console.error("Error saving completed course:", error);
            Alert.alert("Error", "Failed to mark the course as completed.");
          }
        },
      },
      { text: "No, I haven't", style: "cancel" },
    ]);
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
                Time: {resource.read_duration}
              </Text>
            </View>
          ))}
          <Pressable
            style={styles.nextbtn}
            onPress={() => setShowNoteModal(true)}
          >
            <Text style={styles.nextbtntext}>Read</Text>
          </Pressable>
        </ScrollView>
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
              <Text style={styles.resourceContent}>{resource.read_note}</Text>
            </View>
          ))}
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
          <Text style={styles.modalTitle1}>{examMessage}</Text>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalTitle1: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  finishButton: {
    padding: 15,
    backgroundColor: "#c30000",
    width: "100%",
    borderRadius: 30,
    marginVertical: 20,
  },
  finishButton1: {
    padding: 15,
    backgroundColor: "#c30000",
    width: "60%",
    borderRadius: 30,
    marginVertical: 20,
  },
  finishButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
});
