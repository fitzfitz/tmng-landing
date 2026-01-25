import React, { useState } from 'react';
import { Button, Input, Label, Textarea, Typography } from "@/components/ui";

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  if (status === 'success') {
    return (
      <div className="glass-card-strong rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-300">
        <Typography variant="h3" className="text-white mb-2">Message Received</Typography>
        <Typography variant="body" className="text-purple-200">Signal established. We will respond within 24 hours.</Typography>
        <Button 
          variant="link"
          onClick={() => setStatus('idle')}
          className="mt-6"
        >
          Send another transmission
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
            <Label htmlFor="name" required>Name</Label>
            <Input id="name" type="text" placeholder="John Doe" required />
        </div>
        <div className="flex flex-col gap-2">
            <Label htmlFor="email" required>Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" required />
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <Label htmlFor="subject" required>Subject</Label>
        <Input id="subject" type="text" placeholder="Project Inquiry" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message" required>Message</Label>
        <Textarea id="message" placeholder="Tell us about your project..." required />
      </div>
      
      <Button 
        type="submit"
        size="lg"
        disabled={status === 'submitting'}
        className="mt-2"
      >
        {status === 'submitting' ? 'Transmitting...' : 'Send Transmission'}
      </Button>
    </form>
  );
}
