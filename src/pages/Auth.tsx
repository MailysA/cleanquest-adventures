import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/onboarding" replace />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'Prénom requis';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          last_name: formData.lastName
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.email) {
      setErrors({ email: 'Saisir ton email d\'abord' });
      return;
    }

    try {
      await resetPassword(formData.email);
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-hero flex items-center justify-center text-4xl animate-bounce-in">
            🧹
          </div>
          <h1 className="text-3xl font-bold mb-2 gradient-hero bg-clip-text text-transparent">
            CleanQuest
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Connecte-toi à ton aventure' : 'Rejoins l\'aventure CleanQuest'}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="p-6 gradient-card animate-slide-up">
          <Tabs value={isLogin ? 'login' : 'signup'} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger 
                value="login" 
                onClick={() => setIsLogin(true)}
                className="data-[state=active]:gradient-primary"
              >
                Connexion
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                onClick={() => setIsLogin(false)}
                className="data-[state=active]:gradient-primary"
              >
                Inscription
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Signup fields */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                    {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      type="text" 
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password (signup only) */}
              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full gradient-primary hover:opacity-90 mt-6"
              >
                {submitting ? (
                  <LoadingSpinner size="sm" text={isLogin ? 'Connexion...' : 'Inscription...'} />
                ) : (
                  isLogin ? '🚀 Se connecter' : '✨ Créer mon compte'
                )}
              </Button>

              {/* Reset Password */}
              {isLogin && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetPassword}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Mot de passe oublié ?
                  </Button>
                </div>
              )}
            </form>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          En {isLogin ? 'te connectant' : 't\'inscrivant'}, tu acceptes nos conditions d'utilisation
        </div>
      </div>
    </div>
  );
}