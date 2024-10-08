import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import Ionicons from "react-native-vector-icons/Ionicons";


const Userdashboard = () => {
  const [notifyMsg, setNotifyMsg] = useState("");
  const [state, setState] = useState({
    ids: "",
    course: "",
    userData: null,
    refreshing: false,
    modalVisible: false,
    userScore: [],
    selectedImage: null,
    timers: { default: 0 },
    examTimers: {},
    notificationVisible: false, // For notification modal
    isStudyTimerActive: false,
    isTestTimerActive: false,
    isFetching: false,
    completedTopics: [],
    isReadNowDisabled: false,
  });

  const {
    refreshing,
    course,
    timers,
    examTimers,
    userData,
    modalVisible,
    notificationVisible,
    selectedImage,
    userScore,
    isFetching,
    isReadNowDisabled,
  } = state;

  const fetchUserID = async () => {
    try {
      const result = await AsyncStorage.getItem("userId");
      let parsedID = JSON.parse(result);
      setState((prev) => ({ ...prev, ids: parsedID }));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUserID();
    requestNotificationPermissions();
  }, []);

  const currentTopicUrl = useMemo(
    () =>
      `https://safetyiqnativebackend.onrender.com/currentTopic/${state.ids}`,
    [state.ids]
  );
  const resultUrl = useMemo(
    () => `https://safetyiqnativebackend.onrender.com/result/${state.ids}`,
    [state.ids]
  );

  const getCompletedCourse = useMemo(
    () => `https://safetyiqnativebackend.onrender.com/getcomplete/${state.ids}`,
    [state.ids]
  );
  const checkExamURl = useMemo(
    () => `http://192.168.10.92:8000/checkExam/${state.course}`,
    [state.course]
  );

  useEffect(() => {
    if (state.ids) {
      fetchCurrentTopic();
      fetchUserInfo();
      fetchCompletedTopics();
    }
  }, [state.ids]);

  // Function to toggle notification modal visibility
  const toggleNotificationModal = () => {
    setState((prev) => ({
      ...prev,
      notificationVisible: !prev.notificationVisible, // Use the correct key from state
    }));
  };

  useEffect(() => {
    // Study Timer Logic
    const now = new Date();
    const currentHours = now.getUTCHours() + 1;

    if (currentHours >= 2 && currentHours < 14 && !state.isStudyTimerActive) {
      setState((prev) => ({
        ...prev,
        isStudyTimerActive: true,
        timers: { default: (14 - currentHours) * 60 * 60 },
      }));
    }

    const studyTimerId = setInterval(() => {
      if (state.isStudyTimerActive) {
        setState((prev) => {
          const updatedTimers = { ...prev.timers };
          Object.keys(updatedTimers).forEach((key) => {
            updatedTimers[key] = Math.max(updatedTimers[key] - 1, 0);
          });
          return { ...prev, timers: updatedTimers };
        });
      }
    }, 1000);

    return () => clearInterval(studyTimerId);
  }, [state.isStudyTimerActive]);

  useEffect(() => {
    // Exam Timer Logic
    const examTimerId = setInterval(() => {
      if (state.isTestTimerActive) {
        setState((prev) => {
          const updatedExamTimers = { ...prev.examTimers };
          Object.keys(updatedExamTimers).forEach((key) => {
            updatedExamTimers[key] = Math.max(updatedExamTimers[key] - 1, 0);
          });
          return { ...prev, examTimers: updatedExamTimers };
        });
      }
    }, 1000);

    return () => clearInterval(examTimerId);
  }, [state.isTestTimerActive]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const info = await AsyncStorage.getItem("userInfo");
      const parsedInfo = JSON.parse(info);
      setState((prev) => ({ ...prev, userData: parsedInfo }));
    } catch (error) {
      console.log("Error fetching user info: ", error);
    }
  }, []);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      await Notifications.requestPermissionsAsync();
    }
  };

  const fetchCompletedTopics = useCallback(() => {
    axios
      .get(getCompletedCourse)
      .then((response) => {
        const completedCourses = response.data.completedCourses[0].courseName;
        setState((prev) => ({
          ...prev,
          completedTopics: completedCourses,
        }));

        // Check if the current course is completed before checking for exam availability
        if (completedCourses.includes(state.course)) {
          checkExam(); // Only check exam if the course is completed
        }
      })
      .catch((error) => {
        if (error.response) {
          // Server responded with a status other than 200 range
          console.log("Response Error:", error.response.data);
        } else if (error.request) {
          // Request was made but no response was received
          console.log("Request Error:", error.request);
        } else {
          // Something else happened while setting up the request
          console.log("Axios Error:", error.message);
        }
      });
  }, [getCompletedCourse, state.course]); // Include state.course in the dependency array

  const fetchCurrentTopic = useCallback(() => {
    axios
      .get(currentTopicUrl)
      .then((response) => {
        const topics = response.data.currentTopic;
        if (topics) {
          checkIfTopicIsCompleted(topics);
          setState((prev) => ({
            ...prev,
            course: topics,
            timers: {
              ...prev.timers,
              [topics]: (14 - new Date().getUTCHours() - 1) * 60 * 60,
            },
            isStudyTimerActive: true,
          }));
          checkTimeAndUpdateState();
        }
      })
      .catch(() => {
        console.log("No new course to fetch");
      });
  }, [currentTopicUrl]);

  const checkIfTopicIsCompleted = (currentTopic) => {
    setState((prev) => ({
      ...prev,
      isReadNowDisabled: prev.completedTopics.includes(currentTopic),
    }));
  };

  const fetchResult = (courseName) => {
    router.navigate("resource");
    setState((prev) => ({ ...prev, isFetching: true }));
    axios
      .get(resultUrl, { params: { course: courseName } })
      .then((response) => {
        setState((prev) => ({
          ...prev,
          userScore: response.data.result,
          isFetching: false,
        }));
      })
      .catch((err) => {
        console.log(err);
        setState((prev) => ({ ...prev, isFetching: false }));
      });
  };

  const sendExamStartNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Exam Started",
        body: "Your exam has started. You have 3 hours to complete it.",
      },
      trigger: null, // Send it immediately
    });
  };

  const checkTimeAndUpdateState = () => {
    const now = new Date();
    const currentHours = now.getUTCHours() + 1; // Adjust for UTC offset if needed

    // Check if current time is past 3 PM
    if (currentHours >= 15) {
      if (!state.isTestTimerActive) {
        setState((prev) => ({
          ...prev,
          isTestTimerActive: true,
          examTimers: { ...prev.examTimers, [state.course]: 3 * 60 * 60 }, // 3 hours for the exam
        }));

        sendExamStartNotification(); // Ensure notification is only sent once
      }
    } else {
      // Reset the exam timer if it's before 3 PM
      setState((prev) => ({
        ...prev,
        isTestTimerActive: false,
        examTimers: { ...prev.examTimers, [state.course]: 0 },
      }));
    }
  };

  const formatTime = useCallback((seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleReadNowPress = () => {
    const now = new Date();
    const currentHours = now.getUTCHours() + 1;

    if (currentHours < 2) {
      Alert.alert("Alert", "You can start reading after 2 AM.");
    } else {
      router.push({
        pathname: "ReadCourse",
        params: { course: state.course },
      });
    }
  };

  const onRefresh = useCallback(() => {
    checkTimeAndUpdateState();
    setState((prev) => ({ ...prev, refreshing: true }));
    fetchResult(state.course);

    setTimeout(() => {
      fetchUserInfo();
      fetchCurrentTopic();
      setState((prev) => ({ ...prev, refreshing: false }));
    }, 2000);
  }, [state.course]);

  const handleLogout = () => {
    router.push("login");
  };

  const checkExam = () => {
    axios
      .get(checkExamURl)
      .then((result) => {
        if (result.status === 200) {
          setNotifyMsg(result.data.questions[0].course_name);

          // Send a notification to the user that the test is available
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Exam Available",
              body: "An exam for your course is now available. Please check it out.",
            },
            trigger: null,
          });

          // Enable the red badge on the notification icon
          setState((prev) => ({
            ...prev,
            isTestTimerActive: true,
          }));
        }
      })
      .catch((error) => {
        console.log("Error checking exam availability:", error);
      });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {userData ? (
          <>
            <View style={styles.header}>
              {/* Profile Picture */}
              <TouchableOpacity
                style={styles.circle}
                onPress={() =>
                  setState((prev) => ({ ...prev, modalVisible: true }))
                }
              >
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.avatar}
                  />
                ) : (
                  <Text style={styles.avatarPlaceholder}>
                    {userData?.firstName ? userData.firstName[0] : ""}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Notification Icon with Red Badge */}
              <View style={styles.notificationIconWrapper}>
                <TouchableOpacity onPress={toggleNotificationModal}>
                  <Ionicons
                    name="notifications-outline"
                    size={30}
                    color="black"
                  />
                  {/* Red badge if an exam is available */}
                  {state.isTestTimerActive && <View style={styles.badge} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.redBox1}>
              <View style={styles.redBox}>
                <View style={styles.whiteBox}>
                  <View style={styles.whiteBoxText}>
                    <Text style={{ textAlign: "center" }}>
                      Current Topic | {course === "" ? "--" : course}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    paddingHorizontal: 20,
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: "white",
                        marginTop: 20,
                        marginBottom: 5,
                      }}
                    >
                      Study Time Left:{" "}
                    </Text>
                    <Text style={styles.timer}>
                      {formatTime(timers[course] ?? timers["default"] ?? 0)}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        color: "white",
                        marginTop: 20,
                        marginBottom: 5,
                      }}
                    >
                      Test due:{" "}
                    </Text>
                    <Text style={styles.timer}>
                      {state.isTestTimerActive && examTimers[course] > 0
                        ? formatTime(examTimers[course]) // Correctly close the formatTime function
                        : formatTime(3 * 60 * 60)}{" "}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: isReadNowDisabled ? "black" : "white", // Disable button if topic is completed
                  padding: 10,
                  borderRadius: 5,
                  marginTop: -25,
                }}
                onPress={handleReadNowPress}
                disabled={isReadNowDisabled} // Disable button if topic is completed
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: isReadNowDisabled ? "white" : "black",
                  }}
                >
                  {isReadNowDisabled ? "Completed" : "Read Now"}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <View style={styles.examContainer}>
                <Text style={styles.TestText}>Latest Test result</Text>
                <TouchableOpacity onPress={fetchResult}>
                  <Text style={styles.seeMore}>See all</Text>
                </TouchableOpacity>
              </View>

              {isFetching ? (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: 100,
                  }}
                >
                  <ActivityIndicator size="large" color="#c30000" />
                </View>
              ) : userScore.length > 0 ? (
                userScore.map((score, index) => (
                  <View key={index} style={styles.TestBox}>
                    <View style={styles.TestView}>
                      <Text>{score.course}</Text>
                      <Text>{score.score}%</Text>
                    </View>
                    <Text style={styles.time}>
                      Date: {new Date(score.date).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.time}>No test result available</Text>
              )}
            </View>

            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() =>
                setState((prev) => ({ ...prev, modalVisible: false }))
              }
            >
              <View style={styles.modalBackground}>
                <Pressable
                  style={styles.modalView}
                  onPress={() =>
                    setState((prev) => ({ ...prev, modalVisible: false }))
                  }
                >
                  <Text style={styles.modalText}>Log Out</Text>
                  <TouchableOpacity onPress={handleLogout}>
                    <Text style={styles.logoutText}>Yes, log me out</Text>
                  </TouchableOpacity>
                </Pressable>
              </View>
            </Modal>

            {/* Notification Modal */}
            <Modal
              animationType="slide" // Changed to 'slide' for a smoother transition
              transparent={true}
              visible={notificationVisible}
              onRequestClose={toggleNotificationModal}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.notificationModal}>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Notifications</Text>
                    <Pressable
                      onPress={toggleNotificationModal}
                      style={styles.closeButton}
                    >
                      <Ionicons
                        style={styles.closeButtonText}
                        name="close"
                        size={30}
                        color="black"
                      />
                      {/* Close icon */}
                    </Pressable>
                  </View>

                  {/* Notification Items */}
                  <View style={styles.notificationContent}>
                    <Pressable
                      style={styles.notificationCard}
                      onPress={() => router.replace("exam")}
                    >
                      <Text style={styles.notificationMessage}>
                        {notifyMsg ? notifyMsg : "NO"} TEST AVAILABLE
                      </Text>
                      <Text style={styles.notificationTimestamp}>
                        {new Date().toLocaleTimeString()}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <ActivityIndicator size="large" color="#c30000" />
        )}
      </ScrollView>
    </View>
  );
};

export default Userdashboard;




const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  circle: {
    width: 50,
    height: 50,
    backgroundColor: "grey",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    color: "#fff",
    fontSize: 24,
  },

  modalCloseButton: {
    backgroundColor: "#c30000",
    width: "100%",
    padding: 10,
  },

  modalLogoutButton: {
    backgroundColor: "green",
    width: "100%",
    padding: 10,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  welcome: {
    fontFamily: "Kanit-Regular",
    fontSize: 20,
  },
  username: {
    fontFamily: "Kanit-Light",
    fontSize: 12,
  },
  redBox: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  redBox1: {
    width: "100%",
    height: 170,
    borderRadius: 10,
    backgroundColor: "#C30000",
    marginTop: 50,
    marginBottom: 20,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 15,
  },
  whiteBox: {
    width: "fit-content",
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 10,
    position: "absolute",
    top: -10,
    left: 50,
    marginHorizontal: 20,
    paddingHorizontal: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  time: {
    color: "#808080",
    fontSize: 12,
    textAlign: "center",
    marginVertical: 20,
  },
  whiteBoxText: {
    fontFamily: "Kanit-Light",
    fontSize: 13,
    color: "#000",
    textAlign: "center",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  courseContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  courseName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timer: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 25,
  },
  listItem: {
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  TestText: {
    fontWeight: "bold",
    fontSize: 17,
  },
  seeMore: {
    color: "blue",
    fontWeight: "bold",
  },

  examContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 20,
  },
  scoreBoard: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 25,
    marginVertical: 10,
    shadowColor: "rgba(0,0,0,0.6)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  correct: {
    backgroundColor: "green",
    padding: 3,
    borderRadius: 5,
    width: 40,
    marginTop: 13,
  },

  correctText: {
    color: "#fff",
    fontSize: 17,
    textAlign: "center",
  },

  wrong: {
    backgroundColor: "#C30000",
    padding: 3,
    borderRadius: 5,
    width: 40,
    marginTop: 13,
  },

  attempt: {
    backgroundColor: "blue",
    padding: 3,
    borderRadius: 5,
    width: 40,
    marginTop: 13,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  percentage: {
    fontWeight: "bold",
    fontSize: 40,
    color: "#53BD5E",
  },
  avatarPlaceholder: {
    color: "#fff",
    fontSize: 24,
  },
  notificationIconWrapper: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -3,
    top: -3,
    backgroundColor: "red",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  notificationModal: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Elevation for Android shadow effect
    height: 500,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    borderBottomColor: "#c30000", // Accent underline
    borderBottomWidth: 2,
    paddingBottom: 5,
  },
  closeButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#ccc", // Background for the close button
  },
  closeButtonText: {
    fontSize: 18,
    color: "#333",
  },
  notificationContent: {
    marginTop: 10,
  },
  notificationCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  notificationTimestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
});
