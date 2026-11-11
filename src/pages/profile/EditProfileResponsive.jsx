import { useState } from "react";
import EditProfile from "../../components/editProfile/desktop/EditProfile";
import MobileHeader from "../../components/MobileHeader";
import MobileMenu from "../../components/editProfile/mobile/MobileMenu";
import ProfileHeaderCard from "../../components/editProfile/desktop/ProfileHeaderCard";
import BasicInfoForm from "../../components/editProfile/desktop/BasicInfoForm";
import SocialMediaForm from "../../components/editProfile/desktop/SocialMediaForm";
import BusinessCategory from "../../components/editProfile/desktop/BusinessCategory";
import ContentPreferences from "../../components/editProfile/desktop/ContentPreferences";

export default function EditProfileResponsive() {
  const [step, setStep] = useState(0);

  const steps = [
    { title: "Edit Profile", component: <MobileMenu setStep={setStep} /> },
    { title: "Edit Profile Header", component: <ProfileHeaderCard /> },
    { title: "Basic Info", component: <BasicInfoForm /> },
    { title: "Social Links", component: <SocialMediaForm /> },
    { title: "Partner Profile", component: <BusinessCategory /> },
    { title: "Content Preferences", component: <ContentPreferences /> },
  ];

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <EditProfile />
      </div>

      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-[#F6F7FB]">
        <MobileHeader
          title={steps[step].title}
          onBack={() => setStep(0)}
          showBack={step !== 0}
        />

        <div className="p-4">{steps[step].component}</div>

        {step !== 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <button
              onClick={() => setStep(0)}
              className="w-full py-3 rounded-xl bg-violet-600 text-white font-medium"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </>
  );
}