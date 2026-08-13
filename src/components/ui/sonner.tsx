import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/lib/theme";

export function Toaster() {
  const { resolved } = useTheme();
  return (
    <SonnerToaster
      theme={resolved}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "rounded-md border shadow-md",
        },
      }}
    />
  );
}