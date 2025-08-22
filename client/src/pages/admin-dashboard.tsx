import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  FileText, 
  CreditCard, 
  Users, 
  TrendingUp,
  Download,
  Edit,
  Trash2,
  Eye,
  Plus,
  ShieldQuestion,
  LogOut,
  UserCheck
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// AssignOfficerButton Component
function AssignOfficerButton({ 
  appointmentId, 
  currentOfficerId, 
  officers,
  onAssign 
}: { 
  appointmentId: string; 
  currentOfficerId?: string; 
  officers: any[];
  onAssign: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignOfficer = async (officerId: string) => {
    setIsAssigning(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/assign-officer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId }),
      });

      if (response.ok) {
        toast({
          title: "Officer assigned successfully",
          description: "The appointment has been assigned to the selected officer",
        });
        onAssign();
      } else {
        throw new Error("Failed to assign officer");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign officer",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Select onValueChange={handleAssignOfficer} disabled={isAssigning}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder={currentOfficerId ? `Officer ${currentOfficerId.slice(-6)}` : "Assign Officer"} />
      </SelectTrigger>
      <SelectContent>
        {officers.map((officer) => (
          <SelectItem key={officer.id} value={officer.id}>
            {officer.fullName || officer.username}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingOfficer, setIsAddingOfficer] = useState(false);
  const [officerForm, setOfficerForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
  });

  // Redirect non-admin users
  if (user && user.role !== 'admin') {
    setLocation('/');
    return null;
  }

  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<any[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: officers, isLoading: officersLoading } = useQuery<any[]>({
    queryKey: ["/api/officers"],
  });

  const { data: allPayments, isLoading: paymentsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/payments"],
  });

  const { data: allReports, isLoading: reportsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/reports"],
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => setLocation("/"),
    });
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast({
          title: "Appointment updated",
          description: `Appointment status changed to ${status}`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      } else {
        throw new Error("Failed to update appointment");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingOfficer(true);

    try {
      const response = await fetch("/api/admin/add-officer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(officerForm),
      });

      if (response.ok) {
        toast({
          title: "Officer added successfully",
          description: `Officer ${officerForm.fullName} has been created`,
        });
        setOfficerForm({ username: "", fullName: "", email: "", password: "" });
        // Refresh officers list
        window.location.reload();
      } else {
        const error = await response.text();
        toast({
          title: "Failed to add officer",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add officer",
        variant: "destructive",
      });
    } finally {
      setIsAddingOfficer(false);
    }
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
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="text-primary text-xl mr-3" />
              <span className="text-xl font-bold text-gray-900" data-testid="text-dashboard-title">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center" data-testid="user-info">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-2">
                  {user?.fullName?.[0] || user?.username?.[0] || 'A'}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{user?.fullName || user?.username}</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-appointments-today">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="text-primary text-xl" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900" data-testid="stat-appointments-count">
                    {statsLoading ? "..." : stats?.appointmentsToday || 0}
                  </div>
                  <div className="text-sm text-gray-600">Appointments Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-reports-generated">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FileText className="text-accent text-xl" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900" data-testid="stat-reports-count">
                    {statsLoading ? "..." : stats?.reportsGenerated || 0}
                  </div>
                  <div className="text-sm text-gray-600">Reports Generated</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-monthly-revenue">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <CreditCard className="text-yellow-600 text-xl" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900" data-testid="stat-revenue-amount">
                    ${statsLoading ? "..." : stats?.monthlyRevenue?.toLocaleString() || "0"}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-active-officers">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="text-purple-600 text-xl" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900" data-testid="stat-officers-count">
                    {statsLoading ? "..." : stats?.activeOfficers || 0}
                  </div>
                  <div className="text-sm text-gray-600">Active Officers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments" data-testid="tab-appointments">
              <Calendar className="mr-2" size={16} />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="payments" data-testid="tab-payments">
              <CreditCard className="mr-2" size={16} />
              Payments
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <FileText className="mr-2" size={16} />
              Reports
            </TabsTrigger>
            <TabsTrigger value="officers" data-testid="tab-officers">
              <ShieldQuestion className="mr-2" size={16} />
              Officers
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Appointments</CardTitle>
                  <Button data-testid="button-new-appointment">
                    <Plus className="mr-2" size={16} />
                    New Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="text-center py-8">Loading appointments...</div>
                ) : !appointments?.length ? (
                  <div className="text-center py-8 text-gray-500">No appointments found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="table-appointments">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Officer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {appointments?.map((appointment: any) => (
                          <tr key={appointment.id} data-testid={`row-appointment-${appointment.id}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{appointment.fullName}</div>
                                <div className="text-sm text-gray-500">{appointment.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{appointment.preferredDate} {appointment.preferredTime}</div>
                              <div className="text-sm text-gray-500">{appointment.address}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {appointment.officerId ? `Officer ${appointment.officerId}` : "Unassigned"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(appointment.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              
                              <div className="space-x-2">
                                <Button 
                                  size="sm"
                                  onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                  disabled={appointment.status === 'completed'}
                                  data-testid={`button-confirm-${appointment.id}`}
                                >
                                  <UserCheck className="mr-1" size={14} />
                                  Confirm
                                </Button>
                                <AssignOfficerButton
                                  appointmentId={appointment.id}
                                  currentOfficerId={appointment.officerId}
                                  officers={officers || []}
                                  onAssign={() => {
                                    queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-8">Loading payments...</div>
                ) : !allPayments?.length ? (
                  <div className="text-center py-8 text-gray-500" data-testid="payments-empty-state">
                    No payments found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allPayments?.map((payment: any) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.customerId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="text-center py-8">Loading reports...</div>
                ) : !allReports?.length ? (
                  <div className="text-center py-8 text-gray-500" data-testid="reports-empty-state">
                    No reports found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Officer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allReports?.map((report: any) => (
                          <tr key={report.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.reportNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.appointmentId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.officerId}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                                {report.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button variant="ghost" size="sm">
                                <Download size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Officers Tab */}
          <TabsContent value="officers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Security Officers</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-officer">
                        <Plus className="mr-2" size={16} />
                        Add Officer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Security Officer</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddOfficer} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={officerForm.username}
                            onChange={(e) => setOfficerForm(prev => ({ ...prev, username: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={officerForm.fullName}
                            onChange={(e) => setOfficerForm(prev => ({ ...prev, fullName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={officerForm.email}
                            onChange={(e) => setOfficerForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={officerForm.password}
                            onChange={(e) => setOfficerForm(prev => ({ ...prev, password: e.target.value }))}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isAddingOfficer}>
                          {isAddingOfficer ? "Adding Officer..." : "Add Officer"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {officersLoading ? (
                  <div className="text-center py-8">Loading officers...</div>
                ) : !officers?.length ? (
                  <div className="text-center py-8 text-gray-500" data-testid="officers-empty-state">
                    No officers found
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {officers?.map((officer: any) => (
                      <Card key={officer.id} data-testid={`card-officer-${officer.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mr-3">
                              {officer.fullName?.[0] || officer.username?.[0] || 'O'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{officer.fullName || officer.username}</div>
                              <div className="text-sm text-gray-500">License #{officer.id.slice(-6)}</div>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className="text-green-600 font-medium">
                                {officer.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium">{officer.email}</span>
                            </div>
                          </div>
                          <div className="mt-4 space-x-2">
                            <Button variant="ghost" size="sm" data-testid={`button-edit-officer-${officer.id}`}>
                              <Edit className="mr-1" size={14} />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-suspend-officer-${officer.id}`}>
                              <ShieldQuestion className="mr-1" size={14} />
                              Suspend
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}