import { Input } from '@/components/ui/input';
import { useState, forwardRef, useEffect } from 'react';
import clsx from 'clsx';

interface TimeInputProps {
  initialTime: string;
  onBlur?: (time: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  autoFocus?: boolean;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  ({ initialTime, onBlur, onKeyDown, className, autoFocus }, ref) => {
    const [value, setValue] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);

    useEffect(() => {
      // Convert ISO date string to HH:MM format
      const localTime = new Date(initialTime);
      const hours = localTime.getHours().toString().padStart(2, '0');
      const minutes = localTime.getMinutes().toString().padStart(2, '0');
      setValue(`${hours}:${minutes}`);
    }, [initialTime]);

    const formatTimeInput = (input: string): string => {
      // Remove all non-numeric characters
      const numeric = input.replace(/\D/g, '');
      // Limit to 4 digits
      const limited = numeric.slice(0, 4);

      // Format as HH:MM
      if (limited.length === 0) return '';
      if (limited.length <= 2) return limited;
      return limited.slice(0, 2) + ':' + limited.slice(2);
    };

    const validateTime = (timeStr: string): boolean => {
      // Check if format is HH:MM
      if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;

      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
    };

    const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatTimeInput(e.target.value);
      setValue(formatted);

      // Validate only when we have complete time (HH:MM format)
      if (formatted.length === 5) {
        setIsInvalid(!validateTime(formatted));
      } else {
        setIsInvalid(false);
      }
    };

    const handleBlur = () => {
      if (onBlur && validateTime(value)) {
        onBlur(value);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        placeholder="HH:MM"
        value={value}
        onChange={handleTimeInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={clsx(
          'text-xs text-center',
          isInvalid && 'border-red-400 focus-visible:ring-red-400 focus-visible:ring-2',
          className
        )}
        autoFocus={autoFocus}
      />
    );
  }
);

TimeInput.displayName = 'TimeInput';
