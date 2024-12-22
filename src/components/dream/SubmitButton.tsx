import { Button } from "@/components/ui/button";
import { LoadingState } from "./LoadingState";

interface SubmitButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const SubmitButton = ({ isLoading, disabled, onClick }: SubmitButtonProps) => (
  <Button
    onClick={onClick}
    className="w-full bg-purple-600 hover:bg-purple-700"
    disabled={disabled || isLoading}
  >
    {isLoading ? (
      <LoadingState message="Interpreting..." />
    ) : (
      "Interpret Dream (1 credit)"
    )}
  </Button>
);