import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";


const Resource = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [reads, setReads] = useState([]);
  const [modalLoader, setModalLoader] = useState(false);

  const booksUrl = `https://safetyiqnativebackend.onrender.com/courseFetch`;
  const readUrl = `https://safetyiqnativebackend.onrender.com/resources`;

  useEffect(() => {
    fetchCourse();
    fetchCompletedCourses();
  }, []);

  // Memoized filter operation for better performance
  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Fetch courses
  const fetchCourse = useCallback(() => {
    setLoading(true);
    axios
      .get(booksUrl)
      .then((response) => {
        setItems(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error fetching courses:", error);
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  // Fetch completed courses from AsyncStorage
  const fetchCompletedCourses = useCallback(() => {
    AsyncStorage.getItem("completedCourses")
      .then((data) => {
        if (data) {
          setCompletedCourses(JSON.parse(data));
        }
      })
      .catch((error) => {
        console.error("Error fetching completed courses:", error);
      });
  }, []);

  // Save completed course in AsyncStorage
  const saveCompletedCourse = useCallback(
    (course) => {
      const updatedCompletedCourses = [...completedCourses, course];
      setCompletedCourses(updatedCompletedCourses);
      AsyncStorage.setItem(
        "completedCourses",
        JSON.stringify(updatedCompletedCourses)
      ).catch((error) => {
        console.error("Error saving completed course:", error);
      });
    },
    [completedCourses]
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourse();
  };

  const handleSelectCourse = useCallback((course) => {
    setSelectedCourse(course);
    handleFetchResources(course.name);
    setCurrentPage(0);
    setModalVisible(true);
    AsyncStorage.setItem("currentTopic", course.name).catch((error) => {
      console.error("Error saving as current topic:", error);
    });
  }, []);

  // Fetch resources for selected course
  const handleFetchResources = useCallback((courseName) => {
    axios
      .get(readUrl, { params: { course: courseName } })
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
  }, []);

  // Handle pagination for reading content
  const handleNextPage = useCallback(() => {
    const currentRead = reads[currentPage];
    if (currentRead && currentRead.content) {
      const totalWords = currentRead.content.split(" ").length;
      const totalPages = Math.ceil(totalWords / 1000);

      if (currentPage < totalPages - 1) {
        setCurrentPage((prevPage) => prevPage + 1);
      } else if (currentPage === totalPages - 1 && reads.length > 1) {
        setReads(reads.slice(1)); // Move to the next read
        setCurrentPage(0); // Reset to the first page of the next read
      } else {
        saveCompletedCourse(selectedCourse);
        setModalVisible(false);
      }
    }
  }, [currentPage, reads, selectedCourse]);

  // FlatList rendering for efficient memory usage
  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity onPress={() => handleSelectCourse(item)}>
        <View style={styles.book}>
          <View style={styles.courseInfo}>
            <View style={styles.circlegreen}></View>
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
    ),
    [handleSelectCourse]
  );

  return (

    <>
    <View style={styles.container}>
      <Text style={styles.header}>First Aid Tips</Text>
      <View style={styles.searchContainer}>
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
        <ActivityIndicator style={styles.loader} size={57} color="#c30000" />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <Icon
            name="chevron-left"
            size={20}
            color="#000"
            onPress={() => setModalVisible(false)}
          />
        </View>
        {modalLoader ? (
          <ActivityIndicator style={styles.loader} size={57} color="#c30000" />
        ) : (
          <ScrollView style={styles.modalContainer}>
            {reads.length > 0 ? (
              <View style={styles.modalContent}>
                {reads.map((item, i) => (
                  <View key={i} style={styles.resourceItem}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.resourceImage}
                    />
                    <Text style={styles.resourceTitle}>{item.title}</Text>
                    <Text style={styles.modalText}>{item.description}</Text>
                    <Text style={styles.time}>Time: {item.time_taken}</Text>
                    <Text style={styles.resourceContent}>{item.note}</Text>
                  </View>
                ))}
                <Pressable onPress={handleNextPage} style={styles.finishButton}>
                  <Text style={styles.nextButton}>Next</Text>
                </Pressable>
              </View>
            ) : (
              <Text>No resources available</Text>
            )}
          </ScrollView>
        )}
      </Modal>
    </View>
    </>
  );
};

export default Resource;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 10 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInput: {
    width: "100%",
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingVertical: 30 },
  book: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems:"center",
    paddingVertical: 20,
    paddingHorizontal: 13,
  },
  courseInfo: { flexDirection: "row", alignItems: "center" , gap:20 },
  circlegreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#c30000",
  },
  icon: { marginRight: 10 },
  modalOverlay: { padding: 20, backgroundColor: "white" },
  modalContainer: { flex: 1 },
  modalContent: { padding: 20 },
  resourceItem: { marginBottom: 20 },
  resourceImage: { width: "100%", height: 200 },
  resourceTitle: { fontSize: 17, fontWeight: "bold", marginTop: 15 },
  modalText: { fontSize: 15, marginBottom: 20 },
  time: { fontSize: 15, marginBottom: 20 },
  resourceContent: { textAlign: "justify", marginBottom: 20 },
  finishButton: {
    padding: 15,
    backgroundColor: "#c30000",
    borderRadius: 30,
    marginVertical: 20,
  },
  nextButton: { color: "white", textAlign: "center", fontSize: 18 },
});
