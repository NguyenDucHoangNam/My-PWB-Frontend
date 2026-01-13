// src/pages/project/LiveSessionTest.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LiveSessionTest: React.FC = () => {
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState('1');
  const [sessionId, setSessionId] = useState('');

  const handleGoToSessions = () => {
    navigate(`/project/${projectId}/live-sessions`);
  };

  const handleGoToRoom = () => {
    if (!sessionId.trim()) {
      alert('Vui lòng nhập Session ID');
      return;
    }
    navigate(`/session/${sessionId}/room`);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          🧪 Test Live Session
        </h1>

        {/* Test Sessions List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            1. Test danh sách Sessions
          </h2>
          <label className="block text-gray-300 mb-2">Project ID:</label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-4 focus:ring-2 focus:ring-purple-600 outline-none"
            placeholder="Nhập project ID (VD: 1, 123...)"
          />
          <button
            onClick={handleGoToSessions}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold"
          >
            Mở danh sách Sessions
          </button>
          <p className="text-gray-400 text-sm mt-2">
            URL: /project/{projectId}/live-sessions
          </p>
        </div>

        <div className="border-t border-gray-700 my-6"></div>

        {/* Test Session Room */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            2. Test phòng Live (cần sessionId thật)
          </h2>
          <label className="block text-gray-300 mb-2">Session ID:</label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-4 focus:ring-2 focus:ring-purple-600 outline-none"
            placeholder="Nhập session ID từ backend"
          />
          <button
            onClick={handleGoToRoom}
            disabled={!sessionId.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold"
          >
            Vào phòng Live
          </button>
          <p className="text-gray-400 text-sm mt-2">
            URL: /session/{sessionId}/room
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionTest;
