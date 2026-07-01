import { supabase } from "@/lib/supabase";

/**
 * Content validation result
 */
export interface ValidationResult {
  valid: boolean;
  reason?: string;
  action: "APPROVED" | "PENDING" | "REJECTED";
  score: number;
}

// ==================== PROFANITY DICTIONARY ====================

const PROFANITY_LIST = [
  "хуй", "хуя", "хуе", "пизд", "ебал", "ебат", "ебну", "бляд", "блять",
  "сучка", "сука", "гандон", "мудак", "пидор", "пидарас", "шлюха",
  "fuck", "shit", "asshole", "bitch", "bastard", "dick", "pussy",
  "cocksucker", "motherfucker",
];

function normalizeProfanity(text: string): string {
  return text
    .toLowerCase()
    .replace(/[0-9@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, "")
    .replace(/4/g, "a")
    .replace(/3/g, "e")
    .replace(/1/g, "i")
    .replace(/0/g, "o")
    .replace(/5/g, "s")
    .replace(/8/g, "b")
    .replace(/6/g, "g")
    .replace(/7/g, "t");
}

function hasProfanity(text: string): boolean {
  const normalized = normalizeProfanity(text);
  for (const word of PROFANITY_LIST) {
    if (normalized.includes(word)) return true;
  }
  return false;
}

// ==================== CODE DETECTION ====================

const CODE_PATTERNS = [
  /^SELECT\s.*FROM/i,
  /^INSERT\sINTO/i,
  /^DELETE\sFROM/i,
  /^DROP\sTABLE/i,
  /^ALTER\sTABLE/i,
  /<script[\s>]/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onclick\s*=/i,
  /{\s*"[^"]+"\s*:/,
  /\[.*\]\s*\{/,
  /function\s*\(/,
  /=>\s*\{/,
  /require\(/,
  /import\s/,
  /^[A-Za-z0-9+/]{20,}={0,2}$/m, // base64
  /^[0-9a-f]{32,}$/im, // md5-like
  /^[0-9a-f]{40,}$/im, // sha1-like
  /^[0-9a-f]{64,}$/im, // sha256-like
];

function looksLikeCode(text: string): boolean {
  for (const pattern of CODE_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}

// ==================== ENTROPY CHECK ====================

function calculateEntropy(text: string): number {
  const len = text.length;
  if (len === 0) return 0;
  const freq: Record<string, number> = {};
  for (const char of text.toLowerCase()) {
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

// ==================== SUSPICIOUS PATTERNS ====================

const URL_PATTERN = /https?:\/\/[^\s]+/gi;
const REPEATING_CHARS = /(.)\1{4,}/;
const GIBBERISH_PATTERN = /^[^aeiouаеёиоуыэюя]{5,}$/i;

function hasSuspiciousContent(text: string): string | null {
  // Check for repeated characters
  if (REPEATING_CHARS.test(text)) {
    return "Too many repeated characters";
  }

  // Check for URLs (potential spam)
  const urls = text.match(URL_PATTERN);
  if (urls && urls.length > 2) {
    return "Too many links";
  }

  // Check if text is pure gibberish (no vowels)
  const words = text.split(/\s+/);
  let gibberishWords = 0;
  for (const word of words) {
    if (word.length > 3 && GIBBERISH_PATTERN.test(word)) {
      gibberishWords++;
    }
  }
  if (gibberishWords > words.length * 0.5) {
    return "Text appears to be gibberish";
  }

  return null;
}

// ==================== MAIN VALIDATION ====================

export function validateReviewContent(text: string): ValidationResult {
  const trimmed = text.trim();

  // Empty check
  if (trimmed.length < 3) {
    return { valid: false, reason: "Review is too short", action: "REJECTED", score: 0 };
  }

  // Length check
  if (trimmed.length > 5000) {
    return { valid: false, reason: "Review is too long", action: "REJECTED", score: 0 };
  }

  let score = 100;
  const issues: string[] = [];

  // Profanity check
  if (hasProfanity(trimmed)) {
    issues.push("Contains inappropriate language");
    score -= 50;
  }

  // Code detection
  if (looksLikeCode(trimmed)) {
    issues.push("Review appears to contain code");
    score -= 40;
  }

  // Entropy check (random characters)
  const entropy = calculateEntropy(trimmed);
  if (entropy > 5.5 && trimmed.length > 20) {
    issues.push("Text appears random");
    score -= 30;
  }

  // Suspicious content
  const suspicious = hasSuspiciousContent(trimmed);
  if (suspicious) {
    issues.push(suspicious);
    score -= 25;
  }

  // Determine action based on score
  if (score < 30) {
    return {
      valid: false,
      reason: issues.join("; "),
      action: "REJECTED",
      score,
    };
  }

  if (score < 60) {
    return {
      valid: true,
      reason: issues.join("; "),
      action: "PENDING",
      score,
    };
  }

  return { valid: true, action: "APPROVED", score };
}

// ==================== USERNAME VALIDATION ====================

const VOWELS_EN = "aeiouy";
const VOWELS_RU = "аеёиоуыэюя";

export function validateUsername(name: string): ValidationResult {
  const trimmed = name.trim();

  // Length checks
  if (trimmed.length < 3) {
    return { valid: false, reason: "Minimum 3 characters", action: "REJECTED", score: 0 };
  }
  if (trimmed.length > 20) {
    return { valid: false, reason: "Maximum 20 characters", action: "REJECTED", score: 0 };
  }

  // Only allowed characters
  if (!/^[a-zA-Zа-яА-Я0-9_-]+$/.test(trimmed)) {
    return { valid: false, reason: "Only letters, numbers, hyphens and underscores", action: "REJECTED", score: 0 };
  }

  // Not only numbers
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, reason: "Cannot be only numbers", action: "REJECTED", score: 0 };
  }

  // Must contain at least one vowel (to prevent random letter spam)
  const hasVowel = [...trimmed.toLowerCase()].some(
    (c) => VOWELS_EN.includes(c) || VOWELS_RU.includes(c)
  );
  if (!hasVowel) {
    return { valid: false, reason: "Must contain at least one vowel", action: "REJECTED", score: 0 };
  }

  let score = 100;

  // Quality scoring
  const uniqueChars = new Set(trimmed.toLowerCase()).size;
  const uniquenessRatio = uniqueChars / trimmed.length;

  // Penalize low variety (like "aaaaaa" or "111111")
  if (uniquenessRatio < 0.3) {
    score -= 40;
  }

  // Penalize names that look like random strings (no real word pattern)
  const consonantClusters = trimmed.match(/[bcdfghjklmnpqrstvwxzbcdfghjklmnpqrstvwxz]{4,}/i);
  if (consonantClusters) {
    score -= 30;
  }

  // Check for random character sequence (high entropy for length)
  const entropy = calculateEntropy(trimmed);
  if (entropy > 3.5 && trimmed.length > 6) {
    score -= 20;
  }

  if (score < 40) {
    return {
      valid: false,
      reason: "Username appears to be random characters",
      action: "REJECTED",
      score,
    };
  }

  return { valid: true, action: "APPROVED", score };
}

// ==================== GET OR CREATE VALIDATION STATUS ====================

export async function getReviewStatus(reviewId: string): Promise<string | null> {
  const { data } = await supabase
    .from("reviews")
    .select("status")
    .eq("id", reviewId)
    .single();
  return data?.status ?? null;
}

export async function updateReviewStatus(
  reviewId: string,
  status: string,
  reason?: string
): Promise<void> {
  await supabase
    .from("reviews")
    .update({
      status,
      rejection_reason: reason ?? null,
      moderated_at: new Date().toISOString(),
    } as any)
    .eq("id", reviewId);
}