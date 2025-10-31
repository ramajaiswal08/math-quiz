import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Star, LogOut, Play } from "lucide-react";
import { toast } from "sonner";
import bg from "@/assets/bg.jpg";
import bg2 from "@/assets/bg2.jpg";
import "./../math-bg.css"; 

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

    if (error) toast.error("Failed to load profile");
    else setProfile(data);
  };

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .order("difficulty");

    if (error) toast.error("Failed to load quizzes");
    else setQuizzes(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
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
    <div className="relative min-h-screen p-4 overflow-hidden">

      
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${bg})` }}
      ></div>

      {/* ✅ Floating Math Icons */}
      <div className="absolute inset-0 pointer-events-none math-floating-icons">
        <span className="math-icon">➕</span>
        <span className="math-icon">➖</span>
        {/* <span className="math-icon">✖️</span>
        <span className="math-icon">➗</span> */}
      </div>

      {/* ✅ ACTUAL CONTENT */}
      <div className="relative max-w-6xl mx-auto space-y-6">

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

        {/* Math Themed Progress Card */}
<Card className="relative overflow-hidden rounded-3xl shadow-xl border-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">

  {/* ✅ Floating Math Symbols */}
  {/* <div className="absolute top-4 right-80 text-4xl text-purple-300/40 select-none animate-float-slow">π</div>
  <div className="absolute bottom-2 left-80 text-5xl text-blue-300/30 select-none animate-float">√</div>
  <div className="absolute top-1/2 left-2 text-3xl text-teal-300/50 select-none rotate-12">Σ</div>
  <div className="absolute bottom-2 right-8 text-4xl text-indigo-300/40 select-none rotate-6">∞</div> */}

  <CardHeader className="relative z-10">
    
    <CardTitle className="text-xl font-bold flex items-center gap-2">
      📘 My Math Level Progress
    </CardTitle>
    <CardDescription className="text-sm">
      Solve problems and boost your math XP!
    </CardDescription>
  </CardHeader>

  <CardContent className="relative z-10">
    {/* ✅ Fancy Progress Bar */}
    <div className="relative w-full h-2 rounded-full bg-gray-200 overflow-hidden shadow-inner">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
        style={{ width: `${(profile?.total_points || 0) % 100}%` }}
      />
    </div>

    <p className="text-sm text-muted-foreground mt-3">
      <span className="font-semibold text-blue-600">
        {100 - ((profile?.total_points || 0) % 100)} XP
      </span>{" "}
      to reach the next level 📈
    </p>
  </CardContent>

  {/* ✅ Animations */}
  <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    @keyframes float-slow {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-float-slow { animation: float-slow 5s ease-in-out infinite; }
  `}</style>
</Card>


        {/* Quizzes */}
        <div className="mt-10">
  <h2 className="text-2xl font-bold mb-6">Available Quizzes</h2>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-l-3xl bg-slate-50">
    

    {/* LEFT SIDE CHOOSE OPTION CARD */}
    <div className="bg-primary p-8 rounded-l-3xl w-80 text-white flex flex-col justify-center shadow-lg">
      <h3 className="text-2xl font-bold mb-2">Choose the option</h3>
      <p className="text-teal-50 text-sm">
        Go to study in the year of your choice
      </p>
    </div>

    {/* RIGHT SIDE QUIZ CARDS */}
    <div className="lg:col-span-2 space-y-5 mt-5 mb-5 mr-8 ">
      
      {quizzes.map((quiz, index) => (
        <div
  key={quiz.id}
  onClick={() => navigate(`/quiz/${quiz.id}`)}
  className={`
    w-full p-5 rounded-2xl cursor-pointer flex items-center justify-between 
    transition-all border shadow-sm
    hover:bg-primary hover:text-white hover:scale-[1.01] hover:shadow-md
  `}
>

          {/* Left icon + title */}
          <div className="flex items-center gap-4">
            

            {/* ICON */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow 
              `}
            >
              {index === 0 && "🎁"}
              {index === 1 && "🟡"}
              {index === 2 && "👑"}
            </div>

            {/* TITLE */}
            <div>
              <p className="text-lg font-semibold">{quiz.title}</p>
              <p>
                {quiz.total_questions} questions
              </p>
            </div>
          </div>
          

          {/* right side: Start Now arrow */}
          <div
            className={`flex items-center gap-2 text-sm font-medium text-primary hover: text:white
            `}
          >
            Start Now →
          </div>

        </div>
      ))}

    </div>
  </div>
</div>


      </div>
    </div>
  );
};

export default Dashboard;
