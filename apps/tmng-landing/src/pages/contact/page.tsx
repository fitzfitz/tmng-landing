import { ContactForm } from "@/features/contact";

export default function ContactPage() {
  return (
    <section className="relative py-24 min-h-screen bg-gray-50/50 overflow-hidden flex items-center justify-center">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 bg-linear-to-b from-white to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-purple-600 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Available for new projects
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 drop-shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-700">
              Let's Build Something{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-fuchsia-600">
                Amazing
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Have a vision? We have the expertise. Fill out the form below and
              let's start the conversation.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-gray-200 p-8 md:p-12 rounded-3xl shadow-2xl shadow-gray-200/50 animate-in fade-in zoom-in-95 duration-700 delay-200 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-purple-500 via-fuchsia-500 to-purple-500"></div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
