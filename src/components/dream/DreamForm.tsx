import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DreamInput } from "./DreamInput";
import { InterpretationDisplay } from "./InterpretationDisplay";
import { SubmitButton } from "./SubmitButton";
import { useDreamSubmission } from "@/hooks/useDreamSubmission";
import { DreamHeader } from "./DreamHeader";

interface DreamFormProps {
  userId: string;
}

export const DreamForm = ({ userId }: DreamFormProps) => {
  const [dream, setDream] = useState("");
  const { interpretation, isLoading, submitDream } = useDreamSubmission(userId);

  const handleDreamSubmit = async () => {
    await submitDream(dream);
  };

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-lg border-purple-500/20">
      <DreamHeader />

      <div className="space-y-4">
        <DreamInput dream={dream} onChange={setDream} />
        <SubmitButton
          isLoading={isLoading}
          disabled={isLoading}
          onClick={handleDreamSubmit}
        />
      </div>

      <InterpretationDisplay interpretation={interpretation} />
    </Card>
  );
};