import { Navigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import type { JSX } from "react/jsx-dev-runtime";

type Props = {
  children: JSX.Element;
};

const PrivateRoute = ({ children }: Props) => {
  const { account } = useAccount();

  if (!account) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default PrivateRoute;
