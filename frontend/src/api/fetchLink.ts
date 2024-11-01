import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useFetchLink = (id: any) => {
  const query = useQuery({
    queryKey: ["link"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/links/${id}`
      );
      return response.data;
    },
  });
  return query;
};
