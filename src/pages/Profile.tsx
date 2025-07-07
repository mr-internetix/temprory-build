import React, { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
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
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Icon } from "@iconify/react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    jobTitle: "Research Analyst",
    department: "Market Research",
    company: "Ipsos Group",
    bio: "Experienced market research analyst with 5+ years in survey design and data generation. Specialized in consumer behavior studies and statistical analysis.",
    timezone: "America/New_York",
    language: "en",
    avatar: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    marketingEmails: false,
    autoSave: true,
    darkMode: false,
  });

  const activityStats = [
    { label: "Total Requests", value: 247, icon: "heroicons:document-text" },
    { label: "Completed", value: 198, icon: "heroicons:check-circle" },
    { label: "Success Rate", value: "94.3%", icon: "heroicons:chart-bar" },
    { label: "Avg. Response Time", value: "2.4s", icon: "heroicons:clock" },
  ];

  const recentActivity = [
    {
      action: "Created request",
      details: "Customer Satisfaction Survey v2",
      time: "2 hours ago",
      status: "completed",
    },
    {
      action: "Uploaded MDD file",
      details: "product_feedback_questions.mdd",
      time: "1 day ago",
      status: "success",
    },
    {
      action: "Updated test case",
      details: "Q1AllQ2None configuration",
      time: "3 days ago",
      status: "success",
    },
    {
      action: "Generated report",
      details: "Weekly analytics summary",
      time: "1 week ago",
      status: "completed",
    },
  ];

  const handleSave = () => {
    // Save profile logic here
    setIsEditing(false);
    console.log("Profile saved:", profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values if needed
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle avatar upload
      console.log("Uploading avatar:", file.name);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-2 text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Icon icon="heroicons:pencil" className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Icon icon="heroicons:check" className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar} alt={profile.firstName} />
                  <AvatarFallback className="text-xl">
                    {profile.firstName[0]}
                    {profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload">
                      <Button variant="outline" className="cursor-pointer">
                        <Icon
                          icon="heroicons:camera"
                          className="w-4 h-4 mr-2"
                        />
                        Change Photo
                      </Button>
                    </label>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={profile.jobTitle}
                    onChange={(e) =>
                      setProfile({ ...profile, jobTitle: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) =>
                      setProfile({ ...profile, department: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) =>
                    setProfile({ ...profile, company: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={profile.timezone}
                    onValueChange={(value) =>
                      setProfile({ ...profile, timezone: value })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern Time (UTC-5)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time (UTC-6)
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time (UTC-7)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time (UTC-8)
                      </SelectItem>
                      <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={profile.language}
                    onValueChange={(value) =>
                      setProfile({ ...profile, language: value })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium">Notification Preferences</h4>
                <div className="space-y-3">
                  {[
                    {
                      key: "emailNotifications",
                      label: "Email Notifications",
                      description: "Receive notifications via email",
                    },
                    {
                      key: "pushNotifications",
                      label: "Push Notifications",
                      description: "Receive browser notifications",
                    },
                    {
                      key: "weeklyDigest",
                      label: "Weekly Digest",
                      description: "Weekly summary of your activity",
                    },
                    {
                      key: "marketingEmails",
                      label: "Marketing Emails",
                      description: "Product updates and announcements",
                    },
                  ].map((pref) => (
                    <div
                      key={pref.key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Label>{pref.label}</Label>
                        <p className="text-sm text-gray-500">
                          {pref.description}
                        </p>
                      </div>
                      <Switch
                        checked={
                          preferences[pref.key as keyof typeof preferences]
                        }
                        onCheckedChange={(checked) =>
                          setPreferences({
                            ...preferences,
                            [pref.key]: checked,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Activity */}
        <div className="space-y-6">
          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityStats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon icon={stat.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-600">
                        {stat.label}
                      </span>
                    </div>
                    <Badge variant="secondary">{stat.value}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-600">
                          {activity.details}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <Badge
                        variant={
                          activity.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
