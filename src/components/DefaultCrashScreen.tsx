import React from "react";

interface DefaultCrashScreenProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  reset: () => void;
}

export const DefaultCrashScreen: React.FC<DefaultCrashScreenProps> = ({
  error,
  errorInfo,
  reset,
}) => (
  <div className="min-h-screen bg-[#1a0505] text-white p-8 md:p-16 flex flex-col items-start justify-center font-mono selection:bg-red-500">
    <div className="max-w-5xl w-full bg-black/80 p-8 rounded-2xl border border-red-500/30 shadow-2xl backdrop-blur-md">
      <h1 className="text-2xl font-semibold text-red-500 mb-2">
        🚨 Application State Crash
      </h1>
      <p className="text-slate-400 mb-6">
        A critical exception bypassed standard handling. Stack trace attached:
      </p>
      <div className="bg-red-950/20 p-6 rounded-xl overflow-x-auto border border-red-900/50">
        <p className="text-red-400 font-medium text-lg mb-4">
          {error.toString()}
        </p>
        <pre className="text-red-500/70 text-xs leading-relaxed overflow-x-auto">
          {errorInfo?.componentStack}
        </pre>
      </div>
      <button
        onClick={reset}
        className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors duration-200"
      >
        Reload Page
      </button>
    </div>
  </div>
);
