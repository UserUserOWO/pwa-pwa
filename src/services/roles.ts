import { supabase } from "@/lib/supabase";
import { UserRole, UserRoleType } from "@/types";

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  return data as unknown as UserRole | null;
}

export async function updateUserRole(
  targetUserId: string,
  newRole: UserRoleType
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("user_roles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("user_id", targetUserId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getAllUsersWithRoles(options: {
  limit?: number;
  offset?: number;
  role?: UserRoleType;
}): Promise<(UserRole & { name?: string })[]> {
  let query = supabase
    .from("user_roles")
    .select("*, profiles!inner(name)")
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 50);

  if (options.role) query = query.eq("role", options.role);
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1);

  const { data, error } = await query;
  if (error) return [];
  return (data as unknown as (UserRole & { name?: string })[]) || [];
}

export const ROLE_HIERARCHY: Record<UserRoleType, number> = {
  USER: 0,
  BUSINESS: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function hasMinRole(userRole: UserRoleType | null, requiredRole: UserRoleType): boolean {
  if (!userRole) return false;
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}