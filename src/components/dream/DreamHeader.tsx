import { CreditsDisplay } from "./CreditsDisplay";

interface DreamHeaderProps {
  credits: number | null;
  isLoadingCredits: boolean;
}

export const DreamHeader = ({ credits, isLoadingCredits }: DreamHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-white">Interpret Your Dream</h2>
      <CreditsDisplay credits={credits} isLoading={isLoadingCredits} />
    </div>
  );
};