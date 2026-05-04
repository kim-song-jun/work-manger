export type {
  Employee,
  EmployeeDetail,
  EmployeeListQuery,
  EmployeeRole,
  EmployeeStatus,
  EmployeeUpdatePatch,
  EmployeeAttendanceDay,
} from "./model/types";
export { fetchEmployees } from "./api/fetchEmployees";
export { fetchEmployeeDetail } from "./api/fetchEmployeeDetail";
export { updateEmployee, deactivateEmployee } from "./api/updateEmployee";
