import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useFonts } from "@expo-google-fonts/inter";
import { router} from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
const CourseDetail = () => {
  const [fontsLoaded, fontError] = useFonts({
    "Kanit-Bold": require("./../assets/fonts/Kanit-Bold.ttf"),
    "Kanit-Regular": require("./../assets/fonts/Kanit-Regular.ttf"),
    "Kanit-Italic": require("./../assets/fonts/Kanit-Italic.ttf"),
    "Kanit-Light": require("./../assets/fonts/Kanit-Light.ttf"),
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }



  const userEnroll = (packageName, packagePrice) =>{
  AsyncStorage.setItem("courseName", packageName)
    .then(() => AsyncStorage.setItem("coursePrice", packagePrice))
    .then(() => {
      router.push("enroll", { packageName, packagePrice });
    })
    .catch((error) => {
      console.error("Failed to save the course details:", error);
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Choose a FRP Package</Text>

      <ScrollView style={styles.cardContainer}>
        <View style={styles.red}>
          <View style={styles.cardholder}>
            <View style={styles.circlegreen}>
              <Image source={require("../assets/diploma.svg")} />
            </View>
            <Text style={styles.cardText}>Corpers’ Basic FRP </Text>
          </View>
          <View style={styles.holdtextbtn}>
            <Text style={styles.holdtext}>
              Program for corps members. Learn the essentials for success for
              ₦2,000.
            </Text>
            <TouchableOpacity
              style={styles.holdbtn}
              onPress={() => {
                userEnroll(
                  "Corpers’ Basic FRP",
                  "₦2,000 (Two thousand naira only)"
                );
              }}
            >
              <Text style={styles.holdbtntext1}>Enroll Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.blue}>
          <View style={styles.cardholder1}>
            <View style={styles.circleplus}>
              <Image source={require("../assets/award.png")} />
            </View>
            <Text style={styles.cardText1}>General Basic FRP </Text>
          </View>
          <View style={styles.holdtextbtn1}>
            <Text style={styles.holdtext1}>
              Build a strong FRP foundation with this beginner program. Gain
              confidence for ₦20,000.
            </Text>
            <TouchableOpacity
              style={styles.holdbtn1}
              onPress={() => {
                userEnroll(
                  "General Basic FRP",
                  "₦20,000 (Twenty thousand naira only)"
                );
              }}
            >
              <Text style={styles.holdbtntext2}>Enroll Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.purple}>
          <View style={styles.cardholder2}>
            <View style={styles.circlepurple}>
              <Image source={require("../assets/award.png")} />
            </View>
            <Text style={styles.cardText3}>Advanced FRP </Text>
          </View>
          <View style={styles.holdtextbtn3}>
            <Text style={styles.holdtext3}>
              Advance your FRP skills with this expert program. Master
              techniques for ₦50,000.
            </Text>
            <TouchableOpacity
              style={styles.holdbtn3}
              onPress={() => {
                userEnroll(
                  "Advanced FRP",
                  "₦50,000 (Fifty Thousand naira only)"
                );
              }}
            >
              <Text style={styles.holdbtntext4}>Enroll Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.crimson}>
          <View style={styles.cardholder2}>
            <View style={styles.circlecrimson}>
              <Image source={require("../assets/award.png")} />
            </View>
            <Text style={styles.cardText2}>Continuous/Refresher </Text>
          </View>
          <View style={styles.holdtextbtn}>
            <Text style={styles.holdtext2}>
              Stay current on FRP practices. Renew qualifications or refresh
              knowledge for ₦15,000.
            </Text>
            <TouchableOpacity
              style={styles.holdbtn2}
              onPress={() => {
                userEnroll(
                  "Continuous/Refresher",
                  "₦15,000 (Fifteen thousand naira only)"
                );
              }}
            >
              <Text style={styles.holdbtntext3}>Enroll Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CourseDetail;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  red: {
    backgroundColor: "#ECFFEC",
    height: 250,
    marginVertical: 10,
    borderRadius: 30,
    borderColor: "#CBE8CB",
    borderWidth: 1,
  },
  blue: {
    backgroundColor: "#F1FDFF",
    height: 250,
    marginVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#C9E4E9",
  },
  text: {
    fontFamily: "Kanit-Bold",
    fontSize: 24,
    color: "#222222",
    textAlign: "center",
  },
  circlegreen: {
    padding: 10,
    backgroundColor: "#62F562",
    width: 50,
    height: 50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#003D00",
  },
  cardholder: {
    flexDirection: "row",
    gap: 40,
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 25,
  },

  cardText: {
    fontFamily: "Kanit-Regular",
    fontSize: 16,
    color: "#003D00",
  },
  holdtextbtn: {
    paddingHorizontal: 25,
  },
  holdtext: {
    fontFamily: "Kanit-Light",
    fontSize: 12,
    marginVertical: 10,
  },
  holdbtn: {
    backgroundColor: "#62F562",
    width: 100,
    padding: 7,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  holdbtntext1: {
    color: "#003D00",
    fontFamily: "Kanit-Regular",
  },

  //   blue course

  circleplus: {
    padding: 10,
    backgroundColor: "#5BE4FB",
    width: 50,
    height: 50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#004753",
  },
  cardholder1: {
    flexDirection: "row",
    gap: 40,
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 25,
  },

  cardText1: {
    fontFamily: "Kanit-Regular",
    fontSize: 16,
    color: "#004753",
  },
  holdtextbtn1: {
    paddingHorizontal: 25,
  },
  holdtext1: {
    fontFamily: "Kanit-Light",
    fontSize: 12,
    color: "#1C1A1A",
    marginVertical: 10,
  },
  holdbtn1: {
    backgroundColor: "#5BE4FB",
    width: 100,
    padding: 7,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  holdbtntext2: {
    color: "#004753",
    fontFamily: "Kanit-Regular",
  },

  crimson: {
    backgroundColor: "#FFE3E3",
    height: 250,
    marginVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E5CBCB",
    marginBottom: 100,
  },

  circlecrimson: {
    padding: 10,
    backgroundColor: "#FF6666",
    width: 50,
    height: 50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#690000",
  },
  cardholder2: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 25,
  },

  cardText2: {
    fontFamily: "Kanit-Regular",
    fontSize: 16,
    color: "#004753",
  },
  holdtextbtn1: {
    paddingHorizontal: 25,
  },
  holdtext2: {
    fontFamily: "Kanit-Light",
    fontSize: 12,
    color: "#1C1A1A",
    marginVertical: 10,
  },
  holdbtn2: {
    backgroundColor: "#FF6666",
    width: 100,
    padding: 7,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  holdbtntext3: {
    color: "#FFFFFF",
    fontFamily: "Kanit-Regular",
  },

  purple: {
    backgroundColor: "#EDEAFF",
    height: 250,
    marginVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#C8C1ED",
    // marginBottom: 100,
  },

  circlepurple: {
    padding: 10,
    backgroundColor: "#6146FF",
    width: 50,
    height: 50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#0E0062",
  },
  holdtextbtn3: {
    paddingHorizontal: 25,
  },
  cardText3: {
    fontFamily: "Kanit-Regular",
    fontSize: 16,
    color: "#004753",
  },
  holdtext3: {
    fontFamily: "Kanit-Light",
    fontSize: 12,
    color: "#1C1A1A",
    marginVertical: 10,
  },
  holdbtn3: {
    backgroundColor: "#6146FF",
    width: 100,
    padding: 7,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  holdbtntext4: {
    color: "#FFFFFF",
    fontFamily: "Kanit-Regular",
  },
});
