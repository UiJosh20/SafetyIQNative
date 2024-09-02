import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const nuggets = () => {
  return (
    <View style={styles.container}>
      <Text>This page is under maintenance</Text>
    </View>
  )
}

export default nuggets

const styles = StyleSheet.create({
  container:{
    flex:1,
    alignItems:"center",
    justifyContent:"center",
    paddingTop:Platform.OS === "android" ? StatusBar.currentHeight :0,
  }
})