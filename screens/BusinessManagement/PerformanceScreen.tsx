import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { commonStyles } from '../../styles/commonStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'PerformanceScreen'>;

interface AttendanceDay {
  day: number;
  hours: number;
  status: 'Present' | 'Absent' | 'Half-day';
}

interface PerformanceRecord {
  month: string;
  year: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  totalHours: number;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PerformanceScreen({ route }: Props) {
  const { employeeId } = route.params;
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const snapshot = await firestore()
          .collection('attendance')
          .where('employeeId', '==', employeeId)
          .get();

        const records: PerformanceRecord[] = [];

        snapshot.forEach(doc => {
          const data = doc.data();

          const attendance: AttendanceDay[] = data.attendance || [];
          let presentDays = 0, halfDays = 0, absentDays = 0, totalHours = 0;

          attendance.forEach(record => {
            totalHours += record.hours;
            if (record.status === 'Present') presentDays++;
            else if (record.status === 'Half-day') halfDays++;
            else absentDays++;
          });

          records.push({
            month: months[(data.month || 1) - 1], // 0-based index
            year: data.year,
            presentDays,
            halfDays,
            absentDays,
            totalHours,
          });
        });

        const sorted = records.sort((a, b) =>
          b.year - a.year || months.indexOf(b.month) - months.indexOf(a.month)
        );

        setPerformance(sorted);
      } catch (error) {
        console.error('Error fetching performance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [employeeId]);

  const renderItem = ({ item }: { item: PerformanceRecord }) => (
    <View style={styles.performanceCard}>
      <Text style={styles.monthText}>{item.month} {item.year}</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.presentDays}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.halfDays}</Text>
          <Text style={styles.statLabel}>Half Days</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.absentDays}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.totalHours}</Text>
          <Text style={styles.statLabel}>Total Hours</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.heading}>Performance Report</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={performance}
          renderItem={renderItem}
          keyExtractor={item => `${item.month}-${item.year}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No performance data available</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  performanceCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
    color: '#666',
    fontSize: 16,
  },
});
