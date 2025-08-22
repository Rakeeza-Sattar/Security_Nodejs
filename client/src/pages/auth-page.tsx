import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    confirmPassword: "",
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      loginMutation.mutate(
        { username: formData.username, password: formData.password },
        {
          onSuccess: () => {
            toast({
              title: "Login successful",
              description: "Welcome back!",
            });
            setLocation("/");
          },
        }
      );
    } else {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      registerMutation.mutate(
        {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          fullName: formData.fullName,
          role: "homeowner",
        },
        {
          onSuccess: () => {
            toast({
              title: "Registration successful",
              description: "Welcome to SecureHome Audit!",
            });
            setLocation("/");
          },
        }
      );
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Back to home */}
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="button-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <Card data-testid="card-auth-form">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {isLogin ? "Sign in to your account" : "Create your account"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    required
                    data-testid="input-username"
                  />
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        required
                        data-testid="input-fullname"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        data-testid="input-email"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    data-testid="input-password"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      data-testid="input-confirm-password"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-submit-auth"
                >
                  {isLoading
                    ? "Loading..."
                    : isLogin
                    ? "Sign In"
                    : "Create Account"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  data-testid="button-toggle-auth-mode"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary to-blue-800 text-white p-12">
        <div className="max-w-md text-center">
          <Shield className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4" data-testid="text-auth-hero-title">
            Secure Your Valuables
          </h1>
          <p className="text-lg text-blue-100 mb-6" data-testid="text-auth-hero-description">
            Professional home security audits by licensed officers. Complete documentation for insurance claims.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-center" data-testid="feature-licensed">
              <Shield className="mr-2 h-5 w-5" />
              <span>Licensed Security Officers</span>
            </div>
            <div className="flex items-center justify-center" data-testid="feature-documentation">
              <Shield className="mr-2 h-5 w-5" />
              <span>Complete Documentation</span>
            </div>
            <div className="flex items-center justify-center" data-testid="feature-reports">
              <Shield className="mr-2 h-5 w-5" />
              <span>Professional PDF Reports</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
