import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          favorite_team: string | null;
          has_seen_comment_rules: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          favorite_team?: string | null;
          has_seen_comment_rules?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          favorite_team?: string | null;
          has_seen_comment_rules?: boolean;
          updated_at?: string;
        };
      };
      stickers: {
        Row: {
          id: string;
          user_id: string;
          athlete_name: string;
          team: string;
          position: string;
          shirt_number: number;
          image_url: string | null;
          status: 'Quero' | 'Tenho' | 'Repetida';
          rarity: 'Ouro' | 'Prata' | 'Bronze' | 'Lilás';
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          athlete_name: string;
          team: string;
          position: string;
          shirt_number: number;
          image_url?: string | null;
          status: 'Quero' | 'Tenho' | 'Repetida';
          rarity?: 'Ouro' | 'Prata' | 'Bronze' | 'Lilás';
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          athlete_name?: string;
          team?: string;
          position?: string;
          shirt_number?: number;
          image_url?: string | null;
          status?: 'Quero' | 'Tenho' | 'Repetida';
          rarity?: 'Ouro' | 'Prata' | 'Bronze' | 'Lilás';
          description?: string | null;
          updated_at?: string;
        };
      };
      post_likes: {
        Row: {
          id: string;
          sticker_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sticker_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
      };
      comments: {
        Row: {
          id: string;
          sticker_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sticker_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          updated_at?: string;
        };
      };
      comment_likes: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
      };
      comment_reports: {
        Row: {
          id: string;
          comment_id: string;
          reporter_id: string;
          reason: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          reporter_id: string;
          reason: string;
          description?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: never;
      };
      conversations: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          updated_at?: string;
        };
      };
      conversation_participants: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
};
