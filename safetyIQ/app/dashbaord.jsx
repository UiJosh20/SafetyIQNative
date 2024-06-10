import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Userdashboard from '../Components/Userdashboard'

const dashbaord = () => {
  return (
    <View style={styles.container}>
      <Userdashboard/>
    </View>
  )
}

export default dashbaord

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
    width: "100%",
    backgroundColor: "#fff",
  },
});