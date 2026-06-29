import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { authAtom, loginAtom } from "../state/socialAtoms";

export default function LoginPage() {
  const navigate = useNavigate();
  const { jwt, status, error } = useAtomValue(authAtom);
  const login = useSetAtom(loginAtom);

  useEffect(() => {
    if (jwt) {
      navigate("/", { replace: true });
    }
  }, [jwt, navigate]);

  return (
    <AuthForm
      mode="login"
      onSubmit={login}
      loading={status === "loading"}
      error={error}
    />
  );
}
