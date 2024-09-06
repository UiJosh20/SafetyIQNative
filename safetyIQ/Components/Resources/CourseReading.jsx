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

const CourseReading = () => {
  const [resources, setResources] = useState([]);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(true);
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
    .get(`http://192.168.0.103:8000/read`, {
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

  const handleKeywordPrompt = () => {
    Alert.prompt(
      "Enter keywords from the readings",
      "Please enter some keywords from the readings to confirm you have read them",
      (text) => {
        setKeywords(text);
        const matched = text.split(",").filter((keyword) => {
          return resources.some((resource) => {
            return resource.read_description
              .toLowerCase()
              .includes(keyword.toLowerCase());
          });
        });
        setMatchedKeywords(matched);
        console.log("Keywords:", text);
      }
    );
  };

  const handleNextPress = () => {
    Alert.alert("Confirm", "Are you sure you have read the resources?", [
      {
        text: "Yes, I have read them",
        onPress: handleKeywordPrompt,
      },
      {
        text: "No, I haven't read them",
        style: "cancel",
      },
    ]);
  };
  const handleShowNoteModal = (resource) => {
    setSelectedResource(resource);
    setShowNoteModal(true);
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
                {" "}
                <Text style={styles.resourceContent}>{resource.read_description}</Text>
                {resource.read_duration}
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

              <ScrollView>
                {resources.map((resource, index) => (
                  <View key={index}>
                    <Text style={styles.resourceContent}>
                      {resource.read_note}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <Pressable
                style={styles.finishButton}
                onPress={handleNextPress}
              >
                <Text style={styles.finishButtonText}>Finish</Text>
              </Pressable>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign:"center"
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
});
