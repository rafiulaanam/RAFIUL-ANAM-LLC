"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
}

export default function PaymentSettingsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: "stripe", name: "Stripe", enabled: true, apiKey: "" },
    { id: "paypal", name: "PayPal", enabled: false, apiKey: "" },
    { id: "cod", name: "Cash on Delivery", enabled: true },
  ]);

  const handleToggle = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) =>
        method.id === id
          ? { ...method, enabled: !method.enabled }
          : method
      )
    );
  };

  const handleApiKeyChange = (id: string, value: string) => {
    setPaymentMethods(
      paymentMethods.map((method) =>
        method.id === id
          ? { ...method, apiKey: value }
          : method
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Payment Settings</h1>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Payment Methods</h2>
        
        <div className="space-y-6">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="space-y-4 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{method.name}</h3>
                <Switch
                  checked={method.enabled}
                  onCheckedChange={() => handleToggle(method.id)}
                />
              </div>

              {method.enabled && "apiKey" in method && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">API Key</label>
                  <Input
                    type="password"
                    value={method.apiKey}
                    onChange={(e) =>
                      handleApiKeyChange(method.id, e.target.value)
                    }
                    placeholder={`Enter ${method.name} API Key`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
} 