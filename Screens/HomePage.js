import {Text, StyleSheet, View, Dimensions, RefreshControl, TouchableOpacity, ScrollView} from 'react-native'
import React, { useEffect } from 'react'
import DropdownComponent from '../Components/DropDown';
import Header from '../Components/Header';
import { useNavigation } from '@react-navigation/native';
import { store } from '../store/store';
import { setScaleAddress, setLocations, setProducts } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Database/config';
import { get } from 'firebase/database';
import { useBluetooth } from 'rn-bluetooth-classic';
import RNBluetooth from "react-native-bluetooth-classic";


const screenWidth = Dimensions.get("window").width;


const HomePage = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [selectedLocation, setSelectedLocation] = React.useState(null);
  const {connectToDevice} = useBluetooth();

  const BusinessId = store.getState().settings.BusinessId;


  const getProducts = async () => {
    const productsCollection = collection(db, `Businesses/${BusinessId}/Products`);
    const productsSnapshot = await getDocs(productsCollection);
    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    dispatch(setProducts(products));
    console.log('Products:', products); 
  };
  
  const getLocations = async () => {
    const locationsCollection = collection(db, `Businesses/${BusinessId}/Locations`);
    const locationsSnapshot = await getDocs(locationsCollection);
    const locations = locationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    dispatch(setLocations(locations));
    console.log('Locations:', locations); 
  };

  useEffect(() => {
    const fetchData = async () => {
      await getProducts();
      await getLocations();
  
      const products = store.getState().settings.products;
      const locations = store.getState().settings.locations;
      console.log('Products:', products);
      console.log('Locations:', locations);
    };

    const scale = store.getState().settings.scaleAddress;
    const printer = store.getState().settings.printerAddress;

    scale && RNBluetooth.connectToDevice(scale);
    printer && RNBluetooth.connectToDevice(printer);
  
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getProducts();
    getLocations();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  })


  const productsData = store.getState().settings.products
  ? store.getState().settings.products.map(product => ({
      label: product.name,
      value: product.id
    }))
  : [];

  const locationsData = store.getState().settings.locations
  ? store.getState().settings.locations.map(location => ({
      label: location.name,
      value: location.id
    }))
  : [];

  const handleNavigate = () => {
    if(!selectedProduct || selectedLocation){
      console.log('Please fill all fields');
    }

    navigation.navigate('RecordPage', {
      product: selectedProduct,
      location: selectedLocation
    });
  }
  return (
      <ScrollView
        style={{ flex: 1, backgroundColor: "#F9F9F9"}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
        <Header refresh={refreshing} handleClick={onRefresh} />
        <View style={styles.recordSection}>
          <Text style={styles.heading}>Total Records</Text>
          <Text style={styles.normalText}>Today: 30</Text>
          <Text style={styles.normalText}>This Week: 112</Text>
          <Text style={styles.normalText}>This Month: 305</Text>
        </View>
        <View
          style={{
            marginTop: 30,
            gap: 5,
            flex: 1,
          }}
          >
          <DropdownComponent title={"Products"} onChange={(value) => {
            console.log(value.label);
            setSelectedProduct(value);
          }} data={productsData}/>
          <DropdownComponent title={"Location"} onChange={(value) => {
            console.log(value.label);
            setSelectedLocation(value);
          }} data={locationsData}/>
          {/* <DropdownComponent title={"Sub-Location"} data={subLocations}/> */}
        </View>
        <TouchableOpacity onPress={() => handleNavigate()} style={[styles.button, styles.button_Bg, {
          marginTop: 30,
        }]}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          console.log(store.getState());
        }} style={[styles.button, styles.button_Bg, {
          marginTop: 30,
        }]}>
          <Text style={styles.buttonText}>Test</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
  );
}

export default HomePage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    backgroundColor: "#F9F9F9",
    paddingVertical: 10,
    paddingTop: 50,
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    fontFamily: "Poppins-Regular",
  },
  normalText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
  recordSection: {
    display: "flex",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#F2F2F2",
    width: screenWidth * 0.9,
    marginTop: 20,
  },
  button: {
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.9,
  },
  button_Bg: {
    backgroundColor: "#F2F2F2",
  },
});