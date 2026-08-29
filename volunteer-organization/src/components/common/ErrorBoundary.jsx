// App-level boundary for unexpected render errors (expected API errors are
// handled per-page via react-query). Must be a class — no hook equivalent
// for componentDidCatch.

import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import Typography from "../ui/Typography";
import Button from "../ui/Button";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Central place to forward errors to a reporting service later.
    console.error("Unhandled application error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10">
          <AlertTriangle size={30} className="text-danger" aria-hidden="true" />
        </div>

        <Typography variant="overline" color="danger">
          Something went wrong
        </Typography>

        <Typography variant="h1">This page hit an unexpected error</Typography>

        <Typography variant="lead" className="max-w-md text-body">
          Sorry about that. Try reloading the page — if the problem keeps
          happening, please try again later.
        </Typography>

        <Button variant="primary" size="large" onClick={this.handleReload} className="mt-2">
          Reload Page
        </Button>
      </div>
    );
  }
}