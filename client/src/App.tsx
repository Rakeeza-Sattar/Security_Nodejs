
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import SignupPage from "@/pages/signup-page";
import ConfirmationPage from "@/pages/confirmation-page";
import AdminRegister from "@/pages/admin-register";
import AdminDashboard from "@/pages/admin-dashboard";
import OfficerDashboard from "@/pages/officer-dashboard";
import OfficerAudit from "@/pages/officer-audit";
import HomeownerDashboard from "@/pages/homeowner-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin-register" component={AdminRegister} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/confirmation/:id" component={ConfirmationPage} />
      <Route path="/dashboard" component={HomeownerDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/officer" component={OfficerDashboard} />
      <Route path="/officer/audit/:id" component={OfficerAudit} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
