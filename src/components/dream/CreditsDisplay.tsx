import { Coins, Loader2 } from "lucide-react";

interface CreditsDisplayProps {
  credits: number | null;
  isLoading?: boolean;
}

export const CreditsDisplay = ({ credits, isLoading = false }: CreditsDisplayProps) => {
  console.log("CreditsDisplay: Rendering with credits:", credits, "isLoading:", isLoading);
  
  return (
    <div className="flex items-center gap-2 text-white bg-purple-600/20 px-4 py-2 rounded-lg backdrop-blur-sm">
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-purple-300" />
          <span className="text-purple-100">Loading credits...</span>
        </>
      ) : (
        <>
          <Coins className="h-5 w-5 text-purple-300" />
          <span className="text-purple-100">{credits ?? 0} credits remaining</span>
        </>
      )}
    </div>
  );
};