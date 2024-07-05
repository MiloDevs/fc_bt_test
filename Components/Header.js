import React from 'react'
import { Text, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AntDesign from "@expo/vector-icons/AntDesign";
import { store } from '../store/store';

const screenWidth = Dimensions.get("window").width;

const Header = ({ refresh, handleClick }) => {
   const user = store.getState().settings.user;

   console.log(user);

  return (
    <View style={styles.headingContainer}>
      <Text style={styles.heading}>Welcome { user?.fName } 👋</Text>
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
    fontFamily:'Poppins-SemiBold'
  },
});