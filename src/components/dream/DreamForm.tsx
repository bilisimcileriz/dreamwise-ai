import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DreamInput } from "./DreamInput";
import { InterpretationDisplay } from "./InterpretationDisplay";
import { SubmitButton } from "./SubmitButton";
import { useCredits } from "@/hooks/useCredits";
import { useDreamSubmission } from "@/hooks/useDreamSubmission";
import { DreamHeader } from "./DreamHeader";
import { toast } from "@/hooks/use-toast";

interface DreamFormProps {
  userId: string;
}

export const DreamForm = ({ userId }: DreamFormProps) => {
  const [dream, setDream] = useState("");
  const { credits, isLoading: isLoadingCredits, deductCredit } = useCredits(userId);
  const { interpretation, isLoading, submitDream } = useDreamSubmission(userId, deductCredit);

  const handleDreamSubmit = async () => {
    if (credits < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to interpret a dream",
        variant: "destructive",
      });
      return;
    }
    await submitDream(dream);
  };

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-lg border-purple-500/20">
      <DreamHeader credits={credits} isLoadingCredits={isLoadingCredits} />

      <div className="space-y-4">
        <DreamInput dream={dream} onChange={setDream} />
        <SubmitButton
          isLoading={isLoading}
          disabled={credits < 1 || isLoadingCredits}
          onClick={handleDreamSubmit}
        />
      </div>

      <InterpretationDisplay interpretation={interpretation} />
    </Card>
  );
};