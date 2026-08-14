
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import PlayerImageUpload from "./PlayerImageUpload";

// Form validation schema - simplified to match DB schema
const playerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

interface PlayerEditFormProps {
  initialValues: {
    name: string;
    imageUrl?: string | null;
    isActive?: boolean;
  };
  onSubmit: (values: PlayerFormValues) => Promise<void>;
  isSubmitting: boolean;
}

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
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Active Player
                </FormLabel>
                <FormDescription>
                  Active players appear first when creating matches
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
