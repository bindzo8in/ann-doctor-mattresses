import { auth } from "@/auth";
import { FilterSidebar } from "@/components/home/filter-sidebar";

export default async function Home() {
  const session = await auth()
  console.log(session)
  return (
    <main>
      <FilterSidebar />
    </main>
  );
}
