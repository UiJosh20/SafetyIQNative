import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const UserLogin = () => {
  return (
    <View style={styles.container}>
      <Text>UserLogin</Text>
      <Button title="Go to Home" onPress={() => router.push('course')} />
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