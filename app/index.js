import React from "react";
import { MyStack } from "./stack";
import { BluetoothProvider } from "rn-bluetooth-classic";
import { useFonts } from "expo-font";
import { Provider } from "react-redux";
import { store, persistor } from "../store/store";
import { PersistGate } from "redux-persist/integration/react";


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
            <Provider store={store}>
                <PersistGate persistor={persistor} loading={null}>
                    <MyStack />
                </PersistGate>
            </Provider>
        </BluetoothProvider>
    );    
}