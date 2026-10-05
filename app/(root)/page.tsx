import { Button } from "@/shared/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen py-2">
      <h1 className="text-4xl font-bold text-center">Здесь начало твоей IT <br />карьеры</h1>
      <p className="mt-4 text-muted-foreground text-center">Платформа для тех, кто хочет развиваться в IT<br/>через реальные проекты, команды, идеи<br/> и практику.</p>
      <Button variant="default" className="mt-6 text-xl px-8 py-6">Начать</Button>
    </div>
  );
}
