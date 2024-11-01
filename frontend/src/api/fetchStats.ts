import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useFetchStats = () => {
  const query = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const URLshortenerUser = window.localStorage.getItem("URLshortenerUser");
      let user_id = (URLshortenerUser && JSON.parse(URLshortenerUser).id) || {};
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/links/stats?user_id=${user_id}`
      );
      return response.data;
    },
  });
  return query;
};
