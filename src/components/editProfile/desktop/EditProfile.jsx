import BasicInfoForm from "./BasicInfoForm";
import BusinessCategory from "./BusinessCategory";
import ContentPreferences from "./ContentPreferences";
import PageActions from "./PageActions";
import ProfileHeaderCard from "./ProfileHeaderCard";
import SocialMediaForm from "./SocialMediaForm";

export default function EditProfile() {
  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-semibold">Edit Partner Profile</h1>
          <p className="text-xs text-gray-500">
            Tune your creator identity for Reparv social feed and partner discovery.
          </p>
        </div>

        <div className="hidden md:flex gap-4">
          <button className="px-4 py-2 rounded-lg border text-sm">Discard</button>
          <button className="px-4 py-2 rounded-lg bg-[#5323DC] text-white text-sm">
            Save changes
          </button>
        </div>
      </div>

      <div className="max-w-5xl px-4 md:px-6 py-6 space-y-6">
        <ProfileHeaderCard />
        <BasicInfoForm />
        <SocialMediaForm />
        <BusinessCategory />
        <ContentPreferences />
        <PageActions />
      </div>
    </div>
  );
}