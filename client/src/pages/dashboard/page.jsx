import {
  MessageCircle,
  ArrowRight,
  Trash,
  Download,
  FileText,
  Plus,
  LayoutGrid,
  CalendarDays,
  Heart,
  FileInput,
  UserRoundPlus,
  Search,
  Calendar,
  ClipboardList,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Activity,
  Moon,
} from "lucide-react";

const Dashboard = () => {
  const practitioners = [
    {
      id: 1,
      name: "Dr. Michael Chen",
      specialty: "Massage Therapist",
      image: "https://i.pravatar.cc/150?img=12",
    },
    {
      id: 2,
      name: "Dr. Sarah Williams",
      specialty: "Physiotherapist",
      image: "https://i.pravatar.cc/150?img=45",
    },
    {
      id: 3,
      name: "Dr. Michael Chen",
      specialty: "Massage Therapist",
      image: "https://i.pravatar.cc/150?img=12",
    },
    {
      id: 4,
      name: "Dr. Sarah Williams",
      specialty: "Physiotherapist",
      image: "https://i.pravatar.cc/150?img=45",
    },
  ];

  const documents = [
    {
      id: 1,
      title: "LMN - Nov 2025",
      category: "Letter of Medical Necessity",
      isLink: false,
    },
    {
      id: 2,
      title: "Wellness Assessment Results",
      category: "Assessment",
      isLink: true,
    },
    {
      id: 3,
      title: "Service Agreement",
      category: "Legal",
      isLink: false,
    },
    {
      id: 4,
      title: "LMN - Nov 2025",
      category: "Letter of Medical Necessity",
      isLink: false,
    },
    {
      id: 5,
      title: "Wellness Assessment Results",
      category: "Assessment",
      isLink: false,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "Appointment Booked",
      description: "Massage Therapy for tomorrow",
      time: "2 Days Ago",
      icon: Calendar,
      bgColor: "bg-[#d4e8d4]",
    },
    {
      id: 2,
      type: "Session completed",
      description: "Massage Therapy with Dr. Sarah Williams",
      time: "3 Days Ago",
      icon: Dumbbell,
      bgColor: "bg-[#f5e6d3]",
    },
    {
      id: 3,
      type: "Form Submitted",
      description: "Updated Health Intake Form",
      time: "1 Week Ago",
      icon: ClipboardList,
      bgColor: "bg-[#e8e8e8]",
    },
  ];

  const wellnessInsights = [
    {
      id: 1,
      title: "Stress Index",
      value: "Low",
      metric: "-12%",
      icon: Flower2,
      bgColor: "bg-[#e8d5f0]",
      iconColor: "text-[#8b5cf6]",
    },
    {
      id: 2,
      title: "Muscle Recovery",
      value: "Good",
      metric: "10%",
      icon: Activity,
      bgColor: "bg-[#d4f1e8]",
      iconColor: "text-[#10b981]",
    },
    {
      id: 3,
      title: "Sleep Quality",
      value: "7.5 hrs",
      metric: "+12%",
      icon: Moon,
      bgColor: "bg-[#dbeafe]",
      iconColor: "text-[#3b82f6]",
    },
  ];

  return (
    <div className="flex-1 bg-[#f9f7f5] p-2">
      <div className="p-3">
        <h2 className="libre-font text-xl font-bold text-[#5f7a3d]">
          Hello, Ellis
        </h2>
        <span className="font-poppins text-sm text-gray-800">
          Lets take care of you today
        </span>
      </div>

      <div className="grid gap-4 p-4 grid-cols-12">
        <div className="flex gap-4 col-span-9">
          <div className="bg-white w-2/5 p-5 rounded-3xl">
            <h2 className="text-base libre-font font-bold text-[#5f7a3d] mb-4">
              Your Practitioners
            </h2>
            <div className="space-y-2.5">
              {practitioners.map((practitioner) => (
                <div
                  key={practitioner.id}
                  className="group flex items-center gap-2.5 p-2.5 rounded-2xl cursor-pointer transition-all bg-gray-50 border border-transparent hover:bg-transparent hover:border-[#c5893a]"
                >
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    src={practitioner.image}
                    alt={practitioner.name}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                      {practitioner.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {practitioner.specialty}
                    </p>
                  </div>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-gray-200 text-gray-600 group-hover:bg-[#c5893a] group-hover:text-white">
                    <MessageCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button className="flex items-center gap-1.5 px-5 py-2.5 bg-white rounded-full border border-gray-300 font-semibold text-gray-800 text-sm whitespace-nowrap">
                SEE ALL PRACTITIONERS
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Documents Section */}
          <div className="col-span-3 flex-1 bg-[#f7f1e7e5] p-5 rounded-3xl">
            <h2 className="text-base libre-font font-bold text-[#5f7a3d] mb-4">
              Your Documents
            </h2>
            <div className="space-y-2.5">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="parent flex items-center gap-2.5 p-2.5 rounded-2xl pl-0"
                >
                  <div className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center">
                    <FileText size={16} className="text-[#5f7a3d]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        document.isLink ? "text-[#2563eb]" : "text-gray-800"
                      }`}
                    >
                      {document.title}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {document.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="text-gray-600 p-1">
                      <Trash size={16} />
                    </button>
                    <button className="text-gray-600 p-1">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-gray-300 font-semibold text-gray-800 text-sm whitespace-nowrap">
                UPLOAD NEW
                <Plus size={14} />
              </button>
              <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-gray-300 font-semibold text-gray-800 text-sm whitespace-nowrap">
                SEE ALL DOCUMENTS
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-3 space-y-2">
          <div className="bg-white rounded-3xl p-5">
            <h2 className="text-base libre-font font-bold text-[#5f7a3d] mb-4">
              Wellness Score
            </h2>
            <h2>Wellness Half Circle Chart Will be Here</h2>
            <p>75%</p>
          </div>


          <div className="bg-white rounded-3xl p-5">
            <h2 className="text-lg libre-font font-semibold text-[#2d3e31] mb-4">
              Wellness Insights
            </h2>
            <div className="space-y-3">
              {wellnessInsights.map((insight) => {
                const IconComponent = insight.icon;
                return (
                  <div
                    key={insight.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${insight.bgColor} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <IconComponent size={20} className={insight.iconColor} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">
                          {insight.title}
                        </span>
                        <span className="text-base text-[#2d2d2d] font-semibold">
                          {insight.value}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {insight.metric}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-xl libre-font font-semibold text-[#5f7a3d] mb-6">
            Recent Activities
          </h2>
          <div className="">
            {recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`${activity.bgColor} w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent size={24} className="text-[#2d2d2d]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">
                        {activity.type}
                      </span>
                      <span className="text-base text-[#2d2d2d] font-medium">
                        {activity.description}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-400">
                      {activity.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end mt-6">
            {/* <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-lg bg-[#2d2d2d] flex items-center justify-center hover:bg-[#3d3d3d] transition-colors cursor-pointer">
                  <ChevronLeft size={20} className="text-white" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-[#2d2d2d] flex items-center justify-center hover:bg-[#3d3d3d] transition-colors cursor-pointer">
                  <ChevronRight size={20} className="text-white" />
                </button>
              </div> */}
            <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-gray-300 font-semibold text-gray-800 text-sm whitespace-nowrap">
              SEE ALL ACTIVITIES
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
