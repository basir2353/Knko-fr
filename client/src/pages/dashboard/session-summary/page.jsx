const SessionSummary = () => {
  return (
    <div className="flex bg-[#f9f7f5] p-2 min-h-screen">
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="libre-font text-3xl font-bold text-[#5f7a3d] mb-4">
            Session Summary
          </h1>
          <p className="text-gray-600 mb-6">
            View and manage your therapy session summaries.
          </p>
          
          <div className="bg-white rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Sessions
            </h2>
            <p className="text-gray-500">
              Your session history and summaries will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
