import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

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

  const getOptionClass = (option: string) => {
    if (!selectedAnswer) {
      return "hover:bg-primary-light hover:border-primary cursor-pointer";
    }
    
    const isCorrect = option === questions[currentQuestion].correct_answer;
    const isSelected = option === selectedAnswer;
    
    if (isSelected && isCorrect) {
      return "bg-success text-success-foreground border-success";
    }
    if (isSelected && !isCorrect) {
      return "bg-destructive text-destructive-foreground border-destructive";
    }
    if (isCorrect) {
      return "bg-success text-success-foreground border-success";
    }
    return "opacity-50";
  };

  if (showResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-light via-background to-secondary">
        <Card className="max-w-md w-full shadow-2xl">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="text-6xl">{score === questions.length ? "🏆" : "🎯"}</div>
            <h2 className="text-3xl font-bold">Quiz Complete!</h2>
            <div className="space-y-2">
              <p className="text-5xl font-bold text-primary">{score}/{questions.length}</p>
              <p className="text-muted-foreground">Correct Answers</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-2xl font-semibold">+{score * 10} Points! ⭐</p>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="w-full h-12">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-2xl font-semibold text-primary">Loading quiz...</div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary p-4">
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{quiz.title}</h2>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card className="shadow-xl border-2">
          <CardContent className="pt-8 space-y-6">
            <div className="text-center">
              <p className="text-2xl font-semibold mb-8">{currentQ.question_text}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
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
                  className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${getOptionClass(option.key)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {option.key}
                    </span>
                    <span className="flex-1">{option.text}</span>
                    {selectedAnswer && option.key === currentQ.correct_answer && (
                      <Check className="w-5 h-5" />
                    )}
                    {selectedAnswer === option.key && option.key !== currentQ.correct_answer && (
                      <X className="w-5 h-5" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {selectedAnswer && (
              <Button onClick={handleNext} className="w-full h-12 text-lg">
                {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
