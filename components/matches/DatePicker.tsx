import { useId } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label?: string;
}

const DatePicker = ({ date, setDate, label = "Date" }: DatePickerProps) => {
  // The control owns its label so the two can be associated. A caller that
  // wrote its own <label> alongside would have nothing to point it at, and
  // would stack a second caption above this one.
  const id = useId();

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            // Moving focus into the calendar is the point of opening it — a
            // keyboard user would otherwise be left behind on the trigger.
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            selected={date}
            onSelect={setDate}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
