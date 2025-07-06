import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface PayrollTabProps {
  companyId: string;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({ companyId }) => {
  const [payrollList, setPayrollList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filteredPayrolls, setFilteredPayrolls] = useState<any[]>([]);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const snapshot = await firestore()
          .collection('payroll')
          .where('companyId', '==', companyId)
          .orderBy('calculatedAt', 'desc')
          .get();

        const payrolls = await Promise.all(
          snapshot.docs.map(async doc => {
            const data = doc.data();
            const employeeDoc = await firestore().collection('employees').doc(data.employeeId).get();
            return {
              id: doc.id,
              ...data,
              employeeName: employeeDoc.data()?.employeeName || 'Unknown',
            };
          })
        );

        setPayrollList(payrolls);
        setFilteredPayrolls(payrolls);
      } catch (err) {
        console.error('Error loading payrolls:', err);
      }
    };

    fetchPayrolls();
  }, [companyId]);

  useEffect(() => {
    const filtered = payrollList.filter(p =>
      p.employeeName.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPayrolls(filtered);
  }, [search, payrollList]);

  const markAsPaid = async (payrollId: string) => {
    try {
      await firestore().collection('payroll').doc(payrollId).update({ status: 'paid' });
      const updated = payrollList.map(p =>
        p.id === payrollId ? { ...p, status: 'paid' } : p
      );
      setPayrollList(updated);
      Alert.alert('Success', 'Marked as Paid');
    } catch (err) {
      console.error('Error updating status:', err);
      Alert.alert('Error', 'Failed to mark as paid');
    }
  };

  const renderPayroll = ({ item }: { item: any }) => (
    <View style={styles.payrollItem}>
      <View>
        <Text style={styles.employeeName}>{item.employeeName}</Text>
        <Text style={styles.employeeDetail}>{item.month}/{item.year}</Text>
        <Text style={styles.employeeDetail}>Salary: ₹{item.totalSalary?.toFixed(2)}</Text>
        <Text style={styles.employeeDetail}>Status: {item.status?.toUpperCase()}</Text>
      </View>
      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.unpaidButton}
          onPress={() => markAsPaid(item.id)}
        >
          <Text style={styles.unpaidButtonText}>Unpaid</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPayrolls}
        keyExtractor={item => item.id}
        renderItem={renderPayroll}
        ListHeaderComponent={
          <TextInput
            style={styles.searchInput}
            placeholder="Search employee..."
            value={search}
            onChangeText={setSearch}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="event" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No payroll records found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        nestedScrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f7f7f7',
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  payrollItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  employeeDetail: {
    fontSize: 14,
    color: '#555',
  },
  unpaidButton: {
    backgroundColor: '#FFA000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  unpaidButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#999',
    marginTop: 10,
    fontSize: 16,
  },
});
