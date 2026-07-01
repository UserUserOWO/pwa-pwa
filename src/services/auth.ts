import { supabase } from "@/lib/supabase";
import { emailService } from "./email";
import { evaluateUsername } from "./moderation";
import { logAuditEvent } from "./audit";

export async function signUp(email: string, password: string, name: string) {
  // Validate username
  const usernameCheck = await evaluateUsername(name);
  if (usernameCheck.action === "REJECTED") {
    throw new Error(usernameCheck.reason || "Invalid username");
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }
  if (!authData.user) {
    throw new Error("Registration failed. Check if email confirmation is required.");
  }

  // Send verification email (mock for now)
  await emailService.sendVerificationEmail({
    email,
    token: `verify_${Date.now()}_${authData.user.id}`,
    userName: name,
  });

  await logAuditEvent({
    userId: authData.user.id,
    action: "USER_REGISTERED",
    entityType: "user",
    entityId: authData.user.id,
    details: { email, name },
  });

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    await logAuditEvent({
      action: "LOGIN_FAILED",
      entityType: "user",
      details: { email, error: error.message },
    });
    throw new Error(error.message);
  }

  await logAuditEvent({
    userId: data.user?.id,
    action: "USER_LOGIN",
    entityType: "user",
    entityId: data.user?.id,
  });

  return data;
}

export async function signOut() {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.auth.signOut();

  if (user) {
    await logAuditEvent({
      userId: user.id,
      action: "USER_LOGOUT",
      entityType: "user",
      entityId: user.id,
    });
  }

  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}