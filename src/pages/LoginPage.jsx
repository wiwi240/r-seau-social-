import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { loginUser } from "../features/auth/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jwt, status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (jwt) {
      navigate("/", { replace: true });
    }
  }, [jwt, navigate]);

  return (
    <AuthForm
      mode="login"
      onSubmit={(payload) => dispatch(loginUser(payload))}
      loading={status === "loading"}
      error={error}
    />
  );
}
