import { FiArrowLeft } from "react-icons/fi";

function MobileHeader({ title, onBack, showBack }) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
      {showBack && (
        <button onClick={onBack}>
          <FiArrowLeft className="text-xl" />
        </button>
      )}
      <h2 className="font-semibold">{title}</h2>
    </div>
  );
}

export default MobileHeader