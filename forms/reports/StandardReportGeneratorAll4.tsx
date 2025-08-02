"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, getRandomInt } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { USER_TOKEN } from "@/utils/constants";
import { useRouter } from "next/navigation";
import Required from "@/components/ui/required";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { getManagerEmployees, getReportByEmployeeId, apiRequest } from "@/lib/apiHandler";
import { useFetchAllEntity } from "@/hooks/useFetchAllEntity";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  ExportExcelIcon,
  ExportPDFIcon,
  ExportWordIcon,
  LoginIcon,
} from "@/icons/icons";
import { useLanguage } from "@/providers/LanguageProvider";
import * as XLSX from 'exceljs';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';

const formSchema = z.object({
  reports: z.string().optional(),
  organization: z.string().optional(),
  manager: z.string().optional(),
  employee: z.string().optional(),
  employee_type: z.string().optional(),
  employee_group: z.string().optional(),
  from_date: z.date().optional(),
  to_date: z.date().optional(),
  inactive: z.boolean().optional(),
});

export default function StandardReportGenerator() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();
  const { language } = useLanguage();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReportData, setShowReportData] = useState(false);

  // Dynamic fetches
  const { data: organizations } = useFetchAllEntity("organization");
  const { data: employeeTypes } = useFetchAllEntity("employeeType");
  const { data: employeeGroups } = useFetchAllEntity("employeeGroup");
  const { data: employees } = useFetchAllEntity("employee");

  // Manager list
  const { data: managerEmployees } = useQuery({
    queryKey: ["managerEmployees"],
    queryFn: getManagerEmployees,
  });

  // Function to fetch all reports
  const fetchAllReports = async () => {
    try {
      const response = await apiRequest('/report/all', 'GET');
      return response.data;
    } catch (error) {
      console.error("Error fetching all reports:", error);
      throw error;
    }
  };

  // Function to fetch report data
  const fetchReportData = async () => {
    const values = form.getValues();
    setLoading(true);
    
    try {
      let response;
      
      // If employee is selected, call getReportByEmployeeId
      if (values.employee) {
        response = await getReportByEmployeeId({
          employee_id: Number(values.employee)
        });
      } else {
        // If no employee selected, fetch all reports
        response = await fetchAllReports();
      }
      
      // Extract the data array from the response
      const data = response?.data || response;
      setReportData(data);
      return data;
    } catch (error) {
      console.error("Error fetching report data:", error);
      alert("Error fetching report data. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to handle show report
  const handleShowReport = async () => {
    const data = await fetchReportData();
    if (data) {
      setShowReportData(true);
      console.log("Report data:", data);
    }
  };

  // Function to download file
  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Function to handle Excel export
  const handleExportExcel = async () => {
    const data = await fetchReportData();
    console.log("Excel export data:", data);
    
    const dataArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
    
    if (dataArray.length > 0) {
      try {
        const workbook = new XLSX.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        // Set default font
        workbook.creator = 'Report Generator';
        workbook.created = new Date();

        // Add headers
        const headers = Object.keys(dataArray[0]);
        worksheet.addRow(headers);

        // Add data rows
        dataArray.forEach((row: Record<string, any>) => {
          const values = headers.map(header => row[header]);
          worksheet.addRow(values);
        });

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
          cell.font = { name: "Nunito Sans", bold: true, size: 11, color: { argb: "FFFFFFFF" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Style data rows
        for (let i = 2; i <= dataArray.length + 1; i++) {
          const row = worksheet.getRow(i);
          row.eachCell((cell) => {
            cell.font = { name: "Nunito Sans", size: 10 };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        }

        // Auto-fit columns
        worksheet.columns.forEach(column => {
          column.width = 20;
        });

        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        const filename = `report_${form.getValues().employee ? 'employee_' + form.getValues().employee : 'all'}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        saveAs(blob, filename);
      } catch (error) {
        console.error("Error generating Excel:", error);
        alert("Error generating Excel file. Please try again.");
      }
    } else {
      console.log("No data available. Raw data:", data);
      alert("No data available to export.");
    }
  };

  // Function to handle PDF export
  const handleExportPDF = async () => {
    const data = await fetchReportData();
    console.log("PDF export data:", data);
    
    const dataArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
    
    if (dataArray.length > 0) {
      try {
        const headers = Object.keys(dataArray[0]);
        const formValues = form.getValues();
        
        // Calculate column width based on number of columns
        const columnWidth = Math.max(100 / headers.length, 8); // Minimum 8% width per column
        
        const htmlContent = `
          <div style="padding: 15px; font-family: 'Nunito Sans', sans-serif;">
            <h1 style="text-align: center; color: #333; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 20px;">Employee Report</h1>
            <div style="margin-bottom: 15px;">
              <p style="margin: 2px 0; font-size: 12px;"><span style="font-weight: bold;">Generated on:</span> ${format(new Date(), 'dd/MM/yyyy')}</p>
              <p style="margin: 2px 0; font-size: 12px;"><span style="font-weight: bold;">Employee ID:</span> ${formValues.employee || 'All Employees'}</p>
              ${formValues.from_date ? `<p style="margin: 2px 0; font-size: 12px;"><span style="font-weight: bold;">From Date:</span> ${format(formValues.from_date, 'dd/MM/yyyy')}</p>` : ''}
              ${formValues.to_date ? `<p style="margin: 2px 0; font-size: 12px;"><span style="font-weight: bold;">To Date:</span> ${format(formValues.to_date, 'dd/MM/yyyy')}</p>` : ''}
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed;">
              <thead>
                <tr style="background-color: #0078D4;">
                  ${headers.map(header => `
                    <th style="
                      border: 1px solid #ddd; 
                      padding: 6px 4px; 
                      text-align: center; 
                      color: #FFFFFF; 
                      font-family: 'Nunito Sans', sans-serif; 
                      font-weight: bold; 
                      font-size: 11px;
                      width: ${columnWidth}%;
                      word-wrap: break-word;
                      overflow-wrap: break-word;
                    ">${header.toUpperCase()}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${dataArray.map((row: Record<string, any>) => `
                  <tr>
                    ${headers.map(header => `
                      <td style="
                        border: 1px solid #ddd; 
                        padding: 4px 3px; 
                        font-family: 'Nunito Sans', sans-serif; 
                        font-size: 10px;
                        width: ${columnWidth}%;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                      ">${String(row[header] || '').substring(0, 50)}${String(row[header] || '').length > 50 ? '...' : ''}</td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        const opt = {
          margin: [0.3, 0.3, 0.3, 0.3],
          filename: `report_${form.getValues().employee ? 'employee_' + form.getValues().employee : 'all'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            allowTaint: true,
            width: 1200,
            height: 800
          },
          jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: headers.length > 6 ? 'landscape' : 'portrait'
          }
        };

        html2pdf().set(opt).from(htmlContent).save();
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Error generating PDF. Please try again.");
      }
    } else {
      console.log("No data available. Raw data:", data);
      alert("No data available to export.");
    }
  };

  // Function to handle Word export
  const handleExportWord = async () => {
    const data = await fetchReportData();
    console.log("Word export data:", data);
    
    const dataArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
    
    if (dataArray.length > 0) {
      try {
        const headers = Object.keys(dataArray[0]);
        const formValues = form.getValues();
        
        // Calculate column width
        const columnWidth = Math.floor(9600 / headers.length); // Total width distributed equally
        
        // Create table rows with proper styling
        const tableRows = [
          // Header row
          new TableRow({
            children: headers.map(header => 
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ 
                    text: header, 
                    bold: true, 
                    color: "FFFFFF",
                    font: "Nunito Sans"
                  })],
                  alignment: "center"
                })],
                shading: {
                  fill: "0078D4",
                },
                width: {
                  size: columnWidth,
                  type: WidthType.DXA,
                },
              })
            ),
          }),
          // Data rows
          ...dataArray.map((row: Record<string, any>) => 
            new TableRow({
              children: headers.map(header => 
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({
                      text: String(row[header] || ''),
                      font: "Nunito Sans"
                    })]
                  })],
                  width: {
                    size: columnWidth,
                    type: WidthType.DXA,
                  },
                })
              ),
            })
          )
        ];

        // Create document children array
        const documentChildren: (Paragraph | Table)[] = [
          new Paragraph({
            children: [
              new TextRun({
                text: "Employee Report",
                bold: true,
                size: 32, // 16px * 2 (Word uses half-points)
                font: "Nunito Sans"
              }),
            ],
            spacing: { after: 200 },
            alignment: "center",
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Generated on: ",
                font: "Nunito Sans",
                bold: true,
                size: 24 // 12px * 2
              }),
              new TextRun({
                text: format(new Date(), 'dd/MM/yyyy'),
                font: "Nunito Sans",
                size: 24 // 12px * 2
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Employee ID: ",
                font: "Nunito Sans",
                bold: true,
                size: 24 // 12px * 2
              }),
              new TextRun({
                text: formValues.employee || 'All Employees',
                font: "Nunito Sans",
                size: 24 // 12px * 2
              }),
            ],
            spacing: { after: 100 },
          }),
        ];
        
        // Add date range if dates are selected
        if (formValues.from_date || formValues.to_date) {
          const fromDate = formValues.from_date ? format(formValues.from_date, 'dd/MM/yyyy') : 'Not specified';
          const toDate = formValues.to_date ? format(formValues.to_date, 'dd/MM/yyyy') : 'Not specified';
          
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Date Range: ${fromDate} - ${toDate}`,
                  font: "Nunito Sans"
                }),
              ],
              spacing: { after: 200 },
            })
          );
        }

        // Add table
        documentChildren.push(
          new Table({
            rows: tableRows,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          })
        );

        const doc = new Document({
          sections: [{
            properties: {},
            children: documentChildren,
          }],
          styles: {
            default: {
              document: {
                run: {
                  font: "Nunito Sans",
                },
              },
            },
          },
        });

        const buffer = await Packer.toBuffer(doc);
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        
        const filename = `report_${form.getValues().employee ? 'employee_' + form.getValues().employee : 'all'}_${format(new Date(), 'yyyy-MM-dd')}.docx`;
        saveAs(blob, filename);
      } catch (error) {
        console.error("Error generating Word document:", error);
        alert("Error generating Word document. Please try again.");
      }
    } else {
      console.log("No data available. Raw data:", data);
      alert("No data available to export.");
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      return;
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
          <div className="flex flex-col gap-6">
            <div className="p-5 flex flex-col">
              <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
                <FormField
                  control={form.control}
                  name="reports"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reports</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose report" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Daily Movement Report</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Organization</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value !== undefined ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {(organizations?.data || []).map((item: any) => {
                            if (!item.organization_id || item.organization_id.toString().trim() === '') return null;
                            return (
                              <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
                                {item.organization_eng}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Manager</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value !== undefined ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {managerEmployees?.data?.length > 0 &&
                            managerEmployees.data
                              .filter((emp: any) => emp.employee_id != null)
                              .map((emp: any) => (
                                <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                                  {emp.firstname_eng}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employee_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Employee Type</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value !== undefined ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose employee type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(employeeTypes?.data || []).map((item: any) => {
                            if (!item.employee_type_id || item.employee_type_id.toString().trim() === '') return null;
                            return (
                              <SelectItem key={item.employee_type_id} value={item.employee_type_id.toString()}>
                                {item.employee_type_eng}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employee_group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Employee Group</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value !== undefined ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose employee group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(employeeGroups?.data || []).map((item: any) => {
                            if (!item.employee_group_id || item.employee_group_id.toString().trim() === '') return null;
                            return (
                              <SelectItem key={item.employee_group_id} value={item.employee_group_id.toString()}>
                                {item.employee_group_eng}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1">Employee</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value !== undefined ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(employees?.data || []).map((item: any) => {
                            if (!item.employee_id || item.employee_id.toString().trim() === '') return null;
                            return (
                              <SelectItem key={item.employee_id} value={item.employee_id.toString()}>
                                {item.firstname_eng}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="from_date"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        From Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yy")
                              ) : (
                                <span className="font-normal text-sm text-text-secondary">Choose date</span>
                              )}
                              <CalendarIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="to_date"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>
                        To Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button size={"lg"} variant={"outline"}
                              className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yy")
                              ) : (
                                <span className="font-normal text-sm text-text-secondary">Choose date</span>
                              )}
                              <CalendarIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-center gap-2 items-center pb-5">
              <div className="flex gap-4 px-5">
                <Button
                  type="button"
                  size={"sm"}
                  className="flex items-center space-y-0.5"
                  onClick={handleShowReport}
                  disabled={loading}
                >
                  <LoginIcon />
                  {loading ? "Loading..." : "Show report"}
                </Button>
                <Button
                  type="button"
                  variant={"success"}
                  size={"sm"}
                  className="flex items-center space-y-0.5 bg-[#21A366]"
                  onClick={handleExportExcel}
                  disabled={loading}
                >
                  <ExportExcelIcon />
                  Export to excel
                </Button>
                <Button
                  type="button"
                  variant={"success"}
                  size={"sm"}
                  className="flex items-center space-y-0.5 bg-[#DD2025] hover:bg-[#c1181e]"
                  onClick={handleExportPDF}
                  disabled={loading}
                >
                  <ExportPDFIcon />
                  Export to PDF
                </Button>
                <Button
                  type="button"
                  size={"sm"}
                  className="flex items-center space-y-0.5 bg-[#00A2ED]"
                  onClick={handleExportWord}
                  disabled={loading}
                >
                  <ExportWordIcon />
                  Export to word
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    
    </div>
  );
}