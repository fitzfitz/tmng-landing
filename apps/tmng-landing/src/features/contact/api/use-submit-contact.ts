import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/endpoints";
import type { ContactFormData } from "../types";

interface ContactResponse {
  message: string;
  id?: string;
}

async function submitContact(data: ContactFormData): Promise<ContactResponse> {
  const response = await axiosInstance.post<ContactResponse>(
    API_ENDPOINTS.CONTACTS.CREATE,
    data,
  );
  return response.data;
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: submitContact,
    onSuccess: () => {
      console.log("Contact form submitted successfully");
    },
    onError: (error) => {
      console.error("Failed to submit contact form:", error);
    },
  });
}
