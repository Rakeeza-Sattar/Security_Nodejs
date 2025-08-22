import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Shield, Plus, Phone, Mail, Clock, MapPin, User, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function ConfirmationPage() {
  const { id } = useParams();

  // In a real app, this would fetch the appointment details
  const { data: appointment, isLoading } = useQuery({
    queryKey: ["/api/appointments", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading appointment details...</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration (would come from API in real app)
  const mockAppointment = {
    id: id,
    customerName: "John Doe",
    date: "March 15, 2024",
    time: "2:00 PM", 
    address: "123 Main St, Dallas, TX 75201",
    email: "john@example.com",
    phone: "(555) 123-4567"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-accent text-white rounded-full text-sm font-medium">
                <Check size={16} />
              </div>
              <span className="ml-2 text-sm font-medium text-accent">Booking Details</span>
            </div>
            <div className="mx-4 h-px bg-accent w-16"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-accent text-white rounded-full text-sm font-medium">2</div>
              <span className="ml-2 text-sm font-medium text-accent">Confirmation</span>
            </div>
          </div>
        </div>

        <Card className="shadow-lg" data-testid="card-confirmation">
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent text-white rounded-full mb-4">
                <Check size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-confirmation-title">
                Thank you, {mockAppointment.customerName}!
              </h2>
              <p className="text-xl text-gray-600" data-testid="text-appointment-details">
                Your free home audit is booked for {mockAppointment.date} at {mockAppointment.time}
              </p>
            </div>

            {/* Appointment Details */}
            <Card className="bg-gray-50 mb-8" data-testid="card-appointment-details">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Appointment Details</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="mr-3 text-gray-400" size={16} />
                      <span className="text-gray-600">Date & Time:</span>
                    </div>
                    <span className="font-medium" data-testid="text-appointment-datetime">
                      {mockAppointment.date} at {mockAppointment.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="mr-3 text-gray-400" size={16} />
                      <span className="text-gray-600">Address:</span>
                    </div>
                    <span className="font-medium" data-testid="text-appointment-address">
                      {mockAppointment.address}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="mr-3 text-gray-400" size={16} />
                      <span className="text-gray-600">Officer:</span>
                    </div>
                    <span className="font-medium">Will be assigned 24 hours before</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preparation Checklist */}
            <div className="text-left mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center" data-testid="text-checklist-title">
                <Shield className="text-primary mr-2" />
                Please Prepare the Following:
              </h3>
              <div className="space-y-3">
                <div className="flex items-start" data-testid="checklist-receipts">
                  <Check className="text-accent mr-3 mt-1 flex-shrink-0" size={16} />
                  <span className="text-gray-700">Gather receipts for valuables (electronics, jewelry, furniture, artwork, etc.)</span>
                </div>
                <div className="flex items-start" data-testid="checklist-items">
                  <Check className="text-accent mr-3 mt-1 flex-shrink-0" size={16} />
                  <span className="text-gray-700">Collect items to photograph and document</span>
                </div>
                <div className="flex items-start" data-testid="checklist-warranties">
                  <Check className="text-accent mr-3 mt-1 flex-shrink-0" size={16} />
                  <span className="text-gray-700">Warranty papers and appraisals for high-value items</span>
                </div>
                <div className="flex items-start" data-testid="checklist-officer">
                  <Check className="text-accent mr-3 mt-1 flex-shrink-0" size={16} />
                  <span className="text-gray-700">Officer will arrive in uniform and show proper identification</span>
                </div>
              </div>
            </div>

            {/* Title Protection Upsell */}
            <Card className="bg-blue-50 border-blue-200 mb-8" data-testid="card-title-protection-upsell">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="text-primary mr-2" />
                  Add Title Protection for Complete Security
                </h3>
                <p className="text-gray-600 mb-4">
                  Want to protect your home deed from fraud? Add Title Protection today for just $50/month.
                </p>
                <Button 
                  className="bg-primary text-white hover:bg-blue-700"
                  data-testid="button-add-title-protection"
                >
                  <Plus className="mr-2" size={16} />
                  Add Title Protection Now
                </Button>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <div className="text-left mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid="text-next-steps-title">
                What Happens Next?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start" data-testid="step-agreement">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium mr-4 mt-0.5">1</div>
                  <div>
                    <div className="font-medium text-gray-900">Service Agreement</div>
                    <div className="text-sm text-gray-600">You'll receive a DocuSign email to complete the service agreement</div>
                  </div>
                </div>
                <div className="flex items-start" data-testid="step-reminder">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium mr-4 mt-0.5">2</div>
                  <div>
                    <div className="font-medium text-gray-900">24-Hour Reminder</div>
                    <div className="text-sm text-gray-600">We'll send you a reminder email with officer details</div>
                  </div>
                </div>
                <div className="flex items-start" data-testid="step-visit">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium mr-4 mt-0.5">3</div>
                  <div>
                    <div className="font-medium text-gray-900">Officer Visit</div>
                    <div className="text-sm text-gray-600">Professional documentation of your valuables and receipt verification</div>
                  </div>
                </div>
                <div className="flex items-start" data-testid="step-report">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium mr-4 mt-0.5">4</div>
                  <div>
                    <div className="font-medium text-gray-900">PDF Report</div>
                    <div className="text-sm text-gray-600">Receive your comprehensive documentation report via email</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <Card className="bg-gray-50" data-testid="card-contact-info">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Need to Make Changes?</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-center" data-testid="contact-phone">
                    <Phone className="text-primary mr-2" size={16} />
                    <span className="font-medium">(555) 123-SECURE</span>
                  </div>
                  <div className="flex items-center justify-center" data-testid="contact-email">
                    <Mail className="text-primary mr-2" size={16} />
                    <span>support@securehomeaudit.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center mt-8 space-y-4">
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
