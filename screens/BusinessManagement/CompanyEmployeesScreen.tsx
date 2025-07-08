import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../../styles/commonStyles';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'CompanyEmployees'>;

interface Employee {
  id: string;
  name: string;
  role: string;
  contact: string;
  email: string;
  joinDate: string;
  salary: string;
  cnic: string;
  address: string;
}

export default function CompanyEmployees({ route, navigation }: Props) {
  const { companyId, companyName } = route.params;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: companyName ? `${companyName} Employees` : 'Company Employees' });
    fetchEmployees();
  }, [companyId]);

  const fetchEmployees = async () => {
    try {
      setRefreshing(true);
      const subscriber = firestore()
        .collection('employees')
        .where('companyId', '==', companyId)
        .onSnapshot(querySnapshot => {
          const employeesData: Employee[] = [];
          querySnapshot.forEach(documentSnapshot => {
            const data = documentSnapshot.data();
            employeesData.push({
              id: documentSnapshot.id,
              name: data?.employeeName || 'Unknown',
              role: data?.employeeRole || 'Staff',
              contact: data?.employeeContact || 'N/A',
              email: data?.employeeEmail || 'N/A',
              joinDate: data?.employeeJoiningDate || 'N/A',
              salary: data?.employeeSalary || 'N/A',
              cnic: data?.employeeCNIC || 'N/A',
              address: data?.employeeAddress || 'N/A',
            });
          });
          setEmployees(employeesData);
          setLoading(false);
          setRefreshing(false);
        });

      return () => subscriber();
    } catch (error) {
      console.error('Error fetching employees:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this employee?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('employees').doc(employeeId).delete();
              Alert.alert('Success', 'Employee deleted successfully');
              fetchEmployees();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete employee');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderEmployeeItem = ({ item }: { item: Employee }) => (
    <View style={styles.employeeCard}>
      <TouchableOpacity 
        style={styles.employeeContent}
        onPress={() => navigation.navigate('EmployeeDashboard', { 
          employeeId: item.id, 
          employeeName: item.name 
        })}
      >
        <View style={styles.employeeAvatar}>
          <Icon name="person" size={24} color="#fff" />
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeRole}>{item.role}</Text>
          <Text style={styles.employeeDetail}>Salary: {item.salary}</Text>
          <Text style={styles.employeeDetail}>Joined: {item.joinDate}</Text>
        </View>
        <View style={styles.employeeContact}>
          <Icon name="phone" size={18} color="#2196F3" />
          <Text style={styles.contactText}>{item.contact}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('UpdateEmployee', { 
            employeeId: item.id,
            companyId: companyId
          })}
        >
          <Icon name="edit" size={20} color="#2196F3" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteEmployee(item.id)}
        >
          <Icon name="delete" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <FlatList
        data={employees}
        renderItem={renderEmployeeItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={fetchEmployees}
        ListEmptyComponent={
          <View style={styles.center}>
            <Icon name="people-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No employees found</Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerText}>Total Employees: {employees.length}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddEmployee', { companyId })}
            >
              <Icon name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Employee</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  employeeCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  employeeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeAvatar: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  employeeRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  employeeDetail: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  employeeContact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    marginLeft: 5,
    color: '#2196F3',
  },
  listContainer: {
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    marginRight: 15,
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
});