import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  Modal,
} from "react-native";
import { AntDesign, Octicons, Ionicons } from "@expo/vector-icons";
import { useBluetooth } from "rn-bluetooth-classic";
import { useDispatch, useSelector } from "react-redux";
import {
  setPrinterAddress,
  setScaleAddress,
  setLoggedIn,
  setUser,
} from "../store/index";
import { useNavigation } from "@react-navigation/native";
import RNBluetoothClassic from "react-native-bluetooth-classic";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const SettingsPage = () => {
  const { scanForDevices, devices, connectToDevice, connectedDevice } =
    useBluetooth();
  const [pairedDevices, setPairedDevices] = useState(new Map());
  const [isScanning, setIsScanning] = useState(false);
  const [deviceType, setDeviceType] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const scaleAddress = useSelector((state) => state.scaleAddress);
  const printerAddress = useSelector((state) => state.printerAddress);

  useEffect(() => {
    const fetchPairedDevices = async () => {
      try {
        const paired = await RNBluetoothClassic.getBondedDevices();
        const pairedMap = new Map(
          paired.map((device) => [device.address, device])
        );
        setPairedDevices(pairedMap);
      } catch (error) {
        console.error("Error fetching paired devices:", error);
      }
    };
    fetchPairedDevices();
  }, []);

  const handleConnectToDevice = async (deviceAddress) => {
    setConnecting(true);
    try {
      const connected = await connectToDevice(deviceAddress);
      if (deviceType === "scale") {
        dispatch(setScaleAddress(deviceAddress));
      } else if (deviceType === "printer") {
        dispatch(setPrinterAddress(deviceAddress));
      }
      ToastAndroid.show(`Connected to ${deviceType}`, ToastAndroid.SHORT);
    } catch (e) {
      console.log(`Error connecting to ${deviceType}:`, e);
      ToastAndroid.show(
        `Error connecting to ${deviceType}`,
        ToastAndroid.SHORT
      );
    } finally {
      setConnecting(false);
      setIsDropdownVisible(false);
      setDeviceType(null);
    }
  };

  const handleSignOut = () => {
    dispatch(setLoggedIn(false));
    dispatch(setUser(null));
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginPage" }],
    });
    ToastAndroid.show("Signed out", ToastAndroid.SHORT);
  };

  const startScan = async () => {
    setIsScanning(true);
    try {
      await scanForDevices();
    } catch (e) {
      console.log("Error scanning devices:", e);
    } finally {
      setIsScanning(false);
    }
  };

  const renderDeviceItem = (device) => (
    <TouchableOpacity
      key={device.address}
      style={styles.deviceItem}
      onPress={() => handleConnectToDevice(device.address)}
    >
      <Text style={styles.deviceName}>{device.name || device.address}</Text>
      {(deviceType === "scale" && device.address === scaleAddress) ||
      (deviceType === "printer" && device.address === printerAddress) ? (
        <Text style={styles.connectedText}>Connected</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => {
          setDeviceType("scale");
          setIsDropdownVisible(true);
        }}
      >
        
        <Text style={styles.dropdownText}>Select Scale</Text>
        <Ionicons name="chevron-down" size={24} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => {
          setDeviceType("printer");
          setIsDropdownVisible(true);
        }}
      >
        <Text style={styles.dropdownText}>Select Printer</Text>
        <Ionicons name="chevron-down" size={24} color="#333" />
      </TouchableOpacity>

      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select your {deviceType}</Text>
            <ScrollView style={styles.deviceList}>
              {Array.from(pairedDevices.values()).map(renderDeviceItem)}
              {devices.map(renderDeviceItem)}
            </ScrollView>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={startScan}
              disabled={isScanning}
            >
              <Text style={styles.scanButtonText}>
                {isScanning ? "Scanning..." : "Scan for new devices"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsDropdownVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
        <Octicons name="sign-out" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};


// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  dropdown: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  deviceList: {
    maxHeight: 300,
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  deviceName: {
    fontSize: 16,
    color: "#333",
  },
  connectedText: {
    color: "#4CAF50",
    fontSize: 14,
  },
  scanButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  scanButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#FF5252",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signOutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF5252",
    padding: 15,
    borderRadius: 10,
    position: "absolute",
    bottom: 30,
    width: "90%",
  },
  signOutButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
});

export default SettingsPage;
