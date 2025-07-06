import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import CustomButton from '../../components/CustomButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { commonStyles } from '../../styles/commonStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateEmployee'>;

export default function UpdateEmployee({ route, navigation }: Props) {
  const { employeeId } = route.params;
  const [employeeName, setEmployeeName] = useState('');
  const [employeeRole, setEmployeeRole] = useState('Staff');
  const [employeeContact, setEmployeeContact] = useState('');
  const [employeeSalary, setEmployeeSalary] = useState('');
  const [employeeCNIC, setEmployeeCNIC] = useState('');
  const [employeeAddress, setEmployeeAddress] = useState('');
  const [employeeJoiningDate, setEmployeeJoiningDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const employeeDoc = await firestore().collection('employees').doc(employeeId).get();
        if (employeeDoc.exists) {
          const data = employeeDoc.data();
          setEmployeeName(data?.employeeName || '');
          setEmployeeRole(data?.employeeRole || 'Staff');
          setEmployeeContact(data?.employeeContact || '');
          setEmployeeSalary(data?.employeeSalary || '');
          setEmployeeCNIC(data?.employeeCNIC || '');
          setEmployeeAddress(data?.employeeAddress || '');
          setEmployeeJoiningDate(data?.employeeJoiningDate || '');
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to load employee data');
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleUpdateEmployee = async () => {
    if (!employeeName || !employeeRole || !employeeContact || !employeeSalary || !employeeCNIC || !employeeAddress || !employeeJoiningDate) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await firestore().collection('employees').doc(employeeId).update({
        employeeName,
        employeeRole,
        employeeContact,
        employeeSalary,
        employeeCNIC,
        employeeAddress,
        employeeJoiningDate,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Success', 'Employee updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async () => {
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
              navigation.goBack();
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

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Loading employee data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Update Employee</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Employee Name"
          value={employeeName}
          onChangeText={setEmployeeName}
          style={styles.input}
        />

        <Text style={styles.label}>Employee Role</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={employeeRole}
            onValueChange={(itemValue) => setEmployeeRole(itemValue)}
            style={styles.picker}
            dropdownIconColor="#333"
          >
            <Picker.Item label="Staff" value="Staff" />
            <Picker.Item label="Manager" value="Manager" />
            <Picker.Item label="Admin" value="Admin" />
          </Picker>
        </View>

        <TextInput
          placeholder="Contact Info"
          value={employeeContact}
          onChangeText={setEmployeeContact}
          style={styles.input}
          keyboardType="phone-pad"
        />

        <TextInput
          placeholder="Salary"
          value={employeeSalary}
          onChangeText={setEmployeeSalary}
          style={styles.input}
          keyboardType="numeric"
        />

        <TextInput
          placeholder="CNIC / National ID"
          value={employeeCNIC}
          onChangeText={setEmployeeCNIC}
          style={styles.input}
          keyboardType="numeric"
        />

        <TextInput
          placeholder="Address"
          value={employeeAddress}
          onChangeText={setEmployeeAddress}
          style={styles.input}
        />

        <TextInput
          placeholder="Joining Date (e.g. 2024-01-01)"
          value={employeeJoiningDate}
          onChangeText={setEmployeeJoiningDate}
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          <CustomButton 
            title="Update Employee" 
            onPress={handleUpdateEmployee} 
            color="#2196F3"
            icon={<Icon name="account-edit" size={18} color="white" />}
            style={styles.button}
          />
          
          <CustomButton 
            title="Delete Employee" 
            onPress={handleDeleteEmployee} 
            color="#f44336"
            icon={<Icon name="account-remove" size={18} color="white" />}
            style={styles.button}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5F7FA',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#333',
  },
  label: {
    marginBottom: 5,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    marginVertical: 5,
  },
});