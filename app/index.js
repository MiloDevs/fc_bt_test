import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { MyStack, TabLayout } from "./stack";
import { BluetoothProvider } from "rn-bluetooth-classic";
import { useFonts } from "expo-font";


export default function Root() {
    const [loaded] = useFonts({
        "Poppins-Regular": require("../Assets/Fonts/Poppins-Regular.ttf"),
        "Poppins-Medium": require("../Assets/Fonts/Poppins-Medium.ttf"),
        "Poppins-Light": require("../Assets/Fonts/Poppins-Light.ttf"),
        "Poppins-Black": require("../Assets/Fonts/Poppins-Black.ttf"),
        "Poppins-Bold": require("../Assets/Fonts/Poppins-Bold.ttf"),
        "Poppins-SemiBold": require("../Assets/Fonts/Poppins-SemiBold.ttf"),
        "Poppins-ExtraBold": require("../Assets/Fonts/Poppins-ExtraBold.ttf")
    });

    if (!loaded) {
        return null;
    }

    return(
        <BluetoothProvider>
            <MyStack />
        </BluetoothProvider>
    )
    
}