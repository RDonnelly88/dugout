import AddEditPlayer from "@/components/players/AddEditPlayer";

/**
 * Add and edit share one form. Which mode it is follows from whether the route
 * carries an `id`, so this page and `players/edit/[id]` render the same
 * component and let it read the params.
 */
export default function AddPlayerPage() {
  return <AddEditPlayer />;
}
