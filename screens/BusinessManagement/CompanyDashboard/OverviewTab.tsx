import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

const screenWidth = Dimensions.get('window').width;

interface OverviewTabProps {
  attendanceData: any;
  revenueRecords: any[];
  payrollDeadlines: any[];
  navigation: any;
  companyId: string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  attendanceData = {},
  revenueRecords = [],
  payrollDeadlines = [],
  navigation,
  companyId,
}) => {
  const totalEmployees = attendanceData?.totalEmployees ?? 0;
  const avgAttendance =
    attendanceData?.avgAttendance != null ? `${attendanceData.avgAttendance}%` : 'N/A';
  const recentEmployees = attendanceData?.recentEmployees ?? [];
  const monthlyAttendance = attendanceData?.monthlyAttendance ?? [];

  const latestRevenue =
    revenueRecords.length > 0
      ? `₹${revenueRecords[revenueRecords.length - 1].amount.toLocaleString()}`
      : 'N/A';

  const upcomingPayroll =
    payrollDeadlines.length > 0
      ? payrollDeadlines[0]?.status === 'pending'
        ? 'Pending'
        : 'Completed'
      : 'N/A';

  return (
    <View style={styles.tabContent}>
      {/* Key Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Employees</Text>
          <Text style={styles.metricValue}>{totalEmployees}</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('CompanyEmployees', { companyId })}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg. Attendance</Text>
          <Text style={styles.metricValue}>{avgAttendance}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Monthly Revenue</Text>
          <Text style={styles.metricValue}>{latestRevenue}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Upcoming Payroll</Text>
          <Text style={styles.metricValue}>{upcomingPayroll}</Text>
        </View>
      </View>

      {/* Employee Preview */}
      <View style={styles.employeePreviewContainer}>
        <Text style={styles.sectionTitle}>Recent Employees</Text>

        {recentEmployees.length > 0 ? (
          <>
            {recentEmployees.slice(0, 3).map((employee: any) => (
              <TouchableOpacity
                key={employee.id}
                style={styles.employeePreviewItem}
                onPress={() =>
                  navigation.navigate('EmployeeDashboard', {
                    employeeId: employee.id,
                    employeeName: employee.name,
                  })
                }
              >
                <Icon name="person" size={20} color="#2196F3" />
                <Text style={styles.employeePreviewName}>{employee.employeeName}</Text>
                <Text>{employee.role}</Text>
              </TouchableOpacity>
            ))}
            {recentEmployees.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('CompanyEmployees', { companyId })}
              >
                <Text style={styles.viewAllText}>View All Employees</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text>No recent employees available</Text>
        )}
      </View>

      {/* Attendance Chart */}
      <Text style={styles.sectionTitle}>Employee Attendance (Last 6 Months)</Text>
      {monthlyAttendance.length > 0 ? (
        <LineChart
          data={{
            labels: monthlyAttendance.map((item: any) => item.month),
            datasets: [
              {
                data: monthlyAttendance.map((item: any) => item.percentage),
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix="%"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#1976D2',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            paddingRight: 20,
          }}
        />
      ) : (
        <View style={styles.chartPlaceholder}>
          <Text>No attendance data available</Text>
        </View>
      )}

      {/* Revenue Chart */}
      <Text style={styles.sectionTitle}>Revenue Trend</Text>
      {revenueRecords.length > 0 ? (
        <BarChart
          data={{
            labels: revenueRecords
              .slice(-6)
              .map((item) => `${item.month}/${item.year.toString().slice(2)}`),
            datasets: [
              {
                data: revenueRecords.slice(-6).map((item) => item.amount),
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel="₹"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
            paddingRight: 20,
          }}
        />
      ) : (
        <View style={styles.chartPlaceholder}>
          <Text>No revenue data available</Text>
        </View>
      )}
    </View>
  );
};
