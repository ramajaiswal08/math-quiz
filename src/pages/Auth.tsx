// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { toast } from "sonner";
// import { z } from "zod";
// import mathHero from "@/assets/math-hero.jpg";
// import carousel1 from "@/assets/carousel1.jpeg"
// import carousel3 from "@/assets/carousel3.jpg"
// import carousel2 from "@/assets/carousel2.jpeg"



// const carouselImages = [
//   { img: carousel1 , quote: "Mathematics is the language of the universe." },
//   { img: carousel2 , quote: "Every problem has a solution waiting to be discovered." },
//   { img: carousel3, quote: "Believe in yourself. Numbers always add up!" },
// ];


// const authSchema = z.object({
//   email: z.string().email("Invalid email address").max(255),
//   password: z.string().min(6, "Password must be at least 6 characters").max(100),
//   username: z.string().min(3, "Username must be at least 3 characters").max(50).optional(),
// });

// const Auth = () => {
//   const navigate = useNavigate();
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [username, setUsername] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [index , setIndex] = useState(0);

//   useEffect(() => {
//     const checkUser = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (session) {
//         navigate("/dashboard");
//       }
//     };
//     checkUser();
//   }, [navigate]);


//     useEffect(() => {
//     const interval = setInterval(() => {
//       setIndex((prev) => (prev + 1) % carouselImages.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const validation = authSchema.parse({
//         email,
//         password,
//         username: isLogin ? undefined : username,
//       });

//       if (isLogin) {
//         const { error } = await supabase.auth.signInWithPassword({
//           email: validation.email,
//           password: validation.password,
//         });

//         if (error) {
//           if (error.message.includes("Invalid login credentials")) {
//             toast.error("Invalid email or password");
//           } else {
//             toast.error(error.message);
//           }
//         } else {
//           toast.success("Welcome back!");
//           navigate("/dashboard");
//         }
//       } else {
//         const { error } = await supabase.auth.signUp({
//           email: validation.email,
//           password: validation.password,
//           options: {
//             emailRedirectTo: `${window.location.origin}/dashboard`,
//             data: {
//               username: validation.username,
//               display_name: validation.username,
//             },
//           },
//         });

//         if (error) {
//           if (error.message.includes("already registered")) {
//             toast.error("This email is already registered. Please login instead.");
//           } else {
//             toast.error(error.message);
//           }
//         } else {
//           toast.success("Account created! Redirecting...");
//           navigate("/dashboard");
//         }
//       }
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         toast.error(error.errors[0].message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//  return (
//   <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary flex items-center justify-center p-6">

//     <div className="grid md:grid-cols-2 gap-10 max-w-6xl w-full">

//       {/* ✅ LEFT SIDE CAROUSEL */}
//       <div className="hidden md:flex flex-col items-center justify-center space-y-6 px-6">
//         <div className="w-full h-[330px] rounded-3xl overflow-hidden shadow-xl border border-white/20">
//           <img
//             src={carouselImages[index].img}
//             alt="carousel"
//             className="w-full h-full object-cover transition-all duration-700"
//           />
//         </div>
//         <p className="text-lg text-center font-semibold text-primary">
//           {carouselImages[index].quote}
//         </p>
//       </div>

//       {/* ✅ FORM CARD (Reduced Width) */}
//       <Card className="shadow-2xl border border-white/20 rounded-3xl max-w-md w-full mx-auto">
//         <CardHeader className="text-center space-y-2">
//           <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//             {isLogin ? "Welcome Back!" : "Join Math Quiz"}
//           </CardTitle>
//           <CardDescription className="text-base font-medium">
//             {isLogin ? "Continue your learning journey" : "Start your mathematics adventure"}
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-5">

//             {!isLogin && (
//               <div className="space-y-2">
//                 <Label htmlFor="username">Username</Label>
//                 <Input
//                   id="username"
//                   type="text"
//                   placeholder="Choose a username"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   required={!isLogin}
//                   maxLength={50}
//                   className="h-12 rounded-xl"
//                 />
//               </div>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="h-12 rounded-xl"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="h-12 rounded-xl"
//               />
//             </div>

//             <Button
//               type="submit"
//               className="w-full h-12 text-lg font-semibold rounded-xl"
//               disabled={loading}
//             >
//               {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
//             </Button>

//             <p className="text-center text-sm text-muted-foreground">
//               {isLogin ? "Don't have an account? " : "Already have an account? "}
//               <button
//                 type="button"
//                 onClick={() => setIsLogin(!isLogin)}
//                 className="text-primary font-semibold hover:underline"
//               >
//                 {isLogin ? "Sign Up" : "Sign In"}
//               </button>
//             </p>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   </div>
// );
// };

// export default Auth;













import { useEffect, useState } from "react";
import { saveUser } from "@/lib/saveUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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

     <div className="grid md:grid-cols-2 gap-10 max-w-6xl w-full">

       {/* ✅ LEFT SIDE CAROUSEL */}
       <div className="hidden md:flex flex-col items-center justify-center space-y-6 px-6 py-5">
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
      </div>
      <Card className="shadow-2xl border border-white/20 rounded-3xl max-w-md w-full mx-auto">
  <CardHeader className="text-center space-y-2">
    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
      Welcome!
    </CardTitle>
    <CardDescription className="text-base font-medium">
      Enter your details to continue
    </CardDescription>
  </CardHeader>

  <CardContent>
    <form onSubmit={handleSubmit} className="space-y-5 max-w-sm w-full mx-auto">

      {/* ✅ NAME FIELD */}
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

      {/* ✅ EMAIL FIELD */}
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
    </form>
  </CardContent>
</Card>

    </div>
    </div>
  );
};

export default Auth;
