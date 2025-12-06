import { useState, useEffect } from 'react';
import { Play, Flag, CheckCircle, Clock, Send, Eye, XCircle } from 'lucide-react';

const defaultStates = [
  { id: 1, name: 'draft', label: 'Brouillon', color: '#6b7280', icon: Clock, count: 0 },
  { id: 2, name: 'submitted', label: 'Soumis', color: '#3b82f6', icon: Send, count: 0 },
  { id: 3, name: 'review', label: 'Revision', color: '#f59e0b', icon: Eye, count: 0 },
  { id: 4, name: 'validated', label: 'Valide', color: '#10b981', icon: CheckCircle, count: 0 },
  { id: 5, name: 'published', label: 'Publie', color: '#8b5cf6', icon: Flag, count: 0 },
  { id: 6, name: 'rejected', label: 'Rejete', color: '#ef4444', icon: XCircle, count: 0 },
];

const Lifecycle3D = ({ states, entitiesByState, currentState }) => {
  const [rotation, setRotation] = useState({ x: -20, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  const statesData = (states && states.length > 0 ? states : defaultStates).map(state => {
    const entityData = entitiesByState?.find(e => e.currentState?.id === state.id);
    return {
      ...state,
      count: entityData?.count || 0,
      isActive: currentState?.id === state.id
    };
  });

  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setRotation(prev => ({ ...prev, y: (prev.y + 0.5) % 360 }));
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setRotation(prev => ({
      x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const getNodePosition = (index, total) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    const radius = 120;
    return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
  };

  return (
    <div className="lifecycle-3d-container">
      <div className="controls-3d">
        <button className={`control-btn ${autoRotate ? 'active' : ''}`} onClick={() => setAutoRotate(!autoRotate)}>
          {autoRotate ? 'Pause' : 'Auto-rotation'}
        </button>
        <button className="control-btn" onClick={() => setRotation({ x: -20, y: 0 })}>Reset</button>
      </div>

      <div className="scene-3d" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div className="carousel-3d" style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
          <div className="center-node">
            <div className="center-glow"></div>
            <span className="center-text">NIRD</span>
          </div>

          {statesData.map((state, index) => {
            const pos = getNodePosition(index, statesData.length);
            const Icon = state.icon || CheckCircle;
            return (
              <div key={state.id} className={`state-node-3d ${state.isActive ? 'active' : ''} ${selectedNode === state.id ? 'selected' : ''}`}
                style={{ transform: `translateX(${pos.x}px) translateZ(${pos.z}px)`, '--state-color': state.color }}
                onClick={() => setSelectedNode(selectedNode === state.id ? null : state.id)}>
                <div className="node-face front" style={{ backgroundColor: state.color }}>
                  <Icon size={24} />
                  <span className="node-count">{state.count}</span>
                </div>
                <div className="node-face back" style={{ backgroundColor: state.color }} />
                <div className="node-face left" style={{ backgroundColor: state.color }} />
                <div className="node-face right" style={{ backgroundColor: state.color }} />
                <div className="node-face top" style={{ backgroundColor: state.color }} />
                <div className="node-face bottom" style={{ backgroundColor: state.color }} />
                <div className="node-label">{state.label}</div>
                {state.isActive && <div className="active-ring" />}
              </div>
            );
          })}

          {statesData.slice(0, -1).map((state, index) => {
            const start = getNodePosition(index, statesData.length);
            const end = getNodePosition(index + 1, statesData.length);
            const angle = Math.atan2(end.z - start.z, end.x - start.x) * 180 / Math.PI;
            const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2));
            return (
              <div key={`conn-${index}`} className="connection-3d"
                style={{ width: `${length}px`, transform: `translateX(${start.x}px) translateZ(${start.z}px) rotateY(${-angle}deg)` }}>
                <div className="connection-flow"></div>
              </div>
            );
          })}

          <div className="platform-3d"><div className="platform-grid"></div></div>
        </div>
      </div>

      {selectedNode && (
        <div className="node-info-panel">
          {(() => {
            const state = statesData.find(s => s.id === selectedNode);
            if (!state) return null;
            const Icon = state.icon || CheckCircle;
            return (
              <>
                <div className="info-header" style={{ borderColor: state.color }}>
                  <Icon size={20} style={{ color: state.color }} />
                  <span>{state.label}</span>
                </div>
                <div className="info-stats">
                  <div className="info-stat">
                    <span className="stat-value">{state.count}</span>
                    <span className="stat-label">entites</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      <div className="drag-hint">Glissez pour pivoter - Cliquez sur un etat pour details</div>

      <style>{`
        .lifecycle-3d-container { position: relative; width: 100%; padding: 20px; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%); border-radius: 16px; overflow: hidden; }
        .controls-3d { display: flex; gap: 8px; margin-bottom: 16px; justify-content: center; }
        .control-btn { padding: 8px 16px; border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; background: rgba(255,255,255,0.1); color: white; font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease; }
        .control-btn:hover { background: rgba(255,255,255,0.2); }
        .control-btn.active { background: rgba(139, 92, 246, 0.3); border-color: #8b5cf6; }
        .scene-3d { perspective: 800px; perspective-origin: 50% 50%; height: 350px; cursor: grab; user-select: none; }
        .scene-3d:active { cursor: grabbing; }
        .carousel-3d { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.1s ease-out; display: flex; align-items: center; justify-content: center; }
        .center-node { position: absolute; width: 60px; height: 60px; background: linear-gradient(135deg, #ffd700, #ffed4a); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); z-index: 10; }
        .center-glow { position: absolute; width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%); animation: pulse-glow 2s ease-in-out infinite; }
        @keyframes pulse-glow { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } }
        .center-text { font-weight: bold; font-size: 0.8rem; color: #1a1a2e; z-index: 1; }
        .state-node-3d { position: absolute; width: 50px; height: 50px; transform-style: preserve-3d; cursor: pointer; transition: transform 0.3s ease; }
        .state-node-3d:hover { transform: translateX(var(--tx, 0)) translateZ(var(--tz, 0)) scale(1.2); }
        .state-node-3d.active .node-face { box-shadow: 0 0 20px var(--state-color); }
        .node-face { position: absolute; width: 50px; height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid rgba(255,255,255,0.3); backface-visibility: hidden; }
        .node-face.front { transform: translateZ(25px); border-radius: 8px; }
        .node-face.back { transform: rotateY(180deg) translateZ(25px); border-radius: 8px; }
        .node-face.left { transform: rotateY(-90deg) translateZ(25px); }
        .node-face.right { transform: rotateY(90deg) translateZ(25px); }
        .node-face.top { transform: rotateX(90deg) translateZ(25px); }
        .node-face.bottom { transform: rotateX(-90deg) translateZ(25px); }
        .node-count { font-size: 0.7rem; margin-top: 2px; }
        .node-label { position: absolute; bottom: -25px; white-space: nowrap; font-size: 0.7rem; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.8); transform: rotateX(-90deg) translateY(30px); }
        .active-ring { position: absolute; width: 70px; height: 70px; border: 3px solid var(--state-color); border-radius: 50%; animation: ring-pulse 1.5s ease-out infinite; top: -10px; left: -10px; }
        @keyframes ring-pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
        .connection-3d { position: absolute; height: 3px; background: rgba(255,255,255,0.2); transform-origin: left center; border-radius: 2px; overflow: hidden; }
        .connection-flow { position: absolute; width: 30%; height: 100%; background: linear-gradient(90deg, transparent, #ffd700, transparent); animation: flow 2s linear infinite; }
        @keyframes flow { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
        .platform-3d { position: absolute; width: 300px; height: 300px; transform: rotateX(90deg) translateZ(-40px); background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%); border-radius: 50%; }
        .platform-grid { width: 100%; height: 100%; background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px; border-radius: 50%; }
        .node-info-panel { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.8); border-radius: 12px; padding: 16px; min-width: 150px; backdrop-filter: blur(10px); }
        .info-header { display: flex; align-items: center; gap: 8px; padding-bottom: 12px; border-bottom: 2px solid; margin-bottom: 12px; color: white; font-weight: 600; }
        .info-stats { display: flex; gap: 16px; }
        .info-stat { display: flex; flex-direction: column; align-items: center; }
        .stat-value { font-size: 1.5rem; font-weight: bold; color: white; }
        .stat-label { font-size: 0.7rem; color: rgba(255,255,255,0.6); }
        .drag-hint { text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 12px; }
        .state-node-3d.selected { z-index: 100; }
        .state-node-3d.selected .node-face.front { box-shadow: 0 0 30px var(--state-color); }
      `}</style>
    </div>
  );
};

export default Lifecycle3D;

