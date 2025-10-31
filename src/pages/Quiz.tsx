import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import bg2 from "@/assets/bg2.jpg";


interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  order_num: number;
}

interface Quiz {
  id: string;
  title: string;
  total_questions: number;
}

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: boolean }>({});
  const [userId, setUserId] = useState<string | null>(null);
   const [timeLeft, setTimeLeft] = useState(15);


   const [windowSize, setWindowSize] = useState({
  width: window.innerWidth,
  height: window.innerHeight,
});

useEffect(() => {
  const handleResize = () =>
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

const { width, height } = windowSize;


 useEffect(() => {
  setTimeLeft(15);
}, [currentQuestion]);

   
useEffect(() => {
  if (selectedAnswer) return; // Stop timer when answer is selected

  if (timeLeft === 0) {
    handleNext();
    return;
  }

  const timer = setTimeout(() => {
    setTimeLeft((prev) => prev - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [timeLeft, selectedAnswer]);


  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      await fetchQuiz();
    };
    checkUser();
  }, [quizId, navigate]);

  const fetchQuiz = async () => {
    if (!quizId) return;

    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError) {
      toast.error("Quiz not found");
      navigate("/dashboard");
      return;
    }

    setQuiz(quizData);

    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("order_num");

    if (questionsError) {
      toast.error("Failed to load questions");
    } else {
      setQuestions(questionsData || []);
    }
  };



  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correct_answer;
    
    setAnswers({ ...answers, [currentQuestion]: isCorrect });
    
    if (isCorrect) {
      setScore(score + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      toast.success("Correct! 🎉");
    } else {
      toast.error("Wrong answer. Try the next one!");
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!userId || !quiz) return;

    const points = score * 10;

    await supabase.from("quiz_attempts").insert({
      user_id: userId,
      quiz_id: quiz.id,
      score: points,
      total_questions: quiz.total_questions,
      correct_answers: score,
    });

    const { data: profile } = await supabase
      .from("profiles")
      .select("total_points, current_streak")
      .eq("id", userId)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({
          total_points: profile.total_points + points,
          current_streak: profile.current_streak + 1,
        })
        .eq("id", userId);
    }

    setShowResult(true);
    
    if (score === questions.length) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

 const getOptionClass = (option) => {
  if (!selectedAnswer) {
    return "option-hover border bg-transparent";
  }

  const correct = option === questions[currentQuestion].correct_answer;
  const selected = option === selectedAnswer;

  if (selected && correct) return "option-correct border";
  if (selected && !correct) return "option-wrong border";
  if (correct) return "option-correct border";

  return "opacity-40 border";
};


  if (showResult) {

     const percentage = Math.round((score / questions.length) * 100);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

    return (
      
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-light via-background to-secondary relative">
        <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${bg2})` }}
      ></div>

        <Card className="max-w-md w-full shadow-2xl border-2 border-primary/20 bg-white/80 backdrop-blur-xl rounded-2xl">
        <CardContent className="pt-8 text-center space-y-6">
          <div className="text-6xl">{score === questions.length ? "🏆" : "🎯"}</div>

          <h2 className="text-4xl font-extrabold text-primary">Quiz Complete!</h2>

          {/* ✅ Circular Progress */}
          <div className="flex justify-center relative">
            <svg width="180" height="180" className="transform -rotate-90">

              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="#d1d5db"
                strokeWidth="12"
                fill="transparent"
              />

              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="url(#tealGradient)"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />

              <defs>
                <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute top-[58px] text-4xl font-bold text-primary">
              {percentage}%
            </div>
          </div>

          <p className="text-xl font-semibold">
            Your Score {score} out of {questions.length}
          </p>

          <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg shadow-inner">
            <p className="text-2xl font-semibold text-primary">
              +{score * 10} Points ⭐
            </p>
          </div>

          <div className="flex gap-4 pt-4">

            <Button
              onClick={() => window.location.reload()}
              className="flex-1 h-12 rounded-xl bg-primary text-white font-semibold shadow-md hover:bg-primary/90"
            >
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex-1 h-12 rounded-xl border-primary text-primary font-semibold hover:bg-primary/10"
            >
              Go Home
            </Button>

          </div>

        </CardContent>
      </Card>
    </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${bg2})` }}
      ></div>
        <div className="text-2xl font-semibold text-primary">Loading quiz...</div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

 return (
  <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary p-6 relative">
    <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${bg2})` }}
      ></div>

    {/* Floating Math Icons */}
    <div className="absolute inset-0 pointer-events-none opacity-30">
      <span className="absolute top-10 left-20 text-6xl text-primary animate-float-slow">π</span>
      <span className="absolute top-40 right-72 text-5xl text-primary animate-float">√</span>
      <span className="absolute top-1/2 left-40 text-4xl text-primary rotate-12">Σ</span>
      <span className="absolute bottom-40 right-20 text-7xl text-primary rotate-6">∞</span>
    </div>

    <div className="max-w-xl mx-auto">

      {/* HEADER */}
      <Card className="shadow-xl border border-primary/30 rounded-2xl bg-background/40 backdrop-blur-lg">
        <CardContent className="p-6 space-y-4">

          {/* Title & Score */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>

            <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full shadow">
              Score: {score}/{questions.length}
            </div>
          </div>

          {/* Description + Timer */}
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Practice Quiz</p>
            <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-lg text-sm">
              ⏳ {timeLeft}s
            </div>
          </div>

          {/* Question Text */}
          <div className="pt-4">
            <h2 className="text-xl font-semibold">
              {currentQuestion + 1}. {currentQ.question_text}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {[
              { key: "A", text: currentQ.option_a },
              { key: "B", text: currentQ.option_b },
              { key: "C", text: currentQ.option_c },
              { key: "D", text: currentQ.option_d },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => handleAnswer(option.key)}
                disabled={!!selectedAnswer}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getOptionClass(option.key)}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {option.key}
                  </span>
                  <span>{option.text}</span>

                  {selectedAnswer && option.key === currentQ.correct_answer && (
                    <Check className="ms-auto text-green-400" />
                  )}

                  {selectedAnswer === option.key && option.key !== currentQ.correct_answer && (
                    <X className="ms-auto text-red-400" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer NEXT Button */}
          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              {currentQuestion + 1} of {questions.length} Questions
            </p>

            {selectedAnswer && (
              <Button onClick={handleNext} className="bg-primary text-white px-6">
                Next
              </Button>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  </div>
);
};

export default Quiz;
