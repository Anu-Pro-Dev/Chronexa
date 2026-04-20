import { useEffect, useState, useRef } from "react";

interface PunchNotificationOptions {
  minutesBefore?: number[];
  enableBrowserNotifications?: boolean;
  enableSound?: boolean;
  hasPunchedOut?: boolean;
}

interface LastTransaction {
  id: number;
  date: string;
  type: "IN" | "OUT";
}

export function usePunchNotifications(
  lastTransaction: LastTransaction | undefined,
  scheduleHours: number,
  options: PunchNotificationOptions = {}
) {
  const {
    minutesBefore = [30, 15, 5],
    enableBrowserNotifications = true,
    enableSound = true,
    hasPunchedOut = false, 
  } = options;

  const [notifications, setNotifications] = useState<string[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const notifiedMinutes = useRef<Set<number>>(new Set());
  const inOvertimeRef = useRef(false);

  useEffect(() => {
    if (!enableBrowserNotifications) return;

    const requestPermission = async () => {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        setHasPermission(permission === "granted");
      }
    };

    if ("Notification" in window) {
      setHasPermission(Notification.permission === "granted");
    }

    requestPermission();
  }, [enableBrowserNotifications]);

  const playNotificationSound = () => {
    if (!enableSound) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  const showBrowserNotification = (title: string, body: string, isOvertime: boolean = false) => {
    if (!enableBrowserNotifications || !hasPermission) return;

    try {
      const options: NotificationOptions = {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: isOvertime ? "overtime-alert" : "punch-out-reminder",
        requireInteraction: isOvertime, 
      };

      const notification = new Notification(title, options);

      if ('vibrate' in navigator) {
        navigator.vibrate(isOvertime ? [200, 100, 200] : [200]);
      }

      if (!isOvertime) {
        setTimeout(() => notification.close(), 10000);
      }

      playNotificationSound();
    } catch (error) {
      console.error("Error showing browser notification:", error);
    }
  };

  useEffect(() => {
    if (!lastTransaction || lastTransaction.type !== "IN" || hasPunchedOut) {
      return;
    }

    const checkInterval = setInterval(() => {
      const punchInDate = new Date(lastTransaction.date.replace('Z', ''));
      const expectedPunchOut = new Date(
        punchInDate.getTime() + scheduleHours * 60 * 60 * 1000
      );
      const now = new Date();
      const minutesUntilPunchOut = Math.floor(
        (expectedPunchOut.getTime() - now.getTime()) / (1000 * 60)
      );

      const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
      };

      const expectedTimeStr = formatTime(expectedPunchOut);

      if (minutesUntilPunchOut < 0 && !inOvertimeRef.current) {
        inOvertimeRef.current = true;
        const overtimeMinutes = Math.abs(minutesUntilPunchOut);
        const message = `You are now in overtime! Expected punch out was at ${expectedTimeStr}. Current overtime: ${overtimeMinutes} minutes. Please remember to punch out when you finish.`;
        
        setNotifications((prev) => [...prev, message]);
        showBrowserNotification(
          "⚠️ Missed Punch Out!",
          message,
          true
        );
      }

      minutesBefore.forEach((minutes) => {
        const threshold = 2;

        if (
          minutesUntilPunchOut <= minutes &&
          minutesUntilPunchOut >= minutes - threshold &&
          !notifiedMinutes.current.has(minutes)
        ) {
          notifiedMinutes.current.add(minutes);
          
          let message = "";
          let title = "";

          if (minutes === 30) {
            message = `30 minutes until punch out at ${expectedTimeStr}. Start wrapping up your work.`;
            title = "📋 Shift Update";
          } else if (minutes === 15) {
            message = `15 minutes remaining until ${expectedTimeStr}. Please prepare to punch out.`;
            title = "⏱️ 15 Minutes Remaining";
          } else if (minutes === 5) {
            message = `Only 5 minutes left! Time to punch out at ${expectedTimeStr}.`;
            title = "⏰ Time to Punch Out!";
          } else {
            message = `${minutes} minutes until punch out at ${expectedTimeStr}.`;
            title = `⏰ ${minutes} Minutes Remaining`;
          }

          setNotifications((prev) => [...prev, message]);
          showBrowserNotification(title, message);          
        }
      });

      if (
        minutesUntilPunchOut <= 0 &&
        minutesUntilPunchOut >= -1 &&
        !notifiedMinutes.current.has(0) &&
        !inOvertimeRef.current
      ) {
        notifiedMinutes.current.add(0);
        const message = `Your shift has ended! Time to punch out.`;
        
        setNotifications((prev) => [...prev, message]);
        showBrowserNotification(
          "⏰ Shift Ended!",
          message
        );
      }
    }, 30000);

    return () => clearInterval(checkInterval);
  }, [lastTransaction, scheduleHours, minutesBefore, enableBrowserNotifications, enableSound, hasPermission, hasPunchedOut]);

  useEffect(() => {
    notifiedMinutes.current.clear();
    inOvertimeRef.current = false;
    setNotifications([]);
  }, [lastTransaction?.id, hasPunchedOut]);

  return {
    notifications,
    hasPermission,
  };
}