import React, { useState } from 'react';
import { Button, Input, Label, Textarea, Typography } from "@/components/ui";

export default function ContactForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    // Replace with your actual Access Key from web3forms.com
    formData.append("access_key", import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY); 
    formData.append("botcheck", ""); // Honeypot to prevent spam

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
      } else {
        console.error("Form submission error:", data);
        setStatus("error");
      }
    } catch (error) {
      console.error("Form submission network error:", error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="glass-card-strong rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-300">
        <Typography variant="h3" className="text-white mb-2">
          Transmission Received
        </Typography>
        <Typography variant="body" className="text-purple-200">
          Signal confirmed. We will re-establish contact shortly.
        </Typography>
        <Button
          variant="link"
          onClick={() => setStatus("idle")}
          className="mt-6 text-fuchsia-400"
        >
          Send another message
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="glass-card-strong rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-300 border-red-500/30">
        <Typography variant="h3" className="text-white mb-2">
          Transmission Failed
        </Typography>
        <Typography variant="body" className="text-red-200 mb-4">
          Signal lost due to network interference. Please verify your access key
          or connection.
        </Typography>
        <Button
          variant="outline"
          onClick={() => setStatus("idle")}
          className="mt-2 border-red-500/50 text-red-100 hover:bg-red-500/10"
        >
          Retry Transmission
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
        />
      </div>

      {/* Honeypot for spam bots */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        style={{ display: "none" }}
      />

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="mt-2"
      >
        {status === "submitting" ? "Transmitting..." : "Send Transmission"}
      </Button>
    </form>
  );
}
