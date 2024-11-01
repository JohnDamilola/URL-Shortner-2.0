import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useCreateLink = () => {
  const mutation = useMutation({
    mutationFn: async ({ payload }: { payload: any }) => {
      const URLshortenerUser = window.localStorage.getItem("URLshortenerUser");
      let user_id = (URLshortenerUser && JSON.parse(URLshortenerUser).id) || {};
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/links/create?user_id=${user_id}`,
        payload
      );
      return response.data;
    },
  });

  return mutation;
};
