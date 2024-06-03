import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Octicons from "@expo/vector-icons/Octicons";


const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = route.name === "HomePage" ? "home" : "gear";

        return (
          <Pressable
            onPress={onPress}
            key={index}
            style={[styles.tabItem, isFocused && styles.focusedTab]}
          >
            <Octicons
              name={iconName}
              size={24}
              color={isFocused ? "black" : "#D9D9D9"}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#F9F9F9",
    elevation: 0,
    borderTopWidth: 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  focusedTab: {
    borderTopWidth: 2,
    borderTopColor: "#2BFF2B",
  },
});
