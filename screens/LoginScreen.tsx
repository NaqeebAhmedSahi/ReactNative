import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import CustomButton from '../components/CustomButton';
import { commonStyles } from '../styles/commonStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const doc = await firestore().collection('login').doc('u8j7QoMSH2pqJMzbFpw3').get();
      if (doc.exists) {
        const data = doc.data();
        if (username === data?.username && password === data?.pass) {
          Alert.alert('Success', 'Login successful');
          navigation.replace('Home', { username });
        } else {
          Alert.alert('Error', 'Invalid username or password');
        }
      } else {
        Alert.alert('Error', 'Admin credentials not found');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.heading}>Bethel City Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={commonStyles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={commonStyles.input}
      />
      <CustomButton title="Login" onPress={handleLogin} />
    </View>
  );
}