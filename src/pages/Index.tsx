import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { InterpretationService } from "@/components/dream/services/InterpretationService";
import { Brain, Sparkles, Star } from "lucide-react";

const Index = () => {
  const [dreamText, setDreamText] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamText.trim()) {
      toast({
        title: "Please enter your dream",
        description: "Share your dream with us to receive an interpretation",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await InterpretationService.interpretDream(dreamText);
      setInterpretation(result);
      toast({
        title: "Dream Interpreted",
        description: "Your dream has been successfully analyzed",
      });
    } catch (error) {
      console.error("Error interpreting dream:", error);
      toast({
        title: "Error",
        description: "There was an error interpreting your dream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 flex items-center justify-center gap-4">
            <Sparkles className="h-12 w-12 text-yellow-300" />
            Unlock Your Dreams
            <Star className="h-12 w-12 text-yellow-300" />
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Discover the hidden meanings in your dreams with our advanced AI-powered dream interpretation service.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-3">Professional Analysis</h3>
            <p className="text-purple-200">Get detailed interpretations based on psychological principles and ancient wisdom.</p>
          </div>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-3">Instant Results</h3>
            <p className="text-purple-200">Receive your dream interpretation immediately through our advanced AI system.</p>
          </div>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-3">Free Trial</h3>
            <p className="text-purple-200">Try our service now with one free dream interpretation - no sign up required!</p>
          </div>
        </div>

        {/* Dream Input Section */}
        <div className="max-w-2xl mx-auto bg-white/20 p-8 rounded-xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="dream" className="block text-lg font-medium text-white mb-2">
                Share Your Dream
              </label>
              <Textarea
                id="dream"
                placeholder="Describe your dream in detail..."
                value={dreamText}
                onChange={(e) => setDreamText(e.target.value)}
                className="w-full h-32 bg-white/10 text-white placeholder:text-purple-200"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <Brain className="h-5 w-5" />
              {isLoading ? "Interpreting..." : "Interpret My Dream"}
            </Button>
          </form>

          {interpretation && (
            <div className="mt-8 p-6 bg-white/10 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Your Dream Interpretation</h3>
              <p className="text-purple-200 whitespace-pre-line">{interpretation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;