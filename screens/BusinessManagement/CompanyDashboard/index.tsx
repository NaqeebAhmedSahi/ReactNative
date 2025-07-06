// index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { commonStyles } from '../../../styles/commonStyles';
import firestore from '@react-native-firebase/firestore';

import { styles } from './styles';
import { OverviewTab } from './OverviewTab';
import { RevenueTab } from './RevenueTab';
import { PayrollTab } from './PayrollTab';
import { DashboardTabsProps } from './types';
import { Alert } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'CompanyDashboard'>;

export default function CompanyDashboard({ route, navigation }: Props) {
  const { companyId } = route.params;
  const [activeTab, setActiveTab] = useState('overview');
  const [revenueRecords, setRevenueRecords] = useState<any[]>([]);
  const [payrollDeadlines, setPayrollDeadlines] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [revenueInput, setRevenueInput] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    amount: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const revenueSnapshot = await firestore()
        .collection('revenues')
        .where('companyId', '==', companyId)
        .orderBy('year')
        .orderBy('month')
        .get();

      const revenues = revenueSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRevenueRecords(revenues);

      const payrollSnapshot = await firestore()
        .collection('payroll')
        .where('companyId', '==', companyId)
        .orderBy('deadlineDate', 'desc')
        .limit(3)
        .get();

      const deadlines = payrollSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadlineDate: doc.data().deadlineDate.toDate(),
      }));
      setPayrollDeadlines(deadlines);

      const attendanceSnapshot = await firestore()
        .collection('attendance')
        .where('companyId', '==', companyId)
        .get();

      const monthlySummaryMap: Record<string, { total: number; present: number }> = {};
      const employeeSet = new Set<string>();
      const recentEmployeeMap: Record<string, any> = {};

      attendanceSnapshot.forEach(doc => {
        const { employeeId, year, month, attendance } = doc.data();
        employeeSet.add(employeeId);
        if (!recentEmployeeMap[employeeId]) recentEmployeeMap[employeeId] = { employeeId };

        const key = `${month}/${year}`;
        if (!monthlySummaryMap[key]) {
          monthlySummaryMap[key] = { total: 0, present: 0 };
        }

        attendance.forEach((day: any) => {
          monthlySummaryMap[key].total++;
          if (day.status === 'Present') monthlySummaryMap[key].present++;
        });
      });

      const avgAttendance = Object.values(monthlySummaryMap).length > 0
        ? (
          Object.values(monthlySummaryMap).reduce((sum, m) => sum + m.present / m.total, 0) /
          Object.values(monthlySummaryMap).length
        ) * 100
        : null;

      const recentEmployeeIds = Object.keys(recentEmployeeMap).slice(0, 5);
      let recentEmployees: any[] = [];

      if (recentEmployeeIds.length > 0) {
        const recentEmployeesSnapshot = await firestore()
          .collection('employees')
          .where(firestore.FieldPath.documentId(), 'in', recentEmployeeIds)
          .get();

        recentEmployees = recentEmployeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }



      const monthlyAttendance = Object.entries(monthlySummaryMap).map(([key, value]) => ({
        month: key,
        percentage: parseFloat(((value.present / value.total) * 100).toFixed(2)),
      }));

      setAttendanceData({
        totalEmployees: employeeSet.size,
        avgAttendance: avgAttendance ? avgAttendance.toFixed(1) : null,
        recentEmployees,
        monthlyAttendance,
      });
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const handleAddRevenue = async () => {
    if (!revenueInput.amount || isNaN(parseFloat(revenueInput.amount))) {
      Alert.alert('Error', 'Please enter a valid revenue amount');
      return;
    }

    setLoading(true);
    try {
      await firestore().collection('revenues').add({
        companyId,
        year: revenueInput.year,
        month: revenueInput.month,
        amount: parseFloat(revenueInput.amount),
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Revenue record added successfully');
      setRevenueInput(prev => ({ ...prev, amount: '' }));
      fetchData();
    } catch (error) {
      console.error('❌ Error adding revenue:', error);
      Alert.alert('Error', 'Failed to add revenue record');
    } finally {
      setLoading(false);
    }
  };

  const tabsProps: DashboardTabsProps = {
    companyId,
    loading,
    revenueRecords,
    payrollDeadlines,
    attendanceData,
    revenueInput,
    setRevenueInput,
    handleAddRevenue,
    navigation,
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Business Dashboard</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Icon name="dashboard" size={20} color={activeTab === 'overview' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'revenue' && styles.activeTab]}
          onPress={() => setActiveTab('revenue')}
        >
          <Icon name="attach-money" size={20} color={activeTab === 'revenue' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'revenue' && styles.activeTabText]}>Revenue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'payroll' && styles.activeTab]}
          onPress={() => setActiveTab('payroll')}
        >
          <Icon name="account-balance-wallet" size={20} color={activeTab === 'payroll' ? '#2196F3' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'payroll' && styles.activeTabText]}>Payroll</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        )}

        {activeTab === 'overview' && <OverviewTab {...tabsProps} />}
        {activeTab === 'revenue' && <RevenueTab {...tabsProps} />}
        {activeTab === 'payroll' && <PayrollTab {...tabsProps} />}
      </ScrollView>
    </View>
  );
}
