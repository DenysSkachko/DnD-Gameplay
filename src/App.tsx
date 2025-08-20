import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AccountProvider } from "./context/AccountContext";
import AuthPage from "./pages/Auth/AuthPage";
import PrivateRoute from "./components/PrivateRoute";
import HomePage from "./pages/Home/HomePage";
import CombatPage from "./pages/Home/CombatPage"; 

const App = () => {
  return (
    <AccountProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/combat"     
            element={
              <PrivateRoute>
                <CombatPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AccountProvider>
  );
};

export default App;
