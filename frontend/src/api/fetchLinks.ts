import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useFetchLinks = () => {
  const query = useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const URLshortenerUser = window.localStorage.getItem("URLshortenerUser");
      let user_id = (URLshortenerUser && JSON.parse(URLshortenerUser).id) || {};
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/links/all?user_id=${user_id}`
      );
      return response.data;
    },
  });
  return query;
};
