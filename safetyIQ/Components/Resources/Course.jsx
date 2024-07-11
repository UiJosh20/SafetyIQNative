import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome"; // Import the FontAwesome icons

const Course = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const port = 100;
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

  const handleSelectCourse = (course) => {
    AsyncStorage.setItem("currentTopic", course.name)
      .then(() => {})
      .catch((error) => {
        console.error("Error saving as current topic:", error);
      });
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        Completed Topics
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
      >
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          placeholderTextColor={"#A2A4A3"}
          cursorColor={"#000"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#c30000" />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={{ height: "100%", marginTop: 30 }}
        >
          {filteredItems.length === 0 ? (
            <Text>No Topic available</Text>
          ) : (
            filteredItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectCourse(item)}
              >
                <View style={styles.book}>
                  <View style={{ flexDirection: "row", gap: 30,}}>
                  <View style={styles.circlegreen}>
                    {/* <Image source={require("../assets/diploma.svg")} /> */}
                  </View>
                  <Text>{item.name}</Text>
                  </View>
                  <Icon
                    name="arrow-right"
                    size={20}
                    color="#000"
                    style={styles.icon}
                  />
                </View>
              </TouchableOpacity>
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
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:"space-between",
    gap: 20, // Adjusted to fit the icon properly
  },
  circlegreen: {
    padding: 10,
    backgroundColor: "#D8FFEB",
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  searchInput: {
    width: "100%",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  icon: {
    marginRight: 10,
  },
});
