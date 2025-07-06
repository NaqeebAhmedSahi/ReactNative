import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import CustomButton from '../components/CustomButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { commonStyles } from '../styles/commonStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Text style={styles.heroTitle}>Welcome to</Text>
        <Text style={styles.appName}>Bethel City Management</Text>
        <Text style={styles.heroSubtitle}>Choose a module to manage your operations</Text>
      </View>

      {/* Management Cards */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Icon name="briefcase" size={30} color="#4CAF50" />
          <Text style={styles.cardTitle}>Business Management</Text>
          <Text style={styles.cardDescription}>
            Manage businesses, employees, payroll, and more.
          </Text>
          <CustomButton 
            title="Manage Business"
            onPress={() => navigation.navigate('BusinessHome')}
            color="#4CAF50"
            icon={<Icon name="arrow-right-bold" size={18} color="white" />}
          />
        </View>

        <View style={styles.card}>
          <Icon name="hospital-building" size={30} color="#2196F3" />
          <Text style={styles.cardTitle}>Hospital Management</Text>
          <Text style={styles.cardDescription}>
            Add hospitals, doctors, appointments, and dashboards.
          </Text>
          <CustomButton 
            title="Manage Hospital"
            onPress={() => navigation.navigate('HospitalDashboardScreen')}
            color="#2196F3"
            icon={<Icon name="arrow-right-bold" size={18} color="white" />}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F6F8',
  },
  heroContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    color: '#333',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginVertical: 5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginVertical: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
  },
});
