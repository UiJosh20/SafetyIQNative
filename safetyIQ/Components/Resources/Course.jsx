import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";

const Course = () => {
  const [items, setItems] = useState([]);
  const port = 101;
  const books = `http://192.168.0.${port}:8000/courseFetch`;

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = () => {
    axios
      .get(books)
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  };

  return (
    <View style={styles.container}>
        <Text style={{fontSize: 24, fontWeight: "bold", marginBottom: 10}}>Courses</Text>
      <ScrollView>
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
    </View>
  );
};

export default Course;

const styles = StyleSheet.create({
    container:{
        paddingHorizontal: 10,
        width: "100%",
    },
    book:{
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "gray",
    }
});
