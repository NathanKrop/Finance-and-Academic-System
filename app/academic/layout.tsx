import { AcademicShell } from "@/components/academic/AcademicShell";
import { RegistrationProvider } from "@/components/academic/registration/RegistrationProvider";

export default function AcademicLayout({ children }: { children: React.ReactNode }) {
  return (
    <RegistrationProvider>
      <AcademicShell>{children}</AcademicShell>
    </RegistrationProvider>
  );
}