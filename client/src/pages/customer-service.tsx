import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formatDate } from "@/lib/utils";
import { Helmet } from "react-helmet";

// Support ticket form schema
const supportTicketSchema = z.object({
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  category: z.string(),
  priority: z.enum(["low", "medium", "high"]),
});

const CustomerService: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  
  return (
    <>
      <Helmet>
        <title>Customer Service | NextGen Digital Banking</title>
        <meta 
          name="description" 
          content="Get support for your banking needs, submit support tickets, and chat with customer service representatives."
        />
      </Helmet>
      <DashboardLayout title="Customer Service">
        <div className="space-y-6">
          {/* Support Options */}
          <Tabs defaultValue="support-tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Support</CardTitle>
                <CardDescription>
                  Get help with your banking needs
                </CardDescription>
                <TabsList className="mt-2">
                  <TabsTrigger value="support-tickets">Support Tickets</TabsTrigger>
                  <TabsTrigger value="live-chat">Live Chat</TabsTrigger>
                  <TabsTrigger value="faqs">FAQs</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent>
                <TabsContent value="support-tickets">
                  <div className="space-y-6">
                    <SupportTicketForm />
                    <SupportTicketList />
                  </div>
                </TabsContent>
                
                <TabsContent value="live-chat">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <h3 className="font-medium text-gray-900">Live Chat Support</h3>
                      <p className="text-gray-500 text-sm">Connect with a customer support representative</p>
                    </div>
                    
                    <div className="p-8 flex items-center justify-center min-h-[300px]">
                      <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                          <span className="material-icons text-primary-600">chat</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Start a new conversation</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                          Our support representatives are online and ready to help you with any banking questions or issues.
                        </p>
                        <Button>
                          <span className="material-icons mr-2 text-sm">support_agent</span>
                          Start Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="faqs">
                  <div className="space-y-4">
                    <FAQItem 
                      question="How do I reset my password?" 
                      answer="You can reset your password by clicking on the 'Forgot Password' link on the login page. You will receive an email with instructions to reset your password."
                    />
                    <FAQItem 
                      question="What are the daily transfer limits?" 
                      answer="The standard daily transfer limit is $10,000 for internal transfers and $5,000 for external transfers. You can request an increase by contacting customer support."
                    />
                    <FAQItem 
                      question="How long do ACH transfers take?" 
                      answer="ACH transfers typically take 1-3 business days to process. The exact timing depends on the receiving bank and when the transfer was initiated."
                    />
                    <FAQItem 
                      question="Is my account information secure?" 
                      answer="Yes, we use industry-standard encryption and security measures to protect your account information. We also offer two-factor authentication for added security."
                    />
                    <FAQItem 
                      question="How do I report suspicious activity?" 
                      answer="If you notice any suspicious activity on your account, please contact our fraud department immediately at 1-800-123-4567 or submit a fraud alert through the Security Center."
                    />
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
          
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Reach out to us through multiple channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center p-4 text-center">
                  <div className="bg-primary-50 rounded-full p-4 mb-4">
                    <span className="material-icons text-primary-600">phone</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Phone Support</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Call us 24/7 for immediate assistance
                  </p>
                  <p className="font-medium text-primary-600">1-800-123-4567</p>
                </div>
                
                <div className="flex flex-col items-center p-4 text-center">
                  <div className="bg-primary-50 rounded-full p-4 mb-4">
                    <span className="material-icons text-primary-600">email</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Email Support</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Send us an email and we'll respond within 24 hours
                  </p>
                  <p className="font-medium text-primary-600">support@nextgenbank.com</p>
                </div>
                
                <div className="flex flex-col items-center p-4 text-center">
                  <div className="bg-primary-50 rounded-full p-4 mb-4">
                    <span className="material-icons text-primary-600">location_on</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Branch Locations</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Visit one of our local branches for in-person assistance
                  </p>
                  <Button variant="outline" size="sm">
                    Find Nearest Branch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

// Support ticket form component
const SupportTicketForm: React.FC = () => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof supportTicketSchema>>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "account",
      priority: "medium",
    },
  });
  
  const ticketMutation = useMutation({
    mutationFn: async (values: z.infer<typeof supportTicketSchema>) => {
      return apiRequest("POST", "/api/support-tickets", values);
    },
    onSuccess: () => {
      toast({
        title: "Support Ticket Created",
        description: "Your support ticket has been submitted successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof supportTicketSchema>) => {
    ticketMutation.mutate(values);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Submit a Support Ticket</CardTitle>
        <CardDescription>
          Fill out the form below to create a new support ticket
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Brief description of your issue"
                      disabled={ticketMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={ticketMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="transaction">Transaction</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                        disabled={ticketMutation.isPending}
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="low" />
                          </FormControl>
                          <FormLabel className="font-normal">Low</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="medium" />
                          </FormControl>
                          <FormLabel className="font-normal">Medium</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="high" />
                          </FormControl>
                          <FormLabel className="font-normal">High</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Please provide details about your issue"
                      rows={5}
                      disabled={ticketMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={ticketMutation.isPending}
              >
                {ticketMutation.isPending ? (
                  <><span className="material-icons mr-2 animate-spin">refresh</span> Submitting...</>
                ) : (
                  <><span className="material-icons mr-2 text-sm">send</span> Submit Ticket</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// Support ticket list component
const SupportTicketList: React.FC = () => {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["/api/support-tickets"],
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your Support Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : tickets && tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket: any) => (
              <div 
                key={ticket.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {ticket.description.length > 100 
                        ? `${ticket.description.substring(0, 100)}...` 
                        : ticket.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      ticket.status === 'open' 
                        ? 'bg-green-100 text-green-700' 
                        : ticket.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}>
                      {ticket.status.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex mt-3 text-xs">
                  <span className="text-gray-500 flex items-center mr-4">
                    <span className="material-icons text-sm mr-1">category</span>
                    {ticket.category}
                  </span>
                  <span className={`flex items-center ${
                    ticket.priority === 'high' 
                      ? 'text-error' 
                      : ticket.priority === 'medium'
                        ? 'text-amber-600'
                        : 'text-gray-500'
                  }`}>
                    <span className="material-icons text-sm mr-1">flag</span>
                    {ticket.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            You don't have any support tickets yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// FAQ item component
interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full px-4 py-3 text-left font-medium flex justify-between items-center hover:bg-gray-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <span className="material-icons">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 text-gray-600 text-sm bg-gray-50 border-t">
          {answer}
        </div>
      )}
    </div>
  );
};

export default CustomerService;
