import TopNav from "@/shared/components/shared/guest/TopNav";



export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <TopNav className="fixed w-full" />
      {children}
    </main>
  );
};