import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import UserLogin from '../Components/UserLogin'

const index = () => {
  return (
    <View style={styles.container}>
      <UserLogin/>
    </View>
  )
}

export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
    width: "100%",
    backgroundColor: "#fff",
  },
});