
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Calendar, 
  FileText, 
  Home,
  LogOut,
  Clock,
  MapPin,
  Plus
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function HomeownerDashboard() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect non-homeowner users
  if (user && user.role !== 'homeowner') {
    setLocation('/');
    return null;
  }

  const { data: appointments, isLoading } = useQuery<any[]>({
    queryKey: ["/api/appointments"],
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => setLocation("/"),
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "outline",
      in_progress: "default", 
      completed: "secondary",
      cancelled: "destructive",
    };
    
    return (
      <Badge variant={variants[status] || "outline"} data-testid={`badge-status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Home className="text-xl mr-3" />
            <div>
              <div className="font-semibold" data-testid="text-homeowner-dashboard">My Home Security</div>
              <div className="text-sm text-blue-100" data-testid="text-homeowner-name">
                {user?.fullName || user?.username}
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-blue-100 hover:text-white"
            data-testid="button-logout"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Quick Actions */}
        <Card className="mb-6" data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2" size={20} />
              Book New Audit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/signup">
              <Button className="w-full bg-primary text-white" data-testid="button-book-audit">
                Schedule Home Security Audit
              </Button>
            </Link>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Free professional security assessment for your home
            </p>
          </CardContent>
        </Card>

        {/* My Appointments */}
        <Card className="mb-6" data-testid="card-my-appointments">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2" size={20} />
              My Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading appointments...</div>
            ) : !appointments?.length ? (
              <div className="text-center py-8 text-gray-500" data-testid="no-appointments">
                <Calendar className="mx-auto mb-4 text-gray-300" size={48} />
                <p>No appointments yet</p>
                <p className="text-sm">Book your first security audit above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment: any) => (
                  <Card key={appointment.id} className="border" data-testid={`card-appointment-${appointment.id}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-gray-900" data-testid={`text-appointment-id-${appointment.id}`}>
                            Appointment #{appointment.id.slice(-6)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center" data-testid={`text-address-${appointment.id}`}>
                            <MapPin size={14} className="mr-1" />
                            {appointment.address}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-primary flex items-center" data-testid={`text-time-${appointment.id}`}>
                            <Clock size={14} className="mr-1" />
                            {appointment.preferredTime}
                          </div>
                          <div className="text-xs text-gray-500">{appointment.preferredDate}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        {getStatusBadge(appointment.status)}
                        {appointment.status === 'completed' && (
                          <Button size="sm" variant="outline" data-testid={`button-view-report-${appointment.id}`}>
                            <FileText size={14} className="mr-1" />
                            View Report
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card data-testid="stat-total-audits">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {appointments?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Audits</div>
            </CardContent>
          </Card>
          <Card data-testid="stat-completed-audits">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {appointments?.filter((apt: any) => apt.status === 'completed').length || 0}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Security Tips */}
        <Card data-testid="card-security-tips">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2" size={20} />
              Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Before Your Audit</h4>
              <p className="text-sm text-blue-700">Have receipts and documentation ready for valuable items</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">During the Visit</h4>
              <p className="text-sm text-green-700">Verify officer identification before allowing entry</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-900">After the Audit</h4>
              <p className="text-sm text-amber-700">Review your security report and implement recommendations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
