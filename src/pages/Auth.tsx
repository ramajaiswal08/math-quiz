
import { useEffect, useState } from "react";
import { saveUser } from "@/lib/saveUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import chubbLogo from "./../../src/assets/chubb.png"
import carousel1 from "@/assets/carousel1.jpeg"
import carousel3 from "@/assets/carousel3.jpg"
import carousel2 from "@/assets/carousel2.jpeg"



const carouselImages = [
  { img: carousel1 , quote: "Mathematics is the language of the universe." },
  { img: carousel2 , quote: "Every problem has a solution waiting to be discovered." },
  { img: carousel3, quote: "Believe in yourself. Numbers always add up!" },
];


const Auth = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [index , setIndex] = useState(0);
  const navigate = useNavigate(); // ✅ ADD THIS

      useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await saveUser(name, email);

    if (error) {
      toast.error("Failed to save data");
      return;
    }

    toast.success("User saved successfully!");

    // ✅ DIRECT REDIRECT — WORKS
    localStorage.setItem("user", JSON.stringify({ name, email }));
navigate("/dashboard");

  };

  return (
   <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary flex items-center justify-center p-6">
    <div>

  {/* <div className="grid md:grid-cols-2 gap-10 max-w-6xl w-full"> */}

    {/* ✅ LEFT SIDE CHUBB CAROUSEL */}
    {/* <div className="hidden md:flex flex-col items-center justify-center space-y-6 px-6 py-5">
      <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-xl border border-white/20">
        <img
          src={carouselImages[index].img}
          alt="carousel"
          className="w-full h-full object-cover transition-all duration-700"
        />
      </div>

      <p className="text-lg text-center font-semibold text-primary">
        {carouselImages[index].quote}
      </p>
    </div> */}

    {/* ✅ RIGHT SIDE FORM */}
    <Card className="shadow-2xl border border-white/20 rounded-3xl max-w-md w-full mx-auto">

      <CardHeader className="text-center space-y-2">
        {/* ✅ CHUBB LOGO */}
        <img
          src={chubbLogo}
          alt="Chubb Logo"
          className="w-32 mx-auto mb-2"
        />

        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome!
        </CardTitle>

        <CardDescription className="text-base font-medium">
          Enter your details to continue
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-sm w-full mx-auto">

          {/* ✅ NAME */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="h-12 rounded-xl"
            />
          </div>

          {/* ✅ EMAIL */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-12 rounded-xl"
            />
          </div>

          {/* ✅ SUBMIT BUTTON */}
          <Button
            type="submit"
            className="w-full h-12 text-lg font-semibold rounded-xl"
          >
            Submit
          </Button>

          {/* ✅ SIGN IN ANONYMOUSLY */}
          <Button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="w-full h-12 text-lg font-semibold rounded-xl bg-gray-700"
          >
            Sign In Anonymously
          </Button>

        </form>
      </CardContent>

    </Card>
  </div>
</div>

  );
};

export default Auth;
