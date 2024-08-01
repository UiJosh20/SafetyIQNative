import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CourseReading from '../Components/Resources/CourseReading'

const ReadCourse = () => {
  return (
    <View style={styles.container}>
      <CourseReading/>
    </View>
  )
}

export default ReadCourse

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
    width: "100%",
    backgroundColor: "#fff",
  },
});