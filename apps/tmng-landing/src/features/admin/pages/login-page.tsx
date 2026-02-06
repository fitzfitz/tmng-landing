import LoginForm from "@/features/admin/login-form";

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden py-20 px-4">
      {/* Background Decoration */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl ring-1 ring-white/5">
            <div className="text-center mb-8">
                <div className="mx-auto w-12 h-12 bg-linear-to-br from-fuchsia-500 to-purple-600 rounded-xl mb-4 shadow-lg shadow-purple-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
                <p className="text-purple-200/50 text-sm">
                    Sign in to manage your content
                </p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Info */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-purple-200/30 text-xs">
                    Protected System • Authorized Personnel Only
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
