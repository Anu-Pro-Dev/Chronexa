import { grades_data, regions_data } from "@/data/cm.data"; // Import your datasets
import { devices_status_data } from "@/data/devices.data";
import { privileges_data, roles_data } from "@/data/security.data";

export const DynamicApi = (api: any, params: any) => {
  try {
    // Extract parameters

    const page = parseInt(params.page as string) || 1;
    const limit = parseInt(params.limit as string) || 10;
    const search = params.search ? params.search.toString() : "";
    const sortField = params.sortField as string;
    const sortType = (params.sortType as string) || "asc";

    let data: any = [];
    switch (api) {
      case "/company-master/grades":
        data = grades_data;
        break;
      case "/company-master/regions":
        data = regions_data;
        break;
      case "/devices/readers":
        data = devices_status_data;
        break;
      case "/security/roles":
        data = roles_data;
        break;
      case "/security/privileges":
        data = privileges_data;
        break;
      default:
        throw new Error("API endpoint not supported");
    }

    if (search) {
      data = data.filter((item: any) =>
        item.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    data = data.sort((a: any, b: any) => {
      if (sortType === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = data.slice(startIndex, endIndex);

    const totalDataLength = data.length;
    const totalPages = Math.ceil(totalDataLength / limit);

    return {
      data: {
        message: "Data fetched successfully!",
        payload: paginatedData,
        pagination: {
          totalDataLength,
          currentPage: page,
          totalPages,
          rowsPerPage: limit,
        },
      },
    };
  } catch (error: any) {
    return {
      error: error.message,
      message: "An error occurred while processing the request",
    };
  }
};
