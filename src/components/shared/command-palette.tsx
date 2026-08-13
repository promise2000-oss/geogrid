import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { FileText, LayoutDashboard, Calendar, CircleDollarSign, Bell, Settings, Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { APP_NAME } from "@/lib/config";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const items: CommandItem[] = [
    { id: "dashboard", label: "Go to Dashboard", hint: "g d", icon: <LayoutDashboard className="h-4 w-4" />, run: () => go("/app/dashboard") },
    { id: "assignments", label: "Browse assignments", hint: "g a", icon: <FileText className="h-4 w-4" />, run: () => go("/app/assignments") },
    { id: "calendar", label: "Open calendar", hint: "g c", icon: <Calendar className="h-4 w-4" />, run: () => go("/app/calendar") },
    { id: "payments", label: "View payments & invoices", hint: "g p", icon: <CircleDollarSign className="h-4 w-4" />, run: () => go("/app/payments") },
    { id: "notifications", label: "Open notifications", hint: "g n", icon: <Bell className="h-4 w-4" />, run: () => go("/app/notifications") },
    { id: "settings", label: "Open settings", hint: "g s", icon: <Settings className="h-4 w-4" />, run: () => go("/app/settings/profile") },
    { id: "wa", label: "Message my tutor on WhatsApp", icon: <Search className="h-4 w-4" />, run: () => window.open("https://wa.me/15551234567", "_blank") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] max-w-xl translate-y-0 p-0 sm:rounded-xl" hideCloseButton>
        <Command className="overflow-hidden" shouldFilter={false}>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder={`Search ${APP_NAME}…`}
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">Esc</kbd>
          </div>
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="p-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>
            {items
              .filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
              .map((item) => (
                <Command.Item
                  key={item.id}
                  onSelect={item.run}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm aria-selected:bg-accent"
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.hint && <kbd className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">{item.hint}</kbd>}
                </Command.Item>
              ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}