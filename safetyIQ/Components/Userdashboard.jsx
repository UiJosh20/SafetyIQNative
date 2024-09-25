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

const Userdashboard = () => {
  const [state, setState] = useState({
    ids: "",
    course: "",
    userData: null,
    refreshing: false,
    modalVisible: false,
    userScore: [],
    selectedImage: null,
    timers: {},
    examTimers: {},
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
    () => `https://safetyiqnativebackend.onrender.com/currentTopic/${state.ids}`,
    [state.ids]
  );
  const resultUrl = useMemo(
    () => `https://safetyiqnativebackend.onrender.com/result/${state.ids}`,
    [state.ids]
  );

  const getCompletedCourse = useMemo(
    () => `http://192.168.0.102:8000/getcomplete/${state.ids}`,
    [state.ids]
  );

  useEffect(() => {
    if (state.ids) {
      fetchCurrentTopic();
      fetchUserInfo();
      fetchCompletedTopics();
      
    }
  }, [state.ids]);

  useEffect(() => {
    const now = new Date();
    const currentHours = now.getUTCHours() + 1;

    if (currentHours >= 2 && currentHours < 14) {
      setState((prev) => ({
        ...prev,
        isStudyTimerActive: true,
        timers: { default: (14 - currentHours) * 60 * 60 },
      }));
    }

    const intervalId = setInterval(() => {
      updateTimers();
      checkTimeAndUpdateState();
    }, 1000); 

    return () => clearInterval(intervalId);
  }, [state.timers, state.examTimers, state.isStudyTimerActive, state.isTestTimerActive]);

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
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
};


  const fetchCompletedTopics = useCallback(() => {
    axios
      .get(getCompletedCourse)
      .then((response) => {
        setState((prev) => ({
          ...prev,
          completedTopics: response.data.completedCourses[0].courseName,
        }));
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, [getCompletedCourse]);

const fetchCurrentTopic = useCallback(() => {
  axios
    .get(currentTopicUrl)
    .then((response) => {
      const topics = response.data.currentTopic;
      if (topics) {
        setState((prev) => ({
          ...prev,
          course: topics,
          timers: {
            ...prev.timers,
            [topics]: (14 - new Date().getUTCHours() - 1) * 60 * 60,
          },
          isStudyTimerActive: true,
        }));
        checkIfTopicIsCompleted(topics);
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

 const updateTimers = () => {
   setState((prev) => {
     const updatedTimers = { ...prev.timers };

     // Update study timers if active
     if (prev.isStudyTimerActive) {
       Object.keys(updatedTimers).forEach((key) => {
         updatedTimers[key] = Math.max(updatedTimers[key] - 1, 0); // Decrease study time
       });
     }

     // Update exam timers if active
     const updatedExamTimers = { ...prev.examTimers };
     if (prev.isTestTimerActive) {
       Object.keys(updatedExamTimers).forEach((key) => {
         updatedExamTimers[key] = Math.max(updatedExamTimers[key] - 1, 0); // Decrease exam time
       });
     }

     return { ...prev, timers: updatedTimers, examTimers: updatedExamTimers };
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
  const currentHours = now.getUTCHours() + 1;

  if (currentHours >= 14) {
    setState((prev) => ({
      ...prev,
      isStudyTimerActive: false,
      timers: { ...prev.timers, [state.course]: 0 },
    }));

    if (!state.isTestTimerActive) {
      setState((prev) => ({
        ...prev,
        isStudyTimerActive: false,
        isTestTimerActive: true,
        examTimers: { ...prev.examTimers, [state.course]: 3 * 60 * 60 }, // 3 hours for the exam
      }));

      sendExamStartNotification(); // Ensure notification is only sent once
    }
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
    setState((prev) => ({ ...prev, refreshing: true }));
    fetchResult(state.course);

    setTimeout(() => {
      fetchUserInfo();
      fetchCurrentTopic();
      setState((prev) => ({ ...prev, refreshing: false }));
    }, 2000);
    checkTimeAndUpdateState();
  }, [state.course]);

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
                       {timers[course] === 0
                         ? formatTime(examTimers[course] ?? 3 * 60 * 60)
                         : formatTime(timers[course])}
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
