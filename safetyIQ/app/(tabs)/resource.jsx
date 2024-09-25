  import React from 'react'

import { Platform, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native'
import CompletedCourse from '../../Components/CompletedCourse'


const resource = () => {
  return (
    <SafeAreaView style={styles.container}>
        <CompletedCourse/>
    </SafeAreaView>
  )
}

export default resource

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
    width: "100%",
    backgroundColor: "#fff",
  },
});