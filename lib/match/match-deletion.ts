import { supabase } from "@/lib/supabase-browser";

// Delete a match
export const deleteMatch = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("matches")
    .delete()
    .eq("id", id);

  // As with creating one: a delete the database refused has not happened, and
  // reporting it as done takes the match off the screen until the next read
  // puts it back.
  if (error) throw error;

  return true;
};
