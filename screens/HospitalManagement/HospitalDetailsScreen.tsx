// screens/HospitalDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../../styles/commonStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalDetails'>;

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  contact: string;
}

export default function HospitalDetailsScreen({ route, navigation }: Props) {
  const { hospitalId } = route.params;
  const [hospital, setHospital] = useState<any>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitalDetails = async () => {
      try {
        const hospitalDoc = await firestore().collection('hospitals').doc(hospitalId).get();
        if (hospitalDoc.exists) {
          const hospitalData = hospitalDoc.data();
          setHospital(hospitalData);

          const doctorIds: string[] = hospitalData.doctors || [];
          const doctorsList: Doctor[] = [];

          for (const doctorId of doctorIds) {
            const doctorDoc = await firestore().collection('doctors').doc(doctorId).get();
            if (doctorDoc.exists) {
              const doctorData = doctorDoc.data();
              doctorsList.push({
                id: doctorDoc.id,
                name: doctorData?.name,
                specialization: doctorData?.specialization,
                contact: doctorData?.contact,
              });
            }
          }

          setDoctors(doctorsList);
        }
      } catch (error) {
        console.error('Error fetching hospital details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalDetails();
  }, [hospitalId]);

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!hospital) {
    return (
      <View style={commonStyles.container}>
        <Text style={commonStyles.heading}>Hospital not found</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.hospitalInfo}>
        <View style={styles.hospitalHeader}>
          <Icon name="hospital-building" size={30} color="#2196F3" />
          <Text style={styles.hospitalName}>{hospital.name}</Text>
        </View>
        <Text style={styles.hospitalType}>{hospital.type}</Text>
        <Text style={styles.hospitalAddress}>{hospital.address}</Text>
      </View>

      <Text style={styles.doctorsHeading}>Available Doctors</Text>

      {doctors.length === 0 ? (
        <Text style={styles.noDataText}>No doctors available</Text>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.doctorCard}
              onPress={() => navigation.navigate('DoctorDashboard', { doctorId: item.id })}
            >
              <View style={styles.doctorHeader}>
                <Icon name="doctor" size={24} color="#4CAF50" />
                <Text style={styles.doctorName}>{item.name}</Text>
              </View>
              <Text style={styles.doctorSpecialization}>{item.specialization}</Text>
              <Text style={styles.doctorContact}>{item.contact}</Text>
              <View style={styles.viewDetails}>
                <Text style={styles.viewDetailsText}>View Dashboard</Text>
                <Icon name="chevron-right" size={20} color="#4CAF50" />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hospitalInfo: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  hospitalType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
  },
  doctorsHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  doctorContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    color: '#4CAF50',
    marginRight: 5,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
