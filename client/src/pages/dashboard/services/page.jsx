import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, List, LayoutGrid, ArrowUpRight } from "lucide-react";

/**
 * @typedef {"grid" | "list"} ViewMode
 */

/**
 * @typedef {"All Services" | "Massage" | "Physiotherapy" | "Hypnotherapy" | "Acupuncture" | "Nutrition"} TabType
 */

const servicesData = [
  // Massage
  {
    title: "Massage Therapy",
    subtitle: "Therapeutic Touch Transformed",
    category: "Massage",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop",
  },
  {
    title: "Hot Stone Treatment",
    subtitle: "Warmth Meets Wellness",
    category: "Massage",
    image:
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&h=600&fit=crop",
  },
  // Physiotherapy
  {
    title: "Physical Rehabilitation",
    subtitle: "Restore Strength & Mobility",
    category: "Physiotherapy",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
  },
  {
    title: "Sports Injury Recovery",
    subtitle: "Back to Peak Performance",
    category: "Physiotherapy",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
  },
  // Hypnotherapy
  {
    title: "Mind Reprogramming",
    subtitle: "Unlock Inner Potential",
    category: "Hypnotherapy",
    image:
      "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=800&h=600&fit=crop",
  },
  {
    title: "Anxiety Relief Sessions",
    subtitle: "Calm Your Racing Thoughts",
    category: "Hypnotherapy",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
  },
  // Acupuncture
  {
    title: "Traditional Acupuncture",
    subtitle: "Ancient Healing Wisdom",
    category: "Acupuncture",
    image:
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=600&fit=crop",
  },
  {
    title: "Cosmetic Needling",
    subtitle: "Natural Beauty Enhancement",
    category: "Acupuncture",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop",
  },
  // Nutrition
  {
    title: "Personalized Diet Plans",
    subtitle: "Fuel Your Body Right",
    category: "Nutrition",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop",
  },
  {
    title: "Gut Health Optimization",
    subtitle: "Digestive Harmony Achieved",
    category: "Nutrition",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
  },
];

const serviceBoxData = [
  // Massage
  {
    id: 1,
    title: "Therapeutic Massage",
    description:
      "A custom-blended session tailored to your needs using multiple techniques such as deep tissue, myofascial release, or trigger point work. Perfect for chronic tension, postural imbalance, or stress-related discomfort.",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop",
    category: "Massage",
  },
  {
    id: 2,
    title: "Deep Tissue Bodywork",
    description:
      "Focused pressure targeting deeper muscle layers to release persistent knots. Ideal for athletes or individuals seeking lasting relief from stubborn muscular pain.",
    image:
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&h=400&fit=crop",
    category: "Massage",
  },
  {
    id: 3,
    title: "Swedish Relaxation",
    description:
      "Gentle full-body treatment using long strokes and kneading methods. Excellent for stress reduction, improved circulation, and complete mental unwinding.",
    image:
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&h=400&fit=crop",
    category: "Massage",
  },
  // Physiotherapy
  {
    id: 4,
    title: "Movement Restoration",
    description:
      "Comprehensive assessment and targeted exercises designed to rebuild functional mobility. Our specialists create personalized programs addressing your specific physical limitations.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop",
    category: "Physiotherapy",
  },
  {
    id: 5,
    title: "Post-Surgery Rehabilitation",
    description:
      "Structured recovery protocols helping you regain strength after surgical procedures. Evidence-based approaches ensure safe progression toward full functionality.",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    category: "Physiotherapy",
  },
  {
    id: 6,
    title: "Chronic Pain Management",
    description:
      "Long-term strategies combining manual therapy with corrective exercises. Address root causes rather than symptoms for sustainable improvement.",
    image:
      "https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=400&h=400&fit=crop",
    category: "Physiotherapy",
  },
  // Hypnotherapy
  {
    id: 7,
    title: "Subconscious Repatterning",
    description:
      "Transform limiting beliefs through guided trance states. Access deeper awareness to reshape habits, overcome fears, and cultivate positive behavioral changes.",
    image:
      "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=400&h=400&fit=crop",
    category: "Hypnotherapy",
  },
  {
    id: 8,
    title: "Sleep Enhancement Protocol",
    description:
      "Specialized sessions targeting insomnia and restless nights. Reprogram your mind for deeper, more restorative slumber without pharmaceutical dependency.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
    category: "Hypnotherapy",
  },
  {
    id: 9,
    title: "Confidence Building Journey",
    description:
      "Unlock hidden self-assurance buried beneath doubt. Emerge with renewed belief in your capabilities and readiness to embrace life challenges.",
    image:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=400&fit=crop",
    category: "Hypnotherapy",
  },
  // Acupuncture
  {
    id: 10,
    title: "Meridian Balancing",
    description:
      "Traditional Chinese medicine approach restoring energy flow throughout your body. Precise needle placement activates natural healing responses and harmonizes vital systems.",
    image:
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&h=400&fit=crop",
    category: "Acupuncture",
  },
  {
    id: 11,
    title: "Fertility Support Treatment",
    description:
      "Holistic protocols enhancing reproductive wellness for conception journeys. Combines acupuncture with lifestyle guidance supporting hormonal equilibrium.",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop",
    category: "Acupuncture",
  },
  {
    id: 12,
    title: "Migraine Relief Program",
    description:
      "Targeted interventions reducing frequency and intensity of headaches. Many clients report significant improvements after just several sessions.",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
    category: "Acupuncture",
  },
  // Nutrition
  {
    id: 13,
    title: "Metabolic Reset Consultation",
    description:
      "Comprehensive evaluation identifying nutritional gaps hindering your vitality. Receive actionable recommendations transforming how you nourish yourself daily.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop",
    category: "Nutrition",
  },
  {
    id: 14,
    title: "Anti-Inflammatory Diet Design",
    description:
      "Strategic meal planning reducing systemic inflammation naturally. Learn which foods heal versus harm, creating sustainable eating patterns.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop",
    category: "Nutrition",
  },
  {
    id: 15,
    title: "Weight Management Coaching",
    description:
      "Balanced approach achieving healthy body composition without extreme dieting. Focus on nourishment over restriction for lasting transformation.",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=400&fit=crop",
    category: "Nutrition",
  },
];

/** @type {TabType[]} */
const tabs = [
  "All Services",
  "Massage",
  "Physiotherapy",
  "Hypnotherapy",
  "Acupuncture",
  "Nutrition",
];

const Services = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Services");
  const [viewMode, setViewMode] = useState("grid");

  // Filter services based on active tab
  const filteredGridServices =
    activeTab === "All Services"
      ? servicesData
      : servicesData.filter((service) => service.category === activeTab);

  const filteredListServices =
    activeTab === "All Services"
      ? serviceBoxData
      : serviceBoxData.filter((service) => service.category === activeTab);

  // Auto switch view based on tab
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Massage") {
      setViewMode("list");
    } else if (tab === "All Services") {
      setViewMode("grid");
    }
  };

  return (
    <section className="p-6 bg-[#f9f7f5] min-h-screen">
      <p className="text-gray-700 mb-4">
        Explore and Book Wellness Appointments
      </p>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center bg-white px-4 py-2.5 rounded-full w-[280px] border border-gray-200">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Search Service"
            className="outline-none text-sm w-full bg-transparent"
          />
        </div>

        {/* Tabs */}
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => handleTabClick(item)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === item
                ? "bg-[#5f7a3d] text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {item}
          </button>
        ))}

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              viewMode === "list"
                ? "bg-[#c5893a] text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              viewMode === "grid"
                ? "bg-[#c5893a] text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {filteredGridServices.map((service, index) => (
            <div
              key={service.title}
              onClick={() => navigate(`/dashboard/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`)}
              className="bg-white rounded-3xl p-5 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold libre-font text-gray-900">
                    {service.title}
                  </h3>
                  <p className="text-sm text-[#c5893a]">{service.subtitle}</p>
                </div>

                <button className="flex items-center gap-2 text-sm text-gray-600">
                  See All
                  <span className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
                    <ArrowUpRight size={16} />
                  </span>
                </button>
              </div>

              <img
                src={service.image}
                alt={service.title}
                className="rounded-2xl w-full h-[200px] object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="mt-8 space-y-4">
          {activeTab !== "All Services" && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[#5f7a3d] libre-font">
                {activeTab}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Explore and Book {activeTab} Services
              </p>
            </div>
          )}

          {filteredListServices.length > 0 ? (
            filteredListServices.map((service) => (
              <div
                key={service.id}
                onClick={() => navigate(`/dashboard/services/${service.id}`)}
                className="relative flex flex-row gap-5 bg-white rounded-3xl p-5 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="w-[160px] h-[140px] shrink-0">
                  <img
                    className="w-full h-full object-cover rounded-xl"
                    src={service.image}
                    alt={service.title}
                  />
                </div>
                <div className="py-2 flex flex-col gap-2 flex-1 pr-4">
                  <span className="text-lg font-semibold text-[#2b2b2b] libre-font">
                    {service.title}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <button className="absolute bottom-5 right-5 px-6 py-3 bg-[#c5893a] text-white text-xs font-semibold rounded-full hover:bg-[#b07a32] transition-colors tracking-wide">
                  BOOK THIS EXPERIENCE
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              No services found for {activeTab}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Services;
