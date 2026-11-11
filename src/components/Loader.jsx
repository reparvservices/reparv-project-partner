import React from 'react'
import { useAuth } from '../store/auth';

function Loader() {
    const { loading } = useAuth();
  return (
    <div className={`${loading ? "block":"hidden"} w-10 h-10 border-4 border-gray-300 border-t-[#8A38F5] rounded-full animate-spin`}></div>
  )
}

export default Loader