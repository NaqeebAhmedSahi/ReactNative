export type RootStackParamList = {
  Login: undefined;
  Home: { username: string };
  BusinessHome: undefined;
  AddCompany: undefined;
  AddEmployee: undefined;
  HospitalHome: undefined;
  AddHospital: undefined;
  BookAppointment: undefined;
    BusinessDashboard: undefined;
  CompanyEmployees: { companyId: string; companyName: string };
    EmployeeDashboard: { employeeId: string; employeeName: string };
  AttendanceScreen: { employeeId: string; employeeName: string };
  PerformanceScreen: { employeeId: string; employeeName: string };
  PayrollScreen: { employeeId: string; employeeName: string };
  AddDoctor: undefined;
  HospitalDashboard: undefined;
  HospitalDetails: { hospitalId: string };
  DoctorDashboard: { doctorId: string };
   AllDoctors: undefined;
  CompanyDashboard: { companyId: string; companyName?: string };
  UpdateEmployee: { employeeId: string; companyId: string };

};