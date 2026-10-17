import { Container } from "@/shared/components/shared/Container";
import Sidebar from "@/shared/components/shared/SidebarRoot";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Container className="flex">
        <Sidebar />
        {children}
      </Container>
    </main>
  );
};