// screens/DoctorDashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../../styles/commonStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorDashboard'>;

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

export default function DoctorDashboardScreen({ route }: Props) {
  const { doctorId } = route.params;
  const [doctor, setDoctor] = useState<any>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const doctorDoc = await firestore().collection('doctors').doc(doctorId).get();
        if (doctorDoc.exists) {
          const data = doctorDoc.data();
          setDoctor(data);
          setSlots(data?.availableSlots || []);
        } else {
          setDoctor(null);
        }
      } catch (error) {
        console.error('Error fetching doctor details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorDetails();
  }, [doctorId]);

  const handleAddSlot = async () => {
    if (!newSlotDate || !newSlotTime) {
      Alert.alert('Error', 'Please select both date and time');
      return;
    }

    const newSlot: Slot = {
      id: Date.now().toString(),
      date: newSlotDate,
      time: newSlotTime,
      available: true,
    };

    try {
      const updatedSlots = [...slots, newSlot];
      await firestore().collection('doctors').doc(doctorId).update({
        availableSlots: updatedSlots,
      });
      setSlots(updatedSlots);
      setNewSlotDate('');
      setNewSlotTime('');
      Alert.alert('Success', 'Slot added successfully');
    } catch (error) {
      console.error('Error adding slot:', error);
      Alert.alert('Error', 'Failed to add slot');
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    try {
      const updatedSlots = slots.filter(slot => slot.id !== slotId);
      await firestore().collection('doctors').doc(doctorId).update({
        availableSlots: updatedSlots,
      });
      setSlots(updatedSlots);
      Alert.alert('Success', 'Slot removed successfully');
    } catch (error) {
      console.error('Error removing slot:', error);
      Alert.alert('Error', 'Failed to remove slot');
    }
  };

  const toggleExpandSlot = (slotId: string) => {
    setExpandedSlot(expandedSlot === slotId ? null : slotId);
  };

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setDate(selectedDate);
      setNewSlotDate(formatted);
    }
  };

  const onChangeTime = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hrs = selectedTime.getHours().toString().padStart(2, '0');
      const mins = selectedTime.getMinutes().toString().padStart(2, '0');
      setTime(selectedTime);
      setNewSlotTime(`${hrs}:${mins}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c63ff" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Doctor not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Icon name="doctor" size={40} color="#6c63ff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
          </View>
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Icon name="email" size={20} color="#666" />
            <Text style={styles.contactText}>{doctor.email || 'N/A'}</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="phone" size={20} color="#666" />
            <Text style={styles.contactText}>{doctor.contact || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Manage Appointments</Text>

      <View style={styles.addSlotCard}>
        <Text style={styles.addSlotTitle}>Add New Slot</Text>
        <View style={styles.slotForm}>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={20} color="#6c63ff" />
            <Text style={styles.datePickerText}>
              {newSlotDate || 'Select Date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="clock-outline" size={20} color="#6c63ff" />
            <Text style={styles.datePickerText}>
              {newSlotTime || 'Select Time'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddSlot}
          >
            <Text style={styles.addButtonText}>Add Slot</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={onChangeTime}
        />
      )}

      <View style={styles.slotsCard}>
        <Text style={styles.slotsTitle}>Appointment Slots</Text>
        {slots.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar-remove" size={40} color="#ccc" />
            <Text style={styles.emptyStateText}>No slots available</Text>
          </View>
        ) : (
          <FlatList
            data={slots}
            scrollEnabled={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={[
                styles.slotItem,
                !item.available && styles.bookedSlot
              ]}>
                <TouchableOpacity 
                  style={styles.slotHeader}
                  onPress={() => toggleExpandSlot(item.id)}
                >
                  <View style={styles.slotInfo}>
                    <Icon 
                      name={item.available ? "calendar-check" : "calendar-remove"} 
                      size={24} 
                      color={item.available ? "#6c63ff" : "#ff6b6b"} 
                    />
                    <Text style={styles.slotText}>
                      {item.date} at {item.time}
                    </Text>
                  </View>
                  <View style={styles.slotStatus}>
                    <Text style={[
                      styles.statusText,
                      item.available ? styles.available : styles.booked
                    ]}>
                      {item.available ? 'Available' : 'Booked'}
                    </Text>
                    <Icon 
                      name={expandedSlot === item.id ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#666" 
                    />
                  </View>
                </TouchableOpacity>

                {expandedSlot === item.id && (
                  <View style={styles.slotDetails}>
                    {!item.available && item.bookedBy ? (
                      <View style={styles.patientInfo}>
                        <Text style={styles.detailTitle}>Patient Details:</Text>
                        <View style={styles.detailRow}>
                          <Icon name="account" size={16} color="#666" />
                          <Text style={styles.detailText}>{item.bookedBy.name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Icon name="phone" size={16} color="#666" />
                          <Text style={styles.detailText}>{item.bookedBy.contact}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Icon name="note-text" size={16} color="#666" />
                          <Text style={styles.detailText}>
                            {item.bookedBy.reason || 'No reason provided'}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.noPatientText}>This slot is available</Text>
                    )}
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveSlot(item.id)}
                    >
                      <Icon name="trash-can-outline" size={18} color="#ff6b6b" />
                      <Text style={styles.removeButtonText}>Remove Slot</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f9',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  profileCard: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0e6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorSpecialization: {
    fontSize: 16,
    color: '#6c63ff',
    marginTop: 2,
  },
  contactInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addSlotCard: {
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
  addSlotTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 15,
  },
  slotForm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    width: '48%',
  },
  datePickerText: {
    marginLeft: 8,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '100%',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  slotsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  slotsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  listContainer: {
    paddingBottom: 10,
  },
  slotItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  bookedSlot: {
    backgroundColor: '#fff5f5',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  slotStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  available: {
    color: '#6c63ff',
  },
  booked: {
    color: '#ff6b6b',
  },
  slotDetails: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  patientInfo: {
    marginBottom: 15,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  noPatientText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});