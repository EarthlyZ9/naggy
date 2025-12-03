import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import clsx from "clsx"

export function TimeDropdownLikeSelect({ field }: { field: any }) {
  const [open, setOpen] = useState(false)
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false)
  const [inputValue, setInputValue] = useState('1200')

  const handleSelect = (val: string) => {
    field.onChange(val)
    setOpen(false)
    setCustomPopoverOpen(false)
  }

  const formatTimeInput = (value: string) => {
    // Remove non-numeric characters
    const numeric = value.replace(/\D/g, '')
    // Limit to 4 digits
    const limited = numeric.slice(0, 4)
    // Format as HH:MM
    if (limited.length <= 2) {
      return limited
    }
    return limited.slice(0, 2) + ':' + limited.slice(2)
  }

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, '')
    setInputValue(numericOnly.slice(0, 4))
  }

  const handleTimeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const hours = parseInt(inputValue.slice(0, 2) || '0', 10)
      const minutes = parseInt(inputValue.slice(2, 4) || '0', 10)

      // Validate time (00:00 to 23:59)
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        handleSelect(formattedTime)
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onClick={() => setOpen(!open)}
          className={clsx(
            "w-full h-10 px-3 flex items-center justify-between border border-input rounded-md text-sm cursor-pointer",
            "bg-background hover:bg-accent transition"
          )}
        >
          <span className={clsx("truncate", field.value ? "text-foreground" : "text-muted-foreground")}>
            {field.value || "Select time"}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[120px] p-0">
        <Command>
          <CommandGroup>
            <CommandItem onSelect={() => handleSelect("10min")}>10min</CommandItem>
            <CommandItem onSelect={() => handleSelect("30min")}>30min</CommandItem>
            <CommandItem onSelect={() => handleSelect("1hour")}>1hour</CommandItem>
            <CommandItem onSelect={() => handleSelect("3hour")}>3hour</CommandItem>
            <div
              onMouseEnter={() => setCustomPopoverOpen(true)}
              onMouseLeave={() => setCustomPopoverOpen(false)}
            >
              <Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className={clsx("relative px-2 py-1.5 text-sm flex items-center justify-between rounded-sm hover:bg-accent hover:text-accent-foreground", customPopoverOpen && "bg-accent text-accent-foreground")}>
                    <span>Custom</span>
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  side="right"
                  align="center"
                  className="w-[120px] p-0"
                  onMouseEnter={() => setCustomPopoverOpen(true)}
                  onMouseLeave={() => setCustomPopoverOpen(false)}
                >
                  <Input
                    type="text"
                    placeholder="HH:MM"
                    value={formatTimeInput(inputValue)}
                    onChange={handleTimeInputChange}
                    onKeyDown={handleTimeInputKeyDown}
                    className="w-[90px] h-8 text-xs text-center"
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}