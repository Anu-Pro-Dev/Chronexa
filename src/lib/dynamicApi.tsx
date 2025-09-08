export const DynamicApi = (api: any, params: any) => {
  try {
    const page = parseInt(params.page as string) || 1;
    const limit = parseInt(params.limit as string) || 10;
    const search = params.search ? params.search.toString() : "";
    const sortField = params.sortField as string;
    const sortType = (params.sortType as string) || "asc";

    let data: any = [];
    
    if (search) {
      data = data.filter((item: any) =>
        Object.values(item).some((value: any) =>
          value.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    data = data.sort((a: any, b: any) => {
      if (sortType === "dec") {
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
