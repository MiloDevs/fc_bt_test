import React, { useState, useContext, createContext, useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import RNBluetoothClassic from "react-native-bluetooth-classic";

// Define permissions
const reqPerms = [
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
];

// Request permissions
const requestBluetoothPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple(reqPerms);
    const deniedPermissions = Object.keys(granted).filter(
      (permission) => granted[permission] !== PermissionsAndroid.RESULTS.GRANTED
    );

    if (deniedPermissions.length > 0) {
      throw new Error(
        "Bluetooth permissions not granted: " + deniedPermissions.join(", ")
      );
    }

    console.log("Bluetooth permissions granted");
  } catch (error) {
    console.error("Error requesting Bluetooth permissions:", error);
    throw error;
  }
};

// Create Bluetooth context
const BluetoothContext = createContext({
  isScanning: false,
  isBluetoothEnabled: false,
  devices: [],
  bondedDevices: [],
  connectedDevices: [],
  connectedDevice: null,
  receivedData: "",
  scanDevices: () => {},
  stopScan: () => {},
  connectToDevice: (deviceAddress) => {},
  disconnectDevice: () => {},
  connectLastConnected: () => {},
  error: null,
});

// Custom hook to access Bluetooth context
export const useBluetooth = () => {
  return useContext(BluetoothContext);
};

// BluetoothProvider component
export const BluetoothProvider = ({ children }) => {
  // State variables
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [receivedData, setReceivedData] = useState("");
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [bondedDevices, setBondedDevices] = useState([]);
  const [lastConnectedDevice, setLastConnectedDevice] = useState();

  // Function to initialize Bluetooth and start scanning
  const initializeBluetooth = async () => {
    try {
      if (Platform.OS === "android") {
        await requestBluetoothPermission();
      }

      await   getBondedDevices();
      scanDevices();
    } catch (error) {
      setError(error);
    }
  };

  const getConnectedDevices = async () => {
    try {
        const connectedDevices = await RNBluetoothClassic.getConnectedDevices();
        setConnectedDevices(connectedDevices);
    } catch (error) {
        console.error({
            message: "Error getting connected devices",
            error: error,
        });
        setError(error);
    }
  };

  const getBondedDevices = async () => {
    try {
        const bondedDevices = await RNBluetoothClassic.getBondedDevices();
        console.log("Bonded devices:", bondedDevices);
        setBondedDevices(bondedDevices);
    } catch (error) {
        console.error({
            message: "Error getting bonded devices",
            error: error,
        });
        setError(error);
    }
  };

  const checkPermissions = async () => {
    try {
        if (Platform.OS === "android") {
            await  getConnectedDevices();
          reqPerms.map(async (permission) => {
            const granted = await PermissionsAndroid.check(permission);
            if (!granted) {
              setHasPermissions(false);
              throw new Error("Permission not granted: " + permission);
            }
          });
        }
        console.log("Bluetooth permissions granted");
        setHasPermissions(true);
    } catch (error) {
      console.error("Error checking permissions:", error);
      setHasPermissions(false);
      setError(error);
    }
  }

  // Function to scan for Bluetooth devices
  const scanDevices = async () => {
    try {
       // check if we have permissions
       if (!hasPermissions) {
        await checkPermissions();
       }

      // Check if already scanning
      if (isScanning) {
        console.log("Already scanning for devices...");
        return;
      }

      const available = await RNBluetoothClassic.isBluetoothAvailable();
      if (!available) {
        console.log("Bluetooth is not available on this device");
        return;
      }

      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      setIsBluetoothEnabled(enabled);
      if (!enabled) {
        RNBluetoothClassic.openBluetoothSettings();
        setIsBluetoothEnabled(enabled);
        console.log("Bluetooth is not enabled");
        return;
      }

      setIsScanning(true);
      const discovered = await RNBluetoothClassic.startDiscovery();
      console.log("Discovered devices:", discovered);
      const newDevices = discovered.filter(
        (device) => !devices.some((d) => d.address === device.address)
      );
      setDevices((prevDevices) => {
        setError(null);
        setIsScanning(false);
        return [...prevDevices, ...newDevices];
      });
    } catch (error) {
      console.error("Error during discovery:", error);
      setError(error);
      setIsScanning(false);
    }
  };

  // Function to stop scanning for Bluetooth devices
  const stopScan = async () => {
    try {
      await RNBluetoothClassic.cancelDiscovery();
      setIsScanning(false);
    } catch (error) {
      console.error("Error stopping discovery:", error);
      setError(error);
    }
  };

  // Function to connect to a Bluetooth device
  const connectToDevice = async (deviceAddress) => {
    if (!hasPermissions){
        await checkPermissions();
    }
    if (!deviceAddress) {
      console.error("No device address provided");
      return;
    }
    try {
      // check if we currently have a connected device first
        if (connectedDevice) {
            await disconnectDevice();
        }
        await getConnectedDevices();
        if(connectedDevices.length > 0){
            disconnectDevice()
        }
      const connected = await RNBluetoothClassic.connectToDevice(deviceAddress);
      setLastConnectedDevice(connected);
      const subscription = connected.onDataReceived((data) => {
        setReceivedData(data.data.replace(/\r?\n|\r/g, ""));
      });
      setConnectedDevice(connected);
      console.log("Connected to device:", connected);
    } catch (error) {
      console.error({
        message: "Error connecting to device",
        deviceAddress,
        error,
      });
      setError(error);
    }
  };

    // Function to connect to the last connected device
    const connectLastConnected = async () => {
        try {
            if (lastConnectedDevice) {
                await connectToDevice(lastConnectedDevice.address);
            } else {
                console.log("No last connected device found");
            }
        } catch (error) {
            console.error("Error connecting to last connected device:", error);
            setError(error);
        }
    };

    // Function to disconnect from a Bluetooth device

  const disconnectDevice = () => {
    return new Promise((resolve, reject) => {
      try {
        if (connectedDevice) {
          connectedDevice
            .disconnect()
            .then(() => {
              setConnectedDevice(null);
              resolve();
            })
            .catch((error) => {
              console.error("Error disconnecting from device:", error);
              setError(error);
              reject(error);
            });
        } else {
          // If no device is connected, resolve immediately
          resolve();
        }
      } catch (error) {
        console.error("Error disconnecting from device:", error);
        setError(error);
        reject(error);
      }
    });
  };

  // Call initializeBluetooth when the component mounts
  useEffect(() => {
    initializeBluetooth();

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Render Bluetooth context provider with state and functions
  return (
    <BluetoothContext.Provider
      value={{
        isScanning,
        isBluetoothEnabled,
        devices,
        connectedDevice,
        receivedData,
        scanDevices,
        stopScan,
        connectToDevice,
        disconnectDevice,
        bondedDevices,
        connectedDevices,
        error,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};