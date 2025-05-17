
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Utensils, ArrowLeft, Palette, ShieldCheck, ImageUp, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, ChangeEvent } from "react";
import Image from 'next/image'; // Import next/image

const LOCAL_STORAGE_PREFIX = "adminSettings_";
const LOGO_STORAGE_KEY = `${LOCAL_STORAGE_PREFIX}logoDataUrl`;

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [siteName, setSiteName] = useState("IIIT Mess");
    const [defaultCurrency, setDefaultCurrency] = useState("INR");
    const [primaryColor, setPrimaryColor] = useState("#4CAF50"); 
    const [sessionTimeout, setSessionTimeout] = useState(30);
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const [isLoadingLogo, setIsLoadingLogo] = useState(false);


    // Load settings from localStorage on component mount
    useEffect(() => {
        const loadedSiteName = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}siteName`);
        if (loadedSiteName) {
            setSiteName(loadedSiteName);
            document.title = loadedSiteName;
        }

        const loadedCurrency = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}defaultCurrency`);
        if (loadedCurrency) setDefaultCurrency(loadedCurrency);
        
        const loadedPrimaryColor = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}primaryColor`);
        if (loadedPrimaryColor) {
            setPrimaryColor(loadedPrimaryColor);
            // Apply color on load if it was saved
            document.documentElement.style.setProperty('--primary', loadedPrimaryColor);
        }
        
        const loadedSessionTimeout = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}sessionTimeout`);
        if (loadedSessionTimeout) setSessionTimeout(parseInt(loadedSessionTimeout, 10));

        const loadedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
        if (loadedLogo) {
            setLogoDataUrl(loadedLogo);
            // To make this logo appear in the main header, the header component
            // would need to be a client component and read this from localStorage on mount.
            // Example: document.dispatchEvent(new CustomEvent('logoUpdated', { detail: loadedLogo }));
        }

    }, []);

    const handlePrimaryColorChange = (color: string) => {
        setPrimaryColor(color);
        document.documentElement.style.setProperty('--primary', color);
    }

    const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoadingLogo(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoDataUrl(reader.result as string);
                setIsLoadingLogo(false);
            };
            reader.onerror = () => {
                toast({ title: "Error", description: "Failed to read logo file.", variant: "destructive" });
                setIsLoadingLogo(false);
            }
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setLogoDataUrl(null);
        // Optionally, also remove from localStorage immediately or wait for save
        // localStorage.removeItem(LOGO_STORAGE_KEY); 
    };

    const handleSaveChanges = () => {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}siteName`, siteName);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}defaultCurrency`, defaultCurrency);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}primaryColor`, primaryColor);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}sessionTimeout`, String(sessionTimeout));
        
        if (logoDataUrl) {
            localStorage.setItem(LOGO_STORAGE_KEY, logoDataUrl);
            // Dispatch event if other components need to react to logo change
            // document.dispatchEvent(new CustomEvent('logoUpdated', { detail: logoDataUrl }));
        } else {
            localStorage.removeItem(LOGO_STORAGE_KEY);
            // document.dispatchEvent(new CustomEvent('logoUpdated', { detail: null }));
        }
        
        document.title = siteName;
        // Primary color is already applied dynamically on change

        toast({
            title: "Settings Saved",
            description: "Your changes have been saved",
        });
    };

  return (
    <div className="flex min-h-screen bg-secondary">
      <aside className="w-64 bg-card text-card-foreground p-4 space-y-6 shadow-lg">
        <div className="flex items-center gap-2 text-primary">
          {/* Potential place for admin panel logo if needed, driven by localStorage or context */}
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
                    </div>
                </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> Appearance</CardTitle>
                    <CardDescription>Customize the look and feel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="logoUpload" className="flex items-center gap-2">
                            <ImageUp className="h-4 w-4"/> Upload Logo
                        </Label>
                        <Input 
                            id="logoUpload" 
                            type="file" 
                            accept="image/png, image/jpeg, image/svg+xml, image/webp"
                            onChange={handleLogoChange} 
                            className="mt-1"
                            disabled={isLoadingLogo}
                        />
                        {isLoadingLogo && <Loader2 className="mt-2 h-5 w-5 animate-spin" />}
                         <p className="text-xs text-muted-foreground mt-1">Recommended: Transparent PNG/SVG. Max 1MB.</p>
                         {logoDataUrl && (
                            <div className="mt-4 space-y-2">
                                <Label>Current Logo Preview:</Label>
                                <div className="border rounded-md p-2 inline-block bg-muted max-w-[200px]">
                                  <Image src={logoDataUrl} alt="Uploaded logo preview" width={150} height={50} style={{ objectFit: 'contain', maxHeight: '50px' }} />
                                </div>
                                <Button onClick={handleRemoveLogo} variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="mr-1 h-4 w-4" /> Remove Logo
                                </Button>
                            </div>
                         )}
                    </div>
                    <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <Input id="primaryColor" type="color" value={primaryColor} onChange={(e) => handlePrimaryColorChange(e.target.value)} className="h-10 w-full" />
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
            <Button onClick={handleSaveChanges} disabled={isLoadingLogo}>
                {isLoadingLogo ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {isLoadingLogo ? "Processing Logo..." : "Save All Changes"}
            </Button>
        </div>
      </main>
    </div>
  );
}

