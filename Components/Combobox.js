import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const screenWidth = Dimensions.get("window").width;

const items = {
  data: [
    { label: "Item 1", value: "1" },
    { label: "Item 2", value: "2" },
    { label: "Item 3", value: "3" },
    { label: "Item 4", value: "4" },
    { label: "Item 5", value: "5" },
    { label: "Item 6", value: "6" },
    { label: "Item 7", value: "7" },
    { label: "Item 8", value: "8" },
  ],
};

const Combobox = () => {
  const inputRef = React.useRef(null);
  const [search, setSearch] = React.useState("");
  const [isFocus, setIsFocus] = React.useState(false);

  const toggleFocus = () => {
    if (inputRef.current) {
      if (isFocus) {
        inputRef.current.blur();
      } else {
        inputRef.current.focus();
      }
    }
  };

  const handleSelectItem = (itemLabel) => {
    setSearch(itemLabel);
    setIsFocus(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.combobox}>
        <TextInput
          ref={inputRef}
          value={search}
          onChangeText={(text) => setSearch(text)}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          style={styles.input}
          placeholderTextColor="#000"
          placeholder="Product"
        />
        <TouchableOpacity onPress={toggleFocus}>
          <AntDesign name="down" size={16} color="black" />
        </TouchableOpacity>
      </View>
      {isFocus && (
        <View style={styles.dropdown}>
          {(search.length > 0
            ? items.data.filter((item) =>
                item.label.toLowerCase().includes(search.toLowerCase())
              )
            : items.data
          ).map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelectItem(item.label)}
            >
              <Text style={styles.itemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default Combobox;

const styles = StyleSheet.create({
  container: {
    padding: 5,
    height: 65,
    backgroundColor: "#F9F9F9",
    width: screenWidth * 0.9,
  },
  combobox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    shadowColor: "black",
    flex: 1,
    paddingHorizontal: 10,
    shadowOffset: {
      width: 5,
      height: -5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderRadius: 12,
    position: "relative",
  },
  input: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#FFF",
    color: "#000",
    fontSize: 18,
    flex: 1,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    marginTop: 10,
    width: "100%",
    backgroundColor: "#F2F2F2",
    padding: 10,
    borderRadius: 12,
    zIndex: 1,
  },
  itemText: {
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 5,
    marginVertical: 2,
  },
});
