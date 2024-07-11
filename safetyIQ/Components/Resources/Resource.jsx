import { StyleSheet, Text, View } from "react-native";
import { useState, useEffect } from "react";
import axios from "axios";
import { ScrollView } from "react-native";

const Resource = () => {
  const [Data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const port = 100;
  const books = `http://192.168.0.${port}:8000/resources`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get(books).then((response) => {
      console.log(response.data[0]);
      setData(response.data[0]);
    });
  };
  return (
    <ScrollView style={styles.container}>
      <Text>Resource</Text>
      <Text>{Data.title}</Text>

      <Text>{Data.description}</Text>
    </ScrollView>
  );
};

export default Resource;

const styles = StyleSheet.create({
    container:{
        paddingHorizontal: 10,
        textAlign: "justify",
    }
});
