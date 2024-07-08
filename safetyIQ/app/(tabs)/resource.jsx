import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Resource from '../../Components/Resources/Resource'

const resource = () => {
  return (
    <View style={styles.container}>
      <Resource/>
    </View>
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