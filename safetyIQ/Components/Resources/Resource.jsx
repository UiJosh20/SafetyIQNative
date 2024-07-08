import { StyleSheet, Text, View } from "react-native";
import { useState, useEffect } from "react";
import axios from "axios";

const Resource = () => {
  const [Data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const port = 101;
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
    <View style={styles.container}>
      <Text>Resource</Text>
      <Text>{Data.title}</Text>

      <Text>{Data.description}</Text>
      {/* {Data.map((user, i) => {
        <View key={i}>
        </View>
      })} */}
    </View>
  );
};

export default Resource;

const styles = StyleSheet.create({
    container:{
        paddingHorizontal: 10,
        textAlign: "justify",
    }
});
