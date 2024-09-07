import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import UserExam from '../Components/UserExam';

const exam = () => {
  return (
    <View style={styles.container}>
      <UserExam />
    </View>
  );
};
export default exam;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
    width: "100%",
    backgroundColor: "#fff",
  },
});

