// Importing necessary modules and components from React, React Native, and other libraries
import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
} from "react-native";
import DropdownComponent from "../Components/DropDown"; // Custom dropdown component
import Header from "../Components/Header"; // Custom header component
import { useNavigation } from "@react-navigation/native"; // Navigation hook for navigating between screens
import { store } from "../store/store"; // Redux store
import { setCollectionRecords, setLocations, setProducts } from "../store"; // Redux actions
import { useDispatch } from "react-redux"; // Redux hook for dispatching actions
import { collection, getDocs } from "firebase/firestore"; // Firestore methods for database operations
import { db } from "../Database/config"; // Firestore database configuration
import { useBluetooth } from "rn-bluetooth-classic"; // Custom Bluetooth hook
import RNBluetooth from "react-native-bluetooth-classic"; // Bluetooth library

// Getting the width of the device's screen
const screenWidth = Dimensions.get("window").width;

// Defining the HomePage component
const HomePage = () => {
  const dispatch = useDispatch(); // Getting the dispatch function from Redux
  const navigation = useNavigation(); // Getting the navigation function from React Navigation
  const [refreshing, setRefreshing] = useState(false); // State to handle pull-to-refresh functionality
  const [selectedProduct, setSelectedProduct] = useState(null); // State to manage selected product from dropdown
  const [selectedLocation, setSelectedLocation] = useState(null); // State to manage selected location from dropdown
  const [productsData, setProductsData] = useState([]); // State to store products data
  const [locationsData, setLocationsData] = useState([]); // State to store locations data
  const [fieldCollectionData, setFieldCollectionData] = useState([]); // State to store field collection data
  const { connectToDevice } = useBluetooth(); // Destructuring Bluetooth connect function

  // Fetching the BusinessId from the Redux store
  const BusinessId = store.getState().settings.BusinessId;

  // Function to fetch products from Firestore database
  const getProducts = useCallback(async () => {
    try {
      const productsCollection = collection(
        db,
        `Businesses/${BusinessId}/Products`
      ); // Defining the collection path in Firestore
      const productsSnapshot = await getDocs(productsCollection); // Fetching the documents from the collection
      const products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // Mapping the documents to an array of product objects

      // Getting stored products from Redux store
      const storedProducts = store.getState().settings.products;
      let mergedProducts;

      // Merging the fetched products with stored products to avoid duplication
      if (Array.isArray(storedProducts)) {
        const newProducts = products.filter(
          (product) => !storedProducts.some((p) => p.id === product.id)
        );
        mergedProducts = [...storedProducts, ...newProducts];
      } else {
        mergedProducts = products;
      }

      dispatch(setProducts(mergedProducts)); // Dispatching the merged products to Redux store

      // Setting the products data for the dropdown component
      setProductsData(
        mergedProducts.map((product) => ({
          isDukawala: product.isDukawala,
          price: product.price,
          label: product.name,
          value: product.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching products:", error); // Logging error if fetching products fails
      ToastAndroid.show("Error fetching products", ToastAndroid.SHORT); // Showing a toast message on error
    }
  }, [BusinessId, dispatch]); // Dependency array for the useCallback hook

  // Function to fetch locations from Firestore database
  const getLocations = useCallback(async () => {
    try {
      const locationsCollection = collection(
        db,
        `Businesses/${BusinessId}/Locations`
      ); // Defining the collection path in Firestore
      const locationsSnapshot = await getDocs(locationsCollection); // Fetching the documents from the collection
      const locations = locationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // Mapping the documents to an array of location objects

      // Getting stored locations from Redux store
      const storedLocations = store.getState().settings.locations;
      let mergedLocations;

      // Merging the fetched locations with stored locations to avoid duplication
      if (Array.isArray(storedLocations)) {
        const newLocations = locations.filter(
          (location) => !storedLocations.some((l) => l.id === location.id)
        );
        mergedLocations = [...storedLocations, ...newLocations];
      } else {
        mergedLocations = locations;
      }

      dispatch(setLocations(mergedLocations)); // Dispatching the merged locations to Redux store

      // Setting the locations data for the dropdown component
      setLocationsData(
        mergedLocations.map((location) => ({
          label: location.name,
          value: location.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching locations:", error); // Logging error if fetching locations fails
      ToastAndroid.show("Error fetching locations", ToastAndroid.SHORT); // Showing a toast message on error
    }
  }, [BusinessId, dispatch]); // Dependency array for the useCallback hook

  const getFieldCollections = useCallback(async () => {
    try {
      const fieldCollectionCollection = collection(
        db,
        `Businesses/${BusinessId}/FieldCollections`
      ); // Defining the collection path in Firestore
      const fieldCollectionSnapshot = await getDocs(fieldCollectionCollection); // Fetching the documents from the collection
      const fieldCollections = fieldCollectionSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // Mapping the documents to an array of field collection objects

      const clerkId = store.getState().settings.user.clerkId;
      // Setting the field collection data for the dropdown component
      setFieldCollectionData(fieldCollections.filter((fieldCollection) => fieldCollection.clerk.id === clerkId));

      const dailyRecords = fieldCollectionData.filter((fieldCollection) => {
        const today = new Date();
        const recordDate = new Date(fieldCollection.timestamp);
        return (
          recordDate.getFullYear() === today.getFullYear() &&
          recordDate.getMonth() === today.getMonth() &&
          recordDate.getDate() === today.getDate()
        );
      });

      const weeklyRecords = fieldCollectionData.filter((fieldCollection) => {
        const today = new Date();
        const firstDayOfWeek = today.getDate() - today.getDay();
        const weekStart = new Date(today.setDate(firstDayOfWeek));
        weekStart.setHours(0, 0, 0, 0);

        const recordDate = new Date(fieldCollection.timestamp);
        return recordDate >= weekStart;
      });

      const monthlyRecords = fieldCollectionData.filter((fieldCollection) => {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);

        const recordDate = new Date(fieldCollection.timestamp);
        return recordDate >= monthStart;
      });
      const initialCollectionRecords = store.getState().settings.collectionRecords;
      const collectionRecords = {
        daily: dailyRecords.length,
        weekly: weeklyRecords.length,
        monthly: monthlyRecords.length,
      };
      dispatch(setCollectionRecords(collectionRecords));
    } catch (error) {
      ToastAndroid.show("Error fetching field collections", ToastAndroid.SHORT); // Showing a toast message on error
    }
  });

  


  // useEffect hook to fetch data and connect to Bluetooth devices on component mount
  useEffect(() => {
    const fetchData = async () => {
      await getProducts(); // Fetching products data
      await getLocations(); // Fetching locations data
      await getFieldCollections(); // Fetching field collections data
    };

    // Getting the scale and printer addresses from the Redux store
    const scale = store.getState().settings.scaleAddress;
    const printer = store.getState().settings.printerAddress;

    // Connecting to Bluetooth devices if addresses are available
    scale && RNBluetooth.connectToDevice(scale);
    printer && RNBluetooth.connectToDevice(printer);

    fetchData(); // Fetching data
  }, [getProducts, getLocations]); // Dependency array for the useEffect hook

  // Function to handle pull-to-refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true); // Setting the refreshing state to true
    Promise.all([getProducts(), getLocations(), getFieldCollections()]).finally(() => {
      setRefreshing(false); // Setting the refreshing state to false after fetching data
    });
  }, [getProducts, getLocations]); // Dependency array for the useCallback hook

  // Function to handle navigation to the RecordPage screen
  const handleNavigate = () => {
    if (!selectedProduct) {
      ToastAndroid.show("Please select a product", ToastAndroid.SHORT); // Showing a toast message if no product is selected
      return;
    }

    if (!selectedLocation) {
      ToastAndroid.show("Please select a location", ToastAndroid.SHORT); // Showing a toast message if no location is selected
      return;
    }

    // Navigating to the RecordPage screen with selected product and location
    navigation.navigate("RecordPage", {
      productsData: productsData,
      product: selectedProduct,
      location: selectedLocation,
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F9F9F9" }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Adding pull-to-refresh control
      }
    >
      <View style={styles.container}>
        <Header refresh={refreshing} handleClick={onRefresh} />
        <View style={styles.recordSection}>
          <Text style={styles.heading}>Total Records</Text>
          <Text style={styles.normalText}>
            Today: {store.getState().settings.collectionRecords ? store.getState().settings.collectionRecords.daily : 0}
          </Text>
          <Text style={styles.normalText}>
           This Week: {store.getState().settings.collectionRecords ? store.getState().settings.collectionRecords.weekly : 0}
          </Text>
          <Text style={styles.normalText}>
            This Month: {store.getState().settings.collectionRecords ? store.getState().settings.collectionRecords.monthly : 0}
          </Text>
        </View>
        <View style={{ marginTop: 30, gap: 5, flex: 1 }}>
          <DropdownComponent
            title={"Products"}
            onChange={(value) => {
              setSelectedProduct(value); // Setting the selected product state
            }}
            data={productsData} // Providing products data to the dropdown component
          />
          <DropdownComponent
            title={"Location"}
            onChange={(value) => {
              console.log(value.label);
              setSelectedLocation(value); // Setting the selected location state
            }}
            data={locationsData} // Providing locations data to the dropdown component
          />
        </View>
        <TouchableOpacity
          onPress={handleNavigate}
          style={[styles.button, styles.button_Bg, { marginTop: 30 }]}
        >
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const scale = store.getState().settings.scaleAddress;
            if (!scale) {
              ToastAndroid.show(
                "Please go to settings to connect scale",
                ToastAndroid.SHORT
              ); // Showing a toast message if no scale address is available
              return;
            }
            scale && connectToDevice(scale); // Connecting to the scale device
          }}
          style={[styles.button, styles.button_Bg, { marginTop: 30 }]}
        >
          <Text style={styles.buttonText}>Connect to Scale</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Defining the styles for the components
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

export default HomePage; // Exporting the HomePage component as the default export
