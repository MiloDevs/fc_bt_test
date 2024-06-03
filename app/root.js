import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { MyStack, TabLayout } from "./stack";
import { BluetoothProvider } from "rn-bluetooth-classic";
// import { BluetoothProvider } from '../Components/BluetoothContext';


export default function Root() {
    return(
        <BluetoothProvider>
            <MyStack />
        </BluetoothProvider>
    )
    
}