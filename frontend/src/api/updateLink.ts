import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useUpdateLink = () => {
  const mutation = useMutation({
    mutationFn: async ({ id, payload }: { id: any; payload: any }) => {
      const URLshortenerUser = window.localStorage.getItem("URLshortenerUser");
      let user_id = (URLshortenerUser && JSON.parse(URLshortenerUser).id) || {};
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/links/update/${id}?user_id=${user_id}`,
        payload
      );
      return response.data;
    },
  });

  return mutation;
};
