'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Bell, Utensils, ArrowLeft, Palette, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [siteName, setSiteName] = useState("Meal Plan Hub");
    const [defaultCurrency, setDefaultCurrency] = useState("USD");
    const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const handleSaveChanges = () => {
        // In a real app, these settings would be saved to a backend/database
        console.log({ siteName, defaultCurrency, enableEmailNotifications, maintenanceMode });
        toast({
            title: "Settings Saved",
            description: "Your changes have been successfully saved.",
        });
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
          <Link href="/admin/settings" legacyBehavior>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              <Settings className="h-5 w-5" /> Settings
            </a>
          </Link>
          {/* Add other admin links here */}
        </nav>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <header>
          <h2 className="text-3xl font-semibold text-primary">System Settings</h2>
          <p className="text-muted-foreground">Configure general settings for the Meal Plan Hub.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5"/> General Settings</CardTitle>
                    <CardDescription>Basic configuration for your application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="e.g., My Awesome Mess" />
                    </div>
                    <div>
                        <Label htmlFor="defaultCurrency">Default Currency</Label>
                        <Input id="defaultCurrency" value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} placeholder="e.g., USD, INR" />
                    </div>
                     <div className="flex items-center justify-between space-x-2 pt-2">
                        <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                            <span>Maintenance Mode</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                            Temporarily disable access for users.
                            </span>
                        </Label>
                        <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} aria-label="Maintenance mode" />
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Notification Settings</CardTitle>
                    <CardDescription>Manage how notifications are sent.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                            <span>Email Notifications</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                            Enable or disable email notifications for users.
                            </span>
                        </Label>
                        <Switch id="email-notifications" checked={enableEmailNotifications} onCheckedChange={setEnableEmailNotifications} aria-label="Email notifications" />
                    </div>
                     <div>
                        <Label htmlFor="adminEmail">Admin Notification Email</Label>
                        <Input id="adminEmail" type="email" placeholder="admin-alerts@example.com" />
                    </div>
                </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> Appearance</CardTitle>
                    <CardDescription>Customize the look and feel (placeholders).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="logoUpload">Upload Logo</Label>
                        <Input id="logoUpload" type="file" />
                         <p className="text-xs text-muted-foreground mt-1">Recommended size: 200x50px.</p>
                    </div>
                    <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <Input id="primaryColor" type="color" defaultValue="#4CAF50" className="h-10" />
                    </div>
                </CardContent>
            </Card>

             {/* Security Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/> Security</CardTitle>
                    <CardDescription>Security-related configurations (placeholders).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="twoFactorAuth" className="flex flex-col space-y-1">
                            <span>Two-Factor Authentication (Admin)</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                            Require 2FA for admin logins.
                            </span>
                        </Label>
                        <Switch id="twoFactorAuth" disabled aria-label="Two-factor authentication" />
                    </div>
                     <div>
                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                        <Input id="sessionTimeout" type="number" defaultValue="30" />
                    </div>
                </CardContent>
            </Card>
        </div>
        
        <div className="flex justify-end pt-4">
            <Button onClick={handleSaveChanges}>
                <Save className="mr-2 h-5 w-5" /> Save All Changes
            </Button>
        </div>
      </main>
    </div>
  );
}
