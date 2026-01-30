import React, { useState } from 'react';
import { Button, Input, Label, Textarea, Typography } from "@/components/ui";

export default function ContactForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
      } else {
        console.error("Form submission error:", result);
        setErrorMessage(result.error || "Something went wrong");
        setStatus("error");
      }
    } catch (error) {
      console.error("Form submission network error:", error);
      setErrorMessage(
        "Network error. Please check your connection and try again.",
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <Typography variant="h3" className="text-gray-900 mb-2">
          Message Sent Successfully
        </Typography>
        <Typography variant="body" className="text-gray-600">
          Thank you for reaching out. We'll get back to you shortly.
        </Typography>
        <Button
          variant="link"
          onClick={() => setStatus("idle")}
          className="mt-6 text-purple-600"
        >
          Send another message
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <Typography variant="h3" className="text-gray-900 mb-2">
          Submission Failed
        </Typography>
        <Typography variant="body" className="text-gray-600 mb-4">
          {errorMessage || "Something went wrong. Please try again."}
        </Typography>
        <Button
          variant="outline"
          onClick={() => setStatus("idle")}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" required>
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            minLength={2}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="subject" required>
          Subject
        </Label>
        <Input
          id="subject"
          name="subject"
          type="text"
          placeholder="Project Inquiry"
          required
          minLength={5}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message" required>
          Message
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us about your project..."
          required
          minLength={10}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="mt-2"
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
