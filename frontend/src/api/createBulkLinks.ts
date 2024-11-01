import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useCreateBulkLinks = () => {
  const mutation = useMutation({
    mutationFn: async ({ jsonPayload }: { jsonPayload: any }) => {
      const URLshortenerUser = window.localStorage.getItem("URLshortenerUser");
      let user_id = (URLshortenerUser && JSON.parse(URLshortenerUser).id) || {};
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/links/create_bulk?user_id=${user_id}`,
        jsonPayload
      );
      return response.data;
    },
  });

  return mutation;
};
