interface InterpretationDisplayProps {
  interpretation: string;
}

export const InterpretationDisplay = ({ interpretation }: InterpretationDisplayProps) => {
  if (!interpretation) return null;
  
  return (
    <div className="mt-6 p-4 bg-white/5 rounded-lg border border-purple-500/30">
      <h3 className="text-lg font-semibold text-purple-200 mb-2">
        Dream Interpretation
      </h3>
      <p className="text-white whitespace-pre-wrap">{interpretation}</p>
    </div>
  );
};