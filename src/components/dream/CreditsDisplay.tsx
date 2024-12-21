import { Coins, Loader2 } from "lucide-react";

interface CreditsDisplayProps {
  credits: number | null;
  isLoading?: boolean;
}

export const CreditsDisplay = ({ credits, isLoading = false }: CreditsDisplayProps) => {
  return (
    <div className="flex items-center gap-2 text-purple-200">
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading credits...</span>
        </>
      ) : (
        <>
          <Coins className="h-5 w-5" />
          <span>{credits ?? 0} credits remaining</span>
        </>
      )}
    </div>
  );
};