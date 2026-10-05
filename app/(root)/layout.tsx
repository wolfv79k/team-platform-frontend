import TopNav from "@/shared/components/shared/TopNav";



export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <TopNav className="fixed w-full"/>
      {children}
    </main>
  );
};
