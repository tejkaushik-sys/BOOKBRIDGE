import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSendContact } from "@workspace/api-client-react";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const sendContactMutation = useSendContact();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }
    
    sendContactMutation.mutate({ data: formData }, {
      onSuccess: () => {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      },
      onError: () => {
        toast.error("Failed to send message. Please try again.");
      }
    });
  };

  return (
    <Layout>
      <div className="bg-primary/5 py-16 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Have questions about BookBridge? Want to bring it to your campus? We'd love to hear from you.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8 lg:col-span-1">
            <div>
              <h2 className="text-2xl font-display font-semibold mb-6">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                We're here to help you get the most out of BookBridge. Reach out via the form or use our contact details below.
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="border-none shadow-none bg-muted/30">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">support@bookbridge.edu</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-none bg-muted/30">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-none bg-muted/30">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Office</h3>
                    <p className="text-sm text-muted-foreground">Student Union Bldg, Room 204<br/>University Campus</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 shadow-md">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        name="email" 
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="resize-none"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto"
                    disabled={sendContactMutation.isPending}
                  >
                    {sendContactMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}