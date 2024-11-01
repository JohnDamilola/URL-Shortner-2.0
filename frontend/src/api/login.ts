import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useLogin = () => {
  const mutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        { email, password }
      );
      return response.data;
    },
  });

  return mutation;
};
