import { Component, type ReactNode } from "react";

export class ErrorBoundary extends Component<
  { fallback?: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert" className="text-center p-4 text-danger">
          <h2>Algo salió mal 😢</h2>
          <p>Por favor recarga la página o vuelve más tarde.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
