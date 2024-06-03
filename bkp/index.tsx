import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBluetooth } from "rn-bluetooth-classic";

const Home = () => {
  // Use the Bluetooth context
  const {
    isBluetoothEnabled,
    devices,
    connectedDevice,
    receivedData,
    scanDevices,
    connectToDevice,
    error,
  } = useBluetooth();

  useEffect(() => {
    setTimeout(() => {
      scanDevices();
    }, 1000);
  }, []);

  // Render each Bluetooth device
  const renderDeviceItem = ({ item, index }: {
    item: { name: string; address: string };
    index: number;
  }) => (
    <TouchableOpacity
      key={index.toString()}
      style={styles.deviceItem}
      onPress={() => connectToDevice(item.address)}
    >
      <Text style={styles.deviceName}>{item.name}</Text>
      <Text style={styles.deviceAddress}>{item.address}</Text>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bluetooth Devices</Text>
      {connectedDevice && (
        <View style={styles.connectedDevice}>
          <Text style={styles.connectedTitle}>Connected to:</Text>
          <Text style={styles.connectedName}>
            {connectedDevice.name || connectedDevice.address}
          </Text>
        </View>
      )}
      {receivedData && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Received Data:</Text>
          <Text style={styles.dataText}>{receivedData}</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      )}
      {devices && (
        <FlatList
        data={devices}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        keyExtractor={(item) => item.address}
        renderItem={renderDeviceItem}
      />
      )}

      <TouchableOpacity onPress={scanDevices}>
        <Text style={{ color: "#fff" }}>Scan for devices</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  connectedDevice: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#2e2e2e",
    borderRadius: 5,
  },
  connectedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  connectedName: {
    fontSize: 16,
    color: "#fff",
  },
  dataContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#2e2e2e",
    borderRadius: 5,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  dataText: {
    fontSize: 16,
    color: "#fff",
  },
  deviceItem: {
    padding: 15,
    backgroundColor: "#1e1e1e",
    borderRadius: 5,
    marginVertical: 5,
  },
  deviceName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deviceAddress: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: "#ff4d4d",
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Home;
