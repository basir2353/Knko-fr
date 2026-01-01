const Membership = () => {
  return (
    <div className="flex bg-[#f9f7f5] p-2 min-h-screen">
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="libre-font text-3xl font-bold text-[#5f7a3d] mb-4">
            Membership
          </h1>
          <p className="text-gray-600 mb-6">
            Manage your membership plans and benefits.
          </p>
          
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Your Membership Plans
            </h2>
            <p className="text-gray-500">
              Membership features and options will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
