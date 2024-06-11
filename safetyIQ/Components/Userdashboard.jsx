import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Userdashboard = () => {
  const userUrl = "http://192.168.0.100:8000/dashboard";
  const [id, setId] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await AsyncStorage.getItem("userId");
      setId(userId);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (id) {
      axios
        .post(userUrl, { id: id })
        .then((response) => {
          setUserData(response.data.user);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [id]);

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          <View style={styles.header}>
            <View style={styles.circle}></View>
            <View>
              <Text style={styles.welcome}>Welcome</Text>
              <Text style={styles.username}>
                {userData.firstName} {userData.lastName}
              </Text>
            </View>
          </View>

          <View style={styles.redBox}>
            <View style={styles.whiteBox}>
              <Text style={styles.whiteBoxText}>
                Current Topic | Hypoglycemia
              </Text>
            </View>
          </View>
        </>
      ) : (
        <ActivityIndicator animating={true} size="large" color="#C30000" />
      )}
    </View>
  );
};

export default Userdashboard;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  circle: {
    width: 50,
    height: 50,
    backgroundColor: "grey",
    borderRadius: 50,
  },
  welcome: {
    fontFamily: "Kanit-Regular",
    fontSize: 20,
  },
  username: {
    fontFamily: "Kanit-Light",
    fontSize: 12,
  },
  redBox: {
    width: "100%",
    height: 150,
    backgroundColor: "#C30000",
    borderRadius: 10,
    marginTop: 50,
    marginBottom: 20,
  },
  redBoxText: {
    fontFamily: "Kanit-Light",
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
  whiteBox: {
    width: 237,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 10,
    position: "absolute",
    top: -10,
    left: 50,
    paddingHorizontal: 10,
    // Add shadow properties here
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
  },
  whiteBoxText: {
    fontFamily: "Kanit-Light",
    fontSize: 13,
    color: "#000",
    textAlign: "center",
    marginTop: 10,
  },
});

