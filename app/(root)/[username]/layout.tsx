import TopNav from "@/shared/components/shared/guest/TopNav";
import SidebarProfile from "@/shared/components/shared/SidebarProfile";



export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex w-full">
      {children}
      <SidebarProfile />
    </main>
  );
};
