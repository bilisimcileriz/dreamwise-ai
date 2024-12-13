import { Textarea } from "@/components/ui/textarea";

interface DreamInputProps {
  dream: string;
  onChange: (value: string) => void;
}

export const DreamInput = ({ dream, onChange }: DreamInputProps) => {
  return (
    <Textarea
      placeholder="Describe your dream here..."
      value={dream}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[200px] bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
    />
  );
};