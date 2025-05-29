"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ShippingZone {
  id: string;
  name: string;
  rate: number;
}

export default function ShippingSettingsPage() {
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([
    { id: "1", name: "Domestic", rate: 10 },
    { id: "2", name: "International", rate: 25 },
  ]);

  const [newZone, setNewZone] = useState({ name: "", rate: "" });

  const handleAddZone = () => {
    if (newZone.name && newZone.rate) {
      setShippingZones([
        ...shippingZones,
        {
          id: Date.now().toString(),
          name: newZone.name,
          rate: parseFloat(newZone.rate),
        },
      ]);
      setNewZone({ name: "", rate: "" });
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Shipping Settings</h1>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Shipping Zones</h2>
        
        <div className="mb-6 space-y-4">
          {shippingZones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <h3 className="font-medium">{zone.name}</h3>
                <p className="text-sm text-gray-500">
                  Rate: ${zone.rate.toFixed(2)}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() =>
                  setShippingZones(
                    shippingZones.filter((z) => z.id !== zone.id)
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Add New Shipping Zone</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Zone Name"
              value={newZone.name}
              onChange={(e) =>
                setNewZone({ ...newZone, name: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Rate"
              value={newZone.rate}
              onChange={(e) =>
                setNewZone({ ...newZone, rate: e.target.value })
              }
            />
          </div>
          <Button onClick={handleAddZone}>Add Zone</Button>
        </div>
      </Card>
    </div>
  );
} 