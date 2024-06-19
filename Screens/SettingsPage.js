import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  AntDesign,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import { useBluetooth } from "rn-bluetooth-classic";
import { useDispatch } from "react-redux";
import {
  setPrinterAddress,
  setScaleAddress,
  setLoggedIn,
  setUser,
} from "../store/index";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const SettingsPage = ({ navigation }) => {
  const { scanForDevices, devices, connectToDevice, connectedDevice } =
    useBluetooth();
  const [lookingForDevices, setLookingForDevices] = useState(false);
  const [deviceType, setDeviceType] = useState(null); // 'scale' or 'printer'
  const [connecting, setConnecting] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (lookingForDevices) {
      const startScan = async () => {
        try {
          await scanForDevices();
        } catch (e) {
          console.log("Error scanning devices:", e);
        }
      };
      startScan();
    }
  }, [lookingForDevices]);

  const handleConnectToDevice = async (deviceAddress) => {
    setConnecting(true);
    try {
      const connected = await connectToDevice(deviceAddress);
      if (connected) {
        if (deviceType === "scale") {
          dispatch(setScaleAddress(deviceAddress));
        } else if (deviceType === "printer") {
          dispatch(setPrinterAddress(deviceAddress));
        }
        console.log(`Connected to ${deviceType}:`, deviceAddress);
      } else {
        console.log(`Failed to connect to ${deviceType}:`, deviceAddress);
      }
    } catch (e) {
      console.log(`Error connecting to ${deviceType}:`, e);
    } finally {
      setConnecting(false);
      setLookingForDevices(false);
      setDeviceType(null);
    }
  };

  const handleSignOut = () => {
    dispatch(setLoggedIn(false));
    dispatch(setUser(null));
    navigation.navigate("LoginPage");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setLookingForDevices(true);
          setDeviceType("scale");
        }}
      >
        <Text style={styles.buttonText}>Connect to Scale</Text>
        <Octicons name="meter" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setLookingForDevices(true);
          setDeviceType("printer");
        }}
      >
        <Text style={styles.buttonText}>Connect to Printer</Text>
        <AntDesign name="printer" size={24} color="black" />
      </TouchableOpacity>

      {lookingForDevices && (
        <ScrollView style={styles.deviceList}>
          <View style={styles.deviceListContainer}>
            <Text>Please select your {deviceType}</Text>
            {devices.map((device) => (
              <TouchableOpacity
                key={device.address}
                style={styles.deviceItem}
                onPress={() => handleConnectToDevice(device.address)}
              >
                <Text>{device.name || device.address}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.signOutContainer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
          <Octicons name="sign-out" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: 70,
    width: screenWidth,
    height: screenHeight,
  },
  button: {
    width: "80%",
    height: 50,
    backgroundColor: "#E0E0E0",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,
    marginRight: 20,
    fontFamily: "Poppins-Regular",
  },
  deviceList: {
    width: "80%",
  },
  deviceListContainer: {
    width: screenWidth * 0.8,
    alignItems: "center",
    maxHeight: screenHeight * 0.4,
  },
  deviceItem: {
    padding: 10,
    backgroundColor: "#F0F0F0",
    marginVertical: 5,
    borderRadius: 5,
    width: "100%",
  },
  signOutContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
  },
  signOutButton: {
    width: "80%",
    height: 50,
    backgroundColor: "#E0E0E0",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signOutButtonText: {
    color: "#FF0000",
    fontSize: 18,
    marginRight: 10,
    fontFamily: "Poppins-Regular",
  },
});

export default SettingsPage;
