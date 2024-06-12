import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.nav,
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarLabelStyle: styles.tabBarLabel, // Add this line
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome5
              name="home"
              color={color}
              size={size}
              solid={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="firstAid"
        options={{
          headerShown: false,
          title: "First Aid",
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome5
              name="medkit"
              color={color}
              size={size}
              solid={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="course"
        options={{
          headerShown: false,
          title: "Course",
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome5
              name="book"
              color={color}
              size={size}
              solid={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nuggets"
        options={{
          headerShown: false,
          title: "Daily Nugget",
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome5
              name="lightbulb"
              color={color}
              size={size}
              solid={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;

const styles = StyleSheet.create({
  nav: {
    backgroundColor: "#c30000",
    height: 70,
    borderRadius: 10,
    paddingBottom: 10,
  },
  tabBarLabel: {
    marginTop: -9,
  },
});
