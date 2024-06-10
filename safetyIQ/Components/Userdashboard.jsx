import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Userdashboard = () => {
  return (
    <View style={styles.container}>
      <Text>Userdashboard</Text>
    </View>
  )
}

export default Userdashboard

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
});