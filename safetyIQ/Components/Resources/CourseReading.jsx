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
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CourseReading = () => {
  const [resources, setResources] = useState([]);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
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
        }
      })
      .catch((error) => {
        console.log("Error fetching user ID: ", error);
      });
  }, []);

  useEffect(() => {
    if (userId) {
      fetchResources();
    }
  }, [course, userId]);

  const fetchResources = () => {
    setLoading(true);
    axios
      .get(`http://192.168.10.142:8000/read`, {
        params: { courseId: course, userId: userId },
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
    Alert.alert("Confirm", "Are you sure you have read all the resources?", [
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
                {resource.read_duration}
              </Text>
              <Text style={styles.resourceContent}>{resource.read_note}</Text>
            </View>
          ))}
          <Pressable style={styles.nextbtn} onPress={handleNextPress}>
            <Text style={styles.nextbtntext}>Next</Text>
          </Pressable>
          {matchedKeywords.length > 0 && (
            <Text style={styles.resourceContent}>
              Matched keywords: {matchedKeywords.join(", ")}
            </Text>
          )}
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
    lineHeight:30,
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
});
