"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signinAction } from "@/app/services/auth/sign-in.action";
import { signupAction } from "@/app/services/auth/sign-up.action";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function SignInOrSignUp() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="max-w-sm mx-auto mt-32">
      <Form {...form}>
        <form className="space-y-12">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your em@1l" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter p@ssw0rd"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <Button formAction={signinAction} type="submit" className="w-full">
              Sign In
            </Button>
            <Button formAction={signupAction} type="submit" className="w-full">
              Sign Up
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
