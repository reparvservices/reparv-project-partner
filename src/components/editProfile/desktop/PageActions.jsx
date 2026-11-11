export default function PageActions() {
  return (
    <div className="bg-violet-50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p className="font-medium">Unsaved changes</p>
        <p className="text-sm text-gray-500">
          Your creator profile preview updates as you edit. Don’t forget to
          publish.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-sm text-gray-500">Cancel</button>
        <button className="px-4 py-2 rounded-xl border text-sm">
          Preview profile
        </button>
        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm shadow">
          Save changes
        </button>
      </div>
    </div>
  );
}
