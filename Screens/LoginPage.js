import React, { useState } from 'react';
import { View, Text, TextInput, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username.trim() === '' || password.trim() === '') {
      setError('Please enter your username and password.');
      return;
    }
    // Login logic(firebase auth)
    console.log('Tunakuredirect');
    // Navigation after login

    setUsername('');
    setPassword('');
    setError('');
    navigation.navigate('TabLayout');
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
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: screenWidth,
    height: screenHeight,
  },
  title: {
    fontSize: 40,
    color: '#00FF00',
    marginBottom: 40,
    fontFamily: 'Poppins-Bold',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#C4C4C4',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginVertical: 10,
    fontFamily: 'Poppins-Regular',
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#E0E0E0',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
});

export default LoginPage;