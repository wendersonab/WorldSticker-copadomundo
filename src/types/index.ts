export type StickerStatus = 'Quero' | 'Tenho' | 'Repetida';
export type StickerRarity = 'Ouro' | 'Prata' | 'Bronze' | 'Lilás';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_team: string | null;
  has_seen_comment_rules: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sticker {
  id: string;
  user_id: string;
  athlete_name: string;
  team: string;
  position: string;
  shirt_number: number;
  image_url: string | null;
  status: StickerStatus;
  rarity: StickerRarity;
  description: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  likes_count?: number;
  comments_count?: number;
  user_liked?: boolean;
}

export interface Comment {
  id: string;
  sticker_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  likes_count?: number;
  user_liked?: boolean;
  user_reported?: boolean;
}

export interface PostLike {
  id: string;
  sticker_id: string;
  user_id: string;
  created_at: string;
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export interface CommentReport {
  id: string;
  comment_id: string;
  reporter_id: string;
  reason: string;
  description: string | null;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants?: Profile[];
  last_message?: Message;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export type ReportReason =
  | 'Spam'
  | 'Racismo'
  | 'Ofensa'
  | 'Violação dos direitos humanos'
  | 'Pornografia'
  | 'Incentivo à automutilação'
  | 'Incentivo ao abuso infantil'
  | 'Outro';

export const REPORT_REASONS: ReportReason[] = [
  'Spam',
  'Racismo',
  'Ofensa',
  'Violação dos direitos humanos',
  'Pornografia',
  'Incentivo à automutilação',
  'Incentivo ao abuso infantil',
  'Outro',
];

export const STICKER_STATUSES: StickerStatus[] = ['Quero', 'Tenho', 'Repetida'];

export const STICKER_RARITIES: StickerRarity[] = ['Ouro', 'Prata', 'Bronze', 'Lilás'];

export const STICKER_RARITY_ODDS: Record<StickerRarity, string> = {
  'Ouro': '1 a cada 1.900 pacotes',
  'Prata': '1 a cada 900 pacotes',
  'Bronze': '1 a cada 317 pacotes',
  'Lilás': '1 a cada 190 pacotes',
};

export const WORLD_CUP_TEAMS = [
  'Brasil', 'Argentina', 'França', 'Alemanha', 'Espanha', 'Inglaterra',
  'Portugal', 'Itália', 'Holanda', 'Bélgica', 'Croácia', 'Uruguai',
  'México', 'EUA', 'Japão', 'Coreia do Sul', 'Marrocos', 'Senegal',
  'Gana', 'Camarões', 'Austrália', 'Irã', 'Arábia Saudita', 'Qatar',
  'Polônia', 'Sérvia', 'Suíça', 'Dinamarca', 'Gales', 'Equador',
  'Canadá', 'Costa Rica', 'Outra',
];

export const POSITIONS = [
  'Goleiro', 'Lateral Direito', 'Lateral Esquerdo', 'Zagueiro',
  'Volante', 'Meia', 'Meia Atacante', 'Ponta Direita', 'Ponta Esquerda',
  'Centroavante', 'Atacante',
];
