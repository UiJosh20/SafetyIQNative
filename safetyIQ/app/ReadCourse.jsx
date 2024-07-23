import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ReadNow from '../Components/Resources/ReadNow'

const ReadCourse = () => {
  return (
    <View style={styles.container}>
      <ReadNow/>
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