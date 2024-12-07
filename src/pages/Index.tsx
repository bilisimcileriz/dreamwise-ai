import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Loader2, Moon } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Add console logs to debug environment variables
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase Key exists:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Check if environment variables are available
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables");
  throw new Error("Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables");
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Index = () => {
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDreamSubmit = async () => {
    if (!dream.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen rüyanızı anlatın",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Giriş Gerekli",
          description: "Lütfen önce giriş yapın",
          variant: "destructive",
        });
        return;
      }

      // TODO: Implement AI interpretation logic here
      // For now, just a placeholder response
      setInterpretation(
        "Bu özellik yakında aktif olacak. Şu anda test aşamasındayız."
      );
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Moon className="h-16 w-16 text-purple-300" />
          </div>
          <h1 className="text-4xl font-bold text-white">Rüya Tabiri</h1>
          <p className="text-purple-200">
            Rüyanızı anlatın, yapay zeka size yardımcı olsun
          </p>
        </div>

        <Card className="p-6 bg-white/10 backdrop-blur-lg border-purple-500/20">
          <div className="space-y-4">
            <Textarea
              placeholder="Rüyanızı buraya yazın..."
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              className="min-h-[200px] bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
            />
            <Button
              onClick={handleDreamSubmit}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yorumlanıyor...
                </>
              ) : (
                "Rüyayı Yorumla"
              )}
            </Button>
          </div>

          {interpretation && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-200 mb-2">
                Rüya Yorumu
              </h3>
              <p className="text-white">{interpretation}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;