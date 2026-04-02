import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught API/Component error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">Something went wrong.</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            We encountered an internal logic error or endpoint failure while requesting this offer. The Pryme core team has been notified.
          </p>
          <Button 
            variant="outline" 
            onClick={() => this.setState({ hasError: false })}
            className="rounded-xl border-red-200 hover:bg-red-50 text-red-600 dark:border-red-900/50 dark:hover:bg-red-900/20 dark:text-red-400"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
