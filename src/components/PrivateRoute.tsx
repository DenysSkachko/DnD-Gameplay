import { Navigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import type { JSX } from "react/jsx-dev-runtime";

type Props = {
  children: JSX.Element;
};

const PrivateRoute = ({ children }: Props) => {
  const { account } = useAccount();

  if (!account) {
    // Если нет залогиненного аккаунта, редирект на /login
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default PrivateRoute;
