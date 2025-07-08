import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import CustomButton from '../../components/CustomButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { commonStyles } from '../../styles/commonStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'BusinessHome'>;

export default function BusinessHome({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Business Management</Text>
      <Text style={styles.subtitle}>Manage your companies, staff, and dashboard</Text>

      <View style={styles.card}>
        <Icon name="domain-plus" size={30} color="#4CAF50" />
        <Text style={styles.cardTitle}>Add Company</Text>
        <Text style={styles.cardDesc}>Create and manage registered businesses.</Text>
        <CustomButton 
          title="Add Company" 
          onPress={() => navigation.navigate('AddCompany')} 
          color="#4CAF50"
          icon={<Icon name="plus" size={18} color="white" />}
        />
      </View>

      <View style={styles.card}>
        <Icon name="account-multiple-plus" size={30} color="#2196F3" />
        <Text style={styles.cardTitle}>Add Employee</Text>
        <Text style={styles.cardDesc}>Register employees to your company.</Text>
        <CustomButton 
          title="Add Employee" 
          onPress={() => navigation.navigate('AddEmployee')} 
          color="#2196F3"
          icon={<Icon name="account-plus" size={18} color="white" />}
        />
      </View>

      <View style={styles.card}>
        <Icon name="chart-bar" size={30} color="#FF9800" />
        <Text style={styles.cardTitle}>View Dashboard</Text>
        <Text style={styles.cardDesc}>Analyze and monitor business performance.</Text>
        <CustomButton 
          title="View Dashboard" 
          onPress={() => navigation.navigate('BusinessDashboard')} 
          color="#FF9800"
          icon={<Icon name="view-dashboard" size={18} color="white" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
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
    marginVertical: 10,
    color: '#333',
  },
  cardDesc: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
});
