import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Main from "./pages/Main";
import Profile from "./pages/Profile";
import Message from "./pages/Message";
import Explore from "./pages/Explore";
import Search from "./pages/Search";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { refreshToken } from "./api/authApi";



export default function App() {
  const { login, setLoading } = useAuthStore();

  async function checkAuth() {
    try {
      const { isAuthenticated } = useAuthStore.getState();

      console.log("App useEffect isAuthenticated:" + isAuthenticated);

      if (isAuthenticated) {
        return;
      }
      const res = await refreshToken();
      if (!res || res.status !== 200) {
        console.error("Failed to refresh token:", res);
        return;
      }
      const { accessToken, user } = res?.data?.data || {};
      // console.log("Refreshed token:", accessToken, user);
      login(user, accessToken);
      // console.log("After login:", useAuthStore.getState());
    } catch (err) {
      console.error("Error refreshing token:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Main />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/message" element={<Message />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/search" element={<Search />} />
        </Route>

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
