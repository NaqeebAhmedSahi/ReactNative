import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import CustomButton from '../../components/CustomButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { commonStyles } from '../../styles/commonStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'HospitalDashboard'>;

export default function HospitalDashboardScreen({ navigation }: Props) {
  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.heading}>🏥 Hospital Dashboard</Text>
      <Text style={styles.subHeading}>Manage all hospital operations efficiently</Text>

      <View style={styles.cardContainer}>
        <CustomButton
          title="Add Hospital"
          onPress={() => navigation.navigate('AddHospitalScreen')}
          color="#2196F3"
          icon={<Icon name="hospital-building" size={22} color="white" />}
        />

        <CustomButton
          title="Add Doctor"
          onPress={() => navigation.navigate('AddDoctorScreen')}
          color="#4CAF50"
          icon={<Icon name="doctor" size={22} color="white" />}
        />

        <CustomButton
          title="All Doctors"
          onPress={() => navigation.navigate('AllDoctors')}
          color="#9C27B0"
          icon={<Icon name="account-group" size={22} color="white" />}
        />

        <CustomButton
          title="Book Appointment"
          onPress={() => navigation.navigate('BookAppointmentScreen')}
          color="#FF9800"
          icon={<Icon name="calendar-clock" size={22} color="white" />}
        />
          <CustomButton
          title="Patient Management"
          onPress={() => navigation.navigate('PatientManagementScreen')}
          color="#FF9800"
          icon={<Icon name="calendar-clock" size={22} color="white" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: 30,
    paddingHorizontal: 10,
    gap: 16,
  },
  subHeading: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
});
