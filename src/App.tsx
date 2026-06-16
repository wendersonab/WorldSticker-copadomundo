import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { Feed } from '@/pages/Feed';
import { CreateSticker } from '@/pages/CreateSticker';
import { EditSticker } from '@/pages/EditSticker';
import { StickerDetails } from '@/pages/StickerDetails';
import { Profile } from '@/pages/Profile';
import { EditProfile } from '@/pages/EditProfile';
import { Collection } from '@/pages/Collection';
import { Conversations } from '@/pages/Conversations';
import { Chat } from '@/pages/Chat';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/feed" element={<Feed />} />
                <Route path="/collection" element={<Collection />} />
                <Route path="/sticker/create" element={<CreateSticker />} />
                <Route path="/sticker/:id" element={<StickerDetails />} />
                <Route path="/sticker/edit/:id" element={<EditSticker />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/conversations" element={<Conversations />} />
                <Route path="/chat/:id" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/app" element={<Navigate to="/feed" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}
