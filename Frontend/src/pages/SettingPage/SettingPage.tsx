import { useContext, useState } from "react";
import { IoPersonCircle, IoMoonSharp } from "react-icons/io5";
import { LuSiren, LuActivity } from "react-icons/lu";
import { PiSpeakerLowFill } from "react-icons/pi";
import { TbPillFilled } from "react-icons/tb";
import { MdKeyboardArrowDown } from "react-icons/md";
import { CurrentUserContext } from "../../lib/contexts/CurrentUserContext";
import { MdEmail } from "react-icons/md";
import { MdLocalPhone } from "react-icons/md";

const SettingPage = () => {
  const currentUserContext = useContext(CurrentUserContext);
  const [emergencyAlert, setEmergencyAlert] = useState(true);
  const [aiVoiceAlarm, setAiVoiceAlarm] = useState(false);
  const [dailyConfirmation, setDailyConfirmation] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English (US)");

  const ToggleSwitch = ({ isOn, handleToggle, activeColor = "bg-blue-600" }: { isOn: boolean, handleToggle: () => void, activeColor?: string }) => (
    <div
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        isOn ? activeColor : "bg-slate-300"
      }`}
      onClick={handleToggle}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
          isOn ? "translate-x-5" : ""
        }`}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl p-6 text-slate-800">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A2D6E]">Settings</h1>
        </div>
      </div>
      <div className="bg-[#E8F0FF] border-slate-500 rounded-lg shadow-xl w-full p-4 mb-8 flex justify-center items-center align-middle">
        <div className="flex flex-row gap-4 items-center">
          <IoPersonCircle size={50} className="text-[#0A2D6E]" />
          <div className="flex flex-col">
            <p className="font-semibold text-lg">{currentUserContext?.currentUser?.username}</p>
            <p className="text-slate-600">{currentUserContext?.currentUser?.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4 text-slate-600 uppercase tracking-wider">
            Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <LuSiren className="text-xl text-red-600" />
                </div>
                <span className="font-medium text-slate-700">Emergency Alert</span>
              </div>
              <ToggleSwitch 
                isOn={emergencyAlert} 
                handleToggle={() => setEmergencyAlert(!emergencyAlert)} 
                activeColor="bg-red-500" 
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PiSpeakerLowFill className="text-xl text-blue-600" />
                </div>
                <span className="font-medium text-slate-700">AI Voice Alarm</span>
              </div>
              <ToggleSwitch 
                isOn={aiVoiceAlarm} 
                handleToggle={() => setAiVoiceAlarm(!aiVoiceAlarm)} 
                activeColor="bg-blue-500"
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TbPillFilled className="text-xl text-green-600" />
                </div>
                <span className="font-medium text-slate-700">Daily Confirmation</span>
              </div>
              <ToggleSwitch 
                isOn={dailyConfirmation} 
                handleToggle={() => setDailyConfirmation(!dailyConfirmation)} 
                activeColor="bg-green-500"
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <IoMoonSharp className="text-xl text-slate-800" />
                </div>
                <span className="font-medium text-slate-700">Dark Mode</span>
              </div>
              <ToggleSwitch 
                isOn={darkMode} 
                handleToggle={() => setDarkMode(!darkMode)} 
                activeColor="bg-slate-800"
              />
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-600 uppercase tracking-wider mb-2">
            App Language
          </h2>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-4 pr-12 cursor-pointer appearance-none shadow-sm outline-none"
            >
              <option value="English (US)">English (US)</option>
              <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              <option value="中文">中文</option>
            </select>
            <MdKeyboardArrowDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-3xl text-slate-400 pointer-events-none" />
          </div>
        </section>
        <section className="pt-2">
          <button
            onClick={() => console.log("Navigating to Sensor Activity Logs...")}
            className="w-full bg-[#fdf8eb] hover:bg-[#faeed0] border border-[#f0e1bc] text-amber-800 py-4 px-6 rounded-xl flex items-center justify-center transition-colors shadow-sm"
          >
            <LuActivity className="text-2xl mr-3" />
            <span className="font-medium text-lg">View Sensor Activity Logs</span>
          </button>
        </section>
        <section>
          <div className="flex flex-col bg-gradient-to-b from-[#B3CEFF] to-[#FFFFFF] p-2 gap-2 rounded-lg shadow-lg justify-center">
            <p className="text-xl text-[#0A2D6E] font-semibold">Customer Support</p>
            <div className="flex flex-row items-center gap-2">
              <MdEmail />
              <p>Email: eldcaresupport@gmail.com</p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <MdLocalPhone />
              <p>Phone: +62 888 888 888</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingPage;

