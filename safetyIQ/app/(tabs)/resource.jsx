  import React from 'react'
import Course from '../../Components/Resources/Course'
import { Platform, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native'

const resource = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Course/>
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