import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import CustomButton from '../../components/CustomButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { commonStyles } from '../../styles/commonStyles';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEmployee'>;

interface Company {
  id: string;
  companyName: string;
}

export default function AddEmployee({ navigation }: Props) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeRole, setEmployeeRole] = useState('Staff');
  const [employeeContact, setEmployeeContact] = useState('');
  const [employeeSalary, setEmployeeSalary] = useState('');
  const [employeeCNIC, setEmployeeCNIC] = useState('');
  const [employeeAddress, setEmployeeAddress] = useState('');
  const [employeeJoiningDate, setEmployeeJoiningDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscriber = firestore()
      .collection('companies')
      .onSnapshot(
        querySnapshot => {
          const companiesData: Company[] = [];
          querySnapshot.forEach(documentSnapshot => {
            companiesData.push({
              id: documentSnapshot.id,
              companyName: documentSnapshot.data()?.companyName || 'Unknown Company'
            });
          });
          setCompanies(companiesData);
          setLoading(false);
        },
        error => {
          console.error(error);
          showToast('error', 'Error', 'Failed to load companies');
          setLoading(false);
        }
      );

    return () => subscriber();
  }, []);

  const showToast = (type: 'success' | 'error', text1: string, text2?: string) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const validateCNIC = (cnic: string) => {
    const cleaned = cnic.replace(/-/g, '');
    if (cleaned.length !== 13) return false;
    return /^\d+$/.test(cleaned);
  };

  const validateDate = (date: string) => {
    // Simple YYYY-MM-DD validation
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  const handleAddEmployee = async () => {
    if (!selectedCompany) {
      showToast('error', 'Error', 'Please select a company');
      return;
    }

    if (!employeeName || !employeeContact || !employeeSalary || !employeeCNIC || !employeeAddress || !employeeJoiningDate) {
      showToast('error', 'Error', 'Please fill all required fields');
      return;
    }

    if (!/^\d{10,}$/.test(employeeContact)) {
      showToast('error', 'Error', 'Contact must be at least 10 digits');
      return;
    }

    if (!validateCNIC(employeeCNIC)) {
      showToast('error', 'Error', 'CNIC must be exactly 13 digits (with or without dashes)');
      return;
    }

    if (!validateDate(employeeJoiningDate)) {
      showToast('error', 'Error', 'Invalid date format (YYYY-MM-DD) or invalid date');
      return;
    }

    const salaryValue = parseFloat(employeeSalary);
    if (isNaN(salaryValue)) {
      showToast('error', 'Error', 'Please enter a valid salary');
      return;
    }

    const selectedCompanyData = companies.find(c => c.id === selectedCompany);

    try {
      await firestore().collection('employees').add({
        companyId: selectedCompany,
        companyName: selectedCompanyData?.companyName || 'Unknown Company',
        employeeName,
        employeeRole,
        employeeContact,
        employeeSalary: salaryValue,
        employeeCNIC: employeeCNIC.replace(/-/g, ''),
        employeeAddress,
        employeeJoiningDate,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      showToast('success', 'Success', 'Employee added successfully');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      showToast('error', 'Error', 'Failed to add employee');
    }
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Loading companies...</Text>
      </View>
    );
  }

  if (companies.length === 0) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>No companies found</Text>
        <CustomButton 
          title="Go Back" 
          onPress={() => navigation.goBack()} 
          color="#2196F3"
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Employee</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Select Company *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCompany}
            onValueChange={setSelectedCompany}
            style={styles.picker}
            dropdownIconColor="#333"
          >
            <Picker.Item label="Select a company" value="" />
            {companies.map(company => (
              <Picker.Item 
                key={company.id} 
                label={company.companyName} 
                value={company.id} 
              />
            ))}
          </Picker>
        </View>

        <TextInput
          placeholder="Employee Name *"
          value={employeeName}
          onChangeText={setEmployeeName}
          style={styles.input}
        />

        <Text style={styles.label}>Employee Role</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={employeeRole}
            onValueChange={setEmployeeRole}
            style={styles.picker}
            dropdownIconColor="#333"
          >
            <Picker.Item label="Staff" value="Staff" />
            <Picker.Item label="Manager" value="Manager" />
            <Picker.Item label="Admin" value="Admin" />
          </Picker>
        </View>

        <TextInput
          placeholder="Contact Info *"
          value={employeeContact}
          onChangeText={text => setEmployeeContact(text.replace(/[^0-9]/g, ''))}
          style={styles.input}
          keyboardType="phone-pad"
          maxLength={15}
        />

        <TextInput
          placeholder="Salary *"
          value={employeeSalary}
          onChangeText={text => setEmployeeSalary(text.replace(/[^0-9.]/g, ''))}
          style={styles.input}
          keyboardType="decimal-pad"
        />

        <TextInput
          placeholder="CNIC / National ID *"
          value={employeeCNIC}
          onChangeText={text => {
            const cleaned = text.replace(/[^0-9-]/g, '');
            if (cleaned.length <= 15) {
              setEmployeeCNIC(cleaned);
            }
          }}
          style={styles.input}
          keyboardType="numbers-and-punctuation"
          maxLength={15}
        />

        <TextInput
          placeholder="Address *"
          value={employeeAddress}
          onChangeText={setEmployeeAddress}
          style={styles.input}
          multiline
        />

        <TextInput
          placeholder="Joining Date * (YYYY-MM-DD)"
          value={employeeJoiningDate}
          onChangeText={setEmployeeJoiningDate}
          style={styles.input}
        />

        <CustomButton 
          title="Add Employee" 
          onPress={handleAddEmployee} 
          color="#2196F3"
          icon={<Icon name="account-plus" size={18} color="white" />}
        />
      </View>
      <Toast />
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
});