import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Star, LogOut, Play } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  username: string;
  display_name: string | null;
  total_points: number;
  current_streak: number;
  best_streak: number;
  level: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  total_questions: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await fetchProfile(session.user.id);
      await fetchQuizzes();
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      toast.error("Failed to load profile");
    } else {
      setProfile(data);
    }
  };

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .order("difficulty");

    if (error) {
      toast.error("Failed to load quizzes");
    } else {
      setQuizzes(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-success text-success-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "hard": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-2xl font-semibold text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Hi, {profile?.display_name || profile?.username}! 👋
            </h1>
            <p className="text-muted-foreground text-lg mt-1">Let's continue your math journey</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{profile?.total_points || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent to-secondary text-accent-foreground border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="w-5 h-5" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{profile?.current_streak || 0} days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning to-accent text-warning-foreground border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5" />
                Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{profile?.level || "Bronze"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>My Level Progress</CardTitle>
            <CardDescription>Keep practicing to level up!</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={((profile?.total_points || 0) % 100)} className="h-4" />
            <p className="text-sm text-muted-foreground mt-2">
              {100 - ((profile?.total_points || 0) % 100)} XP to next level
            </p>
          </CardContent>
        </Card>

        {/* Quizzes */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {quiz.total_questions} questions
                    </p>
                    <Button 
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
