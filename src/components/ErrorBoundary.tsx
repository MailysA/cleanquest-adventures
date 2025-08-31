import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center">
            <div className="text-6xl mb-4">😵</div>
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Oups ! Une erreur s'est produite</h1>
            <p className="text-muted-foreground mb-6">
              Quelque chose s'est mal passé dans CleanQuest. 
              Essaie de recharger la page ou retourne à l'accueil.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-destructive mb-2">Détails de l'erreur :</h3>
                <pre className="text-xs text-destructive overflow-auto">
                  {this.state.error.message}
                </pre>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                className="flex-1 gradient-primary"
              >
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}