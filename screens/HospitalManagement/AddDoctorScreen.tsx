import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import CustomButton from '../../components/CustomButton';
import { commonStyles } from '../../styles/commonStyles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';

type Props = NativeStackScreenProps<RootStackParamList, 'AddDoctor'>;

export default function AddDoctorScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [specialization, setSpecialization] = useState('General Physician');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddDoctor = async () => {
    if (!name || !contact || !pin) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      await firestore().collection('doctors').add({
        name,
        pin,
        specialization,
        contact,
        availableSlots: [],
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Doctor added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding doctor: ', error);
      Alert.alert('Error', 'Failed to add doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
      <Text style={commonStyles.heading}>👨‍⚕️ Add New Doctor</Text>

      {/* Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Doctor Name*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* PIN */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Doctor PIN*</Text>
        <TextInput
          style={styles.input}
          placeholder="Unique ID / PIN"
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
        />
      </View>

      {/* Specialization */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Specialization</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={specialization}
            onValueChange={(value) => setSpecialization(value)}
            style={styles.picker}
          >
            <Picker.Item label="General Physician" value="General Physician" />
            <Picker.Item label="Cardiologist" value="Cardiologist" />
            <Picker.Item label="Dermatologist" value="Dermatologist" />
            <Picker.Item label="Neurologist" value="Neurologist" />
            <Picker.Item label="Pediatrician" value="Pediatrician" />
            <Picker.Item label="Surgeon" value="Surgeon" />
          </Picker>
        </View>
      </View>

      {/* Contact */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contact Number*</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 0300-1234567"
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
        />
      </View>

      {/* Submit Button */}
      <CustomButton
        title="Add Doctor"
        onPress={handleAddDoctor}
        loading={loading}
        color="#4CAF50"
        icon={<Icon name="person-add" size={20} color="white" />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
});
