"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";

const handleGuestLogin = () => {
  localStorage.setItem('app_mode', 'guest');
  Cookies.set('token', 'guest-token', { expires: 1 });
  window.location.href = '/dashboard';
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email: email,
        password: password,
      });

      if (response.data.token) {
        Cookies.set("token", response.data.token, { expires: 1 });
        router.push("/dashboard");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-2 text-center">
        <Wallet className="mx-auto h-12 w-12" />
        <CardTitle className="text-2xl">Atur uang</CardTitle>
        <CardDescription>Masuk untuk mengelola keuangan Anda</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="nama@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Masuk"}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={handleGuestLogin}>
            Coba sebagai Tamu
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Belum punya akun? <Link href="/register" className="underline">Daftar</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
