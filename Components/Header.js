import React from 'react'
import { Text, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AntDesign from "@expo/vector-icons/AntDesign";

const screenWidth = Dimensions.get("window").width;

const Header = ({ refresh, handleClick }) => {
    
  return (
    <View style={styles.headingContainer}>
      <Text style={styles.heading}>Welcome Steven 👋</Text>
      <TouchableOpacity disabled={refresh} onPress={handleClick}>
        <AntDesign name="reload1" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}

export default Header

const styles = StyleSheet.create({
  headingContainer: {
    width: screenWidth * 0.9,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 20,
    fontWeight: "semibold",
    fontFamily:'Poppins-Bold'
  },
});