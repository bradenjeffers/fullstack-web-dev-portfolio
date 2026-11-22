import React from "react";
import { Container } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/userview/HomePage";
import AdminDashboard from "./pages/adminview/AdminDashboard";
import { loadSession, saveSession, clearSession } from "./session";

const App = () => {
  const [loggedInUser, setLoggedInUser] = React.useState(loadSession);

  const handleLogin = (user) => {
    saveSession(user);
    setLoggedInUser(user);
  };

  const handleLogout = () => {
    clearSession();
    setLoggedInUser(null);
  };

  let page = <LoginPage onLogin={handleLogin} />;
  if (loggedInUser) {
    page = loggedInUser.isAdmin ? <AdminDashboard /> : <HomePage />;
  }

  return (
    <>
      <Header user={loggedInUser} onLogout={handleLogout} />
      <main className="py-3">
        <Container>{page}</Container>
      </main>
      <Footer />
    </>
  );
};

export default App;
