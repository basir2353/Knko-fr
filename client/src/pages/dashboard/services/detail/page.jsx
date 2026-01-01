import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Clock } from "lucide-react";


const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Service data (in real app, fetch based on id)
  const service = {
    title: "Therapeutic Massage",
    subtitle: "Personalized Recovery",
    description:
      "A custom-blended session tailored to your needs using multiple techniques such as deep tissue, myofascial release, or trigger point work. Ideal for those requiring experiencing chronic tension, postural imbalance, injury or stress-related pain. Results deepen with each visit as your body unwinds more completely.",
    basePrice: 420,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop",
  };

  const durations = [
    { id: 1, minutes: 60, price: 425 },
    { id: 2, minutes: 90, price: 525 },
    { id: 3, minutes: 120, price: 620 },
  ];

  const addOns = [
    { id: 1, name: "Hot Stone Therapy", price: 35 },
    { id: 2, name: "Aromatherapy", price: 25 },
    { id: 3, name: "CBD Oil Treatment", price: 45 },
  ];

  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState([1]);

  const toggleAddOn = (addOnId) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  // Calculate totals
  const selectedDurationData = durations.find((d) => d.id === selectedDuration);
  const basePrice = selectedDurationData?.price || 0;
  const addOnsTotal = addOns
    .filter((a) => selectedAddOns.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const total = basePrice + addOnsTotal;

  return (
    <div className="flex-1 bg-[#f9f7f5] p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="libre-font text-2xl font-bold text-[#5f7a3d]">
          Service Booking
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={18} />
          BACK
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Service Details */}
        <div className="col-span-7">
          <div className="bg-white rounded-3xl p-6">
            {/* Service Header */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={service.image}
                alt={service.title}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 libre-font">
                  {service.title}
                </h2>
                <p className="text-sm text-[#c5893a]">{service.subtitle}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {service.description}
            </p>

            {/* Starting Price */}
            <div className="mb-6">
              <span className="text-sm text-gray-500">Starting From </span>
              <span className="text-3xl font-semibold text-[#c5893a]">
                ${service.basePrice}
              </span>
            </div>

            {/* Dashed Separator */}
            <div className="border-t-2 border-dashed border-gray-200 my-6"></div>

            {/* Optional Add-Ons */}
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Optional Add-Ons
              </h3>
              <div className="space-y-3">
                {addOns.map((addOn) => {
                  const isSelected = selectedAddOns.includes(addOn.id);
                  return (
                    <div
                      key={addOn.id}
                      onClick={() => toggleAddOn(addOn.id)}
                      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "border-2 border-[#c5893a] bg-white"
                          : "border border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center ${
                            isSelected
                              ? "bg-[#c5893a]"
                              : "border-2 border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              width="12"
                              height="10"
                              viewBox="0 0 12 10"
                              fill="none"
                            >
                              <path
                                d="M1 5L4.5 8.5L11 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-gray-800">{addOn.name}</span>
                      </div>
                      <span className="text-sm text-[#c5893a] font-medium">
                        +${addOn.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Duration & Summary */}
        <div className="col-span-5 space-y-5">
          {/* Select Duration Card */}
          <div className="bg-[#f7f5f0] rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-[#2d3e31] libre-font mb-4">
              Select Duration
            </h3>
            <div className="space-y-3">
              {durations.map((duration) => {
                const isSelected = selectedDuration === duration.id;
                return (
                  <div
                    key={duration.id}
                    onClick={() => setSelectedDuration(duration.id)}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white"
                        : "bg-transparent hover:bg-white/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center ${
                          isSelected
                            ? "bg-[#c5893a]"
                            : "border-2 border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            width="12"
                            height="10"
                            viewBox="0 0 12 10"
                            fill="none"
                          >
                            <path
                              d="M1 5L4.5 8.5L11 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <Clock size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-800">
                        {duration.minutes} Min
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      ${duration.price.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-[#2b2b2b] rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white libre-font mb-5">
              Booking Summary
            </h3>

            {/* Base Service */}
            <div className="mb-4">
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Base Service
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-white">{service.title}</span>
                <span className="text-sm text-white">${basePrice}</span>
              </div>
            </div>

            {/* Dashed Separator */}
            <div className="border-t border-dashed border-gray-600 my-4"></div>

            {/* Optional Add-Ons */}
            {selectedAddOns.length > 0 && (
              <>
                <div className="mb-4">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    Optional Add-Ons
                  </span>
                  {addOns
                    .filter((a) => selectedAddOns.includes(a.id))
                    .map((addOn) => (
                      <div
                        key={addOn.id}
                        className="flex items-center justify-between mt-1"
                      >
                        <span className="text-sm text-white">{addOn.name}</span>
                        <span className="text-sm text-white">${addOn.price}</span>
                      </div>
                    ))}
                </div>

                {/* Dashed Separator */}
                <div className="border-t border-dashed border-gray-600 my-4"></div>
              </>
            )}

            {/* Total */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-400">Total:</span>
              <span className="text-3xl font-semibold text-white">${total}</span>
            </div>

            {/* CTA Button */}
            <button className="w-full py-4 bg-[#c5893a] text-white text-sm font-semibold rounded-full hover:bg-[#b07a32] transition-colors tracking-wide">
              CHECK PRACTITIONER AVAILABILITY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
