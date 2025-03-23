
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PlayerImageUpload from "./PlayerImageUpload";

// Form validation schema - simplified to match DB schema
const playerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

interface PlayerEditFormProps {
  initialValues: {
    name: string;
    position?: string;
    imageUrl?: string | null;
  };
  onSubmit: (values: PlayerFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const positions = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
  "Center Back",
  "Full Back",
  "Wing Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Winger",
  "Striker",
];

const PlayerEditForm = ({ initialValues, onSubmit, isSubmitting }: PlayerEditFormProps) => {
  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: initialValues,
  });

  const handleSubmit = async (values: PlayerFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PlayerImageUpload 
                  imageUrl={field.value || null} 
                  onImageChange={(url) => field.onChange(url)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Player name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Player"}
        </Button>
      </form>
    </Form>
  );
};

export default PlayerEditForm;
