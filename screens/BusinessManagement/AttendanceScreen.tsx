import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../../styles/commonStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'AttendanceScreen'>;

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface MarkedDay {
  day: number;
  hours: string;
}

export default function AttendanceScreen({ route }: Props) {
  const { employeeId } = route.params;
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [markedDays, setMarkedDays] = useState<MarkedDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState('');

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    id: `${selectedYear}-${selectedMonth + 1}-${i + 1}`
  }));

  // 🟡 Fetch companyId from employees collection
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const doc = await firestore().collection('employees').doc(employeeId).get();
        if (doc.exists) {
          const data = doc.data();
          if (data?.companyId) {
            setCompanyId(data.companyId);
          } else {
            Alert.alert('Error', 'No companyId found for this employee');
          }
        } else {
          Alert.alert('Error', 'Employee not found');
        }
      } catch (error) {
        console.error('Error fetching companyId:', error);
        Alert.alert('Error', 'Failed to fetch companyId');
      }
    };

    fetchCompanyId();
  }, [employeeId]);

  const toggleAttendance = (day: number) => {
    const exists = markedDays.find(d => d.day === day);
    if (exists) {
      setMarkedDays(prev => prev.filter(d => d.day !== day));
    } else {
      setMarkedDays(prev => [...prev, { day, hours: '8' }]);
    }
  };

  const setHoursForDay = (day: number, value: string) => {
    setMarkedDays(prev =>
      prev.map(d =>
        d.day === day ? { ...d, hours: value } : d
      )
    );
  };

  const handleSaveAllAttendance = async () => {
    if (!companyId) {
      Alert.alert('Error', 'Company ID is not loaded yet');
      return;
    }

    setLoading(true);

    try {
      const attendanceArray = [];

      for (let i = 1; i <= daysInMonth; i++) {
        const marked = markedDays.find(d => d.day === i);
        const isPresent = Boolean(marked);
        const hours = isPresent ? parseInt(marked!.hours || '0', 10) : 0;
        const status = isPresent ? (hours >= 4 ? 'Present' : 'Half-day') : 'Absent';

        attendanceArray.push({ day: i, hours, status });
      }

      const docId = `${employeeId}_${selectedYear}_${selectedMonth + 1}`;
      await firestore().collection('attendance').doc(docId).set({
        employeeId,
        companyId, // ✅ Store companyId
        year: selectedYear,
        month: selectedMonth + 1,
        attendance: attendanceArray,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Monthly attendance saved!');
      setMarkedDays([]);
    } catch (error) {
      console.error('Error saving monthly attendance:', error);
      Alert.alert('Error', 'Failed to save monthly attendance.');
    } finally {
      setLoading(false);
    }
  };

  const renderDayItem = ({ item }: { item: { day: number, id: string } }) => {
    const isSunday = new Date(selectedYear, selectedMonth, item.day).getDay() === 0;
    const marked = markedDays.find(d => d.day === item.day);

    return (
      <TouchableOpacity
        style={[
          styles.dayCard,
          isSunday && styles.sundayCard,
          marked && styles.markedPresentCard,
        ]}
        onPress={() => !isSunday && toggleAttendance(item.day)}
        disabled={isSunday}
      >
        <Text style={styles.dayText}>{item.day}</Text>
        {marked && (
          <TextInput
            style={styles.hoursInput}
            value={marked.hours}
            onChangeText={(text) => setHoursForDay(item.day, text)}
            keyboardType="numeric"
            placeholder="Hrs"
            maxLength={2}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={selectedMonth}
          onValueChange={itemValue => setSelectedMonth(itemValue)}
          style={styles.picker}
          dropdownIconColor="#333"
        >
          {months.map((month, index) => (
            <Picker.Item key={month} label={month} value={index} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedYear}
          onValueChange={itemValue => setSelectedYear(itemValue)}
          style={styles.picker}
          dropdownIconColor="#333"
        >
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
            <Picker.Item key={year} label={year.toString()} value={year} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text>Saving attendance...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={days}
            numColumns={4}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.daysContainer}
            renderItem={renderDayItem}
          />

          <TouchableOpacity style={styles.saveAttendanceBtn} onPress={handleSaveAllAttendance}>
            <Text style={styles.saveAttendanceBtnText}>Save Attendance</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  picker: {
    flex: 1,
    marginHorizontal: 5,
  },
  daysContainer: {
    paddingBottom: 20,
  },
  dayCard: {
    width: 70,
    height: 80,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sundayCard: {
    backgroundColor: '#e0e0e0',
  },
  markedPresentCard: {
    backgroundColor: '#90caf9',
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hoursInput: {
    width: 40,
    height: 35,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 14,
    padding: 0,
  },
  saveAttendanceBtn: {
    backgroundColor: '#1976D2',
    padding: 12,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 8,
    alignSelf: 'center',
    width: '90%',
  },
  saveAttendanceBtnText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
