// screens/AddHospitalScreen.tsx
import React, { useState, useEffect } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHospital'>;

const facilitiesOptions = ['Emergency', 'ICU', 'Pharmacy', 'Lab', 'Ambulance'];

export default function AddHospitalScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState('General');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [establishedAt, setEstablishedAt] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
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

  const toggleDoctorSelection = (doctorId: string) => {
    setSelectedDoctors(prev =>
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const toggleFacility = (facility: string) => {
    setFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const handleAddHospital = async () => {
    if (!name || !address || !phone || !email) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await firestore().collection('hospitals').add({
        name,
        type,
        address,
        phone,
        email,
        establishedAt,
        doctors: selectedDoctors,
        facilities,
        createdAt: firestore.FieldValue.serverTimestamp(),
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

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
      <Text style={commonStyles.heading}>🏥 Add New Hospital</Text>

      {/* Hospital Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hospital Name*</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter hospital name"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hospital Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={type}
            onValueChange={setType}
            style={styles.picker}
          >
            <Picker.Item label="General" value="General" />
            <Picker.Item label="Specialty" value="Specialty" />
            <Picker.Item label="Clinic" value="Clinic" />
            <Picker.Item label="Research" value="Research" />
          </Picker>
        </View>
      </View>

      {/* Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address*</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Enter hospital address"
          value={address}
          onChangeText={setAddress}
          multiline
        />
      </View>

      {/* Phone */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone*</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 0300-1234567"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email*</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. contact@hospital.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Year Established */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Established Year</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1995"
          keyboardType="numeric"
          value={establishedAt}
          onChangeText={setEstablishedAt}
        />
      </View>

      {/* Facilities */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Facilities</Text>
        {facilitiesOptions.map(facility => (
          <TouchableOpacity key={facility} style={styles.checkItem} onPress={() => toggleFacility(facility)}>
            <Icon
              name={facilities.includes(facility) ? "checkbox-marked" : "checkbox-blank-outline"}
              size={22}
              color="#4caf50"
            />
            <Text style={styles.checkLabel}>{facility}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Doctors */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Available Doctors</Text>
        {doctors.map(doctor => (
          <TouchableOpacity key={doctor.id} style={styles.checkItem} onPress={() => toggleDoctorSelection(doctor.id)}>
            <Icon
              name={selectedDoctors.includes(doctor.id) ? "checkbox-marked" : "checkbox-blank-outline"}
              size={22}
              color="#2196F3"
            />
            <Text style={styles.checkLabel}>{doctor.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Submit Button */}
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
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  checkLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
});
