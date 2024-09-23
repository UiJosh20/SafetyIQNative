import React, { useEffect, useState, useCallback } from "react";
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

const Userdashboard = () => {
  const [ids, setID] = useState("");
  const [course, setCourse] = useState("");
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userScore, setUserScore] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [timers, setTimers] = useState({});
  const [examTimers, setExamTimers] = useState({});
  const [isStudyTimerActive, setIsStudyTimerActive] = useState(false);
  const [isTestTimerActive, setIsTestTimerActive] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchUserID = async () => {
    try {
      const result = await AsyncStorage.getItem("userId");
      let parsedID = JSON.parse(result);
      setID(parsedID);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUserID();
  }, []);

  const currentTopicUrl = `https://safetyiqnativebackend.onrender.com/currentTopic/${ids}`;
  const resultUrl = `https://safetyiqnativebackend.onrender.com/result/${ids}`;

  useEffect(() => {
    const now = new Date();
    const currentHours = now.getUTCHours() + 1; // WAT is UTC+1

    if (currentHours >= 2 && currentHours < 14) {
      setIsStudyTimerActive(true);
      const initialTimers = { ...timers };
      initialTimers["default"] = (14 - currentHours) * 60 * 60; // Time left till 2 PM
      setTimers(initialTimers);
    }

    const intervalId = setInterval(() => {
      updateTimers();
      checkTimeAndUpdateState();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (ids) {
      fetchCurrentTopic();
      fetchUserInfo();
      fetchResult();

      const intervalId = setInterval(() => {
        updateTimers();
        checkTimeAndUpdateState();
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [ids]);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    };

    requestPermissions();
  }, []);

  const fetchUserInfo = () => {
    AsyncStorage.getItem("userInfo")
      .then((info) => {
        const parsedInfo = JSON.parse(info);
        setUserData(parsedInfo);
      })
      .catch((error) => {
        console.log("Error fetching user ", error);
      });
  };

  const fetchCurrentTopic = () => {
    axios
      .get(currentTopicUrl)
      .then((response) => {
        const topics = response.data.currentTopic;
        if (topics) {
          setCourse(topics);
          const initialTimers = { ...timers };
          initialTimers[topics] = (14 - new Date().getUTCHours() - 1) * 60 * 60;
          setTimers(initialTimers);
          setIsStudyTimerActive(true);
        }
      })
      .catch((error) => {
        console.log("no new course to fetch");
      });
  };

  const fetchResult = (courseName) => {
    setIsFetching(true);
    axios
      .get(resultUrl, { params: { course: courseName } })
      .then((response) => {
        setUserScore(response.data.result);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

  const updateTimers = () => {
  setTimers((prevTimers) => {
    const updatedTimers = { ...prevTimers };
    Object.keys(updatedTimers).forEach((key) => {
      if (isStudyTimerActive) {
        updatedTimers[key] = Math.max(updatedTimers[key] - 1, 0); // Prevent going below zero
      }
    });
    return updatedTimers;
  });

   if (isTestTimerActive) {
    setExamTimers((prevExamTimers) => {
      const updatedTimers = { ...prevExamTimers };
      Object.keys(updatedTimers).forEach((key) => {
        updatedTimers[key] = Math.max(updatedTimers[key] - 1, 0); // Prevent going below zero
      });
      return updatedTimers;
    });
  }
};




 const checkTimeAndUpdateState = () => {
   const now = new Date();
   const currentHours = now.getUTCHours() + 1; // WAT is UTC+1

   // Study timer ends at 2 PM (14:00)
   if (currentHours >= 14) {
     setIsStudyTimerActive(false);
     timers[course] = 0; // Ensure study timer stays at 0

     // Test timer starts at 3 PM (15:00)
     if (currentHours > 14 && !isTestTimerActive) {
       setIsTestTimerActive(true);
       const initialExamTimers = { ...examTimers };
       initialExamTimers[course] = 3 * 60 * 60; // 3 hours test due timer
       setExamTimers(initialExamTimers);
     }
   }
 };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReadNowPress = () => {
    const now = new Date();
    const currentHours = now.getUTCHours() + 1; // WAT is UTC+1

    if (currentHours < 2) {
      Alert.alert("Alert", "You can start reading after 2 AM.");
    } else {
      router.push({
        pathname: "ReadCourse",
        params: { course: course },
      });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchResult();

    setTimeout(() => {
      fetchUserInfo();
      fetchCurrentTopic();
      setRefreshing(false);
    }, 2000);
    checkTimeAndUpdateState();
  }, []);

  const handleLogout = () => {
    router.push("login");
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
                      {formatTime(timers[course] || timers["default"])}
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
                <TouchableOpacity onPress={fetchResult}>
                  <Text style={styles.seeMore}>See more</Text>
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
          </>
        ) : (
          <ActivityIndicator size="large" color="#c30000" />
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalBackground}>
          <Pressable
            style={styles.modalView}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalText}>Log Out</Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Yes, log me out</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Modal>
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
});
