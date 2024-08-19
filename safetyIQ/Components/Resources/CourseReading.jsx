import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  Image,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CourseReading = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null); // Added state for userId
  const route = useRoute();
  const { course } = route.params;

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
      .get(`http://192.168.178.2:8000/read`, {
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
                style={{ width: "100%", height: 200 }}
              ></Image>
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
          <Button title="Next" color={"red"}  />
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
  },
  resourceContent: {
    fontSize: 14,
  },
});
