// "use client";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { cn, getRandomInt } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// import { USER_TOKEN } from "@/utils/constants";
// import { useRouter } from "next/navigation";
// import Required from "@/components/ui/required";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useQuery } from "@tanstack/react-query";
// import { getManagerEmployees, getReportByEmployeeId, apiRequest } from "@/lib/apiHandler";
// import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   CalendarIcon,
//   ExportExcelIcon,
//   ExportPDFIcon,
//   ExportWordIcon,
//   LoginIcon,
// } from "@/icons/icons";
// import { useLanguage } from "@/providers/LanguageProvider";
// import * as XLSX from 'exceljs';
// import { saveAs } from 'file-saver';
// import html2pdf from 'html2pdf.js';

// const formSchema = z.object({
//   reports: z.string().optional(),
//   organization: z.string().optional(),
//   manager: z.string().optional(),
//   employee: z.string().optional(),
//   employee_type: z.string().optional(),
//   employee_group: z.string().optional(),
//   from_date: z.date().optional(),
//   to_date: z.date().optional(),
//   inactive: z.boolean().optional(),
// });

// export default function StandardReportGenerator() {
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//   });

//   const router = useRouter();
//   const { language } = useLanguage();
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showReportData, setShowReportData] = useState(false);

//   // Dynamic fetches
//   const { data: organizations } = useFetchAllEntity("organization");
//   const { data: employeeTypes } = useFetchAllEntity("employeeType");
//   const { data: employeeGroups } = useFetchAllEntity("employeeGroup");
//   const { data: employees } = useFetchAllEntity("employee");

//   // Manager list
//   const { data: managerEmployees } = useQuery({
//     queryKey: ["managerEmployees"],
//     queryFn: getManagerEmployees,
//   });

//   // Function to fetch all reports
//   const fetchAllReports = async () => {
//     try {
//       const response = await apiRequest('/report/all', 'GET');
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching all reports:", error);
//       throw error;
//     }
//   };

//   // Function to fetch report data
//   const fetchReportData = async () => {
//     const values = form.getValues();
//     setLoading(true);
    
//     try {
//       let response;
      
//       // If employee is selected, call getReportByEmployeeId
//       if (values.employee) {
//         response = await getReportByEmployeeId({
//           employee_id: Number(values.employee)
//         });
//       } else {
//         // If no employee selected, fetch all reports
//         response = await fetchAllReports();
//       }
      
//       // Extract the data array from the response
//       const data = response?.data || response;
//       setReportData(data);
//       return data;
//     } catch (error) {
//       console.error("Error fetching report data:", error);
//       alert("Error fetching report data. Please try again.");
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const headerMap: Record<string, string> = {
//     organization_eng: "Organization",
//     schedule: "Schedule",
//     punch_in: "Punch In",
//     punch_out: "Punch Out",
//     late: "Late (mins)",
//     early: "Early (mins)",
//     dailymissedmts: "Missed (mins)",
//     dailyextramts: "Extra (mins)",
//     dailyworkmts: "Total Work (mins)",
//     absentMts: "Absent (mins)",
//   };

//   // Function to handle Excel export with PDF-like formatting
//   const handleExportExcel = async () => {
//     const data = await fetchReportData();
//     console.log("Excel export data:", data);
    
//     const dataArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
    
//     const getTextWidth = (text: string): number => {
//       const wideChars = /[MW]/g;
//       const wideCount = (text.match(wideChars) || []).length;
//       return text.length + wideCount * 0.5;
//     };

//     if (dataArray.length > 0) {
//       try {
//         const workbook = new XLSX.Workbook();
//         const worksheet = workbook.addWorksheet('Report');

//         // Set default font and properties
//         workbook.creator = 'Report Generator';
//         workbook.created = new Date();

//         const formValues = form.getValues();
        
//         // Get employee details from first row
//         const firstRow = dataArray[0];
//         const employeeId = firstRow?.employee_id || formValues.employee || '';
//         const employeeName = firstRow?.employee_name || firstRow?.firstname_eng || '';
//         const employeeNo = firstRow?.emp_no || '';

//         let currentRow = 1;

//         // 1. PAGE HEADER - "EMPLOYEE DAILY MOVEMENT REPORT"
//         worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
//         const titleCell = worksheet.getCell(`A${currentRow}`);
//         titleCell.value = 'EMPLOYEE DAILY MOVEMENT REPORT';
//         titleCell.font = { name: "Nunito Sans", bold: true, size: 12, color: { argb: "FF000000" } };
//         titleCell.alignment = { vertical: "middle", horizontal: "center" };
//         worksheet.getRow(currentRow).height = 30;
//         currentRow += 2; // Skip a row

//         // 2. GENERATED ON and EMPLOYEE ID row
//         worksheet.getCell(`A${currentRow}`).value = `Employee ID: ${employeeId}`;
//         worksheet.getCell(`A${currentRow}`).font = { name: "Nunito Sans", size: 10 };
        
//         worksheet.getCell(`H${currentRow}`).value = `Generated On: ${format(new Date(), 'dd/MM/yyyy')}`;
//         worksheet.getCell(`H${currentRow}`).font = { name: "Nunito Sans", size: 10 };
//         worksheet.getCell(`H${currentRow}`).alignment = { horizontal: "right" };
//         currentRow += 2; // Skip a row

//         // 3. EMPLOYEE DETAILS TABLE
//         // First row: EMPLOYEE NAME | Name Value | EMPLOYEE NO | No Value
//         worksheet.getCell(`A${currentRow}`).value = 'EMPLOYEE NAME';
//         worksheet.getCell(`A${currentRow}`).font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
//         worksheet.getCell(`A${currentRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
//         worksheet.getCell(`A${currentRow}`).alignment = { vertical: "middle", horizontal: "center" };
//         worksheet.getCell(`A${currentRow}`).border = {
//           top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
//         };

//         worksheet.getCell(`B${currentRow}`).value = employeeName;
//         worksheet.getCell(`B${currentRow}`).font = { name: "Nunito Sans", size: 9};
//         worksheet.getCell(`B${currentRow}`).alignment = { vertical: "middle" };
//         worksheet.getCell(`B${currentRow}`).border = {
//           top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
//         };

//         worksheet.getCell(`C${currentRow}`).value = 'EMPLOYEE NO';
//         worksheet.getCell(`C${currentRow}`).font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
//         worksheet.getCell(`C${currentRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
//         worksheet.getCell(`C${currentRow}`).alignment = { vertical: "middle", horizontal: "center" };
//         worksheet.getCell(`C${currentRow}`).border = {
//           top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
//         };

//         worksheet.getCell(`D${currentRow}`).value = employeeNo;
//         worksheet.getCell(`D${currentRow}`).font = { name: "Nunito Sans", size: 9};
//         worksheet.getCell(`D${currentRow}`).alignment = { vertical: "middle" };
//         worksheet.getCell(`D${currentRow}`).border = {
//           top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
//         };

//         currentRow++;

//         // Second row: FROM DATE | From Value | TO DATE | To Value (if dates exist)
//         if (formValues.from_date || formValues.to_date) {
//           worksheet.getCell(`A${currentRow}`).value = 'FROM DATE';
//           worksheet.getCell(`A${currentRow}`).font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
//           worksheet.getCell(`A${currentRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
//           worksheet.getCell(`A${currentRow}`).alignment = { vertical: "middle", horizontal: "center" };
//           worksheet.getCell(`A${currentRow}`).border = {
//             top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
//           };

//           worksheet.getCell(`B${currentRow}`).value = formValues.from_date ? format(formValues.from_date, 'dd/MM/yyyy') : '01/07/2025';
//           worksheet.getCell(`B${currentRow}`).font = { name: "Nunito Sans", size: 9};
//           worksheet.getCell(`B${currentRow}`).alignment = { vertical: "middle" };
//           worksheet.getCell(`B${currentRow}`).border = {
//             top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
//           };

//           worksheet.getCell(`C${currentRow}`).value = 'TO DATE';
//           worksheet.getCell(`C${currentRow}`).font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
//           worksheet.getCell(`C${currentRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
//           worksheet.getCell(`C${currentRow}`).alignment = { vertical: "middle", horizontal: "center" };
//           worksheet.getCell(`C${currentRow}`).border = {
//             top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
//           };

//           worksheet.getCell(`D${currentRow}`).value = formValues.to_date ? format(formValues.to_date, 'dd/MM/yyyy') : '31/07/2025';
//           worksheet.getCell(`D${currentRow}`).font = { name: "Nunito Sans", size: 9};
//           worksheet.getCell(`D${currentRow}`).alignment = { vertical: "middle" };
//           worksheet.getCell(`D${currentRow}`).border = {
//             top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
//           };

//           currentRow++;
//         }

//         currentRow += 1; // Skip a row before main table

//         // 4. MAIN DATA TABLE
//         // Filter out employee columns from main table
//         const excludeColumns = ['employee_id', 'emp_no', 'employee_name', 'organization_arb', 'workmts_row_timediff', 'sch_in', 'sch_out', 'punch_in', 'punch_out'];
//         const allHeaders = Object.keys(dataArray[0]);
//         let filteredHeaders = allHeaders.filter(header => !excludeColumns.includes(header));

//         // Inject "schedule" column where sch_in was (optional — or push to the end)
//         filteredHeaders.push('schedule');

//         // Find transdate column and replace with Date and Day columns
//         const transdateIndex = filteredHeaders.findIndex(header => header === 'transdate');
//         if (transdateIndex !== -1) {
//           // Remove transdate and insert Date and Day at the same position
//           filteredHeaders.splice(transdateIndex, 1, 'Date', 'Day');
//         }
        
//         // Update headerMap to include new columns
//         const updatedHeaderMap: Record<string, string> = {
//           ...headerMap,
//           Date: 'Date',
//           Day: 'Day'
//         };
        
//         // Map headers using updated headerMap
//         const displayHeaders = filteredHeaders.map(header => updatedHeaderMap
//           [header] || header);

//         // Add main table headers
//         const headerRow = worksheet.getRow(currentRow);
//         filteredHeaders.forEach((header, index) => {
//           const cell = worksheet.getCell(currentRow, index + 1);
//           cell.value = (headerMap[header] || header).toUpperCase();
//           cell.font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
//           cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
//           cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
//           cell.border = {
//             top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
//           };
//         });
//         currentRow++;

//         dataArray.forEach((row: Record<string, any>) => {
//           filteredHeaders.forEach((header, index) => {
//             const cell = worksheet.getCell(currentRow, index + 1);
//             let cellValue = '';

//             if (header === 'Date') {
//               const transdate = row['transdate'];
//               if (transdate) {
//                 try {
//                   const date = new Date(transdate);
//                   cellValue = format(date, 'dd-MM-yyyy');
//                 } catch {
//                   cellValue = transdate;
//                 }
//               }
//             } else if (header === 'Day') {
//               const transdate = row['transdate'];
//               if (transdate) {
//                 try {
//                   const date = new Date(transdate);
//                   cellValue = format(date, 'EEEE');
//                 } catch {
//                   cellValue = '';
//                 }
//               }
//             } else if (header === 'schedule') {
//               const schIn = row['sch_in'] || '';
//               const schOut = row['sch_out'] || '';
//               cellValue = schIn && schOut ? `${schIn} - ${schOut}` : '';
//             } else {
//               cellValue = row[header] || '';
//             }

//             cell.value = cellValue;
//             cell.font = { name: "Nunito Sans", size: 8 };
//             cell.border = {
//               top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
//             };
//             cell.alignment = { vertical: "middle", wrapText: true };
//           });
//           currentRow++;
//         });

//         // Enable auto-fit by not setting fixed dimensions initially
//         worksheet.columns = filteredHeaders.map(header => ({
//           header: headerMap[header] || header,
//           key: header,
//           width: 10 // will be overwritten
//         }));

//         // Apply auto-fit using ExcelJS built-in methods
//         worksheet.columns.forEach((column, index) => {
//           let maxWidth = 0;

//           for (let rowIndex = 1; rowIndex <= currentRow; rowIndex++) {
//             const cell = worksheet.getCell(rowIndex, index + 1);
//             if (cell.value) {
//               const cellText = String(cell.value);
//               const textWidth = getTextWidth(cellText);
//               maxWidth = Math.max(maxWidth, textWidth);
//             }
//           }

//           // Include header cell width as well
//           const headerCell = worksheet.getCell(1, index + 1);
//           const headerText = String(headerCell.value || '');
//           maxWidth = Math.max(maxWidth, getTextWidth(headerText));

//           // Set width with padding and bounds
//           column.width = Math.min(Math.max(maxWidth + 1, 6), 40);
//         });


//         // Enable auto-fit for rows by setting appropriate heights
//         for (let rowIndex = 1; rowIndex <= currentRow; rowIndex++) {
//           const row = worksheet.getRow(rowIndex);
          
//           if (rowIndex === 1) {
//             // Keep title row height fixed
//             row.height = 25;
//           } else {
//             // Calculate required height based on content
//             let maxRequiredHeight = 25; // Base height
            
//             row.eachCell((cell) => {
//               if (cell.value && cell.alignment && cell.alignment.wrapText) {
//                 const cellText = String(cell.value);
//                 const columnWidth = worksheet.getColumn(cell.col).width || 15;
                
//                 // Calculate approximate lines needed
//                 const charsPerLine = Math.floor(columnWidth * 0.8);
//                 const lines = Math.ceil(cellText.length / charsPerLine);
//                 const requiredHeight = lines * 15;
                
//                 maxRequiredHeight = Math.max(maxRequiredHeight, requiredHeight);
//               }
//             });
            
//             // Set row height with limits
//             row.height = Math.min(Math.max(maxRequiredHeight, 15), 80);
//           }
//         }

//         // Final auto-fit pass - this ensures proper sizing
//         try {
//           // ExcelJS doesn't have direct autofit, but we can simulate it
//           worksheet.eachRow((row, rowNumber) => {
//             row.eachCell((cell, colNumber) => {
//               // Ensure all cells have proper alignment for auto-sizing
//               if (!cell.alignment) {
//                 cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
//               } else {
//                 cell.alignment = { ...cell.alignment, wrapText: true };
//               }
//             });
//           });
//         } catch (error) {
//           console.warn('Auto-fit adjustment failed:', error);
//         }

//         // Generate Excel file
//         const buffer = await workbook.xlsx.writeBuffer();
//         const blob = new Blob([buffer], { 
//           type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
//         });
        
//         const filename = `report_${formValues.employee ? 'employee_' + formValues.employee : 'all'}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
//         saveAs(blob, filename);
//       } catch (error) {
//         console.error("Error generating Excel:", error);
//         alert("Error generating Excel file. Please try again.");
//       }
//     } else {
//       console.log("No data available. Raw data:", data);
//       alert("No data available to export.");
//     }
//   };

//   // Function to handle showing report in PDF viewer
//   const handleShowReport = async () => {
//     const data = await fetchReportData();
//     console.log("Show report data:", data);
    
//     const dataArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
    
//     if (dataArray.length > 0) {
//       try {
//         // Reverse the data array to show latest data first
//         const reversedDataArray = [...dataArray].reverse();
//         const formValues = form.getValues();
        
//         // Get employee details from first row (use original array for consistent employee info)
//         const firstRow = dataArray[0];
//         const employeeId = firstRow?.employee_id || formValues.employee || '';
//         const employeeName = firstRow?.employee_name || firstRow?.firstname_eng || '';
//         const employeeNo = firstRow?.emp_no || '';
        
//         // Filter out employee columns from main table - same as Excel export
//         const excludeColumns = ['employee_id', 'emp_no', 'employee_name', 'organization_arb', 'workmts_row_timediff', 'sch_in', 'sch_out', 'punch_in', 'punch_out'];
//         const allHeaders = Object.keys(dataArray[0]);
//         let filteredHeaders = allHeaders.filter(header => !excludeColumns.includes(header));

//         // Inject "schedule" column - same as Excel export
//         filteredHeaders.push('schedule');

//         // Find transdate column and replace with Date and Day columns - same as Excel export
//         const transdateIndex = filteredHeaders.findIndex(header => header === 'transdate');
//         if (transdateIndex !== -1) {
//           // Remove transdate and insert Date and Day at the same position
//           filteredHeaders.splice(transdateIndex, 1, 'Date', 'Day');
//         }
        
//         // Update headerMap to include new columns - same as Excel export
//         const updatedHeaderMap: Record<string, string> = {
//           ...headerMap,
//           Date: 'Date',
//           Day: 'Day'
//         };
        
//         // Map headers using updated headerMap - same as Excel export
//         const displayHeaders = filteredHeaders.map(header => 
//           (updatedHeaderMap[header] || header).toUpperCase()
//         );
        
//         const htmlContent = `
//           <div style="padding: 15px; font-family: 'Nunito Sans', sans-serif; width: 100%; box-sizing: border-box;">
//             <!-- 1. PAGE HEADER - "EMPLOYEE DAILY MOVEMENT REPORT" -->
//             <h1 style="text-align: center; color: #333; font-family: 'Nunito Sans', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 20px; page-break-inside: avoid;">EMPLOYEE DAILY MOVEMENT REPORT</h1>
            
//             <!-- 2. GENERATED ON and EMPLOYEE ID row -->
//             <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; page-break-inside: avoid;">
//               <div style="flex: 1;">
//                 <p style="margin: 2px 0; font-size: 12px; font-family: 'Nunito Sans', sans-serif;"><span style="font-weight: bold;">Employee ID:</span> ${employeeId}</p>
//               </div>
//               <div style="flex: 1; text-align: right;">
//                 <p style="margin: 2px 0; font-size: 12px; font-family: 'Nunito Sans', sans-serif;"><span style="font-weight: bold;">Generated On:</span> ${format(new Date(), 'dd/MM/yyyy')}</p>
//               </div>
//             </div>
            
//             <!-- 3. EMPLOYEE DETAILS TABLE -->
//             <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: avoid;">
//               <!-- First row: EMPLOYEE NAME | Name Value | EMPLOYEE NO | No Value -->
//               <tr>
//                 <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; width: 25%; text-align: center; vertical-align: middle;">EMPLOYEE NAME</td>
//                 <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; width: 25%; vertical-align: middle;">${employeeName}</td>
//                 <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; width: 25%; text-align: center; vertical-align: middle;">EMPLOYEE NO</td>
//                 <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; width: 25%; vertical-align: middle;">${employeeNo}</td>
//               </tr>
//               <!-- Second row: FROM DATE | From Value | TO DATE | To Value (if dates exist) -->
//               ${formValues.from_date || formValues.to_date ? 
//                 `<tr>
//                   <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle;">FROM DATE</td>
//                   <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; vertical-align: middle;">${formValues.from_date ? format(formValues.from_date, 'dd/MM/yyyy') : '01/07/2025'}</td>
//                   <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle;">TO DATE</td>
//                   <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; vertical-align: middle;">${formValues.to_date ? format(formValues.to_date, 'dd/MM/yyyy') : '31/07/2025'}</td>
//                 </tr>`
//               : ''}
//             </table>
            
//             <!-- 4. MAIN DATA TABLE -->
//             <table style="width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: auto; min-width: 100%; page-break-inside: auto;">
//               <thead style="display: table-header-group;">
//                 <tr style="background-color: #0078D4;">
//                   ${displayHeaders.map((header, index) => `
//                     <th style="
//                       border: 1px solid #ddd; 
//                       padding: 8px 6px; 
//                       text-align: center; 
//                       vertical-align: middle;
//                       color: #FFFFFF; 
//                       font-family: 'Nunito Sans', sans-serif; 
//                       font-weight: bold; 
//                       font-size: 11px;
//                       white-space: nowrap;
//                       min-width: fit-content;
//                     ">${header}</th>
//                   `).join('')}
//                 </tr>
//               </thead>
//               <tbody style="page-break-inside: auto;">
//                 ${reversedDataArray.map((row: Record<string, any>, rowIndex: number) => `
//                   <tr style="page-break-inside: avoid; ${rowIndex > 0 && rowIndex % 20 === 0 ? 'page-break-before: auto;' : ''}">
//                     ${filteredHeaders.map(header => {
//                       let cellValue = '';
                      
//                       if (header === 'Date') {
//                         const transdate = row['transdate'];
//                         if (transdate) {
//                           try {
//                             const date = new Date(transdate);
//                             cellValue = format(date, 'dd-MM-yyyy');
//                           } catch {
//                             cellValue = transdate;
//                           }
//                         }
//                       } else if (header === 'Day') {
//                         const transdate = row['transdate'];
//                         if (transdate) {
//                           try {
//                             const date = new Date(transdate);
//                             cellValue = format(date, 'EEEE');
//                           } catch {
//                             cellValue = '';
//                           }
//                         }
//                       } else if (header === 'schedule') {
//                         const schIn = row['sch_in'] || '';
//                         const schOut = row['sch_out'] || '';
//                         cellValue = schIn && schOut ? `${schIn} - ${schOut}` : '';
//                       } else {
//                         cellValue = row[header] || '';
//                       }
                      
//                       // Check if this is a "late" or "missed" column for red text
//                       const isLateOrMissed = header === 'late' || header === 'dailymissedmts' || header === 'absentMts';
//                       const textColor = isLateOrMissed ? 'color: #FF0000;' : '';
                      
//                       return `
//                         <td style="
//                           border: 1px solid #ddd; 
//                           padding: 6px 4px; 
//                           font-family: 'Nunito Sans', sans-serif; 
//                           font-size: 10px;
//                           word-wrap: break-word;
//                           overflow-wrap: break-word;
//                           min-width: fit-content;
//                           vertical-align: middle;
//                           ${textColor}
//                         ">${String(cellValue)}</td>
//                       `;
//                     }).join('')}
//                   </tr>
//                 `).join('')}
//               </tbody>
//             </table>
//           </div>
//         `;

//         const opt = {
//           margin: [0.3, 0.3, 0.3, 0.3],
//           filename: `report_${formValues.employee ? 'employee_' + formValues.employee : 'all'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
//           image: { type: 'jpeg', quality: 0.98 },
//           html2canvas: { 
//             scale: 1.5, 
//             useCORS: true,
//             allowTaint: true,
//             scrollX: 0,
//             scrollY: 0,
//             windowWidth: 1400,
//             windowHeight: window.innerHeight
//           },
//           jsPDF: { 
//             unit: 'in', 
//             format: 'a4', 
//             orientation: 'landscape',
//             compress: true
//           },
//           pagebreak: { 
//             mode: ['avoid-all', 'css', 'legacy'],
//             before: '.page-break-before',
//             after: '.page-break-after',
//             avoid: '.page-break-avoid'
//           }
//         };

//         // Generate PDF blob instead of downloading
//         const pdf = await html2pdf().set(opt).from(htmlContent).outputPdf('blob');
        
//         // Create object URL and open in new tab
//         const pdfUrl = URL.createObjectURL(pdf);
//         window.open(pdfUrl, '_blank');
        
//         // Clean up the object URL after a delay
//         setTimeout(() => {
//           URL.revokeObjectURL(pdfUrl);
//         }, 1000);

//       } catch (error) {
//         console.error("Error generating PDF:", error);
//         alert("Error generating PDF. Please try again.");
//       }
//     } else {
//       console.log("No data available. Raw data:", data);
//       alert("No data available to export.");
//     }
//   };

//   function onSubmit(values: z.infer<typeof formSchema>) {
//     try {
//       return;
//     } catch (error) {
//       console.error("Form submission error", error);
//     }
//   }

//   return (
//     <div>
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="bg-accent p-6 rounded-2xl">
//           <div className="flex flex-col gap-6">
//             <div className="p-5 flex flex-col">
//               <div className="grid grid-cols-2 gap-y-5 gap-10 px-8 pb-5">
//                 <FormField
//                   control={form.control}
//                   name="reports"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Reports</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Choose report" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="1">Daily Movement Report</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="organization"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="flex gap-1">Organization</FormLabel>
//                       <Select
//                         onValueChange={(val) => field.onChange(Number(val))}
//                         value={field.value !== undefined ? String(field.value) : ""}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Choose organization" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                             {(organizations?.data || []).map((item: any) => {
//                             if (!item.organization_id || item.organization_id.toString().trim() === '') return null;
//                             return (
//                               <SelectItem key={item.organization_id} value={item.organization_id.toString()}>
//                                 {item.organization_eng}
//                               </SelectItem>
//                             );
//                           })}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="manager"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="flex gap-1">Manager</FormLabel>
//                       <Select
//                         onValueChange={(val) => field.onChange(Number(val))}
//                         value={field.value !== undefined ? String(field.value) : ""}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Choose manager" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {managerEmployees?.data?.length > 0 &&
//                             managerEmployees.data
//                               .filter((emp: any) => emp.employee_id != null)
//                               .map((emp: any) => (
//                                 <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
//                                   {emp.firstname_eng}
//                                 </SelectItem>
//                               ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="employee_type"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="flex gap-1">Employee Type</FormLabel>
//                       <Select
//                         onValueChange={(val) => field.onChange(Number(val))}
//                         value={field.value !== undefined ? String(field.value) : ""}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Choose employee type" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {(employeeTypes?.data || []).map((item: any) => {
//                             if (!item.employee_type_id || item.employee_type_id.toString().trim() === '') return null;
//                             return (
//                               <SelectItem key={item.employee_type_id} value={item.employee_type_id.toString()}>
//                                 {item.employee_type_eng}
//                               </SelectItem>
//                             );
//                           })}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="employee_group"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="flex gap-1">Employee Group</FormLabel>
//                       <Select
//                         onValueChange={(val) => field.onChange(Number(val))}
//                         value={field.value !== undefined ? String(field.value) : ""}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Choose employee group" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {(employeeGroups?.data || []).map((item: any) => {
//                             if (!item.employee_group_id || item.employee_group_id.toString().trim() === '') return null;
//                             return (
//                               <SelectItem key={item.employee_group_id} value={item.employee_group_id.toString()}>
//                                 {item.employee_group_eng}
//                               </SelectItem>
//                             );
//                           })}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="employee"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="flex gap-1">Employee <Required/></FormLabel>
//                       <Select
//                         onValueChange={(val) => field.onChange(Number(val))}
//                         value={field.value !== undefined ? String(field.value) : ""}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Choose employee" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {(employees?.data || []).map((item: any) => {
//                             if (!item.employee_id || item.employee_id.toString().trim() === '') return null;
//                             return (
//                               <SelectItem key={item.employee_id} value={item.employee_id.toString()}>
//                                 {item.firstname_eng}
//                               </SelectItem>
//                             );
//                           })}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="from_date"
//                   render={({ field }) => (
//                     <FormItem className="">
//                       <FormLabel>
//                         From Date
//                       </FormLabel>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <FormControl>
//                             <Button size={"lg"} variant={"outline"}
//                               className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
//                             >
//                               {field.value ? (
//                                 format(field.value, "dd/MM/yy")
//                               ) : (
//                                 <span className="font-normal text-sm text-text-secondary">Choose date</span>
//                               )}
//                               <CalendarIcon />
//                             </Button>
//                           </FormControl>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar
//                             mode="single"
//                             selected={field.value}
//                             onSelect={field.onChange}
//                           />
//                         </PopoverContent>
//                       </Popover>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="to_date"
//                   render={({ field }) => (
//                     <FormItem className="">
//                       <FormLabel>
//                         To Date
//                       </FormLabel>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <FormControl>
//                             <Button size={"lg"} variant={"outline"}
//                               className="w-full bg-accent px-3 flex justify-between text-text-primary max-w-[350px] text-sm font-normal"
//                             >
//                               {field.value ? (
//                                 format(field.value, "dd/MM/yy")
//                               ) : (
//                                 <span className="font-normal text-sm text-text-secondary">Choose date</span>
//                               )}
//                               <CalendarIcon />
//                             </Button>
//                           </FormControl>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar
//                             mode="single"
//                             selected={field.value}
//                             onSelect={field.onChange}
//                           />
//                         </PopoverContent>
//                       </Popover>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-center gap-2 items-center pb-5">
//               <div className="flex gap-4 px-5">
//                 <Button
//                   type="button"
//                   size={"sm"}
//                   className="flex items-center space-y-0.5"
//                   onClick={handleShowReport}
//                   disabled={loading}
//                 >
//                   <LoginIcon />
//                   {loading ? "Loading..." : "Show report"}
//                 </Button>
//                 <Button
//                   type="button"
//                   variant={"success"}
//                   size={"sm"}
//                   className="flex items-center space-y-0.5 bg-[#21A366]"
//                   onClick={handleExportExcel}
//                   disabled={loading}
//                 >
//                   <ExportExcelIcon />
//                   Export to excel
//                 </Button>
//                 {/* <Button
//                   type="button"
//                   variant={"success"}
//                   size={"sm"}
//                   className="flex items-center space-y-0.5 bg-[#DD2025] hover:bg-[#c1181e]"
//                   onClick={handleExportPDF}
//                   disabled={loading}
//                 >
//                   <ExportPDFIcon />
//                   Export to PDF
//                 </Button> */}
//               </div>
//             </div>
//           </div>
//         </form>
//       </Form>
    
//     </div>
//   );
// }

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
import { useFetchAllEntity } from "@/lib/useFetchAllEntity";
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

  const headerMap: Record<string, string> = {
    organization_eng: "Organization",
    schedule: "Schedule",
    punch_in: "Punch In",
    punch_out: "Punch Out",
    late: "Late (mins)",
    early: "Early (mins)",
    dailymissedmts: "Missed (mins)",
    dailyextramts: "Extra (mins)",
    dailyworkmts: "Total Work (mins)",
    absentMts: "Absent (mins)",
  };

  // Function to calculate summary totals from data
  const calculateSummaryTotals = (dataArray: any[]) => {
    const totals = {
      totalLateInHours: 0,
      totalWorkedHours: 0,
      totalEarlyOutHours: 0,
      totalMissedHours: 0,
      totalExtraHours: 0,
      totalAbsents: 0,
    };

    dataArray.forEach((row: any) => {
      // Convert minutes to hours and sum up
      totals.totalLateInHours += parseFloat(row.late || 0) / 60;
      totals.totalWorkedHours += parseFloat(row.dailyworkmts || 0) / 60;
      totals.totalEarlyOutHours += parseFloat(row.early || 0) / 60;
      totals.totalMissedHours += parseFloat(row.dailymissedmts || 0) / 60;
      totals.totalExtraHours += parseFloat(row.dailyextramts || 0) / 60;
      totals.totalAbsents += parseFloat(row.absentMts || 0) / 60;
    });

    // Format to 2 decimal places and convert to HH:MM format
    const formatToHoursMinutes = (hours: number) => {
      const h = Math.floor(Math.abs(hours));
      const m = Math.round((Math.abs(hours) - h) * 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return {
      totalLateInHours: formatToHoursMinutes(totals.totalLateInHours),
      totalWorkedHours: formatToHoursMinutes(totals.totalWorkedHours),
      totalEarlyOutHours: formatToHoursMinutes(totals.totalEarlyOutHours),
      totalMissedHours: formatToHoursMinutes(totals.totalMissedHours),
      totalExtraHours: formatToHoursMinutes(totals.totalExtraHours),
      totalAbsents: formatToHoursMinutes(totals.totalAbsents),
    };
  };

  // Function to handle Excel export with PDF-like formatting
  const handleExportExcel = async () => {
    const data = await fetchReportData();
    console.log("Excel export data:", data);
    
    const dataArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
    
    const getTextWidth = (text: string): number => {
      const wideChars = /[MW]/g;
      const wideCount = (text.match(wideChars) || []).length;
      return text.length + wideCount * 0.5;
    };

    if (dataArray.length > 0) {
      try {
        const workbook = new XLSX.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        // Set default font and properties
        workbook.creator = 'Report Generator';
        workbook.created = new Date();

        const formValues = form.getValues();
        
        // Get employee details from first row
        const firstRow = dataArray[0];
        const employeeId = firstRow?.employee_id || formValues.employee || '';
        const employeeName = firstRow?.employee_name || firstRow?.firstname_eng || '';
        const employeeNo = firstRow?.emp_no || '';

        let currentRow = 1;

        // 1. PAGE HEADER - "EMPLOYEE DAILY MOVEMENT REPORT"
        worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
        const titleCell = worksheet.getCell(`A${currentRow}`);
        titleCell.value = 'EMPLOYEE DAILY MOVEMENT REPORT';
        titleCell.font = { name: "Nunito Sans", bold: true, size: 12, color: { argb: "FF000000" } };
        titleCell.alignment = { vertical: "middle", horizontal: "center" };
        worksheet.getRow(currentRow).height = 30;
        currentRow += 2; // Skip a row

        // 2. GENERATED ON and EMPLOYEE ID row
        worksheet.getCell(`A${currentRow}`).value = `Employee ID: ${employeeId}`;
        worksheet.getCell(`A${currentRow}`).font = { name: "Nunito Sans", size: 10 };
        
        worksheet.getCell(`H${currentRow}`).value = `Generated On: ${format(new Date(), 'dd/MM/yyyy')}`;
        worksheet.getCell(`H${currentRow}`).font = { name: "Nunito Sans", size: 10 };
        worksheet.getCell(`H${currentRow}`).alignment = { horizontal: "right" };
        currentRow += 2; // Skip a row
        
        // 3. EMPLOYEE DETAILS TABLE
        // First row: EMPLOYEE NAME | Name Value | EMPLOYEE NO | No Value
        worksheet.getCell(`A${currentRow}`).value = 'EMPLOYEE NAME';
        worksheet.getCell(`A${currentRow}`).font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
        worksheet.getCell(`A${currentRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
        worksheet.getCell(`A${currentRow}`).alignment = { vertical: "middle", horizontal: "center" };
        worksheet.getCell(`A${currentRow}`).border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        worksheet.getCell(`B${currentRow}`).value = employeeName;
        worksheet.getCell(`B${currentRow}`).font = { name: "Nunito Sans", size: 9};
        worksheet.getCell(`B${currentRow}`).alignment = { vertical: "middle" };
        worksheet.getCell(`B${currentRow}`).border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        worksheet.getCell(`C${currentRow}`).value = 'EMPLOYEE NO';
        worksheet.getCell(`C${currentRow}`).font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
        worksheet.getCell(`C${currentRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
        worksheet.getCell(`C${currentRow}`).alignment = { vertical: "middle", horizontal: "center" };
        worksheet.getCell(`C${currentRow}`).border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        worksheet.getCell(`D${currentRow}`).value = employeeNo;
        worksheet.getCell(`D${currentRow}`).font = { name: "Nunito Sans", size: 9};
        worksheet.getCell(`D${currentRow}`).alignment = { vertical: "middle" };
        worksheet.getCell(`D${currentRow}`).border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        currentRow++;

        // Second row: FROM DATE | From Value | TO DATE | To Value (if dates exist)
        if (formValues.from_date || formValues.to_date) {
          worksheet.getCell(`A${currentRow}`).value = 'FROM DATE';
          worksheet.getCell(`A${currentRow}`).font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
          worksheet.getCell(`A${currentRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
          worksheet.getCell(`A${currentRow}`).alignment = { vertical: "middle", horizontal: "center" };
          worksheet.getCell(`A${currentRow}`).border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          };

          worksheet.getCell(`B${currentRow}`).value = formValues.from_date ? format(formValues.from_date, 'dd/MM/yyyy') : '01/07/2025';
          worksheet.getCell(`B${currentRow}`).font = { name: "Nunito Sans", size: 9};
          worksheet.getCell(`B${currentRow}`).alignment = { vertical: "middle" };
          worksheet.getCell(`B${currentRow}`).border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          };

          worksheet.getCell(`C${currentRow}`).value = 'TO DATE';
          worksheet.getCell(`C${currentRow}`).font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
          worksheet.getCell(`C${currentRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
          worksheet.getCell(`C${currentRow}`).alignment = { vertical: "middle", horizontal: "center" };
          worksheet.getCell(`C${currentRow}`).border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          };

          worksheet.getCell(`D${currentRow}`).value = formValues.to_date ? format(formValues.to_date, 'dd/MM/yyyy') : '31/07/2025';
          worksheet.getCell(`D${currentRow}`).font = { name: "Nunito Sans", size: 9};
          worksheet.getCell(`D${currentRow}`).alignment = { vertical: "middle" };
          worksheet.getCell(`D${currentRow}`).border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          };

          currentRow++;
        }

        currentRow += 1; // Skip a row before main table
        // 4. MAIN DATA TABLE
        // Filter out employee columns from main table
        const excludeColumns = ['employee_id', 'emp_no', 'employee_name', 'organization_arb', 'workmts_row_timediff', 'sch_in', 'sch_out', 'punch_in', 'punch_out'];
        const allHeaders = Object.keys(dataArray[0]);
        let filteredHeaders = allHeaders.filter(header => !excludeColumns.includes(header));

        // Inject "schedule" column where sch_in was (optional — or push to the end)
        filteredHeaders.push('schedule');

        // Find transdate column and replace with Date and Day columns
        const transdateIndex = filteredHeaders.findIndex(header => header === 'transdate');
        if (transdateIndex !== -1) {
          // Remove transdate and insert Date and Day at the same position
          filteredHeaders.splice(transdateIndex, 1, 'Date', 'Day');
        }
        
        // Update headerMap to include new columns
        const updatedHeaderMap: Record<string, string> = {
          ...headerMap,
          Date: 'Date',
          Day: 'Day'
        };
        
        // Map headers using updated headerMap
        const displayHeaders = filteredHeaders.map(header => updatedHeaderMap[header] || header);

        // Add main table headers
        const headerRow = worksheet.getRow(currentRow);
        filteredHeaders.forEach((header, index) => {
          const cell = worksheet.getCell(currentRow, index + 1);
          cell.value = (headerMap[header] || header).toUpperCase();
          cell.font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          };
        });
        currentRow++;

        dataArray.forEach((row: Record<string, any>) => {
          filteredHeaders.forEach((header, index) => {
            const cell = worksheet.getCell(currentRow, index + 1);
            let cellValue = '';

            if (header === 'Date') {
              const transdate = row['transdate'];
              if (transdate) {
                try {
                  const date = new Date(transdate);
                  cellValue = format(date, 'dd-MM-yyyy');
                } catch {
                  cellValue = transdate;
                }
              }
            } else if (header === 'Day') {
              const transdate = row['transdate'];
              if (transdate) {
                try {
                  const date = new Date(transdate);
                  cellValue = format(date, 'EEEE');
                } catch {
                  cellValue = '';
                }
              }
            } else if (header === 'schedule') {
              const schIn = row['sch_in'] || '';
              const schOut = row['sch_out'] || '';
              cellValue = schIn && schOut ? `${schIn} - ${schOut}` : '';
            } else {
              cellValue = row[header] || '';
            }

            cell.value = cellValue;
            cell.font = { name: "Nunito Sans", size: 8 };
            cell.border = {
              top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
            };
            cell.alignment = { vertical: "middle", wrapText: true };
          });
          currentRow++;
        });

        // 5. SUMMARY TOTALS TABLE
        currentRow += 2; // Skip a row before summary table

        // Calculate summary totals
        const summaryTotals = calculateSummaryTotals(dataArray);

        // Add summary table title
        worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
        const summaryTitleCell = worksheet.getCell(`A${currentRow}`);
        summaryTitleCell.value = 'SUMMARY TOTALS';
        summaryTitleCell.font = { name: "Nunito Sans", bold: true, size: 12, color: { argb: "FF000000" } };
        summaryTitleCell.alignment = { vertical: "middle", horizontal: "center" };
        worksheet.getRow(currentRow).height = 25;
        currentRow += 2;

        // Summary data in 2 rows, 3 columns each
        const summaryData = [
          ['Total Late In Hours', summaryTotals.totalLateInHours, 'Total Early Out Hours', summaryTotals.totalEarlyOutHours, 'Total Missed Hours', summaryTotals.totalMissedHours],
          ['Total Worked Hours', summaryTotals.totalWorkedHours, 'Total Absents', summaryTotals.totalAbsents, 'Total Extra Hours', summaryTotals.totalExtraHours]
        ];

        summaryData.forEach((rowData) => {
          for (let i = 0; i < rowData.length; i += 2) {
            const labelCol = String.fromCharCode(65 + i); // A, C, E
            const valueCol = String.fromCharCode(65 + i + 1); // B, D, F
            
            // Label cell
            const labelCell = worksheet.getCell(`${labelCol}${currentRow}`);
            labelCell.value = rowData[i];
            labelCell.font = { name: "Nunito Sans", bold: true, size: 9, color: { argb: "FFFFFFFF" } };
            labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0078D4" } };
            labelCell.alignment = { vertical: "middle", horizontal: "center" };
            labelCell.border = {
              top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
            };

            // Value cell
            const valueCell = worksheet.getCell(`${valueCol}${currentRow}`);
            valueCell.value = rowData[i + 1];
            valueCell.font = { name: "Nunito Sans", size: 9 };
            valueCell.alignment = { vertical: "middle", horizontal: "center" };
            valueCell.border = {
              top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
            };
          }
          currentRow++;
        });

        // Enable auto-fit by not setting fixed dimensions initially
        worksheet.columns = filteredHeaders.map(header => ({
          header: headerMap[header] || header,
          key: header,
          width: 10 // will be overwritten
        }));

        // Apply auto-fit using ExcelJS built-in methods
        worksheet.columns.forEach((column, index) => {
          let maxWidth = 0;

          for (let rowIndex = 1; rowIndex <= currentRow; rowIndex++) {
            const cell = worksheet.getCell(rowIndex, index + 1);
            if (cell.value) {
              const cellText = String(cell.value);
              const textWidth = getTextWidth(cellText);
              maxWidth = Math.max(maxWidth, textWidth);
            }
          }

          // Include header cell width as well
          const headerCell = worksheet.getCell(1, index + 1);
          const headerText = String(headerCell.value || '');
          maxWidth = Math.max(maxWidth, getTextWidth(headerText));

          // Set width with padding and bounds
          column.width = Math.min(Math.max(maxWidth + 1, 6), 40);
        });

        // Enable auto-fit for rows by setting appropriate heights
        for (let rowIndex = 1; rowIndex <= currentRow; rowIndex++) {
          const row = worksheet.getRow(rowIndex);
          
          if (rowIndex === 1) {
            // Keep title row height fixed
            row.height = 25;
          } else {
            // Calculate required height based on content
            let maxRequiredHeight = 25; // Base height
            
            row.eachCell((cell) => {
              if (cell.value && cell.alignment && cell.alignment.wrapText) {
                const cellText = String(cell.value);
                const columnWidth = worksheet.getColumn(cell.col).width || 15;
                
                // Calculate approximate lines needed
                const charsPerLine = Math.floor(columnWidth * 0.8);
                const lines = Math.ceil(cellText.length / charsPerLine);
                const requiredHeight = lines * 15;
                
                maxRequiredHeight = Math.max(maxRequiredHeight, requiredHeight);
              }
            });
            
            // Set row height with limits
            row.height = Math.min(Math.max(maxRequiredHeight, 15), 80);
          }
        }

        // Final auto-fit pass - this ensures proper sizing
        try {
          // ExcelJS doesn't have direct autofit, but we can simulate it
          worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
              // Ensure all cells have proper alignment for auto-sizing
              if (!cell.alignment) {
                cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
              } else {
                cell.alignment = { ...cell.alignment, wrapText: true };
              }
            });
          });
        } catch (error) {
          console.warn('Auto-fit adjustment failed:', error);
        }

        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        const filename = `report_${formValues.employee ? 'employee_' + formValues.employee : 'all'}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
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

  // Function to handle showing report in PDF viewer
  const handleShowReport = async () => {
    const data = await fetchReportData();
    console.log("Show report data:", data);
    
    const dataArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
    
    if (dataArray.length > 0) {
      try {
        // Reverse the data array to show latest data first
        const reversedDataArray = [...dataArray].reverse();
        const formValues = form.getValues();
        
        // Get employee details from first row (use original array for consistent employee info)
        const firstRow = dataArray[0];
        const employeeId = firstRow?.employee_id || formValues.employee || '';
        const employeeName = firstRow?.employee_name || firstRow?.firstname_eng || '';
        const employeeNo = firstRow?.emp_no || '';
        
        // Filter out employee columns from main table - same as Excel export
        const excludeColumns = ['employee_id', 'emp_no', 'employee_name', 'organization_arb', 'workmts_row_timediff', 'sch_in', 'sch_out', 'punch_in', 'punch_out'];
        const allHeaders = Object.keys(dataArray[0]);
        let filteredHeaders = allHeaders.filter(header => !excludeColumns.includes(header));

        // Inject "schedule" column - same as Excel export
        filteredHeaders.push('schedule');

        // Find transdate column and replace with Date and Day columns - same as Excel export
        const transdateIndex = filteredHeaders.findIndex(header => header === 'transdate');
        if (transdateIndex !== -1) {
          // Remove transdate and insert Date and Day at the same position
          filteredHeaders.splice(transdateIndex, 1, 'Date', 'Day');
        }
        
        // Update headerMap to include new columns - same as Excel export
        const updatedHeaderMap: Record<string, string> = {
          ...headerMap,
          Date: 'Date',
          Day: 'Day'
        };
        
        // Map headers using updated headerMap - same as Excel export
        const displayHeaders = filteredHeaders.map(header => 
          (updatedHeaderMap[header] || header).toUpperCase()
        );

        // Calculate summary totals
        const summaryTotals = calculateSummaryTotals(dataArray);
        
        const htmlContent = `
          <div style="padding: 15px; font-family: 'Nunito Sans', sans-serif; width: 100%; box-sizing: border-box;">
            <!-- 1. PAGE HEADER - "EMPLOYEE DAILY MOVEMENT REPORT" -->
            <h1 style="text-align: center; color: #333; font-family: 'Nunito Sans', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 20px; page-break-inside: avoid;">EMPLOYEE DAILY MOVEMENT REPORT</h1>
            
            <!-- 2. GENERATED ON and EMPLOYEE ID row -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; page-break-inside: avoid;">
              <div style="flex: 1;">
                <p style="margin: 2px 0; font-size: 12px; font-family: 'Nunito Sans', sans-serif;"><span style="font-weight: bold;">Employee ID:</span> ${employeeId}</p>
              </div>
              <div style="flex: 1; text-align: right;">
                <p style="margin: 2px 0; font-size: 12px; font-family: 'Nunito Sans', sans-serif;"><span style="font-weight: bold;">Generated On:</span> ${format(new Date(), 'dd/MM/yyyy')}</p>
              </div>
            </div>
             
            <!-- 3. EMPLOYEE DETAILS TABLE -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: avoid;">
              <!-- First row: EMPLOYEE NAME | Name Value | EMPLOYEE NO | No Value -->
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; width: 25%; text-align: center; vertical-align: middle;">EMPLOYEE NAME</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; width: 25%; vertical-align: middle;">${employeeName}</td>
                <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; width: 25%; text-align: center; vertical-align: middle;">EMPLOYEE NO</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; width: 25%; vertical-align: middle;">${employeeNo}</td>
              </tr>
              <!-- Second row: FROM DATE | From Value | TO DATE | To Value (if dates exist) -->
              ${formValues.from_date || formValues.to_date ? 
                `<tr>
                  <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle;">FROM DATE</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; vertical-align: middle;">${formValues.from_date ? format(formValues.from_date, 'dd/MM/yyyy') : '01/07/2025'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle;">TO DATE</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; vertical-align: middle;">${formValues.to_date ? format(formValues.to_date, 'dd/MM/yyyy') : '31/07/2025'}</td>
                </tr>`
              : ''}
            </table>
          
            <!-- 4. MAIN DATA TABLE -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: auto; min-width: 100%; page-break-inside: auto;">
              <thead style="display: table-header-group;">
                <tr style="background-color: #0078D4;">
                  ${displayHeaders.map((header, index) => `
                    <th style="
                      border: 1px solid #ddd; 
                      padding: 8px 6px; 
                      text-align: center; 
                      vertical-align: middle;
                      color: #FFFFFF; 
                      font-family: 'Nunito Sans', sans-serif; 
                      font-weight: bold; 
                      font-size: 11px;
                      white-space: nowrap;
                      min-width: fit-content;
                    ">${header}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody style="page-break-inside: auto;">
                ${reversedDataArray.map((row: Record<string, any>, rowIndex: number) => `
                  <tr style="page-break-inside: avoid; ${rowIndex > 0 && rowIndex % 20 === 0 ? 'page-break-before: auto;' : ''}">
                    ${filteredHeaders.map(header => {
                      let cellValue = '';
                      
                      if (header === 'Date') {
                        const transdate = row['transdate'];
                        if (transdate) {
                          try {
                            const date = new Date(transdate);
                            cellValue = format(date, 'dd-MM-yyyy');
                          } catch {
                            cellValue = transdate;
                          }
                        }
                      } else if (header === 'Day') {
                        const transdate = row['transdate'];
                        if (transdate) {
                          try {
                            const date = new Date(transdate);
                            cellValue = format(date, 'EEEE');
                          } catch {
                            cellValue = '';
                          }
                        }
                      } else if (header === 'schedule') {
                        const schIn = row['sch_in'] || '';
                        const schOut = row['sch_out'] || '';
                        cellValue = schIn && schOut ? `${schIn} - ${schOut}` : '';
                      } else {
                        cellValue = row[header] || '';
                      }
                      
                      // Check if this is a "late" or "missed" column for red text
                      const isLateOrMissed = header === 'late' || header === 'dailymissedmts' || header === 'absentMts';
                      const textColor = isLateOrMissed ? 'color: #FF0000;' : '';
                      
                      return `
                        <td style="
                          border: 1px solid #ddd; 
                          padding: 6px 4px; 
                          font-family: 'Nunito Sans', sans-serif; 
                          font-size: 10px;
                          word-wrap: break-word;
                          overflow-wrap: break-word;
                          min-width: fit-content;
                          vertical-align: middle;
                          ${textColor}
                        ">${String(cellValue)}</td>
                      `;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- 5. SUMMARY TOTALS TABLE -->
            <div style="margin-top: 30px; page-break-inside: avoid;">
              <h2 style="text-align: center; color: #333; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 15px;">SUMMARY TOTALS</h2>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <!-- First row: Total Late In Hours | Value | Total Early Out Hours | Value | Total Missed Hours | Value -->
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">Total Late In Hours</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">${summaryTotals.totalLateInHours}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">Total Early Out Hours</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">${summaryTotals.totalEarlyOutHours}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">Total Missed Hours</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; text-align: center; vertical-align: middle; width: 16.66%;">${summaryTotals.totalMissedHours}</td>
                </tr>
                <!-- Second row: Total Worked Hours | Value | Total Absents | Value | Total Extra Hours | Value -->
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle;">Total Worked Hours</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; text-align: center; vertical-align: middle;">${summaryTotals.totalWorkedHours}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle;">Total Absents</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; text-align: center; vertical-align: middle;">${summaryTotals.totalAbsents}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; background-color: #0078D4; color: #FFFFFF; font-family: 'Nunito Sans', sans-serif; font-weight: bold; font-size: 11px; text-align: center; vertical-align: middle;">Total Extra Hours</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-family: 'Nunito Sans', sans-serif; font-size: 11px; text-align: center; vertical-align: middle;">${summaryTotals.totalExtraHours}</td>
                </tr>
              </table>
            </div>
          </div>
        `;

        const opt = {
          margin: [0.3, 0.3, 0.3, 0.3],
          filename: `report_${formValues.employee ? 'employee_' + formValues.employee : 'all'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 1.5, 
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 1400,
            windowHeight: window.innerHeight
          },
          jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'landscape',
            compress: true
          },
          pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            before: '.page-break-before',
            after: '.page-break-after',
            avoid: '.page-break-avoid'
          }
        };

        // Generate PDF blob instead of downloading
        const pdf = await html2pdf().set(opt).from(htmlContent).outputPdf('blob');
        
        // Create object URL and open in new tab
        const pdfUrl = URL.createObjectURL(pdf);
        window.open(pdfUrl, '_blank');
        
        // Clean up the object URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 1000);

      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Error generating PDF. Please try again.");
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
                      <FormLabel className="flex gap-1">Employee <Required/></FormLabel>
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
                {/* <Button
                  type="button"
                  variant={"success"}
                  size={"sm"}
                  className="flex items-center space-y-0.5 bg-[#DD2025] hover:bg-[#c1181e]"
                  onClick={handleExportPDF}
                  disabled={loading}
                >
                  <ExportPDFIcon />
                  Export to PDF
                </Button> */}
              </div>
            </div>
          </div>
        </form>
      </Form>
    
    </div>
  );
}