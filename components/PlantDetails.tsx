import React from 'react';
import { PlantData } from '../types';
import { Droplets, Sun, Thermometer, Shovel, Sprout, Wind, AlertCircle } from './Icons';

interface PlantDetailsProps {
  data: PlantData;
  imageSrc: string;
  onReset: () => void;
}

const CareItem = ({ icon: Icon, title, value }: { icon: any, title: string, value: string }) => (
  <div className="flex items-start space-x-3 p-4 bg-stone-50 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="bg-green-100 p-2 rounded-lg text-green-700">
      <Icon size={20} />
    </div>
    <div>
      <h4 className="font-semibold text-stone-800 text-sm">{title}</h4>
      <p className="text-stone-600 text-sm mt-1 leading-relaxed">{value}</p>
    </div>
  </div>
);

const PlantDetails: React.FC<PlantDetailsProps> = ({ data, imageSrc, onReset }) => {
  return (
    <div className="animate-fade-in space-y-8 pb-20 md:pb-0">
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
        <div className="md:flex">
          <div className="md:w-1/3 h-64 md:h-auto relative">
            <img 
              src={imageSrc} 
              alt={data.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
            <div className="absolute bottom-4 left-4 text-white md:hidden">
              <h2 className="text-2xl font-bold">{data.name}</h2>
              <p className="text-stone-200 italic">{data.scientificName}</p>
            </div>
          </div>
          <div className="p-6 md:p-8 md:w-2/3 flex flex-col justify-center">
            <div className="hidden md:block mb-4">
              <h2 className="text-3xl font-bold text-green-900">{data.name}</h2>
              <p className="text-lg text-green-700 italic font-medium">{data.scientificName}</p>
            </div>
            
            <p className="text-stone-600 leading-relaxed mb-6">
              {data.description}
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
              <p className="text-amber-800 text-sm font-medium">
                <span className="font-bold block mb-1">🌱 Fun Fact</span>
                {data.funFact}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Care Grid */}
      <div>
        <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
          <Sprout className="mr-2" /> Care Instructions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CareItem icon={Droplets} title="Watering" value={data.care.water} />
          <CareItem icon={Sun} title="Light" value={data.care.sun} />
          <CareItem icon={Shovel} title="Soil" value={data.care.soil} />
          <CareItem icon={Thermometer} title="Temperature" value={data.care.temperature} />
          <CareItem icon={Wind} title="Fertilizer" value={data.care.fertilizer} />
          
          <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-xl border border-red-100 shadow-sm">
             <div className="bg-red-100 p-2 rounded-lg text-red-700">
              <AlertCircle size={20} /> {/* Assuming AlertCircle is available, reused Sprout otherwise */}
            </div>
            <div>
              <h4 className="font-semibold text-stone-800 text-sm">Common Problems</h4>
              <ul className="text-stone-600 text-sm mt-1 list-disc list-inside">
                {data.problems.map((prob, i) => (
                  <li key={i}>{prob}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onReset}
        className="w-full md:w-auto px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-full font-semibold transition-colors mx-auto block"
      >
        Identify Another Plant
      </button>
    </div>
  );
};

export default PlantDetails;