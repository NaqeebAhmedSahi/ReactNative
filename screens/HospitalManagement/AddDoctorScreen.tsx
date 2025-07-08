import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import CustomButton from '../../components/CustomButton';
import { commonStyles } from '../../styles/commonStyles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'AddDoctor'>;

export default function AddDoctorScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [specialization, setSpecialization] = useState('General Physician');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (type: 'success' | 'error', text1: string, text2?: string) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const handleAddDoctor = async () => {
    // Validate name
    if (!name.trim()) {
      showToast('error', 'Validation Error', 'Doctor name is required');
      return;
    }

    // Validate PIN
    if (!pin) {
      showToast('error', 'Validation Error', 'PIN is required');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      showToast('error', 'Validation Error', 'PIN must be 4-6 digits');
      return;
    }

    // Validate contact
    if (!contact) {
      showToast('error', 'Validation Error', 'Contact number is required');
      return;
    }

    const cleanedContact = contact.replace(/[^0-9+]/g, '');

    const isValidUKMobile = /^(\+447\d{9}|07\d{9})$/.test(cleanedContact);

    if (!isValidUKMobile) {
      showToast('error', 'Validation Error', 'Enter valid UK mobile number (07... or +447...)');
      return;
    }

    setLoading(true);

    try {
      await firestore().collection('doctors').add({
        name: name.trim(),
        pin,
        specialization,
        contact: cleanedContact,
        availableSlots: [],
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      showToast('success', 'Success', 'Doctor added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding doctor: ', error);
      showToast('error', 'Error', 'Failed to add doctor. Please try again.');
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
          maxLength={50}
        />
      </View>

      {/* PIN */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Doctor PIN*</Text>
        <TextInput
          style={styles.input}
          placeholder="4-6 digit PIN"
          value={pin}
          onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
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
          placeholder="e.g. 07912345678 or +447912345678"
          value={contact}
          onChangeText={(text) => setContact(text.replace(/[^0-9+]/g, '').slice(0, 15))}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      <CustomButton
        title="Add Doctor"
        onPress={handleAddDoctor}
        loading={loading}
        color="#4CAF50"
        icon={<Icon name="person-add" size={20} color="white" />}
      />

      <Toast />
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
