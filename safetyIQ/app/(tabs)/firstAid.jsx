import React from 'react'
import Resource from "../../Components/Resources/Resource";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";

const firstAid = () => {
  return (
    <View style={styles.container}>
            <Resource/>
    </View>
  )
}

export default firstAid

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
    width: "100%",
    backgroundColor: "#fff",
  },
});