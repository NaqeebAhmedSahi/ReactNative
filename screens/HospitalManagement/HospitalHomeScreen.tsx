// screens/AddHospitalScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import CustomButton from '../../components/CustomButton';
import { commonStyles } from '../../styles/commonStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
// import { addDoc, collection, getDocs } from 'firebase/firestore';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHospital'>;

export default function AddHospitalScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState('General');
  const [address, setAddress] = useState('');
  const [doctors, setDoctors] = useState<Array<{ id: string, name: string }>>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await firestore().collection('doctors').get();
        const doctorsList: Array<{ id: string, name: string }> = [];
        querySnapshot.forEach((doc) => {
          doctorsList.push({ id: doc.id, name: doc.data().name });
        });
        setDoctors(doctorsList);
      } catch (error) {
        console.error('Error fetching doctors: ', error);
      }
    };


    fetchDoctors();
  }, []);

  const handleAddHospital = async () => {
    if (!name || !address) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await firestore().collection('hospitals').add({
        name,
        type,
        address,
        doctors: selectedDoctors,
        createdAt: firestore.FieldValue.serverTimestamp(), // optional
      });
      Alert.alert('Success', 'Hospital added successfully');
      navigation.goBack();
    } catch (error) {
      console.error("Error adding hospital: ", error);
      Alert.alert('Error', 'Failed to add hospital');
    } finally {
      setLoading(false);
    }
  };

  const toggleDoctorSelection = (doctorId: string) => {
    setSelectedDoctors(prev =>
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.heading}>Add New 1 Hospital</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Hospital Name*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter hospital name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Hospital Type</Text>
        <Picker
          selectedValue={type}
          onValueChange={(itemValue) => setType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="General" value="General" />
          <Picker.Item label="Specialty" value="Specialty" />
          <Picker.Item label="Clinic" value="Clinic" />
          <Picker.Item label="Research" value="Research" />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Address*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter hospital address"
          value={address}
          onChangeText={setAddress}
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Available Doctors</Text>
        {doctors.map(doctor => (
          <View key={doctor.id} style={styles.doctorItem}>
            <Icon
              name={selectedDoctors.includes(doctor.id) ? "checkbox-marked" : "checkbox-blank-outline"}
              size={24}
              color="#2196F3"
              onPress={() => toggleDoctorSelection(doctor.id)}
            />
            <Text style={styles.doctorName}>{doctor.name}</Text>
          </View>
        ))}
      </View>

      <CustomButton
        title="Add Hospital"
        onPress={handleAddHospital}
        loading={loading}
        color="#2196F3"
        icon={<Icon name="hospital-building" size={20} color="white" />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  doctorName: {
    marginLeft: 10,
    fontSize: 16,
  },
});