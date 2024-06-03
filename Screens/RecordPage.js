import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView,Modal, TextInput } from 'react-native'
import React, { useState } from 'react'
import DropdownComponent from '../Components/DropDown'
import { Button } from 'react-native-paper';
import Header from '../Components/Header';
import AntDesign from "@expo/vector-icons/AntDesign";


const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const RecordPage = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isSendBySMS, setIsSendBySMS] = useState(true);

    const showSendBySMS = () => {
        setIsSendBySMS(true);
      };
    
      const showPrintReceipt = () => {
        setIsSendBySMS(false);
      };
    
      
  return (
    
    <View style={styles.Container}>
        <Header />
        <DropdownComponent />
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalNav}>
                <TouchableOpacity style={styles.modaltouchable} onPress={showSendBySMS}>
                <AntDesign name="book" size={24} color="black" />
                    <Text style={styles.touchableText}>Send By SMS</Text>
                    
                </TouchableOpacity>
                <TouchableOpacity style={styles.modaltouchable} onPress={showPrintReceipt}>
                <AntDesign name="printer" size={24} color="black" />
                    <Text style={styles.touchableText}>Print Reciept</Text>
                </TouchableOpacity>
            </View>
            {isSendBySMS ? (
            <View style={styles.modalContent}>
              <TextInput placeholder='+254' style={styles.modalInput} />
              <TouchableOpacity style={styles.Button}>
                <Text style={styles.textButton}>Send</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.Button}>
              <AntDesign name="printer" size={34} color="blue" />
                <Text style={styles.textButton}>Printer Connected</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.Button}>
                <Text style={styles.textButton}>Print</Text>

              </TouchableOpacity>
            </View>
          )}
           
          </View>
        </View>
      </Modal>
        <View style={styles.display}>
            <View style={styles.data}>
                <Text style={styles.textBold}>Scale Connected:</Text>
                <Text style={styles.textRegular}>STS MERC SCALE</Text>
                <Text style={styles.textBold}>Scale Stability:</Text>
                <Text style={styles.textRegular}>STABLE</Text>
            </View>
            <View>
                <Text style={styles.textWeight} >7.21 Kg</Text>
            </View>
        </View>
        <TouchableOpacity style={styles.Button}>
            <Text style={styles.textButton}>Next</Text>
        </TouchableOpacity>
        <View style={styles.preview}>
            <Text style={styles.textButton}>Records</Text>
            <ScrollView style={styles.scroll}>
            <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Item</Text>
                <Text style={styles.tableHeader}>Quantity</Text>
                <Text style={styles.tableHeader}>Weight</Text>
                </View>

                {/* Table Rows */}
                <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Row 1, Col 1</Text>
                <Text style={styles.tableCell}>Row 1, Col 2</Text>
                <Text style={styles.tableCell}>Row 1, Col 3</Text>
                </View>
                
               
                {/* Add more rows as needed */}
            </View>

            </ScrollView>
        </View>
        <TouchableOpacity style={styles.Button} onPress={() => setModalVisible(true)}>
            <Text style={styles.textButton}>Save Record</Text>
        </TouchableOpacity>
    </View>
  )
}

export default RecordPage

const styles = StyleSheet.create({
Container: {
    alignItems:'center',
    padding: 50,
    backgroundColor:'#F9F9F9',
    width: screenWidth,
    height: screenHeight


},
display: {
    height: 100,
    backgroundColor: '#2BFF2B',
    width: screenWidth * 0.8,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignItems:'center'
},
centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    display:'flex',
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
  modalNav:{
    display:'flex',
    flexDirection:'row',
    padding:5,
    justifyContent:'space-between',

  },
  modaltouchable:{
    display: 'flex',
    borderBottomColor: '#2BFF2B',
    alignItems:'center',
    padding: 20,
    textAlign: 'center',
    borderBottomWidth:2,
    width: screenWidth * 0.4,
    flexDirection:'row'

  },
  touchableText:{
    fontFamily: 'Poppins-Regular',
    fontSize: 20,
    fontWeight: '400'
  },
  modalContent:{
    display: 'flex',
    alignItems: 'center',
    padding: 10
  },
  modalInput:{
    width: screenWidth * 0.8,
    padding: 20,
    borderWidth:  2,
    borderColor:'#8F8F8F',
    borderRadius: 10,
    fontFamily:'Poppins-Regular',
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
data:{
    display: 'flex',
    flexDirection: 'column'
},
Button: {
    width: screenWidth * 0.8,
    backgroundColor: '#F2F2F2',
    padding:20,
    textAlign: 'center',
    margin: 10,
    alignItems: 'center',
    borderRadius: 20,

},
preview: {
    height: 300,
    backgroundColor:'#F2F2F2',
    borderRadius: 10,
    width: screenWidth * 0.8,
    alignItems: 'center',
    padding: 10

},
scroll:{
    backgroundColor:'white',
    height:300,
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
    fontFamily:'Poppins-Bold'
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
  },
textBold:{
    fontFamily:'Poppins-Bold',
    color: 'white',
    fontSize: 14,
    fontWeight: '700'
},
textRegular:{
    fontFamily:'Poppins-Regular',
    color:'white'
},
textWeight:{
    fontFamily:'Poppins-Regular',
    fontSize: 30,
    textAlign:'center',
    alignSelf:'center',
    color:'white'
},
textButton:{
    fontFamily:'Poppins-Regular',
    fontSize: 13,
    fontWeight:'400'
}

})