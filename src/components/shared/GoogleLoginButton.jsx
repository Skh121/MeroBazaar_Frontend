import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useGoogleAuth } from "../../hooks/useAuth";

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const { mutate: googleAuth, isPending, error } = useGoogleAuth();

  const handleSuccess = (credentialResponse) => {
    googleAuth(credentialResponse.credential, {
      onSuccess: (data) => {
        if (onSuccess) onSuccess(data);
        navigate(data.role === "admin" ? "/admin/dashboard" : "/");
      },
      onError: (err) => {
        if (onError) onError(err);
      },
    });
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.({ message: "Google login failed" })}
        theme="outline"
        size="large"
        width={420}
        text="continue_with"
        shape="rectangular"
      />
      {isPending && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Signing in with Google...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-2 text-center">
          {error.response?.data?.message || "Google authentication failed"}
        </p>
      )}
    </div>
  );
};

export default GoogleLoginButton;
