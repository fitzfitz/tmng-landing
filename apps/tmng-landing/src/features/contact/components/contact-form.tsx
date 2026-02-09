import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { contactFormSchema, type ContactFormData } from "../types";
import { useSubmitContact } from "../api/use-submit-contact";

export function ContactForm() {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const submitContact = useSubmitContact();

  const onSubmit = async (data: ContactFormData) => {
    try {
      setSubmitStatus("idle");
      await submitContact.mutateAsync(data);
      setSubmitStatus("success");
      reset();

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      setSubmitStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Name *
        </label>
        <input
          {...register("name")}
          type="text"
          id="name"
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.name
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          } focus:outline-none focus:ring-2 transition-colors`}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Email *
        </label>
        <input
          {...register("email")}
          type="email"
          id="email"
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.email
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          } focus:outline-none focus:ring-2 transition-colors`}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Subject Field */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Subject *
        </label>
        <input
          {...register("subject")}
          type="text"
          id="subject"
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.subject
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          } focus:outline-none focus:ring-2 transition-colors`}
          placeholder="Project Inquiry"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Message *
        </label>
        <textarea
          {...register("message")}
          id="message"
          rows={6}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.message
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          } focus:outline-none focus:ring-2 transition-colors resize-none`}
          placeholder="Tell us about your project..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      {/* Success/Error Messages */}
      {submitStatus === "success" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Message sent successfully! We'll get back to you soon.
          </p>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            ✗ Failed to send message. Please try again or email us directly.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
