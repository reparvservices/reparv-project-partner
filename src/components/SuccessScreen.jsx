import React, { useEffect } from 'react';
import { MdDone } from "react-icons/md";
import { useAuth } from '../store/auth';

function SuccessScreen() {
  const { successScreen, setSuccessScreen } = useAuth();
  
  // set Timer For Hide After 2 second.
  useEffect(() => {
    if (successScreen.show) {
      const timer = setTimeout(() => {
        setSuccessScreen({ ...successScreen, show: false });
      }, 2000);
      return () => clearTimeout(timer); 
    }
  }, [successScreen.show]);

  if (!successScreen.show) return null;

  return (
    <div 
      onClick={() => setSuccessScreen({ ...successScreen, show: false })}
      className="successScreen w-full h-screen flex items-center justify-center fixed z-[1000] bg-white cursor-pointer"
    >
      <div className="successMessage w-[90%] sm:w-[70%] max-w-4xl py-8 sm:py-15 rounded-xl bg-gradient-to-r from-[#076300] to-[#0BB501] flex sm:gap-8 gap-4 flex-col items-center justify-center text-white">
        <div className="rightIcon w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#0BB501]">
          <MdDone className="w-8 h-8" />
        </div>
        <h2 className="text-xl md:text-3xl font-semibold">{successScreen.label}</h2>
        <h4 className="text-xs md:text-lg">{successScreen.description}</h4>
      </div>
    </div>
  );
}

export default SuccessScreen;