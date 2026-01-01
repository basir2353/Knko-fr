import { useState } from "react";

const Appointment = () => {
  const [activeTab, setActiveTab] = useState("upcoming");

  const appointments = [
    // Upcoming appointments
    {
      id: 1,
      title: "Deep Tissue Massage",
      practitioner: "Dr. Michael Chen",
      date: "Tue, Nov 18",
      time: "10:00 PM",
      duration: "90 Min",
      image:
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=100&h=100&fit=crop",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Swedish Relaxation Massage",
      practitioner: "Dr. Sarah Williams",
      date: "Thu, Nov 21",
      time: "2:00 PM",
      duration: "60 Min",
      image:
        "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=100&h=100&fit=crop",
      status: "upcoming",
    },
    // Completed appointments
    {
      id: 3,
      title: "Deep Tissue Massage - Upper Back Focus",
      practitioner: "Dr. Michael Chen",
      date: "Nov 29, 2024",
      time: "4:30 PM",
      duration: "60 Min",
      image:
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=100&h=100&fit=crop",
      status: "completed",
    },
    {
      id: 4,
      title: "Deep Tissue Massage - Upper Back Focus",
      practitioner: "Dr. Sarah Williams",
      date: "Nov 29, 2024",
      time: "4:30 PM",
      duration: "60 Min",
      image:
        "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=100&h=100&fit=crop",
      status: "completed",
    },
    {
      id: 5,
      title: "Hot Stone Therapy",
      practitioner: "Dr. Emily Rodriguez",
      date: "Nov 15, 2024",
      time: "11:00 AM",
      duration: "75 Min",
      image:
        "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=100&h=100&fit=crop",
      status: "completed",
    },
    {
      id: 6,
      title: "Sports Massage - Full Body",
      practitioner: "Dr. Michael Chen",
      date: "Nov 10, 2024",
      time: "3:00 PM",
      duration: "90 Min",
      image:
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=100&h=100&fit=crop",
      status: "completed",
    },
    // Confirmed appointments
    {
      id: 7,
      title: "Aromatherapy Massage",
      practitioner: "Dr. Lisa Thompson",
      date: "Dec 5, 2024",
      time: "10:30 AM",
      duration: "60 Min",
      image:
        "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=100&h=100&fit=crop",
      status: "confirmed",
    },
    {
      id: 8,
      title: "Prenatal Massage",
      practitioner: "Dr. Sarah Williams",
      date: "Dec 8, 2024",
      time: "1:00 PM",
      duration: "45 Min",
      image:
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=100&h=100&fit=crop",
      status: "confirmed",
    },
    {
      id: 9,
      title: "Reflexology Session",
      practitioner: "Dr. Emily Rodriguez",
      date: "Dec 12, 2024",
      time: "4:00 PM",
      duration: "30 Min",
      image:
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=100&h=100&fit=crop",
      status: "confirmed",
    },
    // Cancelled appointments
    {
      id: 10,
      title: "Couples Massage",
      practitioner: "Dr. Michael Chen",
      date: "Oct 20, 2024",
      time: "5:00 PM",
      duration: "90 Min",
      image:
        "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=100&h=100&fit=crop",
      status: "cancelled",
    },
    {
      id: 11,
      title: "Thai Massage",
      practitioner: "Dr. Lisa Thompson",
      date: "Oct 15, 2024",
      time: "11:30 AM",
      duration: "60 Min",
      image:
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=100&h=100&fit=crop",
      status: "cancelled",
    },
  ];

  const tabs = [
    { id: "completed", label: "Completed" },
    { id: "upcoming", label: "Upcoming" },
    { id: "confirmed", label: "Confirmed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const filteredAppointments = appointments.filter(
    (apt) => apt.status === activeTab
  );

  return (
    <div className="flex-1 bg-[#f9f7f5] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="libre-font text-2xl font-bold text-[#5f7a3d]">
          Appointments
        </h1>
      </div>
      <div className="space-y-4">
        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-6">
          {/* Section Title */}
          <h2 className="libre-font text-lg font-bold text-[#5f7a3d] mb-4">
            Your Appointments
          </h2>

          {/* Tabs */}
          <div className="flex items-center gap-6 mb-6 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? "text-[#5f7a3d] border-b-2 border-[#5f7a3d]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">
                No {activeTab} appointments
              </p>
            ) : (
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-[#f8f8f6] hover:bg-[#eef3e8] rounded-2xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={appointment.image}
                      alt={appointment.title}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {appointment.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {appointment.practitioner} | {appointment.date} at{" "}
                        {appointment.time} ({appointment.duration})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeTab === "upcoming" ? (
                      <>
                        <button className="px-5 py-2.5 bg-[#c5893a] text-white text-xs font-semibold rounded-full hover:bg-[#b07a32] transition-colors tracking-wide">
                          RESCHEDULE
                        </button>
                        <button className="px-5 py-2.5 bg-white text-gray-800 text-xs font-semibold rounded-full border border-gray-300 hover:bg-gray-50 transition-colors tracking-wide">
                          CANCEL
                        </button>
                      </>
                    ) : (
                      <button className="px-5 py-2.5 bg-white text-gray-800 text-xs font-semibold rounded-full border border-gray-300 hover:bg-gray-50 transition-colors tracking-wide">
                        VIEW DETAILS
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl">
            <h2 className="libre-font text-lg font-bold text-[#5f7a3d] mb-4">
              Scheduled Classes
            </h2>
            {/* Classes List */}
            <div className="space-y-4">
              <div className="flex bg-gray-100 p-2 rounded-2xl items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100&h=100&fit=crop"
                    alt="Deep Relaxing & Sleep"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Deep Relaxing & Sleep
                    </h3>
                    <p className="text-xs">
                      <span className="text-[#c5893a]">Sleep</span>
                      <span className="text-gray-400 ml-2">25 min</span>
                    </p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-[#f5f5f3] text-gray-600 text-xs font-medium rounded-full">
                  Nov 15
                </span>
              </div>

              <div className="flex bg-gray-100 p-2 rounded-2xl items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=100&h=100&fit=crop"
                    alt="Pain management"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Pain management
                    </h3>
                    <p className="text-xs">
                      <span className="text-[#c5893a]">Wellness</span>
                      <span className="text-gray-400 ml-2">30 min</span>
                    </p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-[#f5f5f3] text-gray-600 text-xs font-medium rounded-full">
                  Nov 12
                </span>
              </div>

              <div className="flex bg-gray-100 p-2 rounded-2xl items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=100&h=100&fit=crop"
                    alt="Pain management"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Pain management
                    </h3>
                    <p className="text-xs">
                      <span className="text-[#c5893a]">Wellness</span>
                      <span className="text-gray-400 ml-2">30 min</span>
                    </p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-[#f5f5f3] text-gray-600 text-xs font-medium rounded-full">
                  Nov 8
                </span>
              </div>
            </div>

            {/* See All Button */}
            <div className="flex justify-end mt-5">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-800 text-xs font-semibold rounded-full border border-gray-300 hover:bg-gray-50 transition-colors tracking-wide">
                SEE ALL CLASSES
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
