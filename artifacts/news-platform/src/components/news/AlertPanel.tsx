import { useGetAlerts } from "@workspace/api-client-react";
import { AlertTriangle, CloudRain, ShieldAlert, Activity, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatTimeAgo } from "@/lib/utils";

export function AlertPanel() {
  const { data: alerts, isLoading } = useGetAlerts({ location: "Global" });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 glass-panel rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!Array.isArray(alerts) || !alerts.length) {
    return (
      <div className="text-center p-8 glass-panel rounded-2xl text-muted-foreground">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No active alerts in your area</p>
      </div>
    );
  }

  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'weather': return <CloudRain className="w-5 h-5" />;
      case 'traffic': return <MapPin className="w-5 h-5" />;
      case 'safety': return <ShieldAlert className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertStyle = (severity: string) => {
    switch(severity) {
      case 'critical': return 'border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'high': return 'border-orange-500/50 bg-orange-500/10 text-orange-400';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
      default: return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Smart Alerts
      </h3>
      
      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <motion.div 
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "p-4 rounded-xl border backdrop-blur-md relative overflow-hidden",
              getAlertStyle(alert.severity)
            )}
          >
            {alert.severity === 'critical' && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/20 rounded-full blur-xl animate-pulse-glow" />
            )}
            
            <div className="flex gap-3">
              <div className="mt-1">
                {getAlertIcon(alert.type)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-sm text-white">{alert.title}</h4>
                  <span className="text-[10px] uppercase tracking-wider font-bold opacity-70 border border-current px-1.5 rounded">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs opacity-80 mb-2">{alert.message}</p>
                <div className="flex items-center justify-between text-[10px] opacity-60">
                  <span>{alert.location || 'Global'}</span>
                  <span>{formatTimeAgo(alert.timestamp)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
