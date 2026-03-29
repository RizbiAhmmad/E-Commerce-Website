import { useEffect, useState } from "react";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { SlEnvolopeLetter } from "react-icons/sl";

const NoticePopup = () => {
  const axiosPublic = useAxiosPublic();
  const [show, setShow] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const fetchNotice = async () => {
      const res = await axiosPublic.get("/notice");
      if (!res.data?.isActive) return;

      setNotice(res.data);

      const alreadyShown = localStorage.getItem("noticeShown");

      if (!alreadyShown) {
        setTimeout(() => {
          setShow(true);
          localStorage.setItem("noticeShown", "true");
        }, res.data.delay || 3000);
      }
    };

    fetchNotice();
  }, []);

  if (!show || !notice) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-[92%] md:w-105 rounded-2xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gray-100 opacity-90"></div>

        <div className="relative bg-white/10 backdrop-blur-xl p-8 text-black rounded-2xl border border-white/20">
          {/* Icon Badge */}
          <div className="flex justify-center relative mb-6">
            <div className="relative">
              {/* Glow Ring */}
              <span className="absolute inset-0 rounded-full bg-white opacity-30 blur-xl animate-pulse"></span>

              {/* Icon */}
              <div className="relative bg-white text-[#0FABCA] p-4 rounded-full shadow-2xl">
                <SlEnvolopeLetter size={30} />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-3 tracking-wider">
            {notice.title}
          </h2>

          <p className="text-center mb-6">{notice.description}</p>

          <button
            onClick={() => setShow(false)}
            className="w-full bg-white text-[#0FABCA] font-semibold py-3 rounded-xl"
          >
            {notice.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticePopup;