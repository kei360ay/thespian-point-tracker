import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

function AuthButton({ user }) {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign-in failed:', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out failed:', error.message);
    }
  };

  if (user) {
    return (
      <div className="auth-bar">
        <span>Signed in as <strong>{user.displayName}</strong></span>
        <button onClick={handleSignOut} className="auth-button">Sign out</button>
      </div>
    );
  }

  return (
    <div className="auth-bar">
      <button onClick={handleSignIn} className="auth-button">Sign in with Google</button>
    </div>
  );
}

export default AuthButton;