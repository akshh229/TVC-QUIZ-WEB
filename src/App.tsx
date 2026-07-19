// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/toaster";
import Welcome from "@/pages/Welcome";
import ParticipantDetails from "@/pages/ParticipantDetails";
import Spin from "@/pages/Spin";
import Challenge from "@/pages/Challenge";
import Result from "@/pages/Result";
import ThankYou from "@/pages/ThankYou";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import QuestionManagement from "@/pages/admin/QuestionManagement";
import MediaManagement from "@/pages/admin/MediaManagement";
import ParticipantLog from "@/pages/admin/ParticipantLog";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Participant kiosk */}
          <Route
            path="/"
            element={
              <Layout hideHeader>
                <Welcome />
              </Layout>
            }
          />
          <Route
            path="/participant"
            element={
              <Layout>
                <ParticipantDetails />
              </Layout>
            }
          />
          <Route
            path="/spin"
            element={
              <Layout>
                <Spin />
              </Layout>
            }
          />
          <Route
            path="/challenge"
            element={
              <Layout>
                <Challenge />
              </Layout>
            }
          />
          <Route
            path="/result"
            element={
              <Layout>
                <Result />
              </Layout>
            }
          />
          <Route
            path="/thank-you"
            element={
              <Layout hideHeader>
                <ThankYou />
              </Layout>
            }
          />

          {/* Admin — isolated from kiosk chrome and idle reset */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/questions" element={<QuestionManagement />} />
          <Route path="/admin/media" element={<MediaManagement />} />
          <Route path="/admin/participants" element={<ParticipantLog />} />

          {/* No dead ends */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
