import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";

const Course = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const port = 101;
  const books = `http://192.168.0.${port}:8000/courseFetch`;

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = () => {
    setLoading(true);
    axios
      .get(books)
      .then((response) => {
        setItems(response.data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setLoading(false);
        setRefreshing(false);
      });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourse();
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
        Courses
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#c30000" />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={{height: "100%"}}
        >
          {items.length === 0 ? (
            <Text>No courses available</Text>
          ) : (
            items.map((item, index) => (
              <View key={index} style={styles.book}>
                <Text>{item.name}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Course;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    width: "100%",
  },
  book: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
});
