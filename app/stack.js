import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CustomTabBar from "../Components/CustomTabBar";
import HomePage from "../Screens/HomePage";
import RecordPage from "../Screens/RecordPage";
import SettingsPage from "../Screens/SettingsPage";
import LoginPage from "../Screens/LoginPage";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const TabLayout = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomePage"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="HomePage" component={HomePage} />
      <Tab.Screen name="SettingsPage" component={SettingsPage} />
    </Tab.Navigator>
  );
};

export function MyStack() {
  return (
    <Stack.Navigator>
       <Stack.Screen
        name="LoginPage"
        component={LoginPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TabLayout"
        component={TabLayout}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RecordPage"
        component={RecordPage}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
