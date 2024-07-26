import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Button,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";

const Resource = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const port = 102;
  const books = `http://192.168.0.${port}:8000/courseFetch`;
  const read = `http://192.168.0.${port}:8000/resources`;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [reads, setReads] = useState([]);
  const [modalLoader, setModalLoader] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchCompletedCourses();
  }, []);

  const fetchCourse = () => {
    setLoading(true);
    axios
      .get(books)
      .then((response) => {
        setItems(response.data);
        setTimeout(() => {
          setRefreshing(false);
          setLoading(false);
        }, 2500);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setLoading(false);
        setRefreshing(false);
      });
  };

  const fetchCompletedCourses = () => {
    AsyncStorage.getItem("completedCourses")
      .then((data) => {
        if (data) {
          setCompletedCourses(JSON.parse(data));
        }
      })
      .catch((error) => {
        console.error("Error fetching completed courses:", error);
      });
  };

  const saveCompletedCourse = (course) => {
    const updatedCompletedCourses = [...completedCourses, course];
    setCompletedCourses(updatedCompletedCourses);
    AsyncStorage.setItem(
      "completedCourses",
      JSON.stringify(updatedCompletedCourses)
    ).catch((error) => {
      console.error("Error saving completed course:", error);
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourse();
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course.name);
    handleFetchResources(course.id);
    setCurrentPage(0);
    setModalVisible(true);
    AsyncStorage.setItem("currentTopic", course.name).catch((error) => {
      console.error("Error saving as current topic:", error);
    });
  };

  const handleFetchResources = (courseId) => {
    axios
      .get(read, { params: { courseId } })
      .then((response) => {
        setModalLoader(true);
        setTimeout(() => {
          setReads(response.data);
          setModalLoader(false);
        }, 2000);
      })
      .catch((error) => {
        console.error("Error fetching resources:", error);
      });
  };

  const handleNextPage = () => {
    const currentRead = reads[currentPage];
    if (currentRead && currentRead.content) {
      const totalWords = currentRead.content.split(" ").length;
      const totalPages = Math.ceil(totalWords / 1000);

      if (currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1);
      } else if (currentPage === totalPages - 1 && reads.length > 1) {
        setReads(reads.slice(1)); // Move to the next read
        setCurrentPage(0); // Reset to the first page of the next read
      } else {
        saveCompletedCourse(selectedCourse);
        setModalVisible(false);
      }
    }
  };

  const renderContent = (content) => {
    if (content) {
      const words = content.split(" ");
      const pageWords = words.slice(
        currentPage * 200,
        (currentPage + 1) * 200
      );
      return pageWords.join(" ");
    }
    return "";
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
        Topics
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
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            marginTop: 70,
          }}
        >
          <ActivityIndicator size={57} color="#c30000" />
        </View>
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
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 30,
                      alignItems: "center",
                    }}
                  >
                    <View style={styles.circlegreen}>
                      {/* <Image source={require("../assets/diploma.svg")} /> */}
                    </View>
                    <Text>{item.name}</Text>
                  </View>
                  <Icon
                    name="chevron-right"
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

      <Modal visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <Icon
            name="chevron-left"
            size={20}
            color="#000"
            style={styles.icon}
            onPress={() => setModalVisible(false)}
          />
        </View>
        {modalLoader ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.7)",
            }}
          >
            <ActivityIndicator size={57} color="#c30000" />
          </View>
        ) : (
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {reads.length > 0 && reads[currentPage] && (
                <>
                  <Text style={styles.resourseTile}>
                    {reads[currentPage].title}
                  </Text>
                  <Text style={styles.time}>9hrs 45mins 32Sec</Text>
                  <Text style={styles.modalText}>
                    {reads[currentPage].description}
                  </Text>
                </>
              )}
              <Pressable onPress={handleNextPage}>
                <Text>Next</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </Modal>
    </View>
  );
};

export default Resource;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
    width: "100%",
  },
  book: {
    paddingVertical: 20,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  circlegreen: {
    padding: 10,
    backgroundColor: "#c30000",
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
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 17,
    paddingVertical: 15,
    backgroundColor: "white",
  },
  modalText: {
    textAlign: "justify",
    marginBottom: 20,
    fontSize: 15,
  },

  time: {
    textAlign: "justify",
    marginBottom: 20,
    fontSize: 15,
  },
  completedCoursesHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  completedCoursesContainer: {
    maxHeight: 100,
    marginBottom: 20,
  },
  completedCourse: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    marginVertical: 5,
  },
  modalOverlay: {
    padding: 20,
    backgroundColor: "white",
  },
  resourseTile: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
