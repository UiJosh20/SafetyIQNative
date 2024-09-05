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
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

const Userdashboard = () => {
  const id = AsyncStorage.getItem("userId") 
  // const profileUrl = `https://safetyiqnativebackend.onrender.com/profilePic`;
  // const books = `https://safetyiqnativebackend.onrender.com/readFetch`;
  // const currentTopicUrl = `https://safetyiqnativebackend.onrender.com/currentTopic`;
  // const checkExamUrl = `https://safetyiqnativebackend.onrender.com/checkExamCompletion`;

  // const [id, setId] = useState("");
  // const [course, setCourse] = useState("");
  // const [userData, setUserData] = useState(null);
  // const [refreshing, setRefreshing] = useState(false);
  // const [modalVisible, setModalVisible] = useState(false);
  // const [items, setItems] = useState([]);
  // const [selectedImage, setSelectedImage] = useState(null);
  // const [timers, setTimers] = useState({});
  // const [examTimers, setExamTimers] = useState({});
  // const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  // const [isStudyTimerActive, setIsStudyTimerActive] = useState(false);

  // useEffect(() => {
  //   fetchUserId();
  //   fetchCurrentTopic();
  //   fetchData();
  //   fetchCourses();

  //   const intervalId = setInterval(() => {
  //     updateTimers();
  //     checkTimeAndUpdateState();
  //   }, 1000);

  //   return () => clearInterval(intervalId);
  // }, [id, course]); 

  // const fetchUserId = () => {
  //   AsyncStorage.getItem("userId")
  //     .then((userId) => {
  //       if (userId) {
  //         setId(userId);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("Error fetching user ID: ", error);
  //     });
  // };

  // const fetchCurrentTopic = () => {
  //   axios
  //     .get(currentTopicUrl, { params: { userId: id } })
  //     .then((response) => {
  //       if (response.data && response.data.currentTopic) {
  //         setCourse(response.data.currentTopic);
  //         checkExamCompletion(response.data.currentTopic);
  //         const initialTimers = { ...timers };
  //         initialTimers[response.data.currentTopic] = 12 * 60 * 60;
  //         setTimers(initialTimers);
  //         setIsStudyTimerActive(true);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("Error fetching current topic: ", error);
  //     });
  // };

  // const fetchData = () => {
  //   axios
  //     .post(userUrl, { id: id })
  //     .then((response) => {
  //       setUserData(response.data.user);
  //       setRefreshing(false);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       setRefreshing(false);
  //     });
  // };

  // const fetchCourses = () => {
  //   axios
  //     .get(books)
  //     .then((response) => {
  //       setItems(response.data);
  //       const initialTimers = response.data.reduce((acc, course) => {
  //         acc[course.name] = 12 * 60 * 60;
  //         return acc;
  //       }, {});
  //       setTimers(initialTimers);
  //       const initialExamTimers = response.data.reduce((acc, course) => {
  //         acc[course.name] = 3 * 60 * 60;
  //         return acc;
  //       }, {});
  //       setExamTimers(initialExamTimers);
  //     })
  //     .catch((error) => {
  //       console.log("Error fetching courses:", error);
  //     });
  // };

  // const updateTimers = () => {
  //   setTimers((prevTimers) => {
  //     const updatedTimers = { ...prevTimers };
  //     Object.keys(updatedTimers).forEach((key) => {
  //       if (updatedTimers[key] > 0 && isStudyTimerActive) {
  //         updatedTimers[key] -= 1;
  //       }
  //     });
  //     return updatedTimers;
  //   });
  // };

  // const formatTime = (seconds) => {
  //   const hrs = Math.floor(seconds / 3600);
  //   const mins = Math.floor((seconds % 3600) / 60);
  //   const secs = seconds % 60;
  //   return `${hrs.toString().padStart(2, "0")}:${mins
  //     .toString()
  //     .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  // };

  // const onRefresh = useCallback(() => {
  //   setRefreshing(true);
  //   fetchData();
  //   checkTimeAndUpdateState();
  // }, [fetchData]);

  // const checkExamCompletion = (currentCourse) => {
  //   axios
  //     .get(checkExamUrl, { params: { userId: id, course: currentCourse } })
  //     .then((response) => {
  //       if (response.data && response.data.completed) {
  //         setIsButtonDisabled(false);
  //       } else {
  //         setIsButtonDisabled(true);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("Error checking exam completion: ", error);
  //     });
  // };

  // const checkTimeAndUpdateState = () => {
  //   const now = new Date();
  //   const currentHours = now.getUTCHours() + 1; // WAT is UTC+1

  //   if (currentHours >= 18 && currentHours < 24) {
  //     // Between 6 PM and midnight
  //     setIsStudyTimerActive(true);
  //   } else if (currentHours >= 0 && currentHours < 14) {
  //     // Between midnight and 2 AM
  //     setIsStudyTimerActive(false);
  //   } else {
  //     setIsStudyTimerActive(false);
  //   }
  // };

  // const handleReadNowPress = () => {
  //   const now = new Date();
  //   const currentHours = now.getUTCHours() + 1; // WAT is UTC+1

  //   if (currentHours < 18) {
  //     Alert.alert("Alert", "You can only start reading after 4 PM.");
  //   } else {
  //     router.push({
  //       pathname: "ReadCourse",
  //       params: { course: course },
  //     });
  //   }
  // };

  return (
    <View style={styles.container}>
      <ScrollView
      // refreshControl={
      //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      // }
      >
        {/* {userData ? (
          <>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.circle}
                onPress={() => setModalVisible(true)}
              >
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.avatar}
                  />
                ) : (
                  <Text style={styles.avatarPlaceholder}>
                    {userData.firstName[0]}
                  </Text>
                )}
              </TouchableOpacity>
              <View>
                <Text style={styles.welcome}>Welcome</Text>
                <Text style={styles.username}>
                  {userData.firstName} {userData.lastName}
                </Text>
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
                      style={{ color: "white", marginTop: 20, marginBottom: 5 }}
                    >
                      Study Time Left:{" "}
                    </Text>
                    <Text style={styles.timer}>
                      {formatTime(timers[course])}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{ color: "white", marginTop: 20, marginBottom: 5 }}
                    >
                      Test due:{" "}
                    </Text>
                    <Text style={styles.timer}>
                      {timers[course] === 0
                        ? formatTime(examTimers[course])
                        : formatTime(3 * 60 * 60)}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  padding: 10,
                  borderRadius: 5,
                  marginTop: -25,
                }}
                onPress={handleReadNowPress}
              >
                <Text style={{ textAlign: "center" }}>Read Now</Text>
              </TouchableOpacity>
            </View>

            <View>
              <View style={styles.examContainer}>
                <Text style={styles.TestText}>Latest Test result</Text>
                <Text style={styles.seeMore}>See more</Text>
              </View>

              <View style={styles.scoreBoard}>
                <Text style={styles.TestText}>{course}</Text>
                <View style={styles.scoreContainer}>
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <View style={styles.correct}>
                        <Text style={styles.correctText}>13</Text>
                      </View>
                      <Text style={{ fontSize: 16 }}>Correct</Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <View style={styles.wrong}>
                        <Text style={styles.correctText}>7</Text>
                      </View>
                      <Text style={{ fontSize: 16 }}>Wrong</Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <View style={styles.attempt}>
                        <Text style={styles.correctText}>3</Text>
                      </View>
                      <Text style={{ fontSize: 16 }}>Attempt</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.percentage}>70%</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <ActivityIndicator size="large" color="#c30000" />
        )} readcourse_id, // Course ID should be provided
      admin_id, // Still required in Read schema
      user_id, // Still required in Read schema

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
            <Text>Modal Content</Text>
          </View>
        </Modal> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
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
    width: 300,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 10,
    position: "absolute",
    top: -2,
    left: 40,
    paddingHorizontal: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontSize: 20,
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
}); 

export default Userdashboard;
