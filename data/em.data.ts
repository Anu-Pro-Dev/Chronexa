import { EmployeeMasterEmployeesDataType, EmployeeMasterGroupsDataType, EmployeeMasterGroupsMembersDataType, EmployeeMasterTypesDataType } from "./types/types";

export const employeeMaster_employees_columns = [
    "select",
    "number",
    "name",
    "join_date",
    "manager",
    "punch",
    "active",
    "designation",
    "organization",
    "manager_name",
    "actions",
    "code",
    "role",
];

export const employeeMaster_groups_columns = [
    "select",
    "code",
    "description",
    "schedule",
    "from_date",
    "to_date",
    "reporting_group",
    "employee",
    "members",
    "updated",
    "actions",
];

export const employeeMaster_groups_member_columns = [
    "select",
    "number",
    "name",
    "designation",
    "organization",
];

export const employeeMaster_types_columns = [
    "select",
    "code",
    "descriptionEng",
    "descriptionArb",
    "updated",
    "actions",
];

export const  employeeMaster_employees_data: EmployeeMasterEmployeesDataType[] = [
    {
        "number": "1",
        "name": "John Doe",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "Senior Developer",
        "organization": "IT",
        "manager_name": "ADMIN",
        "code": "WD",
        "role": "ADMIN"
    },
    {
        "number": "2",
        "name": "Jane Smith",
        "join_date": "04-12-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗴",
        "designation": "Junior Developer",
        "organization": "HR",
        "manager_name": "Employee 03",
        "code": "PHY",
        "role": "EMPLOYEE"
    },
    {
        "number": "3",
        "name": "Emily Davis",
        "join_date": "01-03-2023", 
        "manager": "🗸",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "Team Lead",
        "organization": "Finance",
        "manager_name": "",
        "code": "WD",
        "role": "DEPARTMENT_ADMIN"
    },
    {
        "number": "4",
        "name": "Michael Brown",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "Developer",
        "organization": "Marketing",
        "manager_name": "Employee 03",
        "code": "CD",
        "role": "MANAGER"
    },
    {
        "number": "5",
        "name": "Sarah Wilson",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "Project Manager",
        "organization": "IT",
        "manager_name": "Employee 03",
        "code": "MD",
        "role": "MANAGER"
    },
    {
        "number": "6",
        "name": "David Johnson",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "QA Engineer",
        "organization": "IT",
        "manager_name": "Employee 03",
        "code": "PHY",
        "role": "DEPARTMENT_ADMIN"
    },
    {
        "number": "7",
        "name": "Laura Lee",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "UX Designer",
        "organization": "HR",
        "manager_name": "Employee 03",
        "code": "DNAY23",
        "role": "EMPLOYEE"
    },
    {
        "number": "8",
        "name": "Brian Moore",
        "join_date": "01-03-2023", 
        "manager": "",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "System Analyst",
        "organization": "Finance",
        "manager_name": "Employee 03",
        "code": "IT",
        "role": "DEPARTMENT_ADMIN"
    },
    {
        "number": "9",
        "name": "Megan White",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "HR Specialist",
        "organization": "HR",
        "manager_name": "Employee 03",
        "code": "IT",
        "role": "HR_ADMIN"
    },
    {
        "number": "10",
        "name": "Kevin Harris",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "Data Scientist",
        "organization": "Marketing",
        "manager_name": "Employee 03",
        "code": "WD",
        "role": "HR_ADMIN"
    },
    {
        "number": "11",
        "name": "Ashley Clark",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "Business Analyst",
        "organization": "IT",
        "manager_name": "Employee 03",
        "code": "IT",
        "role": "EMPLOYEE"
    },
    {
        "number": "12",
        "name": "James Lewis",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "Network Engineer",
        "organization": "IT",
        "manager_name": "Employee 03",
        "code": "IT",
        "role": "EMPLOYEE"
    },
    {
        "number": "13",
        "name": "Olivia Walker",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "Sales Manager",
        "organization": "Sales",
        "manager_name": "Employee 03",
        "code": "CD",
        "role": "MANAGER"
    },
    {
        "number": "14",
        "name": "Daniel Martinez",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "Software Engineer",
        "organization": "IT",
        "manager_name": "Employee 03",
        "code": "NM",
        "role": "DEPARTMENT_ADMIN"
    },
    {
        "number": "15",
        "name": "Jessica Hall",
        "join_date": "01-03-2023", 
        "manager": "🗴",
        "punch":  "🗸",
        "active":  "🗸",
        "designation": "Marketing Lead",
        "organization": "Marketing",
        "manager_name": "Employee 03",
        "code": "MD",
        "role": "DEPARTMENT_ADMIN"
    },
];

export const employeeMaster_groups_data: EmployeeMasterGroupsDataType[] = [
    {
        "code": "WD",
        "description": "Working Days",
        "schedule": "🗸",
        "from_date": "01-01-2014",
        "to_date": "31-12-2030",
        "reporting_group": "🗴",
        "employee": "🗸",
        "members": "🗐",
        "updated": "08-04-2014"
    },
    {
        "code": "PHY",
        "description": "Physician",
        "schedule": "🗴",
        "from_date": "",
        "to_date": "",
        "reporting_group": "🗴",
        "employee": "🗸",
        "members": "🗐",
        "updated": "30-10-2023"
    },
    {
        "code": "NM",
        "description": "Non Muslim Group",
        "schedule": "🗸",
        "from_date": "01-06-2024",
        "to_date": "31-12-2025",
        "reporting_group": "🗴",
        "employee": "🗸",
        "members": "🗐",
        "updated": "06-06-2024"
    },
    {
        "code": "MD",
        "description": "Miscellaneous",
        "schedule": "🗸",
        "from_date": "01-01-2014",
        "to_date": "31-12-2030",
        "reporting_group": "🗴",
        "employee": "🗸",
        "members": "🗐",
        "updated": "31-03-2014"
    },
    {
        "code": "IT",
        "description": "IT Employees",
        "schedule": "🗸",
        "from_date": "01-05-2024",
        "to_date": "29-05-2024",
        "reporting_group": "🗴",
        "employee": "🗸",
        "members": "🗐",
        "updated": "21-05-2024"
    },
    {
        "code": "DNAY23",
        "description": "New Academic Year 2023",
        "schedule": "🗸",
        "from_date": "29-08-2022",
        "to_date": "02-09-2022",
        "reporting_group": "🗴",
        "employee": "🗸",
        "members": "🗐",
        "updated": "30-08-2022"
    },
    {
        "code": "CD",
        "description": "Calendar Days",
        "schedule": "🗸",
        "from_date": "01-01-2014",
        "to_date": "31-12-2030",
        "reporting_group": "🗴",
        "employee": "🗸",
        "members": "🗐",
        "updated": "31-03-2014"
    },
];

export const employeeMaster_groups_member_data : EmployeeMasterGroupsMembersDataType[] = [
    {
        "number": "1",
        "name": "John Doe",
        "designation": "System Analyst",
        "organization": "Finance"
    },
    {
        "number": "2",
        "name": "Jane Smith",
        "designation": "HR Specialist",
        "organization": "HR"
    },
    {
        "number": "3",
        "name": "Michael Johnson",
        "designation": "Data Scientist",
        "organization": "Marketing"
    },
    {
        "number": "4",
        "name": "Emily Davis",
        "designation": "Business Analyst",
        "organization": "IT"
    },
    {
        "number": "5",
        "name": "David Wilson",
        "designation": "Network Engineer",
        "organization": "IT"
    },
    {
        "number": "6",
        "name": "Sarah Thompson",
        "designation": "Sales Manager",
        "organization": "Sales"
    },
    {
        "number": "7",
        "name": "Daniel Martinez",
        "designation": "Software Engineer",
        "organization": "IT",
    },
    {
        "number": "8",
        "name": "Jessica Hall",
        "designation": "Marketing Lead",
        "organization": "Marketing"
    },
];


export const employeeMaster_types_data: EmployeeMasterTypesDataType[] = [
    {
        "code": "EMP",
        "descriptionEng": "Employee",
        "descriptionArb": "موظف",
        "updated": "12-03-2023"
    }
];