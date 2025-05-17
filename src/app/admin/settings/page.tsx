
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Utensils, ArrowLeft, Palette, ShieldCheck } from "lucide-react"; // Removed Bell
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const LOCAL_STORAGE_PREFIX = "adminSettings_";

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [siteName, setSiteName] = useState("IIIT Mess"); // Default changed
    const [defaultCurrency, setDefaultCurrency] = useState("INR"); // Default changed to INR
    // Removed enableEmailNotifications and adminNotificationEmail states
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [primaryColor, setPrimaryColor] = useState("#4CAF50"); // Default from globals.css primary HSL
    const [sessionTimeout, setSessionTimeout] = useState(30);


    // Load settings from localStorage on component mount
    useEffect(() => {
        const loadedSiteName = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}siteName`);
        if (loadedSiteName) {
            setSiteName(loadedSiteName);
            document.title = loadedSiteName;
        }

        const loadedCurrency = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}defaultCurrency`);
        if (loadedCurrency) setDefaultCurrency(loadedCurrency);
        
        const loadedMaintenanceMode = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}maintenanceMode`);
        if (loadedMaintenanceMode) setMaintenanceMode(loadedMaintenanceMode === 'true');

        const loadedPrimaryColor = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}primaryColor`);
        if (loadedPrimaryColor) {
            setPrimaryColor(loadedPrimaryColor);
            document.documentElement.style.setProperty('--primary-color-dynamic', loadedPrimaryColor);
        }
        
        const loadedSessionTimeout = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}sessionTimeout`);
        if (loadedSessionTimeout) setSessionTimeout(parseInt(loadedSessionTimeout, 10));

    }, []);

    const handlePrimaryColorChange = (color: string) => {
        setPrimaryColor(color);
        document.documentElement.style.setProperty('--primary', color);
    }

    const handleSaveChanges = () => {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}siteName`, siteName);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}defaultCurrency`, defaultCurrency);
        // Removed saving for email notifications and admin email
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}maintenanceMode`, String(maintenanceMode));
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}primaryColor`, primaryColor);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sessionTimeout`, String(sessionTimeout));
        
        document.title = siteName;
        document.documentElement.style.setProperty('--primary', primaryColor);

        toast({
            title: "Settings Saved",
            description: "Your changes have been saved to local storage and applied for this session.",
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
        </nav>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <header>
          <h2 className="text-3xl font-semibold text-primary">System Settings</h2>
          <p className="text-muted-foreground">Configure general settings for the IIIT Mess.</p>
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
                        <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="e.g., IIIT Mess" />
                    </div>
                    <div>
                        <Label htmlFor="defaultCurrency">Default Currency</Label>
                        <Input id="defaultCurrency" value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} placeholder="e.g., INR, USD" />
                         <p className="text-xs text-muted-foreground mt-1">Note: Changing currency here is for display preference. Actual currency processing is handled elsewhere.</p>
                    </div>
                     <div className="flex items-center justify-between space-x-2 pt-2">
                        <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                            <span>Maintenance Mode</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                            Temporarily disable access for users (simulated).
                            </span>
                        </Label>
                        <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} aria-label="Maintenance mode" />
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings Card Removed */}

            {/* Appearance Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> Appearance</CardTitle>
                    <CardDescription>Customize the look and feel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="logoUpload">Upload Logo</Label>
                        <Input id="logoUpload" type="file" disabled />
                         <p className="text-xs text-muted-foreground mt-1">Recommended size: 200x50px (Upload disabled in prototype).</p>
                    </div>
                    <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <Input id="primaryColor" type="color" value={primaryColor} onChange={(e) => handlePrimaryColorChange(e.target.value)} className="h-10" />
                         <p className="text-xs text-muted-foreground mt-1">Changes apply to the current session. Actual theme change requires editing globals.css.</p>
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
                        <Input id="sessionTimeout" type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(parseInt(e.target.value,10) || 0)} />
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

