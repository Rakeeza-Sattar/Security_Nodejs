import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Calendar, Lock, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DatePicker } from "@/components/ui/date-picker";

interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  hasReceiptsReady: boolean;
  addTitleProtection: boolean;
}

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    preferredDate: "",
    preferredTime: "",
    hasReceiptsReady: false,
    addTitleProtection: false,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/appointments", data);
      return await res.json();
    },
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment booked successfully!",
        description: "You will receive a confirmation email shortly.",
      });
      setLocation(`/confirmation/${appointment.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.preferredDate || !formData.preferredTime) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.hasReceiptsReady) {
      toast({
        title: "Please confirm you will have receipts ready",
        variant: "destructive",
      });
      return;
    }

    // Check if date is within 7 days
    const selectedDate = new Date(formData.preferredDate);
    const today = new Date();
    const maxDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    if (selectedDate < today || selectedDate > maxDate) {
      toast({
        title: "Invalid date",
        description: "Please select a date within the next 7 days",
        variant: "destructive",
      });
      return;
    }

    const appointmentData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      hasReceiptsReady: formData.hasReceiptsReady,
      status: "scheduled",
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate available dates (next 7 days)
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const availableTimes = [
    "9:00 AM",
    "11:00 AM", 
    "1:00 PM",
    "3:00 PM",
    "5:00 PM"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium">1</div>
              <span className="ml-2 text-sm font-medium text-primary">Booking Details</span>
            </div>
            <div className="mx-4 h-px bg-gray-300 w-16"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium">2</div>
              <span className="ml-2 text-sm font-medium text-gray-500">Confirmation</span>
            </div>
          </div>
        </div>

        <Card className="shadow-lg" data-testid="card-signup-form">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Schedule Your Free Home Audit
            </CardTitle>
            <p className="text-gray-600">
              Fill out the form below to book your appointment with a licensed security officer
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="John Doe"
                    required
                    data-testid="input-full-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2">
                  Mobile Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                  data-testid="input-phone"
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2">
                  Home Address (Service Location) *
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street, City, State, ZIP"
                  required
                  data-testid="input-address"
                />
              </div>

              {/* Date & Time Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Preferred Date *
                  </Label>
                  <Input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    required
                    data-testid="input-preferred-date"
                  />
                  <p className="text-xs text-gray-500 mt-1">Available within the next 7 days</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Preferred Time *
                  </Label>
                  <Select 
                    value={formData.preferredTime} 
                    onValueChange={(value) => handleInputChange("preferredTime", value)}
                  >
                    <SelectTrigger data-testid="select-preferred-time">
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="receipts-ready"
                  checked={formData.hasReceiptsReady}
                  onCheckedChange={(checked) => handleInputChange("hasReceiptsReady", !!checked)}
                  data-testid="checkbox-receipts-ready"
                />
                <Label htmlFor="receipts-ready" className="text-sm text-gray-600">
                  I will have my receipts and valuables ready for documentation at the scheduled appointment time.
                </Label>
              </div>

              {/* Payment Section */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h3>
                
                {/* Service Options */}
                <div className="space-y-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Free Home Audit</div>
                          <div className="text-sm text-gray-600">Professional documentation of your valuables</div>
                        </div>
                        <div className="text-lg font-semibold text-accent">FREE</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="title-protection"
                          checked={formData.addTitleProtection}
                          onCheckedChange={(checked) => handleInputChange("addTitleProtection", !!checked)}
                          data-testid="checkbox-title-protection"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="title-protection" className="font-medium text-gray-900">
                                Title Protection Monitoring
                              </Label>
                              <div className="text-sm text-gray-600">Monthly monitoring of your property title for fraudulent activity</div>
                            </div>
                            <div className="text-lg font-semibold text-primary">$50/month</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Square Payment Form Integration */}
                <Card className="bg-gray-50">
                  <CardContent className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <CreditCard className="mr-2" />
                      Payment Method
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">Card Number *</Label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="•••• •••• •••• ••••"
                            data-testid="input-card-number"
                          />
                          <div className="absolute right-3 top-3 flex space-x-1">
                            <CreditCard className="text-blue-600" size={16} />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2">Expiry Date *</Label>
                          <Input
                            type="text"
                            placeholder="MM/YY"
                            data-testid="input-expiry"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2">CVV *</Label>
                          <Input
                            type="text"
                            placeholder="•••"
                            data-testid="input-cvv"
                          />
                        </div>
                      </div>
                    </div>
                    <Card className="mt-4 bg-blue-50 border-blue-200">
                      <CardContent className="p-3">
                        <div className="flex items-center">
                          <Lock className="text-blue-600 mr-2" size={16} />
                          <span className="text-sm text-blue-800">Secured by Square Payment Processing</span>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home Audit Service</span>
                      <span className="font-medium">FREE</span>
                    </div>
                    {formData.addTitleProtection && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Title Protection</span>
                        <span>$50.00/month</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Today</span>
                        <span className="text-accent">FREE</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="text-center pt-6">
                <Button
                  type="submit"
                  className="w-full bg-accent text-white hover:bg-green-600 py-4 text-lg font-semibold"
                  disabled={createAppointmentMutation.isPending}
                  data-testid="button-complete-booking"
                >
                  <Calendar className="mr-2" />
                  {createAppointmentMutation.isPending 
                    ? "Processing..."
                    : "Complete Booking & Schedule Audit"
                  }
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  By clicking submit, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back to Landing */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="ghost" data-testid="button-back-home">
              <ArrowLeft className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
