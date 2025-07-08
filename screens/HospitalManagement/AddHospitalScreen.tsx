import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import CustomButton from '../../components/CustomButton';
import { commonStyles } from '../../styles/commonStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';

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
  const [fetchingDoctors, setFetchingDoctors] = useState(true);

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
        showToast('error', 'Error', 'Failed to load doctors');
      } finally {
        setFetchingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const showToast = (type: 'success' | 'error', text1: string, text2?: string) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 3000,
    });
  };

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

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[\d\s-]{10,15}$/;
    return re.test(phone);
  };

  const validateYear = (year: string) => {
    if (!year) return true;
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year, 10);
    return yearNum > 1800 && yearNum <= currentYear;
  };

  const handleAddHospital = async () => {
    if (!name.trim()) {
      showToast('error', 'Error', 'Hospital name is required');
      return;
    }

    if (!address.trim()) {
      showToast('error', 'Error', 'Address is required');
      return;
    }

    if (!phone.trim()) {
      showToast('error', 'Error', 'Phone number is required');
      return;
    }

    if (!validatePhone(phone)) {
      showToast('error', 'Error', 'Please enter a valid UK phone number');
      return;
    }

    if (!email.trim()) {
      showToast('error', 'Error', 'Email is required');
      return;
    }

    if (!validateEmail(email)) {
      showToast('error', 'Error', 'Please enter a valid email address');
      return;
    }

    if (establishedAt && !validateYear(establishedAt)) {
      showToast('error', 'Error', 'Please enter a valid establishment year');
      return;
    }

    setLoading(true);
    try {
      await firestore().collection('hospitals').add({
        name: name.trim(),
        type,
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        establishedAt: establishedAt.trim(),
        doctors: selectedDoctors,
        facilities,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      showToast('success', 'Success', 'Hospital added successfully');
      navigation.goBack();
    } catch (error) {
      console.error("Error adding hospital: ", error);
      showToast('error', 'Error', 'Failed to add hospital');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDoctors) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Loading doctors...</Text>
      </View>
    );
  }

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
          placeholder="e.g. 020 7946 0958"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={text => setPhone(text.replace(/[^0-9\s-]/g, ''))}
          maxLength={15}
        />
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email*</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. info@hospital.co.uk"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Year Established */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Established Year (e.g. 1995)</Text>
        <TextInput
          style={styles.input}
          placeholder="1995"
          keyboardType="numeric"
          value={establishedAt}
          onChangeText={text => setEstablishedAt(text.replace(/[^0-9]/g, '').slice(0, 4))}
          maxLength={4}
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
        {doctors.length > 0 ? (
          doctors.map(doctor => (
            <TouchableOpacity key={doctor.id} style={styles.checkItem} onPress={() => toggleDoctorSelection(doctor.id)}>
              <Icon
                name={selectedDoctors.includes(doctor.id) ? "checkbox-marked" : "checkbox-blank-outline"}
                size={22}
                color="#2196F3"
              />
              <Text style={styles.checkLabel}>{doctor.name}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDoctorsText}>No doctors available</Text>
        )}
      </View>

      {/* Submit Button */}
      <CustomButton
        title="Add Hospital"
        onPress={handleAddHospital}
        loading={loading}
        color="#2196F3"
        icon={<Icon name="hospital-building" size={20} color="white" />}
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
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  checkLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
  noDoctorsText: {
    fontStyle: 'italic',
    color: '#666',
  },
});
