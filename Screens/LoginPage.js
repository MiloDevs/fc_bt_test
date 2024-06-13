import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoggedIn, setBusinessId } from "../store";
import { db } from "../Database/config";
import { collection, getDocs, query, where } from "firebase/firestore";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const loggedIn = useSelector((state) => state.settings.loggedIn);

  useEffect(() => {
    if (loggedIn) {
      navigation.navigate("TabLayout");
    }
  }, [loggedIn]);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    if (username.trim() === "" || password.trim() === "") {
      setError("Please enter your username and password.");
      setLoading(false);
      return;
    }

    try {
      const businessCollections = await getDocs(collection(db, "Businesses"));
      let isValidLogin = false;
      for (const businessDoc of businessCollections.docs) {
        const clerkCollection = await getDocs(
          query(
            collection(businessDoc.ref, "Clerks"),
            where("fName", "==", username),
            where("Id", "==", password)
          )
        );
        if (!clerkCollection.empty) {
          const clerkDoc = clerkCollection.docs[0];
          const clerkData = {
            clerkId: clerkDoc.id,
            ...clerkDoc.data(),
          };
          dispatch(setBusinessId(businessDoc.id));
          dispatch(setUser(clerkData));
          dispatch(setLoggedIn(true));
          navigation.navigate("TabLayout");
          isValidLogin = true;
          break;
        }
      }
      if (!isValidLogin) {
        setError("Invalid username or password.");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farm Scale</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#C4C4C4"
        onChangeText={(text) => setUsername(text)}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#C4C4C4"
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        value={password}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#00FF00" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    width: screenWidth,
    height: screenHeight,
  },
  title: {
    fontSize: 40,
    color: "#00FF00",
    marginBottom: 40,
    fontFamily: "Poppins-ExtraBold",
  },
  input: {
    width: "80%",
    height: 50,
    borderColor: "#C4C4C4",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginVertical: 10,
    fontFamily: "Poppins-Regular",
  },
  button: {
    width: "80%",
    height: 50,
    backgroundColor: "#E0E0E0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,
    fontFamily: "Poppins-Medium",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
});

export default LoginPage;
