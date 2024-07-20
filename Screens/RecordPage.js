import * as Network from 'expo-network';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator, ToastAndroid } from 'react-native';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import DropdownComponent from '../Components/DropDown';
import Header from '../Components/Header';
import AntDesign from "@expo/vector-icons/AntDesign";
import { useBluetooth } from 'rn-bluetooth-classic';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../Database/config';
import { store } from '../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { setSuppliers, setCollections } from "../store";
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const RecordPage = ({ route, navigation }) => {
  const { location, product, productsData } = route.params;
  const dispatch = useDispatch();
  const collections = useSelector((state) => state.settings.collections);
  const suppliers = useSelector((state) => state.settings.suppliers);
  const { BusinessId, user } = useSelector((state) => state.settings);

  const [modalVisible, setModalVisible] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [scaleStability, setScaleStability] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Advancements state
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [barterItem, setBarterItem] = useState(null);
  const [barterWeight, setBarterWeight] = useState("");
  const [advanceType, setAdvanceType] = useState("cash");
  const [advancements, setAdvancements] = useState([]);
  const [totalAdvanced, setTotalAdvanced] = useState(0);

  const bottomSheetModalRef = useRef(null);

  const {
    devices,
    connectToDevice,
    receivedData,
    isConnected,
    disconnectDevice,
    writeToDevice,
  } = useBluetooth();

  const fieldCollectionData = useMemo(
    () => ({
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
        price: product?.price,
        name: product?.label,
        id: product?.value,
      },
      timestamp: new Date().toISOString(),
    }),
    [selectedSupplier, user, location, product]
  );

  useEffect(() => {
    getSuppliers();
  }, []);
  
  useEffect(() => {
    const newTotalQuantity = products.reduce(
      (acc, item) => acc + parseInt(item.quantity),
      0
    );
    const newTotalWeight = products.reduce(
      (acc, item) => acc + parseFloat(item.weight),
      0
    );
    const newTotalPrice = newTotalWeight * product.price;
    setTotalQuantity(newTotalQuantity);
    setTotalWeight(newTotalWeight.toFixed(2));
    setTotalPrice(newTotalPrice.toFixed(2));
  }, [products, product.price]);

  useEffect(() => {
    const newTotalAdvanced = advancements.reduce((sum, adv) => {
      if (adv.type === "cash") {
        return sum + parseFloat(adv.amount);
      } else {
        return sum + parseFloat(adv.item.price) * parseFloat(adv.weight);
      }
    }, 0);
    setTotalAdvanced(newTotalAdvanced);
  }, [advancements]);

  const getSuppliers = async () => {
    const suppliersCollection = collection(
      db,
      `Businesses/${BusinessId}/Suppliers`
    );
    const suppliersSnapshot = await getDocs(suppliersCollection);
    const suppliersData = suppliersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    dispatch(setSuppliers(suppliersData));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getSuppliers();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const supplierData = suppliers
    ? suppliers.map((supplier) => ({
        label: supplier.fName,
        value: supplier.id,
      }))
    : [];

  const parseBluetoothData = (data) => {
    const regex = /(?:(US|ST),GS,)(\+\d+\.\d+kg)/g;
    let match;
    let lastStableReading = null;

    while ((match = regex.exec(data)) !== null) {
      const stability = match[1];
      const reading = match[2];

      if (stability === "ST") {
        lastStableReading = reading;
      }
    }

    return {
      reading: lastStableReading,
      isStable: lastStableReading !== null,
    };
  };

  const handleSwitchBt = async () => {
    const printer = store.getState().settings.printerAddress;
    connectToDevice(printer);
    console.log("Printer: ", printer);
  };

  const showPrinterReceipt = async () => {
    console.log(products);
    const supplier = fieldCollectionData.supplier.name;
    const supplierID = fieldCollectionData.supplier.id;
    const location = fieldCollectionData.location.name;
    const sublocation = fieldCollectionData.location.subLocation;
    const product = fieldCollectionData.product.name;
    const items = products;
    const server = fieldCollectionData.clerk.name;
    const separator = "-----------------------------\n";

    let receiptData = "";
    receiptData += "====== Weighing Receipt =====\n\n";
    receiptData += `Supplier: ${supplier.padEnd(10)} ID: ${supplierID}\n`;
    receiptData += `Location: ${location.padEnd(10)}\n`;
    receiptData += `Date: ${new Date()
      .toLocaleDateString()
      .padEnd(9)} Time: ${new Date().toLocaleTimeString()}\n\n`;

    receiptData += "----------- Products -----------\n";
    receiptData += "Product  Qty   Weight(Kg)  Price\n";
    items.forEach((item) => {
      const { label, quantity, weight, price } = item;
      const qty = parseInt(quantity, 10);
      const wgt = parseFloat(weight);
      const prc = parseFloat(price);
      receiptData += `${label.padEnd(8)} ${qty.toString().padStart(2)} ${wgt
        .toFixed(2)
        .padStart(9)} ${prc.toFixed(2).padStart(10)}\n`;
    });
    receiptData += separator;
    receiptData += `Total:${totalQuantity.toString().padStart(6)} ${parseFloat(
      totalWeight
    )
      .toFixed(2)
      .padStart(10)} ${parseFloat(totalPrice).toFixed(2).padStart()}\n\n`;

    receiptData += "--------- Advancements --------\n";
    receiptData += "Type    Amount/Item   Weight(Kg)\n";
    advancements.forEach((adv) => {
      if (adv.type === "cash") {
        receiptData += `Cash     ${parseFloat(adv.amount)
          .toFixed(2)
          .padStart(9)}      -\n`;
      } else {
        receiptData += `Barter   ${adv.item.label.padEnd(9)} ${parseFloat(
          adv.weight
        )
          .toFixed(2)
          .padStart(9)}\n`;
      }
    });
    receiptData += "\n";
    receiptData += `Total Advanced: Ksh ${parseFloat(totalAdvanced)
      .toFixed(2)}\n`;
    receiptData += `Net Pay: Ksh ${(
      parseFloat(totalPrice) - parseFloat(totalAdvanced)
    )
      .toFixed(2)}\n\n`;

    receiptData += `Served by: ${server}\n\n`;
    receiptData += "Thank you for your business!\n";
    receiptData += "===========================\n";
    receiptData += "\n\n\n"; // Extra lines for printer feed

    console.log(receiptData); // For debugging

    const printer = store.getState().settings.printerAddress;
    writeToDevice(printer, receiptData, "ascii");
    console.log("Receipt sent to the printer");
  };

  const handleSaveRecord = async () => {
    setLoading(true);
    if (!location || !product || !selectedSupplier || products.length === 0) {
      ToastAndroid.show("Please fill all required fields", ToastAndroid.SHORT);
      setLoading(false);
      return;
    }

    try {
      const newRecord = {
        ...fieldCollectionData,
        products,
        quantity: totalQuantity,
        weight: totalWeight,
        advancements,
        totalAdvanced,
        totalPrice: totalPrice,
        remainingBalance: totalPrice - totalAdvanced,
      };

      console.log("New Record:", newRecord);

      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected) {
        const fieldCollectionsRef = collection(
          db,
          `Businesses/${BusinessId}/FieldCollections`
        );
        const docRef = await addDoc(fieldCollectionsRef, newRecord);
        console.log("Record saved successfully:", docRef.id);
        ToastAndroid.show("Record saved successfully", ToastAndroid.SHORT);
      } else {
        dispatch(setCollections([...collections, newRecord]));
        console.log("Record saved to Redux store");
        ToastAndroid.show("Record saved to local storage", ToastAndroid.SHORT);
      }

      setModalVisible(true);
      setLoading(false);
    } catch (error) {
      console.error("Error saving record:", error);
      ToastAndroid.show(
        "Error saving record. Please try again.",
        ToastAndroid.SHORT
      );
      setLoading(false);
    }
  };

  const handleAdvancement = () => {
    if (advanceType === "cash") {
      if (isNaN(parseFloat(advanceAmount)) || parseFloat(advanceAmount) <= 0) {
        ToastAndroid.show("Please enter a valid amount", ToastAndroid.SHORT);
        return;
      }
      const newAdvance = { type: "cash", amount: parseFloat(advanceAmount) };
      setAdvancements([...advancements, newAdvance]);
    } else {
      if (
        !barterItem
      ) {
        ToastAndroid.show(
          "Please enter valid barter details",
          ToastAndroid.SHORT
        );
        return;
      }
      const newAdvance = {
        type: "barter",
        item: barterItem,
        weight: parseFloat(receivedData.toString().match(/[+-]?\d*\.?\d+/g)?.join(", ")),
      };
      setAdvancements([...advancements, newAdvance]);
    }

    bottomSheetModalRef.current?.dismiss();
    setAdvanceAmount("");
    setBarterItem(null);
    setBarterWeight("");
  };

  return (
    <View style={styles.container}>
      <Header refresh={refreshing} handleClick={onRefresh} />
      <DropdownComponent
        title="Suppliers"
        onChange={setSelectedSupplier}
        data={supplierData}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalNav}>
              <View style={styles.modaltouchable}>
                <Text style={styles.touchableText}>Print Receipt</Text>
              </View>
            </View>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.button} onPress={handleSwitchBt}>
                <AntDesign name="printer" size={34} color="blue" />
                <Text style={styles.textButton}>Reconnect printer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={showPrinterReceipt}
              >
                <Text style={styles.textButton}>Print</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={[styles.display, { backgroundColor: "green" }]}>
        <View style={styles.data}>
          <Text style={styles.textBold}>Scale Connected:</Text>
          <Text style={styles.textRegular}>
            {isConnected
              ? `${connectedDevice.name} (${connectedDevice.address})`
              : "Scale Not Connected"}
          </Text>
          <Text style={styles.textBold}>Scale Stability:</Text>
          <Text style={styles.textRegular}>
            {parseBluetoothData(receivedData).isStable ? "Stable" : "Unstable"}
          </Text>
        </View>
        <View>
          <Text style={styles.textWeight}>
            {(receivedData || "")
              .toString()
              .match(/[+-]?\d*\.?\d+/g)
              ?.join(", ")}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setProducts([
            ...products,
            {
              ...product,
              quantity: 1,
              weight: parseFloat(
                (receivedData || "0.00")
                  .toString()
                  .match(/[+-]?\d*\.?\d+/g)
                  ?.join(", ")
              ),
            },
          ]);
        }}
      >
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
            <Text style={styles.tableHeader}>Advancements</Text>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Type</Text>
              <Text style={styles.tableHeader}>Amount</Text>
              <Text style={styles.tableHeader}>Price</Text>
            </View>
            {advancements.map((adv, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCell}>
                  {adv.type === "cash" ? "Cash" : adv.item.label}
                </Text>
                <Text style={styles.tableCell}>
                  {adv.type === "cash" ? adv.amount : adv.weight}
                </Text>
                <Text style={styles.tableCell}>
                  {adv.type === "cash" ? "" : adv.item.price}
                </Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.tableCell}>Total</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={styles.tableCell}>{totalAdvanced.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => bottomSheetModalRef.current?.present()}
      >
        <Text style={styles.textButton}>Add Advancement</Text>
      </TouchableOpacity>

      <View style={styles.advancementSummary}>
        <Text style={styles.summaryText}>Total Price: {totalPrice}</Text>
        <Text style={styles.summaryText}>
          Total Advanced: {totalAdvanced.toFixed(2)}
        </Text>
        <Text style={styles.summaryText}>
          Remaining: {(totalPrice - totalAdvanced).toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSaveRecord}>
        {loading ? (
          <ActivityIndicator color="#00FF00" />
        ) : (
          <Text style={styles.textButton}>Save Record</Text>
        )}
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={["50%", "75%"]}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.modalTitle}>Add Advancement</Text>

          <View style={styles.advanceTypeSelection}>
            <TouchableOpacity
              style={[
                styles.advanceTypeButton,
                advanceType === "cash" && styles.selectedAdvanceType,
              ]}
              onPress={() => setAdvanceType("cash")}
            >
              <Text>Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.advanceTypeButton,
                advanceType === "barter" && styles.selectedAdvanceType,
              ]}
              onPress={() => setAdvanceType("barter")}
            >
              <Text>Dukawala (Barter)</Text>
            </TouchableOpacity>
          </View>

          {advanceType === "cash" ? (
            <TextInput
              style={styles.input}
              placeholder="Enter cash amount"
              value={advanceAmount}
              onChangeText={setAdvanceAmount}
              keyboardType="numeric"
            />
          ) : (
            <>
              <DropdownComponent
                title="Select item"
                data={productsData}
                onChange={setBarterItem}
              />
              <View style={styles.advanceTypeSelection}>
                <Text
                  style={{
                    marginRight: 10,
                    fontFamily: "Poppins-Regular",
                    fontSize: 16,
                  }}
                >
                  Weight:
                </Text>
                <Text
                  style={{
                    marginRight: 10,
                    fontFamily: "Poppins-Regular",
                    fontSize: 16,
                  }}
                >
                  {receivedData &&
                    parseFloat(
                      receivedData
                        .toString()
                        .match(/[+-]?\d*\.?\d+/g)
                        ?.join(", ")
                    )}{" "}
                  Kg
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.button} onPress={handleAdvancement}>
            <Text style={styles.advanceButtonText}>Add Advancement</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    backgroundColor: "#F9F9F9",
  },
  display: {
    height: 100,
    width: screenWidth * 0.8,
    borderRadius: 10,
    flexDirection: "row",
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  data: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    width: screenWidth * 0.8,
    backgroundColor: "#F2F2F2",
    padding: 15,
    alignItems: "center",
    margin: 10,
    borderRadius: 20,
  },
  textButton: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
  },
  preview: {
    height: 200,
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    width: screenWidth * 0.8,
    alignItems: "center",
    padding: 10,
    marginVertical: 10,
  },
  scroll: {
    backgroundColor: "white",
    width: "100%",
    borderRadius: 10,
  },
  table: {
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  tableHeader: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f1f1f1",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: "center",
  },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  textBold: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
    color: "white",
  },
  textRegular: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "white",
  },
  textWeight: {
    fontFamily: "Poppins-Regular",
    fontSize: 24,
    color: "white",
  },
  advancementSummary: {
    width: screenWidth * 0.8,
    backgroundColor: "#F2F2F2",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  summaryText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    marginBottom: 5,
  },
  bottomSheetContent: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  advanceTypeSelection: {
    flexDirection: "row",
    marginBottom: 20,
  },
  advanceTypeButton: {
    padding: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  selectedAdvanceType: {
    backgroundColor: "#e0e0e0",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  advanceButtonText: {
    color: "#000000",
    fontWeight: "bold",
  },
});

export default RecordPage;