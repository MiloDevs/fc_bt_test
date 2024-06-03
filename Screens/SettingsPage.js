// SettingsPage.js
import React, { useEffect } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {Octicons} from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { useBluetooth } from 'rn-bluetooth-classic';
//import { useBluetooth } from '../Components/BluetoothContext';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const SettingsPage = ({ navigation }) => {
  const { scanDevices, devices, connectToDevice } = useBluetooth();
  const [lookingForDevices, setLookingForDevices] = React.useState(false);

  useEffect(() => {
    try {
      scanDevices();
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    console.log('Discovered Devices:', devices);
  }, [devices]); 

  const handleConnectToScale = (deviceAddress) => {
    console.log('Connecting to device', deviceAddress);
    connectToDevice(deviceAddress);
  };

  const handleConnectToPrinter = () => {
    if (devices.length > 0) {
      connectToDevice(devices[0].address);
      console.log('Connected to printer');
    } else {
      console.log('No devices found');
    }
  };

  const handleSignOut = () => {
    console.log('Sign Out button pressed');
    navigation.navigate('LoginPage');
  };

  return (
    <View style={styles.container}>
      <View style={{
        width: screenWidth,
        alignItems: 'center',
      }}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setLookingForDevices(true)}
      >
        <Text style={styles.buttonText}>Connect to Scale</Text>
        <Octicons name="meter" size={24} color="black" />
      </TouchableOpacity>
      {lookingForDevices && (
        <View
        >
          <Text style={{
            color: "#000000"
          }}>
            {devices[0]?.name || devices[0]?.address || 'No devices found'}
          </Text>
          <Text>Looking for devices...</Text>
          {devices.map((device) => (
            <View
              key={device.address}
              onPress={() => handleConnectToScale(device.address)}
            >
              <Text>{device.name || device.address}</Text>
            </View>
          ))}
        </View>
      )}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleConnectToPrinter}>
        <Text style={styles.buttonText}>Connect to Printer</Text>
        <AntDesign name="printer" size={24} color="black" />
      </TouchableOpacity>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 70,
    width: screenWidth,
    height: screenHeight,
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#E0E0E0',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    marginRight: 20,
    fontFamily: 'Poppins-Regular',
  },
  signOutContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  signOutButton: {
    width: '80%',
    height: 50,
    backgroundColor: '#E0E0E0',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FF0000',
    fontSize: 18,
    marginRight: 10,
    fontFamily: 'Poppins-Regular',
  },
});

export default SettingsPage;




// import React, { useEffect } from 'react';
// import { View, Text, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
// import AntDesign from "@expo/vector-icons/AntDesign";
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { FontAwesome6 } from '@expo/vector-icons';




// const screenWidth = Dimensions.get('window').width;
// const screenHeight = Dimensions.get('window').height;

// const SettingsPage = ({ navigation }) => {


//   useEffect(() => {
//     try {
//       scanDevices();
//     } catch (e) {
//       console.log(e);
//     }
//   }, []);

//   const handleConnectToScale = (deviceAddress) => {
//     connectToDevice(deviceAddress);
//     console.log('Connected to device', deviceAddress);
//   };


//   const handleConnectToPrinter = () => {
//     connectToDevice(devices[0].address);
//     console.log('devices');
//   };

//   const handleSignOut = () => {
//     // sign out
//     console.log('Sign Out button pressed');
//     navigation.navigate('LoginPage');
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.button} onPress={handleConnectToScale}>
//         <Text style={styles.buttonText}>Connect to Scale</Text>
//         <FontAwesome6 name="weight-scale" size={24} color="black" />
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.button} onPress={handleConnectToPrinter}>
//         <Text style={styles.buttonText}>Connect to Printer</Text>
//         <AntDesign name="printer" size={24} color="black" />
//       </TouchableOpacity>
//       <View style={styles.signOutContainer}>
//         <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
//           <Text style={styles.signOutButtonText}>Sign Out</Text>
//           <MaterialCommunityIcons name="logout" size={24} color="red" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     paddingTop: 70,
//     width: screenWidth,
//     height: screenHeight,
//   },
//   button: {
//     width: '80%',
//     height: 50,
//     backgroundColor: '#E0E0E0',
//     borderRadius: 25,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   buttonText: {
//     color: '#000000',
//     fontSize: 18,
//     marginRight: 20,
//     fontFamily: 'Poppins-Regular',
//   },
//   signOutContainer: {
//     position: 'absolute',
//     bottom: 30,
//     width: '100%',
//     alignItems: 'center',
//   },
//   signOutButton: {
//     width: '80%',
//     height: 50,
//     backgroundColor: '#E0E0E0',
//     borderRadius: 25,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   signOutButtonText: {
//     color: '#FF0000',
//     fontSize: 18,
//     marginRight: 10,
//     fontFamily: 'Poppins-Regular',
//   },
// });

// export default SettingsPage;
