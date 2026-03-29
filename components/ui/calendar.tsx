import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3 pointer-events-auto', className)}
      classNames={
        {
          // ... your existing classNames
        }
      }
      components={{
        Nav: ({ onPreviousClick, onNextClick }) => (
          <>
            <button
              onClick={onPreviousClick}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNextClick}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
