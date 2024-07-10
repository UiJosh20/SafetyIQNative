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
  Button,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

const Userdashboard = () => {
  const port = 101;
  const userUrl = `http://192.168.0.${port}:8000/dashboard`;
  const profileUrl = `http://192.168.0.${port}:8000/profilePic`;
  const books = `http://192.168.0.${port}:8000/courseFetch`;

  const [id, setId] = useState("");
  const [course, setCourse] = useState("");
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [timers, setTimers] = useState({});

  useEffect(() => {
    fetchUserId();
    setInterval(()=>{

      fetchCurrentTopic();
    }, 1000)
    fetchData();
    fetchCourses();
  }, [id]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateTimers();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timers]);

  const fetchCurrentTopic = () => {
    AsyncStorage.getItem("currentTopic")
      .then((topic) => {
        setCourse(topic);
      })
      .catch((error) => {
        console.log("Error fetching current topic: ", error);
      });
  };

  const fetchUserId = () => {
    AsyncStorage.getItem("userId")
      .then((userId) => {
        if (userId) {
          setId(userId);
        }
      })
      .catch((error) => {
        console.log("Error fetching user ID: ", error);
      });
  };

  const fetchData = () => {
    axios
      .post(userUrl, { id: id })
      .then((response) => {
        setUserData(response.data.user);
        setRefreshing(false);
      })
      .catch((error) => {
        console.log(error);
        setRefreshing(false);
      });
  };

  const fetchCourses = () => {
    axios
      .get(books)
      .then((response) => {
        setItems(response.data);
        const initialTimers = response.data.reduce((acc, course) => {
          acc[course.name] = 17 * 60 * 60; // 17 hours in seconds
          return acc;
        }, {});
        setTimers(initialTimers);
      })
      .catch((error) => {
        console.log("Error fetching courses:", error);
      });
  };

  const updateTimers = () => {
    setTimers((prevTimers) => {
      const updatedTimers = { ...prevTimers };
      Object.keys(updatedTimers).forEach((key) => {
        if (updatedTimers[key] > 0) {
          updatedTimers[key] -= 1;
        }
      });
      return updatedTimers;
    });
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const pickImage = async () => {
  console.log("pickImage");
}
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
                <View>
                  <Text
                    style={{ color: "white", marginTop: 20, marginBottom: 5 }}
                  >
                    Study Time Left:{" "}
                  </Text>
                  <Text style={styles.timer}>{formatTime(timers[course])}</Text>
                </View>
                <View>
                  <Text
                    style={{ color: "white", marginTop: 20, marginBottom: 5 }}
                  >
                    Test due:{" "}
                  </Text>
                  <Text style={styles.timer}>{formatTime(timers[course])}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  padding: 10,
                  borderRadius: 5,
                  marginTop: -25,
                }}
              >
                <Text style={{ color: "#C30000" }}>Read More</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <ActivityIndicator
            animating={true}
            size="large"
            color="#C30000"
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          />
        )}

        <View>
          <View>
            <Text>Latest test result</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Upload Profile Picture</Text>
            <Button title="Choose Image" onPress={pickImage} />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
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
    backgroundColor: "#fff",
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
    // paddingVertical: 25,
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
    width: 250,
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
});
