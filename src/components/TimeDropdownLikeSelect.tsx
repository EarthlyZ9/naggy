import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { TimeInput } from './TimeInput';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { TIME_PRESETS } from '@/types';

export function TimeDropdownLikeSelect({ field }: { field: any }) {
  const [open, setOpen] = useState(false);
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false);

  const handleSelect = (val: string) => {
    field.onChange(val);
    setOpen(false);
    setCustomPopoverOpen(false);
  };

  const handleCustomTimeBlur = (time: string) => {
    if (time) {
      handleSelect(time);
    }
  };

  const handleCustomTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
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
                  <TimeInput
                    initialTime={new Date().toISOString()}
                    onBlur={handleCustomTimeBlur}
                    onKeyDown={handleCustomTimeKeyDown}
                    className="w-inherit h-8"
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
