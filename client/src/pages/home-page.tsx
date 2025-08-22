import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Phone, Check, Calendar, Award, Lock, Tag, Star } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="text-primary text-2xl mr-3" />
              <span className="text-xl font-bold text-gray-900">SecureHome Audit</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-primary">Services</a>
              <a href="#about" className="text-gray-600 hover:text-primary">About</a>
              <a href="#contact" className="text-gray-600 hover:text-primary">Contact</a>
              {user ? (
                <Link href={
                  user.role === 'admin' ? '/admin' : 
                  user.role === 'officer' ? '/officer' : 
                  '/dashboard'
                }>
                  <Button data-testid="button-dashboard">Dashboard</Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button data-testid="button-login">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6" data-testid="text-hero-headline">
                We send a licensed security officer to your home to document your valuables and receipts.
              </h1>
              <p className="text-xl text-blue-100 mb-8" data-testid="text-hero-subheadline">
                Professional home security audits by licensed officers. Protect your valuables with comprehensive documentation for insurance claims.
              </p>
              
              {/* Key Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center" data-testid="benefit-licensed">
                  <Check className="text-accent mr-3" />
                  <span>Licensed security officers with verified credentials</span>
                </div>
                <div className="flex items-center" data-testid="benefit-documentation">
                  <Check className="text-accent mr-3" />
                  <span>Complete photo documentation and receipts verification</span>
                </div>
                <div className="flex items-center" data-testid="benefit-reports">
                  <Check className="text-accent mr-3" />
                  <span>Professional PDF reports for insurance claims</span>
                </div>
              </div>

              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-accent text-white hover:bg-green-600 text-lg px-8 py-4"
                  data-testid="button-schedule-audit"
                >
                  <Calendar className="mr-2" />
                  Schedule Your Free Audit Now
                </Button>
              </Link>
            </div>
            <div className="mt-12 lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Professional security officer documenting home valuables" 
                className="rounded-xl shadow-2xl w-full h-auto"
                data-testid="img-hero"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Security Badges */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8" data-testid="text-trusted-title">Trusted & Certified</h2>
            <div className="flex justify-center items-center space-x-12 flex-wrap gap-8">
              <div className="flex flex-col items-center" data-testid="badge-asis">
                <Tag className="text-primary text-4xl mb-2" />
                <span className="text-sm font-medium">ASIS Certified</span>
              </div>
              <div className="flex flex-col items-center" data-testid="badge-bbb">
                <Award className="text-primary text-4xl mb-2" />
                <span className="text-sm font-medium">BBB Accredited</span>
              </div>
              <div className="flex flex-col items-center" data-testid="badge-licensed">
                <Shield className="text-primary text-4xl mb-2" />
                <span className="text-sm font-medium">Licensed Security</span>
              </div>
              <div className="flex flex-col items-center" data-testid="badge-insured">
                <Lock className="text-primary text-4xl mb-2" />
                <span className="text-sm font-medium">Insured & Bonded</span>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12" data-testid="text-testimonials-title">What Our Clients Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card data-testid="card-testimonial-1">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="fill-current" size={16} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4" data-testid="text-testimonial-1-content">
                    "Professional service from start to finish. The officer was thorough and the documentation was exactly what I needed for my insurance claim."
                  </p>
                  <div className="font-semibold text-gray-900" data-testid="text-testimonial-1-name">Sarah M.</div>
                  <div className="text-sm text-gray-500">Homeowner, Dallas TX</div>
                </CardContent>
              </Card>
              
              <Card data-testid="card-testimonial-2">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="fill-current" size={16} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4" data-testid="text-testimonial-2-content">
                    "The peace of mind knowing all my valuables are properly documented is invaluable. Highly recommend this service."
                  </p>
                  <div className="font-semibold text-gray-900" data-testid="text-testimonial-2-name">Michael R.</div>
                  <div className="text-sm text-gray-500">Homeowner, Austin TX</div>
                </CardContent>
              </Card>
              
              <Card data-testid="card-testimonial-3">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="fill-current" size={16} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4" data-testid="text-testimonial-3-content">
                    "Quick, efficient, and professional. The PDF report was comprehensive and helped me get my insurance claim processed faster."
                  </p>
                  <div className="font-semibold text-gray-900" data-testid="text-testimonial-3-name">Jennifer L.</div>
                  <div className="text-sm text-gray-500">Homeowner, Houston TX</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Support Contact */}
          <div className="text-center">
            <Card className="bg-primary text-white inline-block" data-testid="card-support">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">Need Help? Call Us</h3>
                <div className="text-2xl font-bold mb-2" data-testid="text-phone-number">
                  <Phone className="inline mr-2" />
                  (555) 123-SECURE
                </div>
                <p className="text-blue-100">Available 24/7 for support</p>
              </CardContent>
            </Card>
          </div>

          {/* Second CTA */}
          <div className="text-center mt-12">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="bg-accent text-white hover:bg-green-600 text-lg px-8 py-4"
                data-testid="button-schedule-audit-bottom"
              >
                <Calendar className="mr-2" />
                Schedule Your Free Audit Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
