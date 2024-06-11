import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

const TabLayout = () => {
  return (
    <Tabs screenOptions={{ tabBarStyle: styles.nav }}>
      <Tabs.Screen name="dashbaord" options={{ headerShown: false, title: 'Home', 
        
       }} />
    </Tabs>
  );
}

export default TabLayout
const styles = StyleSheet.create({
  nav: {
    backgroundColor: "#c30000",
    height: 70,
    borderRadius: 10,
  },
  text: {
    color:"white",
   fontSize: 20,
  },
});