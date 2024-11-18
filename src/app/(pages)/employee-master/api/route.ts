import { employee_master_employees_data, employee_master_groups_data, employee_master_types_data } from "@/data/em.data";

export async function GET(request: Request) {
  const url = request.url;
  if (url.split("tab=")[1] === 'Employees') {
    return Response.json({
      data: employee_master_employees_data,
    });
  }
  else if (url.split("tab=")[1] === 'Employee Groups') {
    return Response.json({
      data: employee_master_groups_data,
    });
  }
  else {
    return Response.json({
      data: employee_master_groups_data
    })
  }

}