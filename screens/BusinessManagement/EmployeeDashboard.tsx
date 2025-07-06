import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../../styles/commonStyles';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'EmployeeDashboard'>;

export default function EmployeeDashboard({ route, navigation }: Props) {
  const { employeeId, employeeName } = route.params;

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.heading}>{employeeName}'s Dashboard</Text>
      
      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => navigation.navigate('AttendanceScreen', { employeeId, employeeName })}
      >
        <View style={styles.optionContent}>
          <Icon name="calendar-today" size={24} color="#4CAF50" />
          <Text style={styles.optionText}>Attendance</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => navigation.navigate('PerformanceScreen', { employeeId, employeeName })}
      >
        <View style={styles.optionContent}>
          <Icon name="assessment" size={24} color="#FF9800" />
          <Text style={styles.optionText}>Performance</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => navigation.navigate('PayrollScreen', { employeeId, employeeName })}
      >
        <View style={styles.optionContent}>
          <Icon name="attach-money" size={24} color="#2196F3" />
          <Text style={styles.optionText}>Payroll</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#333',
  },
});