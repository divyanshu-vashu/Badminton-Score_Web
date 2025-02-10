import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

interface ScoreState {
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  pset1: number;
  pset2: number;
  roomId?: string;
}

function App() {
  const [roomKey, setRoomKey] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [scoreState, setScoreState] = useState<ScoreState>({
    player1: 'Player 1',
    player2: 'Player 2',
    score1: 0,
    score2: 0,
    pset1: 0,
    pset2: 0
  });

  useEffect(() => {
    const connectWebSocket = () => {
      const websocket = new WebSocket('ws://52.140.130.229:8089/ws');
      
      websocket.onopen = () => {
        setIsConnected(true);
        setWs(websocket);
      };

      websocket.onclose = () => {
        setIsConnected(false);
        setWs(null);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        if (data.type === 'room_state') {
          setScoreState({
            player1: data.player1,
            player2: data.player2,
            score1: data.score1,
            score2: data.score2,
            pset1: data.pset1,
            pset2: data.pset2,
            roomId: data.roomId
          });
        }
      };

      return websocket;
    };

    const websocket = connectWebSocket();

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  const handleJoinRoom = () => {
    if (!roomKey) {
      alert('Please enter room key');
      return;
    }

    if (!isConnected) {
      alert('Not connected to server');
      return;
    }

    ws?.send(JSON.stringify({
      type: 'join_room',
      roomId: roomKey
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
      {!scoreState.roomId ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-8">Badminton Score Stream</h1>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="roomKey" className="text-sm font-medium">Room Key</label>
                <input
                  id="roomKey"
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter room key"
                  value={roomKey}
                  onChange={(e) => setRoomKey(e.target.value)}
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={!isConnected}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
              >
                {isConnected ? 'Join Room' : 'Connecting...'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen p-4 md:p-8">
          {/* Room ID Display */}
          <div className="text-center mb-6">
            <span className="bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
              Room: {scoreState.roomId}
            </span>
          </div>

          {/* Responsive Layout Indicators */}
          <div className="fixed top-4 right-4 bg-white/10 backdrop-blur rounded-full p-2">
            <Monitor className="hidden md:block w-6 h-6" />
            <Smartphone className="block md:hidden w-6 h-6" />
          </div>

          {/* Score Display */}
          <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
            {/* Player 1 */}
            <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{scoreState.player1}</h2>
                <div className="bg-purple-600 rounded-2xl p-8 mb-4 shadow-lg shadow-purple-900/20">
                  <div className="text-7xl md:text-8xl font-bold">{scoreState.score1}</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-xl font-medium">Sets: {scoreState.pset1}</p>
                </div>
              </div>
            </div>

            {/* Player 2 */}
            <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{scoreState.player2}</h2>
                <div className="bg-purple-600 rounded-2xl p-8 mb-4 shadow-lg shadow-purple-900/20">
                  <div className="text-7xl md:text-8xl font-bold">{scoreState.score2}</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-xl font-medium">Sets: {scoreState.pset2}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
