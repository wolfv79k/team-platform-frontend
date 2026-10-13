import { Container } from "@/shared/components/shared/Container";
import Sidebar from "@/shared/components/shared/Sidebar";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Container>
        <Sidebar />
        {children}
      </Container>
    </main>
  );
};