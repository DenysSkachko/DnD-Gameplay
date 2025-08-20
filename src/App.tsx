// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { AccountProvider } from "./context/AccountContext";
import AuthPage from "./pages/Auth/AuthPage";
import PrivateRoute from "./components/PrivateRoute";
import HomePage from "./pages/Home/HomePage";
import CombatPage from "./pages/Home/CombatPage";

const Header = () => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 w-full h-14 bg-gradient-to-r from-accent to-accent-hover text-light text-3xl bangers flex shadow-md z-50">
      <nav className="flex w-full">
        <Link
          to="/"
          className={`flex-1 flex items-center justify-center transition ${
            location.pathname === "/" ? "bg-accent" : "hover:bg-white/10"
          }`}
        >
          Home
        </Link>
        <Link
          to="/combat"
          className={`flex-1 flex items-center justify-center transition ${
            location.pathname === "/combat" ? "bg-accent-hover" : "hover:bg-white/10"
          }`}
        >
          Fight
        </Link>
      </nav>
    </header>
  );
};

const App = () => {
  return (
    <AccountProvider>
      <Router>
        <Routes>
          {/* публичная страница */}
          <Route path="/auth" element={<AuthPage />} />

          {/* приватные страницы */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <div className="pt-14"> 
                  {/* фиксированный хедер */}
                  <Header />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/combat" element={<CombatPage />} />
                  </Routes>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AccountProvider>
  );
};

export default App;
