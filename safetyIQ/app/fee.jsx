import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ProgramFee from '../Components/ProgramFee';

const fee = () => {
  return (
    <View style={styles.container}>
      <ProgramFee />
    </View>
  );
}

export default fee

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
    width: "100%",
    backgroundColor: "#fff",
  },
});