import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { authAtom, registerAtom } from "../state/socialAtoms";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { jwt, status, error } = useAtomValue(authAtom);
  const register = useSetAtom(registerAtom);

  useEffect(() => {
    if (jwt) {
      navigate("/", { replace: true });
    }
  }, [jwt, navigate]);

  return (
    <AuthForm
      mode="register"
      onSubmit={register}
      loading={status === "loading"}
      error={error}
    />
  );
}
