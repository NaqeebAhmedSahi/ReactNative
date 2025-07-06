import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import BusinessHome from './screens/BusinessManagement/BusinessHome';
import CompanyDashboard from './screens/BusinessManagement/CompanyDashboard'; 
import BusinessDashboard from './screens/BusinessManagement/BusinessDashboard'
import UpdateEmployee from './screens/BusinessManagement/UpdateEmployee'; 

import CompanyEmployees from './screens/BusinessManagement/CompanyEmployees';
import EmployeeDashboard from './screens/BusinessManagement/EmployeeDashboard';
import AttendanceScreen from './screens/BusinessManagement/AttendanceScreen';
import PerformanceScreen from './screens/BusinessManagement/PerformanceScreen';
import PayrollScreen from './screens/BusinessManagement/PayrollScreen';
import AddCompany from './screens/BusinessManagement/AddCompany';
import AddEmployee from './screens/BusinessManagement/AddEmployee';
import HospitalHomeScreen from './screens/HospitalManagement/HospitalHomeScreen';
import AddHospitalScreen from './screens/HospitalManagement/AddHospitalScreen';
import BookAppointmentScreen from './screens/HospitalManagement/BookAppointmentScreen';
import AddDoctorScreen from './screens/HospitalManagement/AddDoctorScreen';
import DoctorDashboardScreen from './screens/HospitalManagement/DoctorDashboardScreen';
import HospitalDashboardScreen from './screens/HospitalManagement/HospitalDashboardScreen';
import HospitalDetailsScreen from './screens/HospitalManagement/HospitalDetailsScreen';
import PatientManagementScreen from './screens/HospitalManagement/PatientManagementScreen';

import AllDoctors from './screens/HospitalManagement/AllDoctorsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* Authentication */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login', headerShown: false }}
        />

        {/* Main Screens */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Bethel City Management',
            headerBackTitle: 'Logout',
            headerBackVisible: true
          }}
        />

        {/* Business Management */}
        <Stack.Screen
          name="BusinessHome"
          component={BusinessHome}
          options={{
            title: 'Business Management',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="BusinessDashboard"
          component={BusinessDashboard}
          options={({ route }) => ({
            title: 'Company Dashboard',
            headerBackTitle: 'Back'
          })}
        />
        <Stack.Screen
          name="CompanyDashboard"
          component={CompanyDashboard}
          options={({ route }) => ({
            title: route.params?.companyName || 'Company Dashboard',
            headerBackTitle: 'Back'
          })}
        />
        <Stack.Screen
          name="CompanyEmployees"
          component={CompanyEmployees}
          options={({ route }) => ({
            title:'Company Employees',
            headerBackTitle: 'Back'
          })}
        />
        <Stack.Screen
          name="UpdateEmployee"
          component={UpdateEmployee}
          options={{ title: 'Update Employee' }}
        />
        <Stack.Screen
          name="EmployeeDashboard"
          component={EmployeeDashboard}
          options={({ route }) => ({
            title: route.params.employeeName || 'Employee Dashboard',
            headerBackTitle: 'Back'
          })}
        />
        <Stack.Screen
          name="AttendanceScreen"
          component={AttendanceScreen}
          options={{
            title: 'Attendance',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="PerformanceScreen"
          component={PerformanceScreen}
          options={{
            title: 'Performance Review',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="PayrollScreen"
          component={PayrollScreen}
          options={{
            title: 'Payroll',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="AddCompany"
          component={AddCompany}
          options={{
            title: 'Add New Company',
            headerBackTitle: 'Cancel'
          }}
        />
        <Stack.Screen
          name="AddEmployee"
          component={AddEmployee}
          options={({ route }) => ({
            title: 'Add Employee',
            headerBackTitle: 'Cancel'
          })}
        />

        {/* Hospital Management */}
        <Stack.Screen
          name="HospitalHomeScreen"
          component={HospitalHomeScreen}
          options={{
            title: 'Hospital Management',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="AddHospitalScreen"
          component={AddHospitalScreen}
          options={{
            title: 'Add New Hospital',
            headerBackTitle: 'Cancel'
          }}
        />
        <Stack.Screen
          name="BookAppointmentScreen"
          component={BookAppointmentScreen}
          options={({ route }) => ({
            title: 'Book Appointment',
            headerBackTitle: 'Back'
          })}
        />
        <Stack.Screen
          name="AddDoctorScreen"
          component={AddDoctorScreen}
          options={({ route }) => ({
            title:'Add Doctor',
            headerBackTitle: 'Cancel'
          })}
        />
        <Stack.Screen
          name="DoctorDashboard"
          component={DoctorDashboardScreen}
          options={({ route }) => ({
            title: 'Doctor Dashboard',
            headerBackTitle: 'Back'
          })}
        />
        <Stack.Screen
          name="HospitalDashboardScreen"
          component={HospitalDashboardScreen}
          options={({ route }) => ({
            title:'Hospital Dashboard',
            headerBackTitle: 'Back'
          })}
        />
        <Stack.Screen
          name="HospitalDetailsScreen"
          component={HospitalDetailsScreen}
          options={({ route }) => ({
            title:  'Hospital Details',
            headerBackTitle: 'Back'
          })}
        />
        <Stack.Screen
          name="AllDoctors"
          component={AllDoctors}
          options={({ route }) => ({
            title : 'All Doctors',
            headerBackTitle: 'Back'
          })}
        />
         <Stack.Screen
          name="PatientManagementScreen"
          component={PatientManagementScreen}
          options={({ route }) => ({
            title : 'Patient Management Screen',
            headerBackTitle: 'Back'
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}