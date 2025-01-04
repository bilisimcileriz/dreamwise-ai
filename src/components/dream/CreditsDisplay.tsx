import { Coins } from "lucide-react";

interface CreditsDisplayProps {
  credits: number | null;
}

export const CreditsDisplay = ({ credits }: CreditsDisplayProps) => {
  return (
    <div className="flex items-center gap-2 text-purple-200">
      <Coins className="h-5 w-5" />
      <span>{credits ?? 0} credits remaining</span>
    </div>
  );
};