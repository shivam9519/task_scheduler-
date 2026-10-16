import React from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Clock, 
  CheckCheck, 
  Trash2, 
  Volume2, 
  VolumeX,
  Flame,
  ArrowRight
} from 'lucide-react';
import { NotificationItem, Task } from '../types.ts';
import { soundService } from '../utils/audio.ts';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  tasks: Task[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onSnoozeNotification: (id: string, minutes: number) => void;
  onNavigateToTask?: (taskId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  tasks,
  onMarkAsRead,
  onClearAll,
  onSnoozeNotification,
  onNavigateToTask,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getPriorityStyle = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'critical':
        return {
          icon: <Flame className="w-4 h-4 text-rose-600" />,
          border: 'border-rose-200 bg-rose-50/30',
          badge: 'text-rose-700 font-semibold',
          label: 'Critical Alert',
        };
      case 'high':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          border: 'border-amber-200 bg-amber-50/20',
          badge: 'text-amber-700 font-medium',
          label: 'High Priority',
        };
      case 'medium':
      default:
        return {
          icon: <Clock className="w-4 h-4 text-indigo-600" />,
          border: 'border-slate-200 bg-white',
          badge: 'text-indigo-700',
          label: 'Notification',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Priority Notifications
              </h2>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundService.playChime('upcoming');
              }}
              aria-label={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-indigo-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications panel"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action bar */}
        <div className="px-6 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-white">
          <span className="font-medium text-slate-700">Notification Feed</span>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2 mt-8">
              <CheckCheck className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="text-sm font-semibold text-slate-700">All notifications caught up</p>
              <p className="text-xs text-slate-400">
                You will be notified for upcoming deadlines and schedule shifts.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const style = getPriorityStyle(item.priority);
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${style.border} ${
                    !item.isRead ? 'shadow-xs ring-1 ring-slate-900/5' : 'opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{style.icon}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={style.badge}>{style.label}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-400 font-mono tabular-nums">{item.timestamp}</span>
                          {item.scheduledTime && (
                            <>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span className="font-mono tabular-nums text-slate-600 font-medium">
                                {item.scheduledTime}
                              </span>
                            </>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h4>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>

                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => onSnoozeNotification(item.id, 15)}
                      className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
                    >
                      Snooze 15m
                    </button>

                    <div className="flex items-center gap-3">
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={() => onMarkAsRead(item.id)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                          Mark Read
                        </button>
                      )}

                      {item.taskId && onNavigateToTask && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigateToTask(item.taskId!);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-slate-700 hover:text-indigo-600 font-medium transition-colors"
                        >
                          <span>View Task</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
