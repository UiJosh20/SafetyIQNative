import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const Rootlayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="enroll" options={{ headerShown: false }} />
      <Stack.Screen name="course" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="fee" options={{ headerShown: false }} />
    </Stack>
  );
}

export default Rootlayout

const styles = StyleSheet.create({})