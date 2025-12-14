import React, { useState, useCallback } from 'react';
import { Upload, Loader2, Camera, Leaf } from './components/Icons';
import PlantDetails from './components/PlantDetails';
import ChatBot from './components/ChatBot';
import { analyzePlantImage } from './services/geminiService';
import { PlantData, AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      // Convert to base64 for API (removing header)
      const base64Promise = new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.readAsDataURL(file);
          r.onload = () => {
              if (typeof r.result === 'string') {
                  const base64Data = r.result.split(',')[1];
                  resolve(base64Data);
              } else {
                  reject(new Error("Failed to read file"));
              }
          };
          r.onerror = reject;
      });

      const base64Data = await base64Promise;
      const data = await analyzePlantImage(base64Data, file.type);
      
      setPlantData(data);
      setAppState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setError("Failed to identify the plant. Please try a clearer photo.");
      setAppState(AppState.ERROR);
    }
  }, []);

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setPlantData(null);
    setImagePreview(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-green-50 text-stone-800 font-sans selection:bg-green-200">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-green-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-green-600 p-1.5 rounded-lg text-white">
              <Leaf size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-green-950">GreenThumb AI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-stone-600">
            <span className="hover:text-green-700 cursor-pointer transition-colors">How it Works</span>
            <span className="hover:text-green-700 cursor-pointer transition-colors">Garden Guide</span>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        
        {/* State: IDLE - Upload Area */}
        {appState === AppState.IDLE && (
          <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-6 leading-tight">
              Discover Your Garden's <br className="hidden md:block"/> Hidden Secrets
            </h1>
            <p className="text-lg text-stone-600 mb-10 leading-relaxed max-w-lg mx-auto">
              Snap a photo of any plant to instantly identify it and receive expert care instructions tailored to its needs.
            </p>

            <div className="relative group cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className="border-4 border-dashed border-green-200 bg-white rounded-3xl p-12 transition-all duration-300 group-hover:border-green-400 group-hover:shadow-xl group-hover:scale-[1.01] flex flex-col items-center justify-center min-h-[300px]">
                <div className="bg-green-50 p-6 rounded-full text-green-600 mb-6 group-hover:bg-green-100 transition-colors">
                  <Camera size={48} />
                </div>
                <h3 className="text-xl font-semibold text-stone-800 mb-2">Upload or Drop Photo</h3>
                <p className="text-stone-500">Supports JPG, PNG, WEBP</p>
                <button className="mt-8 px-8 py-3 bg-green-600 text-white rounded-full font-semibold shadow-lg shadow-green-200 group-hover:bg-green-700 transition-all flex items-center">
                  <Upload className="mr-2" size={20} /> Select Image
                </button>
              </div>
            </div>
            
            {/* Feature Pills */}
            <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm font-medium text-stone-500">
               <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-stone-100">🌿 Instant Identification</span>
               <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-stone-100">💧 Care Schedules</span>
               <span className="px-4 py-2 bg-white rounded-full shadow-sm border border-stone-100">🩺 Disease Diagnosis</span>
            </div>
          </div>
        )}

        {/* State: ANALYZING - Loading */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
            <div className="relative w-64 h-64 mb-8">
              {imagePreview && (
                 <img 
                   src={imagePreview} 
                   alt="Analyzing" 
                   className="w-full h-full object-cover rounded-3xl shadow-lg opacity-50"
                 />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex flex-col items-center">
                   <Loader2 size={40} className="animate-spin text-green-600 mb-2" />
                   <span className="font-semibold text-green-800">Analyzing leaf patterns...</span>
                </div>
              </div>
            </div>
            <p className="text-stone-500 text-center max-w-md">
              We're consulting our botanical database (and AI brain) to get you the best details.
            </p>
          </div>
        )}

        {/* State: RESULT - Details */}
        {appState === AppState.RESULT && plantData && imagePreview && (
          <PlantDetails 
            data={plantData} 
            imageSrc={imagePreview} 
            onReset={resetApp} 
          />
        )}

        {/* State: ERROR */}
        {appState === AppState.ERROR && (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-red-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-red-500 mb-6">
              <Leaf size={40} className="transform rotate-180" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Oops! Something went wrong.</h2>
            <p className="text-stone-600 mb-8 max-w-md mx-auto">{error}</p>
            <button 
              onClick={resetApp}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

      </main>

      {/* Chat Bot is always available, but gets smarter with context */}
      <ChatBot plantContext={plantData || undefined} />

    </div>
  );
}

export default App;
