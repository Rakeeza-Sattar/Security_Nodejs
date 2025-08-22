import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Calendar, 
  FileText, 
  User,
  LogOut,
  Clock,
  MapPin,
  Play
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function OfficerDashboard() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect non-officer users
  if (user && user.role !== 'officer') {
    setLocation('/');
    return null;
  }

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => setLocation("/"),
    });
  };

  const todayAppointments = appointments?.filter((apt: any) => {
    const today = new Date().toISOString().split('T')[0];
    return apt.preferredDate === today;
  }) || [];

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
            <Shield className="text-xl mr-3" />
            <div>
              <div className="font-semibold" data-testid="text-officer-dashboard">Officer Dashboard</div>
              <div className="text-sm text-blue-100" data-testid="text-officer-name">
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
        {/* Today's Appointments */}
        <Card className="mb-6" data-testid="card-todays-appointments">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2" size={20} />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading appointments...</div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500" data-testid="no-appointments-today">
                No appointments scheduled for today
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment: any) => (
                  <Card key={appointment.id} className="border" data-testid={`card-appointment-${appointment.id}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-gray-900" data-testid={`text-customer-name-${appointment.id}`}>
                            {appointment.fullName}
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
                        <Link href={`/officer/audit/${appointment.id}`}>
                          <Button 
                            size="sm" 
                            className="bg-primary text-white"
                            data-testid={`button-start-audit-${appointment.id}`}
                          >
                            <Play size={14} className="mr-1" />
                            Start Audit
                          </Button>
                        </Link>
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
          <Card data-testid="stat-audits-today">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{todayAppointments.length}</div>
              <div className="text-sm text-gray-600">Audits Today</div>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-completed">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {appointments?.filter((apt: any) => apt.status === 'completed').length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full bg-primary text-white justify-start"
              data-testid="button-view-schedule"
            >
              <Calendar className="mr-3" size={16} />
              View Schedule
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-recent-reports"
            >
              <FileText className="mr-3" size={16} />
              Recent Reports
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-profile-settings"
            >
              <User className="mr-3" size={16} />
              Profile Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
