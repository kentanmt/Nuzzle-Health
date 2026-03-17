import { motion } from 'framer-motion';
import { Bluetooth, Wifi, Battery, BatteryLow, BatteryMedium, BatteryFull, CheckCircle, AlertCircle, Plus, Watch, Smartphone, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'collar' | 'tag' | 'scale' | 'feeder' | 'camera';
  brand: string;
  status: 'connected' | 'disconnected' | 'low-battery';
  battery: number;
  lastSync: string;
  icon: typeof Watch;
  dataTypes: string[];
}

const mockDevices: ConnectedDevice[] = [
  {
    id: '1',
    name: "FitBark GPS Collar",
    type: 'collar',
    brand: 'FitBark',
    status: 'connected',
    battery: 82,
    lastSync: '2 min ago',
    icon: Watch,
    dataTypes: ['Activity', 'Sleep', 'Location'],
  },
  {
    id: '2',
    name: 'Petivity Smart Litter Monitor',
    type: 'scale',
    brand: 'Petivity',
    status: 'connected',
    battery: 100,
    lastSync: '15 min ago',
    icon: Smartphone,
    dataTypes: ['Weight', 'Frequency'],
  },
  {
    id: '3',
    name: 'Fi Series 3 Collar',
    type: 'tag',
    brand: 'Fi',
    status: 'low-battery',
    battery: 12,
    lastSync: '1 hr ago',
    icon: Tag,
    dataTypes: ['Location', 'Steps'],
  },
];

function BatteryIcon({ level }: { level: number }) {
  if (level <= 20) return <BatteryLow className="h-4 w-4 text-score-elevated" />;
  if (level <= 50) return <BatteryMedium className="h-4 w-4 text-score-watch" />;
  return <BatteryFull className="h-4 w-4 text-score-optimal" />;
}

function StatusBadge({ status }: { status: ConnectedDevice['status'] }) {
  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-score-optimal/10 px-2 py-0.5 text-[10px] font-semibold text-score-optimal">
        <CheckCircle className="h-3 w-3" /> Connected
      </span>
    );
  }
  if (status === 'low-battery') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-score-elevated/10 px-2 py-0.5 text-[10px] font-semibold text-score-elevated">
        <AlertCircle className="h-3 w-3" /> Low Battery
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      <Bluetooth className="h-3 w-3" /> Disconnected
    </span>
  );
}

interface ConnectedDevicesProps {
  isRealPet?: boolean;
  petName?: string;
}

export function ConnectedDevices({ isRealPet = false, petName }: ConnectedDevicesProps) {
  const devices = isRealPet ? [] : mockDevices;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-foreground flex items-center gap-2">
          <Wifi className="h-5 w-5 text-primary" />
          Connected Devices
        </h3>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <Plus className="h-3.5 w-3.5" /> Add Device
        </Button>
      </div>

      {devices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 flex flex-col items-center text-center gap-3"
        >
          <div className="h-14 w-14 rounded-2xl bg-sage-light flex items-center justify-center">
            <Wifi className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No devices connected{petName ? ` for ${petName}` : ''}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Connect a smart collar, GPS tracker, or activity monitor to automatically track {petName || 'your pet'}'s activity, sleep, and location.
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground bg-secondary/50 rounded-full px-3 py-1">
            Device integrations coming soon
          </p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device, i) => {
            const Icon = device.icon;
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{device.name}</p>
                      <p className="text-xs text-muted-foreground">{device.brand}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <StatusBadge status={device.status} />
                  <div className="flex items-center gap-1.5">
                    <BatteryIcon level={device.battery} />
                    <span className="text-xs font-medium text-muted-foreground">{device.battery}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex flex-wrap gap-1">
                    {device.dataTypes.map(dt => (
                      <span key={dt} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {dt}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    Synced {device.lastSync}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
