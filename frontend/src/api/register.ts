import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useRegister = () => {
  const mutation = useMutation({
    mutationFn: async ({
      first_name,
      last_name,
      email,
      password,
    }: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
    }) => {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/register`,
        { first_name, last_name, email, password }
      );
      return response.data;
    },
  });

  return mutation;
};
