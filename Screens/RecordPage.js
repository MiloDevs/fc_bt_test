import * as Network from 'expo-network';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import DropdownComponent from '../Components/DropDown';
import { Button } from 'react-native-paper';
import Header from '../Components/Header';
import AntDesign from "@expo/vector-icons/AntDesign";
import { useBluetooth } from 'rn-bluetooth-classic';
import { addDoc, collection, doc, getDocs } from 'firebase/firestore';
import { db } from '../Database/config';
import { store } from '../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { setSuppliers, setCollections } from "../store";
import RNBluetooth from "react-native-bluetooth-classic";


const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;


const RecordPage = ({route, navigation}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isSendBySMS, setIsSendBySMS] = useState(true);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [scaleStability, setScaleStability] = useState(null);
    const {location, product} = route.params;
    const [products, setProducts] = useState([]);
    const [quantity, setQuantity] = useState(0);
    const [loading, setLoading] = useState(false);
    const { devices, connectToDevice, receivedData, isConnected, disconnectDevice, writeToDevice } = useBluetooth();
    const dispatch = useDispatch();
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [refreshing, setRefreshing] = React.useState(false);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalWeight, setTotalWeight] = useState(0);
    const collections = useSelector(state => state.settings.collections);

    const suppliers = store.getState().settings.suppliers;
    const BusinessId = store.getState().settings.BusinessId;

    const user = store.getState().settings.user;

    const fieldCollectionData = {
      supplier: {
        id: selectedSupplier?.value,
        name: selectedSupplier?.label,
      },
      clerk: {
        id: user?.clerkId,
        name: `${user?.fName} ${user?.lName}`,
      },
      location: {
        name: location?.label,
        subLocation: "Sub-Location A",
      },
      product: {
        name: product?.label,
        id: product?.id,
      },
      timestamp: new Date().toISOString(),
    };

    useEffect(() => {
      console.log(location, product);
    }, [navigation]);


    console.log(BusinessId);

    const getSuppliers = async () => {
      const suppliersCollection = collection(db, `Businesses/${BusinessId}/Suppliers`);
      const suppliersSnapshot = await getDocs(suppliersCollection);
      const suppliers = suppliersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch(setSuppliers(suppliers))
    };

    useEffect(() => {
      getSuppliers();
    }, []);

    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      getSuppliers();
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    })

    useEffect(() => {
      if (selectedSupplier) {
        fieldCollectionData.supplier = selectedSupplier;
      }
    }, [selectedSupplier]);
  
    

    const supplierData = suppliers ? suppliers.map(supplier => ({
        label: supplier.fName,
        value: supplier.id
    })) : [];



    console.log(receivedData);

    useEffect(() => {
        if (connectedDevice) {

            const readInterval = setInterval(async () => {
                try {
                    const data = receivedData;
                    if (data) {
                        const textDecoder = new TextDecoder('ascii');
                        const decodedString = textDecoder.decode(data);

                        const parsedData = parseBluetoothData(decodedString);
                        if (parsedData) {
                            setScaleStability(parsedData.isStable ? 'ST' : 'US');
                        }
                    }
                    console.log(data);
                    console.log(parsedData);
                } catch (error) {
                    console.error('Error reading data:', error);
                }
            }, 1000);

            return () => clearInterval(readInterval);
        }
    });

    const parseBluetoothData = (data) => {
        const regex = /(?:(US|ST),GS,)(\+\d+\.\d+kg)/g;
        let match;
        let lastStableReading = null;
    
        while ((match = regex.exec(data)) !== null) {
            const stability = match[1];
            const reading = match[2];
    
            if (stability === 'ST') {
                lastStableReading = reading;
            }
        }
    
        return {
            reading: lastStableReading,
            isStable: lastStableReading !== null
        };
    };

    const showSendBySMS = () => {
        setIsSendBySMS(true);
    };

    const showPrintReceipt = () => {
        setIsSendBySMS(false);
    };

    const handleSwitchBt = async () => {
        const printer = store.getState().settings.printerAddress;
        connectToDevice(printer);
        console.log("Printer: ", printer);
    };

    const handleConnectToScale = async (device) => {
        try {
            const connected = await connectToDevice(device.address);
            if (connected) {
                setConnectedDevice(device);
            }
        } catch (e) {
            console.error(e);
        }
    };


    const showPrinterReceipt = async () => {
      console.log(products)
        const supplier = fieldCollectionData.supplier.name;
        const location = fieldCollectionData.location.name;
        const product = fieldCollectionData.product.name;
        const items = products;
        const server = fieldCollectionData.clerk.name;
    
        // Generate receipt data
        let receiptData = '';
        receiptData += 'Weighing Receipt\n';
        receiptData += `Supplier: ${supplier}\n`;
        receiptData += `Location: ${location}\n`;
        receiptData += `Product: ${product}\n`;
        receiptData += `Date: ${new Date().toLocaleDateString()}\n`;
        receiptData += `Time: ${new Date().toLocaleTimeString()}\n`;
        receiptData += '\n';
        receiptData += 'Item         Qty    Weight (Kg)\n';
        items.forEach(item => {
            const { label, quantity, weight } = item;
            receiptData += `${label.padEnd(12)} ${quantity.toString().padStart(3)} ${weight.toString().padStart(10)}\n`;
        });
        receiptData += '\n';
        receiptData += `Total:       ${totalQuantity.toString().padStart(3)} ${totalWeight.toString().padStart(10)}\n`;
        receiptData += '\n';
        receiptData += `Served by: ${server}\n`;
        receiptData += 'Thank you for your business!\n';
        receiptData += '\n';
        receiptData += '\n';
        receiptData += '\n';
    
        // Send receipt data to the printer
        console.log(receiptData);
        
        const printer = store.getState().settings.printerAddress;
        writeToDevice(printer, receiptData, "ascii");
        console.log('Receipt sent to the printer');
           
    };

    const closeModal = () => {
        setModalVisible(false);
        setProducts([]);
        connectToDevice(store.getState().settings.scaleAddress);
    };


    useEffect(() => {
        const newTotalQuantity = products.reduce((acc, item) => acc + parseInt(item.quantity), 0);
        const newTotalWeight = products.reduce((acc, item) => acc + parseFloat(item.weight), 0);
        setTotalQuantity(newTotalQuantity);
        setTotalWeight(newTotalWeight.toFixed(2));
    }, [products]);

    const handleSaveRecord = async () => {
      setLoading(true);
      try {
        const businessId = store.getState().settings.BusinessId;
        console.log('Business ID:', businessId);
  
        const newRecord = {
          supplier: fieldCollectionData.supplier,
          businessId: businessId,
          clerk: fieldCollectionData.clerk,
          location: fieldCollectionData.location,
          timestamp: fieldCollectionData.timestamp,
          products,
          quantity: totalQuantity,
          weight: totalWeight,
        };
  
        // Check network connectivity
        const networkState = await Network.getNetworkStateAsync();
        if (networkState.isConnected) {
          const fieldCollectionsRef = collection(db, `Businesses/${businessId}/FieldCollections`);
          const docRef = await addDoc(fieldCollectionsRef, newRecord);
          console.log('Record saved successfully:', docRef.id);
        } else {
          dispatch(setCollections([...collections, newRecord]));
          console.log('Record saved to Redux store');
        }
  
        setModalVisible(true);
        setLoading(false);
      } catch (error) {
        console.error('Error saving record:', error);
        setLoading(false);
      }
    };
  
    useEffect(() => {
      let isMounted = true;
    
      const checkNetworkAndUpload = async () => {
        if (!isMounted) return;
    
        const networkState = await Network.getNetworkStateAsync();
        if (networkState.isConnected) {
          for (const record of collections) {
            const fieldCollectionsRef = collection(db, `Businesses/${record.businessId}/FieldCollections`);
            await addDoc(fieldCollectionsRef, record);
          }
          dispatch(setCollections([]));
          console.log('Records uploaded to database');
        }
      };
    
      // Check network state periodically
      const intervalId = setInterval(checkNetworkAndUpload, 10000); 
    
      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }, [collections]);
  

    return (
      <View style={styles.Container}>
        <Header refresh={refreshing} handleClick={onRefresh} />
        <DropdownComponent
          title="Suppliers"
          onChange={(value) => {
            console.log(value);
            setSelectedSupplier(value);
          }}
          data={supplierData}
        />
        
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalNav}>
                <TouchableOpacity
                  style={styles.modaltouchable}
                  onPress={showSendBySMS}
                >
                  <AntDesign name="book" size={24} color="black" />
                  <Text style={styles.touchableText}>Send By SMS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modaltouchable}
                  onPress={showPrintReceipt}
                >
                  <AntDesign name="printer" size={24} color="black" />
                  <Text style={styles.touchableText}>Print Receipt</Text>
                </TouchableOpacity>
              </View>
              {isSendBySMS ? (
                <View style={styles.modalContent}>
                  <TextInput placeholder="+254" style={styles.modalInput} />
                  <TouchableOpacity style={styles.Button}>
                    <Text style={styles.textButton}>Send</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.modalContent}>
                  <TouchableOpacity 
                    style={styles.Button}
                    onPress={handleSwitchBt}
                  >
                    <AntDesign name="printer" size={34} color="blue" />
                    <Text style={styles.textButton}>Printer Connected</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.Button}
                    onPress={showPrinterReceipt}
                  >
                    <Text style={styles.textButton}>Print</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
        <View
          style={[
            styles.display,
            {
              backgroundColor:
                receivedData.split(",")[0] === "ST" ? "green" : "red",
            },
          ]}
        >
          <View style={styles.data}>
            <Text style={styles.textBold}>Scale Connected:</Text>
            <Text style={styles.textRegular}>
              {isConnected
                ? `${connectedDevice.name} (${connectedDevice.address})`
                : "Scale Not Connected"}
            </Text>
            <Text style={styles.textBold}>Scale Stability:</Text>
            <Text style={[styles.textRegular]}>
              {parseBluetoothData(receivedData).isStable
                ? "Stable"
                : "Unstable"}
            </Text>
          </View>
          <View>
            <Text style={styles.textWeight}>
              {(receivedData || "").toString().match(/[+-]?\d*\.?\d+/g)?.join(', ')}
            </Text>   



          </View>
        </View>
        <TouchableOpacity style={styles.Button} onPress={() => {
            setProducts([...products, { ...product , quantity: 1, weight: parseFloat((receivedData || "").toString().match(/[+-]?\d*\.?\d+/g)?.join(', ')) }]);
            setQuantity(0);
        }}>
          <Text style={styles.textButton}>Capture</Text>
        </TouchableOpacity>
        <View style={styles.preview}>
          <Text style={styles.textButton}>Records</Text>
          <ScrollView style={styles.scroll}>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Item</Text>
                <Text style={styles.tableHeader}>Quantity</Text>
                <Text style={styles.tableHeader}>Weight</Text>
              </View>
              {products.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableCell}>{item.label}</Text>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                  <Text style={styles.tableCell}>{item.weight}</Text>
                </View>
              ))}
                <View style={styles.totalRow}>
                    <Text style={styles.tableCell}>Total</Text>
                    <Text style={styles.tableCell}>{totalQuantity}</Text>
                    <Text style={styles.tableCell}>{totalWeight}</Text>
                </View>
            </View>
          </ScrollView>
        </View>
        <TouchableOpacity
          style={styles.Button}
          onPress={() => handleSaveRecord()}
        >
          {loading ? (
            <ActivityIndicator color="#00FF00" />
          ) : (
            <Text style={styles.textButton}>Save Record</Text>
          )}
        </TouchableOpacity>
      </View>
    );
};

export default RecordPage;

const styles = StyleSheet.create({
    Container: {
        alignItems: 'center',
        padding: 50,
        backgroundColor: '#F9F9F9',
        width: screenWidth,
        height: screenHeight
    },
    display: {
        height: 100,
        backgroundColor: '#2BFF2B',
        width: screenWidth * 0.8,
        borderRadius: 10,
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: screenWidth * 0.9
    },
    modalNav: {
        flexDirection: 'row',
        padding: 5,
        justifyContent: 'space-between',
    },
    modaltouchable: {
        alignItems: 'center',
        padding: 20,
        borderBottomColor: '#2BFF2B',
        borderBottomWidth: 2,
        width: screenWidth * 0.4,
        flexDirection: 'row'
    },
    touchableText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 20,
        fontWeight: '400'
    },
    modalContent: {
        alignItems: 'center',
        padding: 10
    },
    modalInput: {
        width: screenWidth * 0.8,
        padding: 20,
        borderWidth: 2,
        borderColor: '#8F8F8F',
        borderRadius: 10,
        fontFamily: 'Poppins-Regular',
        fontSize: 20,
        marginBottom: 40
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    data: {
        flexDirection: 'column'
    },
    Button: {
        width: screenWidth * 0.8,
        backgroundColor: '#F2F2F2',
        padding: 20,
        alignItems: 'center',
        margin: 10,
        borderRadius: 20,
    },
    preview: {
        height: 200,
        backgroundColor: '#F2F2F2',
        borderRadius: 10,
        width: screenWidth * 0.8,
        alignItems: 'center',
        padding: 10
    },
    scroll: {
        backgroundColor: 'white',
        height: 300,
        width: screenWidth * 0.7,
        borderRadius: 10
    },
    table: {
        margin: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    tableHeader: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f1f1f1',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Poppins-Bold'
    },
    tableCell: {
        flex: 1,
        padding: 10,
        textAlign: 'center',
    },
    textBold: {
        fontFamily: 'Poppins-Bold',
        color: 'white',
        fontSize: 14,
        fontWeight: '700'
    },
    textRegular: {
        fontFamily: 'Poppins-Regular',
        color: 'white'
    },
    textWeight: {
        fontFamily: 'Poppins-Regular',
        fontSize: 18,
        textAlign: 'center',
        alignSelf: 'center',
        color: 'black'
    },
    textButton: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        fontWeight: '400'
    },
    totalRow: {
      flexDirection: 'row',
      padding: 8,
      borderTopWidth: 1,
      borderTopColor: '#ccc',
      backgroundColor: '#f0f0f0',
  },
  
});

