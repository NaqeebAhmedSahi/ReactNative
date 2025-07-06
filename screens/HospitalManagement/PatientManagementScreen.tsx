import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../../styles/commonStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import { debounce } from 'lodash';

type Props = NativeStackScreenProps<RootStackParamList, 'PatientManagement'>;

interface Hospital {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  name: string;
  contact: string;
  lastAppointment: string;
  nextFollowUp?: string;
  doctorName: string;
  treatmentHistory: string[];
}

export default function PatientManagementScreen({ navigation }: Props) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const handleSearch = debounce((query: string) => {
    if (!query) {
      setFilteredPatients(patients);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const lowerCaseQuery = query.toLowerCase();
    const filtered = patients.filter(patient => 
      patient.name.toLowerCase().includes(lowerCaseQuery) ||
      patient.contact.includes(query) ||
      patient.doctorName.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredPatients(filtered);
  }, 300);

  useEffect(() => {
    handleSearch(searchQuery);
    return () => handleSearch.cancel();
  }, [searchQuery, patients]);

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
    const fetchPatients = async () => {
      if (!selectedHospital) return;

      setLoadingPatients(true);
      try {
        const appointmentsSnapshot = await firestore()
          .collection('appointments')
          .where('hospitalId', '==', selectedHospital)
          .get();

        const patientMap = new Map<string, Patient>();

        for (const doc of appointmentsSnapshot.docs) {
          const appointment = doc.data();
          const patientId = appointment.patient.id;

          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, {
              id: patientId,
              name: appointment.patient.name,
              contact: appointment.patient.contact,
              lastAppointment: appointment.slot.date,
              doctorName: appointment.doctorName,
              treatmentHistory: [appointment.patient.reason || 'No reason provided'],
            });
          } else {
            const existingPatient = patientMap.get(patientId)!;
            patientMap.set(patientId, {
              ...existingPatient,
              lastAppointment: appointment.slot.date,
              treatmentHistory: [
                ...existingPatient.treatmentHistory,
                appointment.patient.reason || 'No reason provided'
              ],
            });
          }
        }

        const patientsArray = Array.from(patientMap.values());
        setPatients(patientsArray);
        setFilteredPatients(patientsArray);
      } catch (error) {
        console.error('Error fetching patients: ', error);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [selectedHospital]);

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity 
      style={styles.patientCard}
      onPress={() => navigation.navigate('PatientDetails', { patientId: item.id })}
    >
      <View style={styles.patientAvatar}>
        <Icon name="account" size={28} color="#6c63ff" />
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientContact}>{item.contact}</Text>
        <View style={styles.patientMeta}>
          <Text style={styles.patientMetaText}>
            <Icon name="calendar" size={14} color="#666" /> Last visit: {item.lastAppointment}
          </Text>
          <Text style={styles.patientMetaText}>
            <Icon name="doctor" size={14} color="#666" /> {item.doctorName}
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          <Icon name="account-group" size={28} color="#6c63ff" /> Patient Management
        </Text>
        <Text style={styles.subHeading}>View and manage patient records</Text>
      </View>

      <View style={styles.pickerCard}>
        <Text style={styles.label}>Select Hospital</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#6c63ff" />
        ) : (
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
        )}
      </View>

      {selectedHospital && (
        <>
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.length > 0) setIsSearching(true);
              }}
              clearButtonMode="while-editing"
            />
            {isSearching && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                }}
              >
                <Icon name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.patientsContainer}>
            <Text style={styles.sectionTitle}>
              {isSearching ? 'Search Results' : 'Patients'} ({filteredPatients.length})
            </Text>
            {loadingPatients ? (
              <ActivityIndicator size="large" color="#6c63ff" style={styles.loader} />
            ) : filteredPatients.length > 0 ? (
              <FlatList
                data={filteredPatients}
                keyExtractor={item => item.id}
                renderItem={renderPatientItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="on-drag"
              />
            ) : (
              <View style={styles.emptyState}>
                <Icon 
                  name={isSearching ? "magnify-close" : "account-question"} 
                  size={50} 
                  color="#ccc" 
                />
                <Text style={styles.emptyStateText}>
                  {isSearching ? 'No matching patients found' : 'No patients found'}
                </Text>
                <Text style={styles.emptyStateSubText}>
                  {isSearching ? 'Try a different search term' : 'Patients will appear here once they book appointments'}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f9',
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subHeading: {
    fontSize: 14,
    color: '#666',
  },
  pickerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    marginLeft: 10,
  },
  patientsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0e6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  patientContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  patientMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patientMetaText: {
    fontSize: 12,
    color: '#666',
    marginRight: 15,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    fontWeight: '500',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
    maxWidth: '80%',
  },
});