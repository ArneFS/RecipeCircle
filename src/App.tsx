import './App.css';
import AuthForm from './AuthForm';

function App() {
  return (
    <div className="min-h-screen bg-amber-100 p-6 font-sans">
      <h1 className="text-4xl md:text-6xl font-serif font-bold text-center text-amber-600 mb-4">
        RecipeCircle
      </h1>
      <p className="text-center text-base md:text-lg max-w-md mx-auto mb-6">
        Sign in or create an account to manage your favorite recipes.
      </p>
      <AuthForm />
    </div>
  );
}

export default App;