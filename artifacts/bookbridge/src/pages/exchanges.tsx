import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  useListExchanges, 
  useUpdateExchange,
  getListExchangesQueryKey,
  getGetDashboardStatsQueryKey,
  ExchangeUpdateStatus
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  MessageSquare, 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Inbox, 
  Send,
  User,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function Exchanges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("incoming");

  const { data: exchanges, isLoading } = useListExchanges();
  const updateExchangeMutation = useUpdateExchange();

  const handleUpdateStatus = (id: number, status: ExchangeUpdateStatus) => {
    updateExchangeMutation.mutate({
      id,
      data: { status }
    }, {
      onSuccess: () => {
        toast.success(`Exchange request ${status}`);
        queryClient.invalidateQueries({ queryKey: getListExchangesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
      onError: () => {
        toast.error("Failed to update status");
      }
    });
  };

  const incomingRequests = exchanges?.filter(e => e.ownerId === user?.id) || [];
  const outgoingRequests = exchanges?.filter(e => e.requesterId === user?.id) || [];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'accepted': return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Accepted</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const RequestCard = ({ request, isIncoming }: { request: any, isIncoming: boolean }) => {
    const partnerName = isIncoming ? request.requesterName : request.ownerName;
    const partnerEmail = isIncoming ? request.requesterEmail : undefined; // Only show requester email to owner
    const date = new Date(request.createdAt).toLocaleDateString();

    return (
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Book Info */}
            <div className="p-4 md:w-1/3 bg-muted/20 border-b md:border-b-0 md:border-r flex items-start gap-4">
              <div className="w-16 h-20 bg-muted rounded overflow-hidden shrink-0 border shadow-sm">
                {request.book?.imageUrl ? (
                  <img src={request.book.imageUrl} alt={request.book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <BookOpen className="w-6 h-6 text-primary/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/books/${request.bookId}`} className="font-medium hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {request.book?.title || 'Unknown Book'}
                </Link>
                <div className="text-xs text-muted-foreground mt-2">Requested on {date}</div>
              </div>
            </div>

            {/* Request Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-full text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{isIncoming ? 'From' : 'To'}: </span>
                      <span className="text-sm text-foreground">{partnerName}</span>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {request.message && (
                  <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground italic border-l-2 border-l-primary/30">
                    "{request.message}"
                  </div>
                )}

                {/* Only show email if accepted/completed OR to the owner who received the request */}
                {(isIncoming || request.status === 'accepted' || request.status === 'completed') && partnerEmail && (
                  <div className="text-sm text-muted-foreground bg-primary/5 px-3 py-2 rounded-md">
                    Contact: <a href={`mailto:${partnerEmail}`} className="text-primary font-medium hover:underline">{partnerEmail}</a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-2">
                {isIncoming && request.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleUpdateStatus(request.id, 'rejected')}
                      disabled={updateExchangeMutation.isPending}
                    >
                      Decline
                    </Button>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleUpdateStatus(request.id, 'accepted')}
                      disabled={updateExchangeMutation.isPending}
                    >
                      Accept Request
                    </Button>
                  </>
                )}

                {isIncoming && request.status === 'accepted' && (
                  <Button 
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => handleUpdateStatus(request.id, 'completed')}
                    disabled={updateExchangeMutation.isPending}
                  >
                    Mark as Completed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="bg-primary/5 py-8 border-b">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <MessageSquare className="h-6 w-6" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Exchanges</h1>
          </div>
          <p className="text-muted-foreground text-lg ml-9">
            Manage incoming requests and track books you want to get.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8 mx-auto flex-1 max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
            <TabsTrigger value="incoming" className="text-base flex items-center gap-2 data-[state=active]:shadow-sm">
              <Inbox className="w-4 h-4" /> 
              Incoming Requests
              {incomingRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px] rounded-full">
                  {incomingRequests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="text-base flex items-center gap-2 data-[state=active]:shadow-sm">
              <Send className="w-4 h-4" /> 
              My Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4 outline-none">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-40 animate-pulse bg-muted/50 border-border/50" />
                ))}
              </div>
            ) : incomingRequests.length > 0 ? (
              <div className="space-y-4">
                {incomingRequests
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(request => (
                  <RequestCard key={request.id} request={request} isIncoming={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border rounded-xl bg-muted/10 border-dashed">
                <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-medium">No incoming requests</h3>
                <p className="text-muted-foreground mt-2">When someone wants to buy or exchange your book, it will appear here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-4 outline-none">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-40 animate-pulse bg-muted/50 border-border/50" />
                ))}
              </div>
            ) : outgoingRequests.length > 0 ? (
              <div className="space-y-4">
                {outgoingRequests
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(request => (
                  <RequestCard key={request.id} request={request} isIncoming={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border rounded-xl bg-muted/10 border-dashed">
                <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-medium">No outgoing requests</h3>
                <p className="text-muted-foreground mt-2">You haven't requested any books yet.</p>
                <Link href="/books">
                  <Button variant="outline" className="mt-6">Browse Books</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}