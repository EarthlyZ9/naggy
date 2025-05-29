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
  const [customTime, setCustomTime] = useState("12:00")

  const handleSelect = (val: string) => {
    field.onChange(val)
    setOpen(false)
    setCustomPopoverOpen(false)
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

      <PopoverContent className="w-60 p-0">
        <Command>
          <CommandGroup heading="Preset">
            <CommandItem onSelect={() => handleSelect("10")}>T-10min</CommandItem>
            <CommandItem onSelect={() => handleSelect("30")}>T-30min</CommandItem>
            <CommandItem onSelect={() => handleSelect("60")}>T-1hour</CommandItem>
            <CommandItem onSelect={() => handleSelect("180")}>T-3hour</CommandItem>
          </CommandGroup>

          <CommandGroup heading="Custom Time">
            <Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
              <PopoverTrigger asChild>
                <div
                  onMouseEnter={() => setCustomPopoverOpen(true)}
                  onMouseLeave={() => setCustomPopoverOpen(false)}
                  className="relative px-4 py-2 text-sm flex items-center justify-between cursor-pointer"
                >
                  <span>Custom</span>
                </div>
              </PopoverTrigger>

              <PopoverContent side="right" align="center" className="w-auto">
                <Input
                  type="time"
                  value={customTime}
                  onChange={(e) => {
                    setCustomTime(e.target.value)
                    handleSelect(`Custom: ${e.target.value}`)
                  }}
                  className="w-[90px] h-8 text-xs"
                />
              </PopoverContent>
            </Popover>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}