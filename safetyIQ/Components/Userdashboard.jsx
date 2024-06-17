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
  const port = 102;
  const userUrl = `http://192.168.0.${port}:8000/dashboard`;
  const profileUrl = `http://192.168.0.${port}:8000/profilePic`;
  const [id, setId] = useState("");
  const [course, setCourse] = useState("");
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchCourseName = () => {
    AsyncStorage.getItem("courseName")
      .then((course) => {
        setCourse(course);
      })
      .catch((error) => {
        console.log("Error fetching course name: ", error);
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

  useEffect(() => {
    fetchUserId();
    fetchCourseName();
    fetchData();
  }, [id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

 const pickImage = () => {
   ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Images,
     allowsEditing: true,
     aspect: [4, 3],
     quality: 1,
   })
     .then((result) => {
       if (!result.canceled) {
         setSelectedImage(result.assets[0].uri);
         const formData = new FormData();
         formData.append("image", {
           uri: result.assets[0].uri,
           name: "profile.jpg",
           type: "image/jpeg",
         });

         axios
           .post(profileUrl, formData, {
             headers: {
               "Content-Type": "multipart/form-data",
               id: id,
             },
           })
           .then((response) => {
             console.log(response.data);
           })
           .catch((error) => {
             console.log(error);
           });
       }
     })
     .catch((error) => {
       console.log(error);
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
                  <Text style={styles.avatarPlaceholder}>{userData.firstName[0]}</Text>
                )}
              </TouchableOpacity>
              <View>
                <Text style={styles.welcome}>Welcome</Text>
                <Text style={styles.username}>
                  {userData.firstName} {userData.lastName}
                </Text>
              </View>
            </View>

            <View style={styles.redBox}>
              <View style={styles.whiteBox}>
                <Text style={styles.whiteBoxText}>
                  Current Topic | Hypoglycemia
                </Text>
              </View>
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
    backgroundColor: "#C30000",
    borderRadius: 10,
    marginTop: 50,
    marginBottom: 20,
  },
  whiteBox: {
    width: 250,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 10,
    position: "absolute",
    top: -10,
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
});
