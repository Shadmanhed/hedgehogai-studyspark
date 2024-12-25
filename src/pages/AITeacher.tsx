import { AITeacher } from "@/components/AITeacher";
import { Navbar } from "@/components/Navbar";

const AITeacherPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">AI Teacher</h1>
        <AITeacher />
      </main>
    </div>
  );
};

export default AITeacherPage;