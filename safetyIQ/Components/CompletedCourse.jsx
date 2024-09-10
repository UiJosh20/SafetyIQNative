import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const CompletedCourse = () => {
  return (
    <SafeAreaView>
      <Text style={{ fontSize: 30, fontWeight: "bold" }}>CompletedCourse</Text>

      <View style={styles.container}>
        <Text> No completed course</Text>
      </View>
    </SafeAreaView>
  );
}

export default CompletedCourse

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"center",
        alignItems:"center"
    }

})