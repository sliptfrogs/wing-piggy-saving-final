import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "inline-flex items-center justify-center rounded-lg",
          "h-8 w-8 bg-secondary/80 border border-border/50 text-muted-foreground",
          "hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all duration-200",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-medium text-[0.75rem] uppercase tracking-wider",
        row: "flex w-full mt-1",
        cell: cn(
          "relative h-9 w-9 text-center text-sm p-0",
          "focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected])]:rounded-lg",
          "[&:has([aria-selected].day-outside)]:bg-primary/5",
          "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg",
          "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal rounded-lg inline-flex items-center justify-center",
          "text-foreground/80 hover:bg-primary/15 hover:text-primary transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-0",
          "aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-primary text-primary-foreground font-semibold",
          "hover:bg-primary hover:text-primary-foreground",
          "focus:bg-primary focus:text-primary-foreground",
          "shadow-[0_0_12px_hsl(var(--primary)/0.4)]",
        ),
        day_today: cn(
          "bg-accent/20 text-accent font-semibold",
          "border border-accent/30",
        ),
        day_outside: "day-outside text-muted-foreground/30 aria-selected:bg-primary/5 aria-selected:text-muted-foreground/50",
        day_disabled: "text-muted-foreground/25 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground/25",
        day_range_middle: "aria-selected:bg-primary/10 aria-selected:text-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
