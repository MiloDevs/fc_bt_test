import React from "react";
import { MyStack } from "./stack";
import { BluetoothProvider } from "rn-bluetooth-classic";
import { useFonts } from "expo-font";
import { Provider } from "react-redux";
import { store, persistor } from "../store/store";
import { PersistGate } from "redux-persist/integration/react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";


export default function Root() {
    const [loaded] = useFonts({
        "Poppins-Regular": require("../assets/Fonts/Poppins-Regular.ttf"),
        "Poppins-Medium": require("../assets/Fonts/Poppins-Medium.ttf"),
        "Poppins-Light": require("../assets/Fonts/Poppins-Light.ttf"),
        "Poppins-Black": require("../assets/Fonts/Poppins-Black.ttf"),
        "Poppins-Bold": require("../assets/Fonts/Poppins-Bold.ttf"),
        "Poppins-SemiBold": require("../assets/Fonts/Poppins-SemiBold.ttf"),
        "Poppins-ExtraBold": require("../assets/Fonts/Poppins-ExtraBold.ttf")
    });

    if (!loaded) {
        return null;
    }

    return(
        <BluetoothProvider>
            <BottomSheetModalProvider>
            <Provider store={store}>
                <PersistGate persistor={persistor} loading={null}>
                    <MyStack />
                </PersistGate>
            </Provider>
            </BottomSheetModalProvider>
        </BluetoothProvider>
    );    
}