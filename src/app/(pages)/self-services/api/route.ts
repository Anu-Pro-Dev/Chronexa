import { workflows_data } from "@/data/selfservices.data";

export async function GET(request: Request) {
  const url = request.url;
  if (url.split("tab=")[1] === 'Workflows') {
    return Response.json({
      data: workflows_data,
    });
  }
  else if (url.split("tab=")[1] === 'Approvals') {
    return Response.json({
      data: workflows_data,
    });
  }


}