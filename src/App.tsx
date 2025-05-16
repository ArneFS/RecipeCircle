import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-amber-100 text-gray-800 flex flex-col items-center justify-center p-6 font-sans">
      {/* Logo / App Name */}
      <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-amber-600">
        RecipeCircle
      </h1>

      {/* Description */}
      <p className="text-base md:text-lg text-center max-w-md mb-8">
        Save and share your family’s favorite recipes — beautifully preserved for generations.
      </p>

      {/* Call to Action */}
      <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-xl shadow transition">
        Get Started
      </button>
    </div>
  );
}

export default App;
