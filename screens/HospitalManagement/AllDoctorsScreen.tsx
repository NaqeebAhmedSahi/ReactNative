// screens/HospitalDashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../../styles/commonStyles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalDashboard'>;

interface Doctor {
  id: string;
  name: string;
  pin: string;
  specialization: string;
  contact: string;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  doctors: string[];
}

export default function HospitalDashboardScreen({ navigation }: Props) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [expandedHospitalId, setExpandedHospitalId] = useState<string | null>(null);
  const [doctorsMap, setDoctorsMap] = useState<Record<string, Doctor>>({});
  const [loading, setLoading] = useState(true);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinModalVisible, setPinModalVisible] = useState(false);

  useEffect(() => {
    const fetchHospitalsAndDoctors = async () => {
      try {
        const hospitalsSnapshot = await firestore().collection('hospitals').get();
        const hospitalsList: Hospital[] = [];
        const allDoctorIds: Set<string> = new Set();

        hospitalsSnapshot.forEach(doc => {
          const data = doc.data();
          const hospital: Hospital = {
            id: doc.id,
            name: data.name,
            address: data.address,
            doctors: data.doctors || [],
          };
          hospitalsList.push(hospital);
          data.doctors?.forEach((id: string) => allDoctorIds.add(id));
        });

        const doctorPromises = Array.from(allDoctorIds).map(async id => {
          const docSnap = await firestore().collection('doctors').doc(id).get();
          if (docSnap.exists) {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data?.name,
              pin: data?.pin,
              specialization: data?.specialization,
              contact: data?.contact,
            } as Doctor;
          }
          return null;
        });

        const doctorList = (await Promise.all(doctorPromises)).filter(Boolean) as Doctor[];
        const doctorMap: Record<string, Doctor> = {};
        doctorList.forEach(doctor => {
          doctorMap[doctor.id] = doctor;
        });

        setHospitals(hospitalsList);
        setDoctorsMap(doctorMap);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalsAndDoctors();
  }, []);

  const toggleHospital = (hospitalId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedHospitalId(prev => (prev === hospitalId ? null : hospitalId));
  };

  const handleDoctorPress = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setEnteredPin('');
    setPinModalVisible(true);
  };

  const verifyPinAndNavigate = () => {
    if (enteredPin === selectedDoctor?.pin) {
      setPinModalVisible(false);
      navigation.navigate('DoctorDashboard', { doctorId: selectedDoctor.id });
    } else {
      Alert.alert('Incorrect PIN', 'Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
        <Text style={commonStyles.heading}>🏥 Hospital Dashboard</Text>
        {hospitals.map(hospital => (
          <View key={hospital.id} style={styles.hospitalCard}>
            <TouchableOpacity onPress={() => toggleHospital(hospital.id)}>
              <View style={styles.hospitalHeader}>
                <Icon name="hospital-building" size={24} color="#2196F3" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.hospitalName}>{hospital.name}</Text>
                  <Text style={styles.hospitalAddress}>{hospital.address}</Text>
                </View>
                <Icon
                  name={expandedHospitalId === hospital.id ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color="#999"
                  style={{ marginLeft: 'auto' }}
                />
              </View>
            </TouchableOpacity>

            {expandedHospitalId === hospital.id && (
              <View style={styles.doctorList}>
                {hospital.doctors.map(doctorId => {
                  const doctor = doctorsMap[doctorId];
                  if (!doctor) return null;
                  return (
                    <TouchableOpacity
                      key={doctorId}
                      style={styles.doctorItem}
                      onPress={() => handleDoctorPress(doctor)}
                    >
                      <Icon name="stethoscope" size={20} color="#4CAF50" />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.doctorName}>{doctor.name}</Text>
                        <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={pinModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter PIN for {selectedDoctor?.name}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter PIN"
              secureTextEntry
              keyboardType="number-pad"
              value={enteredPin}
              onChangeText={setEnteredPin}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setPinModalVisible(false)}>
                <Text style={{ color: '#fff' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.okButton} onPress={verifyPinAndNavigate}>
                <Text style={{ color: '#fff' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  hospitalCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
  },
  doctorList: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  doctorSpecialization: {
    fontSize: 13,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#999',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  okButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
