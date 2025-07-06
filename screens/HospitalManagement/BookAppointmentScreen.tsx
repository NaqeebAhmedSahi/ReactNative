// screens/BookAppointmentScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, TextInput, ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../../styles/commonStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = NativeStackScreenProps<RootStackParamList, 'BookAppointment'>;

interface Hospital {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface Slot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  bookedBy?: {
    patientId: string;
    name: string;
    contact: string;
    reason: string;
  };
}

interface PatientData {
  name: string;
  contact: string;
  reason: string;
}

export default function BookAppointmentScreen({ navigation, route }: Props) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    contact: '',
    reason: ''
  });
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const snapshot = await firestore().collection('hospitals').get();
        const hospitalList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setHospitals(hospitalList);
      } catch (error) {
        console.error('Error fetching hospitals: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedHospital) return;

      setLoadingDoctors(true);
      try {
        const hospitalDoc = await firestore().collection('hospitals').doc(selectedHospital).get();
        const doctorIds: string[] = hospitalDoc.exists ? hospitalDoc.data()?.doctors || [] : [];

        const doctorList: Doctor[] = [];

        for (const id of doctorIds) {
          const docSnap = await firestore().collection('doctors').doc(id).get();
          if (docSnap.exists) {
            const { name, specialization } = docSnap.data()!;
            doctorList.push({ id: docSnap.id, name, specialization });
          }
        }

        setDoctors(doctorList);
        setSelectedDoctor('');
        setSlots([]);
      } catch (error) {
        console.error('Error fetching doctors: ', error);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [selectedHospital]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor) return;

      setLoadingSlots(true);
      try {
        const doctorDoc = await firestore().collection('doctors').doc(selectedDoctor).get();
        const availableSlots: Slot[] = doctorDoc.exists ? doctorDoc.data()?.availableSlots || [] : [];
        setSlots(availableSlots);
      } catch (error) {
        console.error('Error fetching slots: ', error);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDoctor]);

  const handleSelectSlot = (slot: Slot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setShowPatientForm(true);
  };

const handleBookAppointment = async () => {
  if (!selectedSlot || !patientData.name || !patientData.contact) {
    Alert.alert('Error', 'Please fill all required fields');
    return;
  }

  try {
    const doctorRef = firestore().collection('doctors').doc(selectedDoctor);
    const doctorDoc = await doctorRef.get();

    const currentSlots: Slot[] = doctorDoc.exists ? doctorDoc.data()?.availableSlots || [] : [];

    // Generate a unique ID for the appointment if userId isn't available
    const patientId = route.params?.userId || `temp-${Date.now()}`;

    const updatedSlots = currentSlots.map(s => 
      s.id === selectedSlot.id ? { 
        ...s, 
        available: false,
        bookedBy: {
          patientId: patientId,
          name: patientData.name,
          contact: patientData.contact,
          reason: patientData.reason
        }
      } : s
    );

    await doctorRef.update({ availableSlots: updatedSlots });

    // Create appointment record
    await firestore().collection('appointments').add({
      doctorId: selectedDoctor,
      doctorName: doctors.find(d => d.id === selectedDoctor)?.name,
      hospitalId: selectedHospital,
      hospitalName: hospitals.find(h => h.id === selectedHospital)?.name,
      slot: selectedSlot,
      patient: {
        id: patientId,
        name: patientData.name,
        contact: patientData.contact,
        reason: patientData.reason
      },
      createdAt: firestore.FieldValue.serverTimestamp(),
      status: 'booked'
    });

    Alert.alert('Success', 'Appointment booked successfully!');
    setSlots(updatedSlots);
    setShowPatientForm(false);
    setPatientData({ name: '', contact: '', reason: '' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    Alert.alert('Error', 'Failed to book appointment');
  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.heading}>Book Appointment</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Select Hospital</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedHospital}
            onValueChange={setSelectedHospital}
            style={styles.picker}
            dropdownIconColor="#6c63ff"
          >
            <Picker.Item label="Select a hospital" value="" />
            {hospitals.map(h => (
              <Picker.Item key={h.id} label={h.name} value={h.id} />
            ))}
          </Picker>
        </View>
      </View>

      {loadingDoctors ? (
        <ActivityIndicator size="small" color="#6c63ff" />
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Select Doctor</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedDoctor}
              onValueChange={setSelectedDoctor}
              style={styles.picker}
              enabled={!!selectedHospital}
              dropdownIconColor="#6c63ff"
            >
              <Picker.Item label="Select a doctor" value="" />
              {doctors.map(doc => (
                <Picker.Item
                  key={doc.id}
                  label={`${doc.name} (${doc.specialization})`}
                  value={doc.id}
                />
              ))}
            </Picker>
          </View>
        </View>
      )}

      {loadingSlots ? (
        <ActivityIndicator size="small" color="#6c63ff" />
      ) : slots.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          <FlatList
            data={slots}
            scrollEnabled={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.slotCard,
                  !item.available && styles.bookedSlot,
                  selectedSlot?.id === item.id && styles.selectedSlot
                ]}
                onPress={() => handleSelectSlot(item)}
                disabled={!item.available}
              >
                <View style={styles.slotContent}>
                  <Icon 
                    name={item.available ? "calendar-check" : "calendar-remove"} 
                    size={24} 
                    color={item.available ? "#6c63ff" : "#ff6b6b"} 
                  />
                  <View style={styles.slotTextContainer}>
                    <Text style={styles.slotText}>{item.date} at {item.time}</Text>
                    <Text style={styles.slotStatus}>
                      {item.available ? 'Available' : 'Booked'}
                    </Text>
                  </View>
                </View>
                {item.available && (
                  <Icon name="chevron-right" size={24} color="#6c63ff" />
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      ) : selectedDoctor ? (
        <View style={styles.card}>
          <Text style={styles.noSlotsText}>No available slots for this doctor</Text>
        </View>
      ) : null}

      {showPatientForm && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={patientData.name}
              onChangeText={text => setPatientData({...patientData, name: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contact Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your contact number"
              keyboardType="phone-pad"
              value={patientData.contact}
              onChangeText={text => setPatientData({...patientData, contact: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Reason for Visit</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Briefly describe your reason for visit"
              multiline
              numberOfLines={3}
              value={patientData.reason}
              onChangeText={text => setPatientData({...patientData, reason: text})}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowPatientForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleBookAppointment}
            >
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f9',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  listContainer: {
    width: '100%',
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  bookedSlot: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  selectedSlot: {
    borderWidth: 2,
    borderColor: '#6c63ff',
  },
  slotContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotTextContainer: {
    marginLeft: 10,
  },
  slotText: {
    fontSize: 16,
    color: '#333',
  },
  slotStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noSlotsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#6c63ff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});