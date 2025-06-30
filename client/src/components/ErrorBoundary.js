import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card border-danger">
                <div className="card-header bg-danger text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Something went wrong
                  </h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">
                    We're sorry, but something unexpected happened. Please try refreshing the page.
                  </p>
                  
                  <div className="d-flex gap-2 mt-3">
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.reload()}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Refresh Page
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => window.location.href = '/'}
                    >
                      <i className="bi bi-house me-2"></i>
                      Go Home
                    </button>
                  </div>

                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4">
                      <summary className="text-danger mb-2">
                        <strong>Error Details (Development Only)</strong>
                      </summary>
                      <div className="bg-light p-3 rounded">
                        <h6>Error:</h6>
                        <pre className="text-danger small">
                          {this.state.error && this.state.error.toString()}
                        </pre>
                        <h6>Component Stack:</h6>
                        <pre className="text-muted small">
                          {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
