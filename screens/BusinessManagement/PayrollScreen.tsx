import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../../styles/commonStyles';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = NativeStackScreenProps<RootStackParamList, 'PayrollScreen'>;

export default function PayrollScreen({ route }: Props) {
  const { employeeId } = route.params;
  const [monthlySalary, setMonthlySalary] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [payrollData, setPayrollData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [deadlineDate, setDeadlineDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // 🟢 Fetch employee details
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const doc = await firestore().collection('employees').doc(employeeId).get();
        if (doc.exists) {
          const data = doc.data();
          if (data?.employeeSalary) setMonthlySalary(data.employeeSalary.toString());
          if (data?.companyId) setCompanyId(data.companyId);
        } else {
          Alert.alert('Error', 'Employee not found');
        }
      } catch (err) {
        console.error('Error fetching employee:', err);
        Alert.alert('Error', 'Failed to fetch employee');
      }
    };
    fetchEmployeeDetails();
  }, [employeeId]);

  const calculateSalary = async () => {
    if (!monthlySalary || isNaN(parseFloat(monthlySalary))) {
      Alert.alert('Error', 'Please enter a valid monthly salary');
      return;
    }

    setLoading(true);

    try {
      const salary = parseFloat(monthlySalary);

      const snapshot = await firestore()
        .collection('attendance')
        .where('employeeId', '==', employeeId)
        .where('month', '==', selectedMonth + 1)
        .where('year', '==', selectedYear)
        .get();

      if (snapshot.empty) {
        Alert.alert('No Data', 'No attendance found for this month');
        setLoading(false);
        return;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      const attendance = data.attendance || [];

      let presentDays = 0;
      let halfDays = 0;
      let absentDays = 0;
      let totalHours = 0;

      attendance.forEach((record: any) => {
        if (record.status === 'Present') presentDays++;
        else if (record.status === 'Half-day') halfDays++;
        else absentDays++;
        totalHours += record.hours || 0;
      });

      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      let workingDays = 0;
      let current = new Date(startDate);
      while (current <= endDate) {
        if (current.getDay() !== 0) workingDays++;
        current.setDate(current.getDate() + 1);
      }

      const salaryPerDay = salary / workingDays;
      const salaryPerHour = salary / (workingDays * 8);
      const presentSalary = presentDays * salaryPerDay;
      const halfDaySalary = halfDays * (salaryPerDay / 2);
      const totalSalary = presentSalary + halfDaySalary;

      setPayrollData({
        presentDays, halfDays, absentDays, totalHours,
        workingDays, salaryPerDay, salaryPerHour,
        presentSalary, halfDaySalary, totalSalary
      });

      await firestore().collection('payroll').add({
        employeeId,
        companyId,
        month: selectedMonth + 1,
        year: selectedYear,
        monthlySalary: salary,
        presentDays,
        halfDays,
        absentDays,
        totalHours,
        totalSalary,
        deadlineDate,
        status: 'pending', // ✅ Added status field
        calculatedAt: firestore.FieldValue.serverTimestamp()
      });


      Alert.alert('Success', 'Payroll saved successfully');
    } catch (error) {
      console.error('Payroll calculation error:', error);
      Alert.alert('Error', 'Failed to calculate payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.heading}>Payroll Calculator</Text>

      <View style={styles.filterContainer}>
        <Picker selectedValue={selectedMonth} onValueChange={setSelectedMonth} style={styles.picker}>
          {months.map((month, index) => (
            <Picker.Item key={month} label={month} value={index} />
          ))}
        </Picker>
        <Picker selectedValue={selectedYear} onValueChange={setSelectedYear} style={styles.picker}>
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
            <Picker.Item key={year} label={year.toString()} value={year} />
          ))}
        </Picker>
      </View>

      <TextInput
        placeholder="Monthly Salary"
        value={monthlySalary}
        onChangeText={setMonthlySalary}
        keyboardType="numeric"
        style={commonStyles.input}
      />

      {/* 🔵 Deadline Picker */}
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>
          Set Deadline: {deadlineDate.toDateString()}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={deadlineDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDeadlineDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity
        style={styles.calculateButton}
        onPress={calculateSalary}
        disabled={loading}
      >
        <Text style={styles.calculateButtonText}>
          {loading ? 'Calculating...' : 'Calculate Salary'}
        </Text>
      </TouchableOpacity>

      {/* 🔽 Result Display */}
      {payrollData && (
        <View style={styles.resultContainer}>
          {Object.entries({
            'Working Days': payrollData.workingDays,
            'Present Days': payrollData.presentDays,
            'Half Days': payrollData.halfDays,
            'Absent Days': payrollData.absentDays,
            'Total Hours': payrollData.totalHours,
            'Salary Per Day': `₹${payrollData.salaryPerDay.toFixed(2)}`,
            'Salary Per Hour': `₹${payrollData.salaryPerHour.toFixed(2)}`
          }).map(([label, value]) => (
            <View key={label} style={styles.resultRow}>
              <Text style={styles.resultLabel}>{label}:</Text>
              <Text style={styles.resultValue}>{value}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, styles.totalLabel]}>Total Salary:</Text>
            <Text style={[styles.resultValue, styles.totalValue]}>
              ₹{payrollData.totalSalary.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  picker: {
    flex: 1,
    marginHorizontal: 5,
  },
  calculateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginVertical: 15,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  dateText: {
    color: '#444',
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: 18,
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
});
