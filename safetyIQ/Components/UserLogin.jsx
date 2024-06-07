import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const UserLogin = () => {
  return (
    <View style={styles.container}>
      <Text>UserLogin</Text>
    </View>
  )
}

export default UserLogin

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
});