import { Container } from "react-bootstrap";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RequireAuth from "./components/RequireAuth";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/userview/HomePage";
import UserProfilePage from "./pages/UserProfilePage";
import AdminDashboard from "./pages/adminview/AdminDashboard";
import ItemsListPage from "./pages/adminview/ItemsListPage";
import AddItemPage from "./pages/adminview/AddItemPage";

// The router itself is created in index.js so tests can supply a MemoryRouter.
const App = () => (
  <>
    <Header />
    <main className="py-3">
      <Container>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><UserProfilePage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth adminOnly><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/:entity" element={<RequireAuth adminOnly><ItemsListPage /></RequireAuth>} />
          <Route path="/admin/:entity/new" element={<RequireAuth adminOnly><AddItemPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </main>
    <Footer />
  </>
);

export default App;
