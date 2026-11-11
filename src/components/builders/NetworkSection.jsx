import BuilderCard from "./BuilderCard";

/**
 * NetworkSection
 * Props: builders (real API data array), onAction(action, builderid)
 */
export default function NetworkSection({ builders = [], onAction }) {
  return (
    <div>
      <div className="px-5 md:px-8 pt-7 pb-5">
        <p className="text-[11px] font-bold tracking-[0.12em] text-gray-500 uppercase">
          Your Network ({builders.length})
        </p>
      </div>

      <div className="px-5 md:px-8 pb-8">
        {builders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400 text-sm">
            No builders found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {builders.map((builder, index) => (
              <BuilderCard
                key={builder.builderid || index}
                builder={builder}
                onAction={onAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}