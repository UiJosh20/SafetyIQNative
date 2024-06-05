import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import UserRegister from '../Components/UserRegister'

const enroll = () => {
  return (
    <View style={styles.container}>
      <UserRegister/>
    </View>
  )
}

export default enroll

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
    width: "100%",
    backgroundColor:'#fff',
  },
});