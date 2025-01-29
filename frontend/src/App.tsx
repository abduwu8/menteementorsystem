import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import MentorLogin from './pages/Login/MentorLogin';
import MenteeLogin from './pages/Login/MenteeLogin';
import MentorRegister from './pages/Register/MentorRegister';
import MenteeRegister from './pages/Register/MenteeRegister';
import MentorDashboard from './pages/MentorDashboard';
import MenteeDashboard from './pages/MenteeDashboard';
import MentorProfile from './pages/Profile/MentorProfile';
import MenteeProfile from './pages/Profile/MenteeProfile';
import SessionRequestPage from './pages/SessionRequestPage';
import SessionRequestsPage from './pages/SessionRequests';
import MentorList from './pages/MentorList';
import RequestLecture from './pages/LectureRequest/RequestLecture';
import ViewRequests from './pages/LectureRequest/ViewRequests';
import WeeklyAvailabilityPage from './pages/WeeklyAvailability';
import ProtectedRoute from './components/ProtectedRoute';
import AIChatbot from './pages/AIChatbot';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MentorLogin />} />
          <Route path="/login/mentor" element={<MentorLogin />} />
          <Route path="/login/mentee" element={<MenteeLogin />} />
          <Route path="/register/mentor" element={<MentorRegister />} />
          <Route path="/register/mentee" element={<MenteeRegister />} />

          {/* Protected Mentor routes */}
          <Route
            path="/mentor-dashboard"
            element={
              <ProtectedRoute allowedRole="mentor">
                <Layout>
                  <MentorDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor-profile"
            element={
              <ProtectedRoute allowedRole="mentor">
                <Layout>
                  <MentorProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor-sessions"
            element={
              <ProtectedRoute allowedRole="mentor">
                <Layout>
                  <SessionRequestsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/set-availability"
            element={
              <ProtectedRoute allowedRole="mentor">
                <Layout>
                  <WeeklyAvailabilityPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-requests"
            element={
              <ProtectedRoute allowedRole="mentor">
                <Layout>
                  <ViewRequests />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Protected Mentee routes */}
          <Route
            path="/mentee-dashboard"
            element={
              <ProtectedRoute allowedRole="mentee">
                <Layout>
                  <MenteeDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentee-profile"
            element={
              <ProtectedRoute allowedRole="mentee">
                <Layout>
                  <MenteeProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentee-sessions"
            element={
              <ProtectedRoute allowedRole="mentee">
                <Layout>
                  <SessionRequestPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-mentors"
            element={
              <ProtectedRoute allowedRole="mentee">
                <Layout>
                  <MentorList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request-lecture"
            element={
              <ProtectedRoute allowedRole="mentee">
                <Layout>
                  <RequestLecture />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* AI Chatbot route - accessible to both roles */}
          <Route
            path="/ai-chat"
            element={
              <ProtectedRoute allowedRole="both">
                <Layout>
                  <AIChatbot />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to mentor login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
