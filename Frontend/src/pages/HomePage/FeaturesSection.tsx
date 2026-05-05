import FeatureBox from "../../components/HomePage/FeatureBox";
import { FaMedkit } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { IoIosFolder } from "react-icons/io";
import { FaBell } from "react-icons/fa";
import { IoPhonePortraitOutline } from "react-icons/io5";

const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="pb-2 mx-auto flex h-fit w-full max-w-[1200px] flex-col items-center justify-center px-4 pt-16"
    >
      <h2 className="text-3xl font-bold tracking-wide text-blue-900">
        Main Features
      </h2>
      <div className="flex w-full flex-wrap justify-center gap-4 py-4">
        <FeatureBox>
          <div className="ml-1 rounded-lg bg-[#eaedfb] p-2">
            <FaMedkit size={30} color="#06437a" />
          </div>
          <h3 className="text-left text-2xl font-bold text-[#252a35]">
            Integrated IoT MedBox
          </h3>
          <p className="text-start text-[#8890a0]">
            The centerpiece of our technology, an IoT MedBox that comes with loads of features
          </p>
        </FeatureBox>
        <FeatureBox>
          <div className="ml-1 rounded-lg bg-[#eaedfb] p-2">
            <MdDashboard size={30} color="#06437a" />
          </div>
          <h3 className="text-left text-2xl font-bold text-[#252a35]">
            Centralized Dashboard
          </h3>
          <p className="text-start text-[#8890a0]">
            Centralized dashboard for your schedule-checking convenience
          </p>
        </FeatureBox>
        <FeatureBox>
          <div className="ml-1 rounded-lg bg-[#eaedfb] p-2">
            <IoIosFolder size={30} color="#06437a" />
          </div>
          <h3 className="text-left text-2xl font-bold text-[#252a35]">
            Document Repository
          </h3>
          <p className="text-start text-[#8890a0]">
            Central document storage system to store all your important medical records (it's encrypted!)
          </p>
        </FeatureBox>
        <FeatureBox>
          <div className="ml-1 rounded-lg bg-[#eaedfb] p-2">
            <FaBell size={30} color="#06437a" />
          </div>
          <h3 className="text-left text-2xl font-bold text-[#252a35]">
            Notification System
          </h3>
          <p className="text-start text-[#8890a0]">
            Active notification systems so that you can be aware of any and all scenarios that might happen
          </p>
        </FeatureBox>
        <FeatureBox>
          <div className="ml-1 rounded-lg bg-[#eaedfb] p-2">
            <IoPhonePortraitOutline size={30} color="#06437a" />
          </div>
          <h3 className="text-left text-2xl font-bold text-[#252a35]">
            EldCare Mobile App
          </h3>
          <p className="text-start text-[#8890a0]">
            The EldCare Mobile App, designed as a mobile companion app that is elderly-centered
          </p>
        </FeatureBox>
      </div>
    </section>
  );
};

export default FeaturesSection;
