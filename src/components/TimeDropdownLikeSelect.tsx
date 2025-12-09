import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { TIME_PRESETS } from '@/types';

export function TimeDropdownLikeSelect({ field }: { field: any }) {
  const [open, setOpen] = useState(false);
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState('1200');
  const [isInvalid, setIsInvalid] = useState(false);

  const handleSelect = (val: string) => {
    field.onChange(val);
    setOpen(false);
    setCustomPopoverOpen(false);
    setIsInvalid(false);
  };

  const formatTimeInput = (value: string) => {
    // Remove non-numeric characters
    const numeric = value.replace(/\D/g, '');
    // Limit to 4 digits
    const limited = numeric.slice(0, 4);
    // Format as HH:MM
    if (limited.length <= 2) {
      return limited;
    }
    return limited.slice(0, 2) + ':' + limited.slice(2);
  };

  const validateTime = (value: string): boolean => {
    if (value.length < 4) return false;

    const hours = parseInt(value.slice(0, 2) || '0', 10);
    const minutes = parseInt(value.slice(2, 4) || '0', 10);

    return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, '');
    const limited = numericOnly.slice(0, 4);
    setInputValue(limited);

    if (limited.length === 4) {
      setIsInvalid(!validateTime(limited));
    } else {
      setIsInvalid(false);
    }
  };

  const handleTimeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isInvalid === false) {
      const hours = parseInt(inputValue.slice(0, 2) || '0', 10);
      const minutes = parseInt(inputValue.slice(2, 4) || '0', 10);

      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      handleSelect(formattedTime);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onClick={() => setOpen(!open)}
          className={clsx(
            'w-full h-10 px-3 flex items-center justify-between border border-input rounded-md text-sm cursor-pointer',
            'bg-background hover:bg-accent transition'
          )}
        >
          <span
            className={clsx('truncate', field.value ? 'text-foreground' : 'text-muted-foreground')}
          >
            {field.value || 'Select time'}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[120px] p-0">
        <Command>
          <CommandGroup>
            <CommandItem onSelect={() => handleSelect(TIME_PRESETS.TEN_MIN)}>
              {TIME_PRESETS.TEN_MIN}
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(TIME_PRESETS.THIRTY_MIN)}>
              {TIME_PRESETS.THIRTY_MIN}
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(TIME_PRESETS.ONE_HOUR)}>
              {TIME_PRESETS.ONE_HOUR}
            </CommandItem>
            <CommandItem onSelect={() => handleSelect(TIME_PRESETS.THREE_HOUR)}>
              {TIME_PRESETS.THREE_HOUR}
            </CommandItem>
            <div
              onMouseEnter={() => setCustomPopoverOpen(true)}
              onMouseLeave={() => setCustomPopoverOpen(false)}
            >
              <Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
                <PopoverTrigger asChild>
                  <div
                    className={clsx(
                      'relative px-2 py-1.5 text-sm flex items-center justify-between rounded-sm hover:bg-accent hover:text-accent-foreground',
                      customPopoverOpen && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <span>Custom</span>
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  side="right"
                  align="center"
                  className="p-0 w-[90px]"
                  onMouseEnter={() => setCustomPopoverOpen(true)}
                  onMouseLeave={() => setCustomPopoverOpen(false)}
                >
                  <Input
                    type="text"
                    placeholder="HH:MM"
                    value={formatTimeInput(inputValue)}
                    onChange={handleTimeInputChange}
                    onKeyDown={handleTimeInputKeyDown}
                    className={clsx(
                      'w-inherit h-8 text-xs text-center',
                      isInvalid && 'border-red-400 focus-visible:ring-red-400 focus-visible:ring-2'
                    )}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
