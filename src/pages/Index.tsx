import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [session, setSession] = useState(null);
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      const { error } = await supabase.from("dreams").insert({
        dream_text: dream,
        user_id: session.user.id,
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Rüyanız kaydedildi",
      });
      
      // Clear the form after successful submission
      setDream("");
      setInterpretation("");
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

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 p-4">
        <div className="max-w-md mx-auto pt-16">
          <div className="text-center mb-8">
            <Moon className="h-16 w-16 text-purple-300 mx-auto" />
            <h1 className="text-4xl font-bold text-white mt-4">Rüya Tabiri</h1>
            <p className="text-purple-200 mt-2">
              Rüyalarınızı yorumlamak için giriş yapın
            </p>
          </div>
          <Card className="p-6 bg-white/10 backdrop-blur-lg border-purple-500/20">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#9333ea',
                      brandAccent: '#7e22ce',
                    },
                  },
                },
              }}
              providers={[]}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Moon className="h-8 w-8 text-purple-300" />
            <h1 className="text-2xl font-bold text-white">Rüya Tabiri</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => supabase.auth.signOut()}
            className="bg-white/10 text-white hover:bg-white/20 border-purple-500/20"
          >
            Çıkış Yap
          </Button>
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