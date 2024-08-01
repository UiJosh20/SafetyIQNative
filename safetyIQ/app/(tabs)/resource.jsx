  import React from 'react'

import { Platform, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native'
// import CourseReading from '../../Components/Resources/CourseReading'

const resource = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* <CourseReading/> */}
    </SafeAreaView>
  )
}

export default resource

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
    width: "100%",
    backgroundColor: "#fff",
  },
});