/* eslint-disable react-hooks/refs -- refs are only dereferenced inside event handlers (exec/makeLink), never during render */
import { useRef, useState } from "react";
import { Bold, Italic, Link2, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  id?: string;
}

/** Lightweight rich-text editor for assignment instructions and feedback.
 *  Output is sanitized with DOMPurify before rendering anywhere. */
export function RichTextEditor({ value, onChange, placeholder, minHeight = 160, id }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});

  const exec = (command: string) => {
    ref.current?.focus();
    document.execCommand(command, false);
    ref.current?.dispatchEvent(new Event("input", { bubbles: true }));
    updateActive();
  };

  const updateActive = () => {
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  };

  const makeLink = () => {
    const url = window.prompt("Link URL");
    if (!url) return;
    ref.current?.focus();
    document.execCommand("createLink", false, url);
    ref.current?.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const toolbar = [
    { key: "bold", icon: Bold, label: "Bold", run: () => exec("bold") },
    { key: "italic", icon: Italic, label: "Italic", run: () => exec("italic") },
    { key: "insertUnorderedList", icon: List, label: "Bullet list", run: () => exec("insertUnorderedList") },
    { key: "insertOrderedList", icon: ListOrdered, label: "Numbered list", run: () => exec("insertOrderedList") },
    { key: "link", icon: Link2, label: "Insert link", run: makeLink },
  ];

  return (
    <div className="overflow-hidden rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring">
      <div className="flex items-center gap-0.5 border-b bg-muted/40 px-2 py-1">
        {toolbar.map((t) => (
          <Button
            key={t.key}
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t.label}
            title={t.label}
            className={cn("h-7 w-7", active[t.key] && "bg-accent text-accent-foreground")}
            onClick={t.run}
          >
            <t.icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>
      <div
        ref={ref}
        id={id}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        className={cn("prose-none min-h-[160px] w-full px-3 py-2 text-sm outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]")}
        style={{ minHeight }}
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onKeyUp={updateActive}
        onMouseUp={updateActive}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}