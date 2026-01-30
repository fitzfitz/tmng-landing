import { useState } from "react";
import { Button, Input } from "@/components/ui";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "blog-sidebar",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-4 animate-in fade-in duration-300">
        <div className="text-2xl mb-2">🎉</div>
        <p className="text-purple-200 text-sm">{message}</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-fuchsia-400 text-sm hover:underline"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-fuchsia-500 transition-colors"
      />
      
      {status === "error" && (
        <p className="text-red-400 text-xs">{message}</p>
      )}
      
      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-white text-obsidian-950 font-bold hover:bg-fuchsia-50 transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}
