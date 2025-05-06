'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, History, Utensils, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendNotification, type Notification as NotificationType, type NotificationResult } from '@/services/notification';


interface SentNotification extends NotificationType {
  id: string;
  sentAt: Date;
  status: 'Sent' | 'Failed';
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const [recipient, setRecipient] = useState<'all' | 'specific' | 'group'>('all');
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

    let actualRecipient = "all_users@example.com"; // Placeholder for 'all'
    if (recipient === 'specific' && specificRecipient.trim()) {
        actualRecipient = specificRecipient;
    } else if (recipient === 'specific' && !specificRecipient.trim()) {
        toast({ title: "Error", description: "Please enter a specific recipient email.", variant: "destructive" });
        return;
    }
    // Group logic would be more complex, involving fetching users in a group.

    setIsLoading(true);
    const notificationData: NotificationType = { recipient: actualRecipient, subject, body };
    
    try {
        const result: NotificationResult = await sendNotification(notificationData);
        const newSentNotification: SentNotification = {
            ...notificationData,
            id: String(Date.now()), // simple ID for demo
            sentAt: new Date(),
            status: result.success ? 'Sent' : 'Failed',
        };
        setSentNotifications(prev => [newSentNotification, ...prev]);

        if (result.success) {
            toast({ title: "Notification Sent", description: result.message || "Successfully sent."});
            setSubject('');
            setBody('');
            setSpecificRecipient('');
        } else {
            toast({ title: "Failed to Send", description: result.message || "An error occurred.", variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
         setSentNotifications(prev => [{ ...notificationData, id: String(Date.now()), sentAt: new Date(), status: 'Failed' }, ...prev]);
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
              <Select value={recipient} onValueChange={(value) => setRecipient(value as any)}>
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
            {recipient === 'specific' && (
              <div>
                <Label htmlFor="specificEmail">Recipient Email</Label>
                <Input id="specificEmail" type="email" placeholder="user@example.com" value={specificRecipient} onChange={e => setSpecificRecipient(e.target.value)} />
              </div>
            )}
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Important Update" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="body">Message Body</Label>
              <Textarea id="body" placeholder="Enter your notification message here..." value={body} onChange={e => setBody(e.target.value)} rows={5} />
            </div>
            <Button onClick={handleSendNotification} disabled={isLoading}>
              <Send className="mr-2 h-4 w-4" /> {isLoading ? "Sending..." : "Send Notification"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Sent Notifications History</CardTitle>
            <CardDescription>Log of all notifications sent through the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {sentNotifications.length === 0 ? (
              <p className="text-muted-foreground text-center">No notifications sent yet.</p>
            ) : (
              <ul className="space-y-3">
                {sentNotifications.map(notif => (
                  <li key={notif.id} className="p-3 border rounded-md bg-background">
                    <p className="font-semibold text-sm">{notif.subject}</p>
                    <p className="text-xs text-muted-foreground">To: {notif.recipient} - <span className={notif.status === 'Sent' ? 'text-green-600' : 'text-red-600'}>{notif.status}</span></p>
                    <p className="text-xs text-muted-foreground">Sent: {notif.sentAt.toLocaleString()}</p>
                    <p className="text-sm mt-1 truncate">{notif.body}</p>
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
