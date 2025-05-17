
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, History, Utensils, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendNotification, type Notification as NotificationType, type NotificationResult } from '@/services/notification';


interface SentNotification extends NotificationType {
  id: string;
  sentAt: Date;
  status: 'Sent' | 'Failed';
}

type RecipientOption = 'all' | 'specific' | 'group';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [recipientType, setRecipientType] = useState<RecipientOption>('all');
  const [specificRecipient, setSpecificRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendNotification = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Error", description: "Subject and body cannot be empty.", variant: "destructive" });
      return;
    }

    let actualRecipient: string;
    let recipientDescription: string;

    switch (recipientType) {
      case 'all':
        actualRecipient = "all_users@example.com"; // Placeholder for backend processing
        recipientDescription = "All Users";
        break;
      case 'specific':
        if (!specificRecipient.trim()) {
          toast({ title: "Error", description: "Please enter a specific recipient email.", variant: "destructive" });
          return;
        }
        actualRecipient = specificRecipient;
        recipientDescription = specificRecipient;
        break;
      case 'group':
        actualRecipient = "group_expiring_coupons@example.com"; // Placeholder for backend processing
        recipientDescription = "User Group (Expiring Coupons)";
        break;
      default:
        toast({ title: "Error", description: "Invalid recipient type selected.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    const notificationData: NotificationType = { recipient: actualRecipient, subject, body };
    
    try {
        // In a real app, sendNotification would interact with a backend service.
        // For now, it's a mock. The `recipient` field here would be used by the backend.
        const result: NotificationResult = await sendNotification(notificationData);
        
        const newSentNotification: SentNotification = {
            ...notificationData,
            recipient: recipientDescription, // Use the descriptive recipient for display
            id: String(Date.now()), // simple ID for demo
            sentAt: new Date(),
            status: result.success ? 'Sent' : 'Failed',
        };
        setSentNotifications(prev => [newSentNotification, ...prev]);

        if (result.success) {
            toast({ title: "Notification Sent", description: result.message || `Successfully sent to ${recipientDescription}.`});
            setSubject('');
            setBody('');
            setSpecificRecipient('');
            // setRecipientType('all'); // Optionally reset recipient type
        } else {
            toast({ title: "Failed to Send", description: result.message || "An error occurred.", variant: "destructive" });
        }
    } catch (error) {
        console.error("Error sending notification:", error);
        toast({ title: "Error", description: "An unexpected error occurred while sending the notification.", variant: "destructive" });
         setSentNotifications(prev => [{ 
            recipient: recipientDescription, 
            subject, 
            body, 
            id: String(Date.now()), 
            sentAt: new Date(), 
            status: 'Failed' 
        }, ...prev]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-secondary">
      <aside className="w-64 bg-card text-card-foreground p-4 space-y-6 shadow-lg">
        <div className="flex items-center gap-2 text-primary">
          <Utensils className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/admin" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <ArrowLeft className="h-5 w-5" /> Dashboard
            </a>
          </Link>
          <Link href="/admin/notifications" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              <Bell className="h-5 w-5" /> Notifications
            </a>
          </Link>
          {/* Add other admin links here */}
        </nav>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <header>
          <h2 className="text-3xl font-semibold text-primary">Notification System</h2>
          <p className="text-muted-foreground">Send updates and reminders to users.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Compose Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="recipientType">Recipient Type</Label>
              <Select value={recipientType} onValueChange={(value) => setRecipientType(value as RecipientOption)}>
                <SelectTrigger id="recipientType">
                  <SelectValue placeholder="Select recipient type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="specific">Specific User (by email)</SelectItem>
                  <SelectItem value="group">User Group (e.g., expiring coupons)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {recipientType === 'specific' && (
              <div>
                <Label htmlFor="specificEmail">Recipient Email</Label>
                <Input 
                    id="specificEmail" 
                    type="email" 
                    placeholder="user@example.com" 
                    value={specificRecipient} 
                    onChange={e => setSpecificRecipient(e.target.value)}
                    disabled={isLoading}
                />
              </div>
            )}
            {recipientType === 'group' && (
                <p className="text-sm text-muted-foreground">
                    Note: Selecting "User Group" is a placeholder. In a real system, you would define and select actual groups.
                </p>
            )}
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="Important Update" 
                value={subject} 
                onChange={e => setSubject(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="body">Message Body</Label>
              <Textarea 
                id="body" 
                placeholder="Enter your notification message here..." 
                value={body} 
                onChange={e => setBody(e.target.value)} 
                rows={5} 
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleSendNotification} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isLoading ? "Sending..." : "Send Notification"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Sent Notifications History</CardTitle>
            <CardDescription>Log of all notifications sent through the system (simulated).</CardDescription>
          </CardHeader>
          <CardContent>
            {sentNotifications.length === 0 ? (
              <p className="text-muted-foreground text-center">No notifications sent yet.</p>
            ) : (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {sentNotifications.map(notif => (
                  <li key={notif.id} className="p-3 border rounded-md bg-background">
                    <p className="font-semibold text-sm">{notif.subject}</p>
                    <p className="text-xs text-muted-foreground">To: {notif.recipient} - <span className={notif.status === 'Sent' ? 'text-green-600' : 'text-red-600'}>{notif.status}</span></p>
                    <p className="text-xs text-muted-foreground">Sent: {notif.sentAt.toLocaleString()}</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">{notif.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
