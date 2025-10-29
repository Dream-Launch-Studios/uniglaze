import React from "react";
import type { ReactNode, ErrorInfo } from "react";
import { useRouter } from "next/navigation";
import Icon from "./AppIcon";

// Extend Window interface for custom error handler
declare global {
  interface Window {
    __COMPONENT_ERROR__?: (error: Error, errorInfo: ErrorInfo) => void;
  }
}

// Extend Error interface for the custom property
interface ExtendedError extends Error {
  __ErrorBoundary?: boolean;
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    (error as ExtendedError).__ErrorBoundary = true;
    window.__COMPONENT_ERROR__?.(error, errorInfo);
    // console.log("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
          <div className="max-w-md p-8 text-center">
            <div className="mb-2 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="42px"
                height="42px"
                viewBox="0 0 32 33"
                fill="none"
              >
                <path
                  d="M16 28.5C22.6274 28.5 28 23.1274 28 16.5C28 9.87258 22.6274 4.5 16 4.5C9.37258 4.5 4 9.87258 4 16.5C4 23.1274 9.37258 28.5 16 28.5Z"
                  stroke="#343330"
                  strokeWidth="2"
                  strokeMiterlimit="10"
                />
                <path
                  d="M11.5 15.5C12.3284 15.5 13 14.8284 13 14C13 13.1716 12.3284 12.5 11.5 12.5C10.6716 12.5 10 13.1716 10 14C10 14.8284 10.6716 15.5 11.5 15.5Z"
                  fill="#343330"
                />
                <path
                  d="M20.5 15.5C21.3284 15.5 22 14.8284 22 14C22 13.1716 21.3284 12.5 20.5 12.5C19.6716 12.5 19 13.1716 19 14C19 14.8284 19.6716 15.5 20.5 15.5Z"
                  fill="#343330"
                />
                <path
                  d="M21 22.5C19.9625 20.7062 18.2213 19.5 16 19.5C13.7787 19.5 12.0375 20.7062 11 22.5"
                  stroke="#343330"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-1 text-center">
              <h1 className="text-2xl font-medium text-neutral-800">
                Authorization Error
              </h1>
              <p className="w mx-auto w-8/12 text-base text-neutral-600">
                You are not authorized to access this page.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center">
              <ErrorBoundaryButton />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Separate component for the button to use Next.js navigation hook
function ErrorBoundaryButton(): ReactNode {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        router.push("/");
      }}
      className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-600"
    >
      <Icon name="ArrowLeft" size={18} color="#fff" />
      Back
    </button>
  );
}

export default ErrorBoundary;
