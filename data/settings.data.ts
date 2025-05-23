import { DBSettingsDataType, EmailSettingsDataType } from "./types/types";

export const db_settings_columns = [
  "select",
  "databaseType",
  "databaseName",
  "host",
  "port",
  "user",
  "password",
  "isConnected",
  "createdBy",
  "createdAt",
  "actions",
];

export const email_settings_columns = [
  "select",
  "emailID",
  "name",
  "host",
  "port",
  "encryption",
  "username",
  "password",
  "fromEmail",
  "isDefault",
  "isActive",
  "createdBy",
  "createdAt",
  "actions",
];

export const db_settings_data: DBSettingsDataType[] = [
  {
    databaseType: "PostgreSQL",
    databaseName: "employee_db",
    host: "db1.company.com",
    port: 5432,
    user: "db_admin",
    password: "pg-secure-pass", // Should be encrypted or securely stored
    isConnected: false,
    createdBy: "admin",
    createdAt: "2025-05-20T12:00:00Z",
  },
  {
    databaseType: "MySQL",
    databaseName: "crm_data",
    host: "mysql.company.com",
    port: 3306,
    user: "crm_user",
    password: "mysql-secret",
    isConnected: false,
    createdBy: "developer1",
    createdAt: "2025-05-18T09:30:00Z",
  },
  {
    databaseType: "Microsoft SQL Server",
    databaseName: "Chronologix",
    host: "192.168.1.187 \ SQLEXPRESS",
    port: 61627,
    user: "Chronologix",
    password: "Chr0n0l0g1x",
    isConnected: true,
    createdBy: "super-admin",
    createdAt: "2025-05-15T16:45:00Z",
  },
  {
    databaseType: "MongoDB",
    databaseName: "user_profiles",
    host: "mongodb.company.com",
    port: 27017,
    user: "mongo_admin",
    password: "mongo-secure-pass",
    isConnected: false,
    createdBy: "admin",
    createdAt: "2025-05-14T10:15:00Z",
  }
];

export const email_settings_data: EmailSettingsDataType[] = [
  {
    emailID: "smtp-001",
    name: "Primary SMTP (Gmail)",
    host: "smtp.gmail.com",
    port: 587,
    authentication: true,
    encryption: "TLS",
    username: "noreply@yourcompany.com",
    password: "app-password-123", // In real use, this would be encrypted or secured
    fromEmail: "noreply@yourcompany.com",
    isDefault: true,
    isActive: true,
    createdBy: "admin",
    createdAt: "2025-05-20T10:30:00Z",
  },
  {
    emailID: "smtp-002",
    name: "Marketing SMTP (SendGrid)",
    host: "smtp.sendgrid.net",
    port: 587,
    authentication: false,
    encryption: "None",
    username: "apikey",
    password: "SG.xxxxxxxx",
    fromEmail: "marketing@yourcompany.com",
    isDefault: false,
    isActive: true,
    createdBy: "marketing-admin",
    createdAt: "2025-05-19T09:00:00Z",
  },
  {
    emailID: "smtp-003",
    name: "Backup SMTP (Zoho)",
    host: "smtp.zoho.com",
    port: 465,
    authentication: true,
    encryption: "SSL",
    username: "support@yourcompany.com",
    password: "zoho-pass",
    fromEmail: "support@yourcompany.com",
    isDefault: false,
    isActive: false, // Disabled
    createdBy: "it-team",
    createdAt: "2025-05-15T14:45:00Z",
  }
];
