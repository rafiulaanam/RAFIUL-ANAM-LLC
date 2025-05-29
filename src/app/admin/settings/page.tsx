"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface GeneralSettings {
  storeName: string;
  storeDescription: string;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  currency: string;
}

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<GeneralSettings>({
    storeName: "My E-commerce Store",
    storeDescription: "Your one-stop shop for everything you need",
    supportEmail: "support@example.com",
    supportPhone: "+1 (555) 123-4567",
    maintenanceMode: false,
    allowGuestCheckout: true,
    currency: "USD",
  });

  const handleChange = (
    key: keyof GeneralSettings,
    value: string | boolean
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">General Settings</h1>

      <div className="space-y-6">
        {/* Store Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Store Information</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Store Name
              </label>
              <Input
                value={settings.storeName}
                onChange={(e) =>
                  handleChange("storeName", e.target.value)
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Store Description
              </label>
              <Textarea
                value={settings.storeDescription}
                onChange={(e) =>
                  handleChange("storeDescription", e.target.value)
                }
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Support Email
              </label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) =>
                  handleChange("supportEmail", e.target.value)
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Support Phone
              </label>
              <Input
                value={settings.supportPhone}
                onChange={(e) =>
                  handleChange("supportPhone", e.target.value)
                }
              />
            </div>
          </div>
        </Card>

        {/* Store Settings */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Store Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium">
                  Maintenance Mode
                </label>
                <p className="text-sm text-gray-500">
                  Enable this to put the store in maintenance mode
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) =>
                  handleChange("maintenanceMode", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium">
                  Guest Checkout
                </label>
                <p className="text-sm text-gray-500">
                  Allow customers to check out without an account
                </p>
              </div>
              <Switch
                checked={settings.allowGuestCheckout}
                onCheckedChange={(checked) =>
                  handleChange("allowGuestCheckout", checked)
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Currency
              </label>
              <Input
                value={settings.currency}
                onChange={(e) =>
                  handleChange("currency", e.target.value)
                }
              />
            </div>
          </div>
        </Card>

        <div>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
} 