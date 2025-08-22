import { useState } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Plus, 
  Save, 
  CheckCircle, 
  Edit,
  Tv,
  Gem,
  Laptop
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuditItem {
  id?: string;
  category: string;
  description: string;
  estimatedValue: string;
  serialNumber: string;
}

export default function OfficerAudit() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect non-officer users
  if (user && user.role !== 'officer') {
    setLocation('/');
    return null;
  }

  const [currentItem, setCurrentItem] = useState<AuditItem>({
    category: '',
    description: '',
    estimatedValue: '',
    serialNumber: '',
  });

  const { data: appointment, isLoading: appointmentLoading } = useQuery({
    queryKey: ["/api/appointments", id],
    enabled: !!id,
  });

  const { data: auditItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/audit-items", id],
    enabled: !!id,
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const res = await apiRequest("POST", "/api/audit-items", {
        ...item,
        appointmentId: id,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-items", id] });
      setCurrentItem({
        category: '',
        description: '',
        estimatedValue: '',
        serialNumber: '',
      });
      toast({
        title: "Item added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/reports/generate/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report generated successfully",
        description: "The audit report has been created",
      });
      setLocation("/officer");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof AuditItem, value: string) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    if (!currentItem.category || !currentItem.description) {
      toast({
        title: "Please fill in required fields",
        description: "Category and description are required",
        variant: "destructive",
      });
      return;
    }

    addItemMutation.mutate({
      ...currentItem,
      estimatedValue: parseFloat(currentItem.estimatedValue) || 0,
    });
  };

  const totalItems = auditItems?.length || 0;
  const progressPercentage = Math.min((totalItems / 15) * 100, 100);

  const categories = [
    "Electronics",
    "Jewelry", 
    "Furniture",
    "Artwork",
    "Appliances",
    "Other"
  ];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'electronics':
        return <Tv className="text-gray-500" size={20} />;
      case 'jewelry':
        return <Gem className="text-gray-500" size={20} />;
      default:
        return <Laptop className="text-gray-500" size={20} />;
    }
  };

  if (appointmentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading audit details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Audit Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center justify-between">
          <Link href="/officer">
            <Button variant="ghost" className="text-blue-100 hover:text-white p-0" data-testid="button-back">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="text-center">
            <div className="font-semibold" data-testid="text-audit-title">Home Audit</div>
            <div className="text-sm text-blue-100" data-testid="text-customer-location">
              {appointment?.fullName} - {appointment?.address}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm">{appointment?.preferredTime}</div>
            <div className="text-xs text-blue-100">Started</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Audit Progress */}
        <Card className="mb-6" data-testid="card-audit-progress">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Audit Progress</h3>
              <span className="text-sm text-gray-500" data-testid="text-progress-count">
                {totalItems} of 15 items
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" data-testid="progress-audit" />
          </CardContent>
        </Card>

        {/* Current Item Documentation */}
        <Card className="mb-6" data-testid="card-document-item">
          <CardHeader>
            <CardTitle>Document Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Item Category */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Category</Label>
              <Select 
                value={currentItem.category} 
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Item Description */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Description</Label>
              <Input
                type="text"
                value={currentItem.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="e.g., Samsung 65-inch Smart TV"
                data-testid="input-description"
              />
            </div>

            {/* Value and Serial */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Estimated Value</Label>
                <Input
                  type="number"
                  value={currentItem.estimatedValue}
                  onChange={(e) => handleInputChange("estimatedValue", e.target.value)}
                  placeholder="2000"
                  data-testid="input-estimated-value"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Serial/Model</Label>
                <Input
                  type="text"
                  value={currentItem.serialNumber}
                  onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                  placeholder="Model #"
                  data-testid="input-serial-number"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Item Photo</Label>
              <Card className="border-2 border-dashed border-gray-300 p-6 text-center" data-testid="photo-upload-area">
                <Camera className="text-4xl text-gray-400 mb-3 mx-auto" />
                <div className="text-gray-600 mb-2">Take Photo</div>
                <Button className="bg-primary text-white" data-testid="button-open-camera">
                  <Camera className="mr-2" size={16} />
                  Open Camera
                </Button>
              </Card>
            </div>

            {/* Receipt Upload */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Receipt (Optional)</Label>
              <Card className="border-2 border-dashed border-gray-300 p-4 text-center" data-testid="receipt-upload-area">
                <Upload className="text-2xl text-gray-400 mb-2 mx-auto" />
                <div className="text-sm text-gray-600 mb-2">Upload Receipt</div>
                <Button variant="secondary" size="sm" data-testid="button-choose-file">
                  <Upload className="mr-2" size={14} />
                  Choose File
                </Button>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleAddItem}
                disabled={addItemMutation.isPending}
                className="flex-1 bg-accent text-white hover:bg-green-600"
                data-testid="button-add-item"
              >
                <Plus className="mr-2" size={16} />
                {addItemMutation.isPending ? "Adding..." : "Add Item"}
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1"
                data-testid="button-save-draft"
              >
                <Save className="mr-2" size={16} />
                Save Draft
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documented Items */}
        <Card className="mb-6" data-testid="card-documented-items">
          <CardHeader>
            <CardTitle>Documented Items ({totalItems})</CardTitle>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="text-center py-4">Loading items...</div>
            ) : !auditItems?.length ? (
              <div className="text-center py-8 text-gray-500" data-testid="no-items-message">
                No items documented yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {auditItems?.map((item: any) => (
                  <div key={item.id} className="py-4 flex items-center justify-between" data-testid={`item-${item.id}`}>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900" data-testid={`item-description-${item.id}`}>
                          {item.description}
                        </div>
                        <div className="text-sm text-gray-500" data-testid={`item-details-${item.id}`}>
                          {item.category} - ${item.estimatedValue?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" data-testid={`button-edit-item-${item.id}`}>
                      <Edit size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete Audit */}
        <Card data-testid="card-complete-audit">
          <CardContent className="p-4">
            <Button 
              onClick={() => generateReportMutation.mutate()}
              disabled={generateReportMutation.isPending || totalItems === 0}
              className="w-full bg-accent text-white hover:bg-green-600 py-3 text-lg font-semibold"
              data-testid="button-complete-audit"
            >
              <CheckCircle className="mr-2" size={20} />
              {generateReportMutation.isPending 
                ? "Generating Report..." 
                : "Complete Audit & Generate Report"
              }
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              This will generate the PDF report and request homeowner signature
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
