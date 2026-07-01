/**
 * Storage Service
 *
 * Currently uses Supabase Storage.
 * To migrate to Cloudflare R2 or S3, implement the interface.
 */

export interface StorageProvider {
  upload(path: string, file: File): Promise<string>;
  delete(path: string): Promise<void>;
  getPublicUrl(path: string): string;
}

class SupabaseStorage implements StorageProvider {
  async upload(path: string, file: File): Promise<string> {
    const { supabase } = await import("@/lib/supabase");
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  }

  async delete(path: string): Promise<void> {
    const { supabase } = await import("@/lib/supabase");
    await supabase.storage.from("avatars").remove([path]);
  }

  getPublicUrl(path: string): string {
    // Uses supabase directly; for S3/R2, return the CDN URL
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
  }
}

/** TODO: Implement Cloudflare R2 storage */
class R2Storage implements StorageProvider {
  async upload(_path: string, _file: File): Promise<string> {
    throw new Error("R2 storage not implemented yet");
  }
  async delete(_path: string): Promise<void> {
    throw new Error("R2 storage not implemented yet");
  }
  getPublicUrl(path: string): string {
    return path; // TODO: return R2 CDN URL
  }
}

export const storage: StorageProvider = new SupabaseStorage();