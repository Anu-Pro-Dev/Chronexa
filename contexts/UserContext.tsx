import { USER_TOKEN, UserAxiosInstance } from "@/utils/Instance";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext<any>({
  StoreData: [],
  SetStoreData: () => [],
  GetData: () => {},
});

export const UserContextProvider = ({ children }: { children: any }) => {
  const [StoreData, SetStoreData] = useState<any>({});
  const router = useRouter();
  const GetData = async () => {
    try {
      const response = await UserAxiosInstance.get("/users/get-user-details");
      SetStoreData(response.data.payload);
    } catch (error) {
      console.log(error);
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(USER_TOKEN);
      }

      router.push("/sign-in");
    }
  };

  useEffect(() => {
    GetData();
  }, []);

  const value = {
    StoreData,
    SetStoreData,
    GetData,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
