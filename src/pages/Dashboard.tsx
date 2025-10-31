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
  const [profile, setProfile] = useState<Profile | null>(null);
 const [quizzes, setQuizzes] = useState<Quiz[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const userString = localStorage.getItem("user");

  if (!userString) {
    navigate("/");
    return;
  }

  const user = JSON.parse(userString);

  // ✅ Load quizzes
  fetchQuizzes();

  // ✅ Set profile from local user
  setProfile({
    username: user.name,
    display_name: user.name,
    total_points: 20,
    current_streak: 0,
    best_streak: 0,
    level: "Beginner"
  });

  setLoading(false);
}, []);

const fetchQuizzes = async () => {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("difficulty");

  if (error) {
    console.error("Quizzes error:", error);
    return;
  }

  console.log("Quizzes fetched:", data); // ✅ data exists here
  setQuizzes(data || []);
};

const handleLogout = () => {
  localStorage.removeItem("user");
  navigate("/");
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


      {/* ✅ CONTENT */}
      <div className="relative max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Hi, {profile?.username}! 👋
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Let's continue your math journey
            </p>
          </div>

          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>


        {/* ✅ PROGRESS CARD */}
        <Card className="rounded-3xl shadow-xl border-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              📘 My Math Level Progress
            </CardTitle>
            <CardDescription>Boost your math XP!</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `20%` }}
              />
            </div>

            <p className="text-sm text-muted-foreground mt-3">
              80 XP to reach the next level 📈
            </p>
          </CardContent>
        </Card>


        {/* ✅ QUIZZES */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">Available Quizzes</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-50 rounded-l-3xl">

            {/* left card */}
            <div className="bg-primary p-8 text-white rounded-l-3xl w-80 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-2">Choose the option</h3>
              <p className="text-sm">Go to study in the year of your choice</p>
            </div>

            {/* Quizzes */}
            <div className="lg:col-span-2 space-y-5 mt-5 mb-5 mr-8">
              {quizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  className="p-5 rounded-2xl cursor-pointer flex justify-between border hover:bg-primary hover:text-white transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                      {index === 0 && "🎁"}
                      {index === 1 && "🟡"}
                      {index === 2 && "👑"}
                    </div>

                    <div>
                      <p className="text-lg font-semibold">{quiz.title}</p>
                      <p>{quiz.total_questions} questions</p>
                    </div>
                  </div>

                  <div className="font-medium">Start Now →</div>
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
