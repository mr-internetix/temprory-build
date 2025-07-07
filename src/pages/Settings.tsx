import React, { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";

export default function Settings() {
  const [generalSettings, setGeneralSettings] = useState({
    autoSave: true,
    autoBackup: false,
    darkMode: false,
    compactView: false,
    enableSounds: true,
    showAdvancedOptions: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "4h",
    emailOnLogin: true,
    strongPasswordRequired: true,
    allowMultipleSessions: false,
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    apiAccess: true,
    webhookEnabled: false,
    exportFormat: "csv",
    maxRequestsPerHour: "100",
    cacheEnabled: true,
  });

  const [storageSettings, setStorageSettings] = useState({
    autoArchive: true,
    archiveAfterDays: "90",
    maxFileSize: "50MB",
    compressionEnabled: true,
    currentUsage: "47.3GB",
    storageLimit: "100GB",
  });

  const apiKeys = [
    {
      id: 1,
      name: "Production API Key",
      key: "sk_live_4567...8901",
      created: "2024-01-15",
      lastUsed: "2 hours ago",
      status: "active",
    },
    {
      id: 2,
      name: "Development API Key",
      key: "sk_test_1234...5678",
      created: "2024-02-01",
      lastUsed: "1 week ago",
      status: "active",
    },
  ];

  const webhooks = [
    {
      id: 1,
      url: "https://api.company.com/webhooks/surveys",
      events: ["request.completed", "request.failed"],
      status: "active",
      lastTriggered: "3 hours ago",
    },
  ];

  const handleSaveSettings = () => {
    console.log("Saving settings...", {
      generalSettings,
      securitySettings,
      integrationSettings,
      storageSettings,
    });
    // Save settings logic here
  };

  const generateApiKey = () => {
    console.log("Generating new API key...");
    // Generate API key logic here
  };

  const revokeApiKey = (id: number) => {
    console.log("Revoking API key:", id);
    // Revoke API key logic here
  };

  const testWebhook = (id: number) => {
    console.log("Testing webhook:", id);
    // Test webhook logic here
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">
              Configure your application preferences and integrations
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={handleSaveSettings}>
              <Icon icon="heroicons:check" className="w-4 h-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    key: "autoSave",
                    label: "Auto Save",
                    description: "Automatically save form data as you type",
                  },
                  {
                    key: "autoBackup",
                    label: "Auto Backup",
                    description: "Create daily backups of your data",
                  },
                  {
                    key: "darkMode",
                    label: "Dark Mode",
                    description: "Switch to dark theme",
                  },
                  {
                    key: "compactView",
                    label: "Compact View",
                    description: "Use smaller spacing and fonts",
                  },
                  {
                    key: "enableSounds",
                    label: "Enable Sounds",
                    description: "Play notification sounds",
                  },
                  {
                    key: "showAdvancedOptions",
                    label: "Advanced Options",
                    description: "Show advanced configuration options",
                  },
                ].map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <Label>{setting.label}</Label>
                      <p className="text-sm text-gray-500">
                        {setting.description}
                      </p>
                    </div>
                    <Switch
                      checked={
                        generalSettings[
                          setting.key as keyof typeof generalSettings
                        ]
                      }
                      onCheckedChange={(checked) =>
                        setGeneralSettings({
                          ...generalSettings,
                          [setting.key]: checked,
                        })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultCompletes">Default Completes</Label>
                  <Input
                    id="defaultCompletes"
                    type="number"
                    defaultValue="10"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="defaultDevice">Default Device Type</Label>
                  <Select defaultValue="desktop">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="defaultScreenshot">Default Screenshot</Label>
                  <Select defaultValue="yes">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication & Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    key: "twoFactorAuth",
                    label: "Two-Factor Authentication",
                    description: "Require 2FA for account access",
                  },
                  {
                    key: "emailOnLogin",
                    label: "Email on Login",
                    description: "Send email notification on login",
                  },
                  {
                    key: "strongPasswordRequired",
                    label: "Strong Password Required",
                    description: "Enforce strong password policy",
                  },
                  {
                    key: "allowMultipleSessions",
                    label: "Multiple Sessions",
                    description: "Allow multiple concurrent sessions",
                  },
                ].map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <Label>{setting.label}</Label>
                      <p className="text-sm text-gray-500">
                        {setting.description}
                      </p>
                    </div>
                    <Switch
                      checked={
                        securitySettings[
                          setting.key as keyof typeof securitySettings
                        ]
                      }
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          [setting.key]: checked,
                        })
                      }
                    />
                  </div>
                ))}

                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout</Label>
                  <Select
                    value={securitySettings.sessionTimeout}
                    onValueChange={(value) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="4h">4 hours</SelectItem>
                      <SelectItem value="8h">8 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password & Recovery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Icon icon="heroicons:key" className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full">
                  <Icon
                    icon="heroicons:shield-check"
                    className="w-4 h-4 mr-2"
                  />
                  Setup 2FA
                </Button>
                <Button variant="outline" className="w-full">
                  <Icon
                    icon="heroicons:arrow-down-tray"
                    className="w-4 h-4 mr-2"
                  />
                  Download Recovery Codes
                </Button>
                <Button variant="outline" className="w-full text-red-600">
                  <Icon icon="heroicons:trash" className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {/* API Settings */}
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="exportFormat">Default Export Format</Label>
                    <Select
                      value={integrationSettings.exportFormat}
                      onValueChange={(value) =>
                        setIntegrationSettings({
                          ...integrationSettings,
                          exportFormat: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxRequests">Max Requests/Hour</Label>
                    <Input
                      id="maxRequests"
                      value={integrationSettings.maxRequestsPerHour}
                      onChange={(e) =>
                        setIntegrationSettings({
                          ...integrationSettings,
                          maxRequestsPerHour: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={integrationSettings.cacheEnabled}
                      onCheckedChange={(checked) =>
                        setIntegrationSettings({
                          ...integrationSettings,
                          cacheEnabled: checked,
                        })
                      }
                    />
                    <Label>Enable Caching</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Keys */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>API Keys</CardTitle>
                  <Button onClick={generateApiKey}>
                    <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
                    Generate New Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{key.name}</h4>
                        <p className="text-sm text-gray-500 font-mono">
                          {key.key}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Created: {key.created}</span>
                          <span>Last used: {key.lastUsed}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{key.status}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revokeApiKey(key.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Webhooks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Webhooks</CardTitle>
                  <Button>
                    <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
                    Add Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium font-mono">{webhook.url}</h4>
                        <p className="text-sm text-gray-500">
                          Events: {webhook.events.join(", ")}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last triggered: {webhook.lastTriggered}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{webhook.status}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testWebhook(webhook.id)}
                        >
                          Test
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Storage Settings */}
        <TabsContent value="storage">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="archiveAfter">
                    Auto-archive after (days)
                  </Label>
                  <Input
                    id="archiveAfter"
                    type="number"
                    value={storageSettings.archiveAfterDays}
                    onChange={(e) =>
                      setStorageSettings({
                        ...storageSettings,
                        archiveAfterDays: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="maxFileSize">Max file size</Label>
                  <Select
                    value={storageSettings.maxFileSize}
                    onValueChange={(value) =>
                      setStorageSettings({
                        ...storageSettings,
                        maxFileSize: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10MB">10 MB</SelectItem>
                      <SelectItem value="25MB">25 MB</SelectItem>
                      <SelectItem value="50MB">50 MB</SelectItem>
                      <SelectItem value="100MB">100 MB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {[
                  {
                    key: "autoArchive",
                    label: "Auto Archive",
                    description: "Automatically archive old requests",
                  },
                  {
                    key: "compressionEnabled",
                    label: "Compression",
                    description: "Compress stored files to save space",
                  },
                ].map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <Label>{setting.label}</Label>
                      <p className="text-sm text-gray-500">
                        {setting.description}
                      </p>
                    </div>
                    <Switch
                      checked={
                        storageSettings[
                          setting.key as keyof typeof storageSettings
                        ]
                      }
                      onCheckedChange={(checked) =>
                        setStorageSettings({
                          ...storageSettings,
                          [setting.key]: checked,
                        })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Current Usage</span>
                    <span>
                      {storageSettings.currentUsage} /{" "}
                      {storageSettings.storageLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "47%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">47% used</p>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Icon
                      icon="heroicons:arrow-down-tray"
                      className="w-4 h-4 mr-2"
                    />
                    Export All Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Icon
                      icon="heroicons:archive-box"
                      className="w-4 h-4 mr-2"
                    />
                    Archive Old Requests
                  </Button>
                  <Button variant="outline" className="w-full text-red-600">
                    <Icon icon="heroicons:trash" className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
