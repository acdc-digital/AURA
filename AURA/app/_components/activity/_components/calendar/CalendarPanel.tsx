// CALENDAR PANEL COMPONENT - Sidebar panel for calendar following AURA patterns
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/activity/_components/calendar/CalendarPanel.tsx

"use client";

import { DashCalendarConsole } from '@/app/_components/dashboard/_components/calendarTab/DashCalendarConsole';

interface CalendarPanelProps {
  className?: string;
}

export default function CalendarPanel({ className = "" }: CalendarPanelProps) {
  return (
    <div className={`h-full flex flex-col ${className}`}>
      <DashCalendarConsole />
    </div>
  );
}
