import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, Globe, Palette, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EncryptionSettings } from "@/components/EncryptionSettings";

export default function Settings() {
  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="profile">
              <User className="mr-2 hidden md:block" size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 hidden md:block" size={16} />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="mr-2 hidden md:block" size={16} />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="mr-2 hidden md:block" size={16} />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="language">
              <Globe className="mr-2 hidden md:block" size={16} />
              Language
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="mr-2 hidden md:block" size={16} />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-6">
            <Card className="p-6 gradient-card space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">U</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="gradient">Change Photo</Button>
                  <p className="text-sm text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="@username" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="user@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" defaultValue="Content creator and developer" />
                </div>
              </div>

              <Button variant="gradient">Save Changes</Button>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-6">
            <Card className="p-6 gradient-card space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Subscriptions</p>
                  <p className="text-sm text-muted-foreground">Get notified when channels you subscribe to upload</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Recommended Videos</p>
                  <p className="text-sm text-muted-foreground">Get personalized video recommendations</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Comments</p>
                  <p className="text-sm text-muted-foreground">Notify when someone replies to your comments</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <Switch />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 mt-6">
            {/* End-to-End Encryption Settings */}
            <EncryptionSettings />

            <Card className="p-6 gradient-card space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Private Account</p>
                  <p className="text-sm text-muted-foreground">Only approved followers can see your videos</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Watch History</p>
                  <p className="text-sm text-muted-foreground">Save videos you watch</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Search History</p>
                  <p className="text-sm text-muted-foreground">Save your search queries</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button variant="outline">Clear History</Button>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-6">
            <Card className="p-6 gradient-card space-y-6">
              <div>
                <p className="font-medium mb-4">Theme</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20">Dark Mode</Button>
                  <Button variant="outline" className="h-20" disabled>Light Mode (Coming Soon)</Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autoplay Videos</p>
                  <p className="text-sm text-muted-foreground">Automatically play next video</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Animations</p>
                  <p className="text-sm text-muted-foreground">Enable smooth animations</p>
                </div>
                <Switch defaultChecked />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="language" className="space-y-4 mt-6">
            <Card className="p-6 gradient-card space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="region">Region</Label>
                <select
                  id="region"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>India</option>
                </select>
              </div>

              <Button variant="gradient">Save Changes</Button>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4 mt-6">
            <Card className="p-6 gradient-card space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Current Plan</h3>
                <p className="text-muted-foreground">Free Plan - Upgrade for premium features</p>
              </div>

              <div className="grid gap-4">
                <Button variant="gradient" size="lg">Upgrade to Premium</Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>✓ Ad-free experience</div>
                  <div>✓ 4K video quality</div>
                  <div>✓ Background playback</div>
                  <div>✓ Early access to features</div>
                  <div>✓ Priority support</div>
                  <div>✓ Custom badges</div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
