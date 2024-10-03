import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";

const CompletedCourse = () => {
  const [state, setState] = useState({
    ids: "",
    completedTopics: [],
    loading: true, // New state to manage loading
  });

  const { ids, completedTopics, loading } = state;

  const fetchUserID = async () => {
    try {
      const result = await AsyncStorage.getItem("userId");
      let parsedID = JSON.parse(result);
      setState((prev) => ({ ...prev, ids: parsedID }));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCompletedTopics = useCallback(() => {
    const getCompletedCourse = `https://safetyiqnativebackend.onrender.com/getcomplete/${ids}`;
    setState((prev) => ({ ...prev, loading: true })); // Set loading to true when fetching
    axios
      .get(getCompletedCourse)
      .then((response) => {
        const courses = response.data.completedCourses.map(
          (course) => course.courseName
        );
        setState((prev) => ({
          ...prev,
          completedTopics: courses,
          loading: false, // Set loading to false after fetching
        }));
        console.log("Fetched completed courses:", courses);
      })
      .catch((error) => {
        console.error("Error fetching completed topics:", error.message);
        setState((prev) => ({ ...prev, loading: false })); // Set loading to false if error occurs
      });
  }, [ids]);

  useEffect(() => {
    fetchUserID();
  }, []);

  useEffect(() => {
    if (ids) {
      fetchCompletedTopics();
    }
  }, [ids]);

  return (
    <> 
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={{ fontSize: 30, fontWeight: "bold", textAlign: "center" }}>
        Completed Courses
      </Text>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#c30000" /> // Show loading indicator
        ) : completedTopics.length > 0 ? (
          <FlatList
          style={{marginTop:30}}
            data={completedTopics}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.list}>
                <View style={{flexDirection:"row", gap:10, alignItems:'center'}}>
                <View style={styles.circlegreen}></View>
                <Text style={styles.courseItem}>{item}</Text>
                </View>
                <Icon
                  name="chevron-right" // Chevron icon
                  size={20}
                  color="black"
                  style={styles.chevronIcon} // Optional: add styling for the icon
                />
              </View>
            )}
          />
        ) : (
          <Text>No completed courses</Text>
        )}
      </View>
    </SafeAreaView>
    </>
  );
};

export default CompletedCourse;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  courseItem: {
    fontSize: 14,
    marginVertical: 5,
    marginLeft: 10, // Add some space between the icon and the text
  },
  circlegreen: {
    padding: 10,
    backgroundColor: "lightgreen",
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  list: {
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center vertically
    width: "100%",
    padding: 10,
    justifyContent: "space-between",
  },
  chevronIcon: {
    marginRight: 10, // Optional: add margin to the right of the icon
  },
});
