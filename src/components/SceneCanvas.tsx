/**
 * Center Workspace - Scene Canvas Component
 * Interactive 16:9 viewport with real-time shadow rendering, selection handles,
 * transform manipulation, drag-and-drop, pan, and zoom.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move, Eye, EyeOff } from 'lucide-react';
import { SceneProject, SceneElement, AssetDefinition } from '../types';
import { renderShadowScene, getElementStateAtTime } from '../engine/renderer';

interface SceneCanvasProps {
  scene: SceneProject;
  currentTime: number;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElementTransform: (
    id: string,
    updates: Partial<{ x: number; y: number; scaleX: number; scaleY: number; rotation: number }>
  ) => void;
  onAddElementFromDrop: (asset: AssetDefinition, x: number, y: number) => void;
  onDeleteSelected: () => void;
}

type DragMode = 'move' | 'scale' | 'rotate' | 'pan' | null;

export const SceneCanvas: React.FC<SceneCanvasProps> = ({
  scene,
  currentTime,
  selectedElementId,
  onSelectElement,
  onUpdateElementTransform,
  onAddElementFromDrop,
  onDeleteSelected,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport zoom & pan
  const [zoom, setZoom] = useState<number>(0.65); // 0.65 fits well on 1080p canvas in standard desktop
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [showGizmos, setShowGizmos] = useState<boolean>(true);

  // Interaction dragging states
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    initialX: number;
    initialY: number;
    initialScaleX: number;
    initialScaleY: number;
    initialRotation: number;
    panStartX: number;
    panStartY: number;
  } | null>(null);

  // Fit canvas to screen on initial mount
  useEffect(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    // We want 1920x1080 canvas to fit comfortably with padding
    const scaleX = (clientWidth - 60) / 1920;
    const scaleY = (clientHeight - 60) / 1080;
    const optimalZoom = Math.min(scaleX, scaleY, 0.85);
    setZoom(Math.max(0.3, Math.min(1.2, optimalZoom)));
  }, []);

  // Real-time canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderShadowScene(ctx, scene, currentTime, {
      selectedElementId,
      showGizmos,
    });
  }, [scene, currentTime, selectedElementId, showGizmos]);

  // Convert client mouse event to 1920x1080 canvas coordinate
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 1920;
      const y = ((e.clientY - rect.top) / rect.height) * 1080;
      return { x, y };
    },
    []
  );

  // Hit-test elements on canvas to select
  const findElementAt = useCallback(
    (cx: number, cy: number): SceneElement | null => {
      // Search top-to-bottom (highest zIndex first)
      const sorted = [...scene.elements].sort((a, b) => b.zIndex - a.zIndex);
      for (const el of sorted) {
        if (!el.visible || el.locked) continue;
        const state = getElementStateAtTime(el, currentTime);
        const w = 90 * Math.abs(state.scaleX);
        const h = 140 * Math.abs(state.scaleY);

        // Approximate hit box centered horizontally, extending up from y
        if (
          cx >= state.x - w * 0.6 &&
          cx <= state.x + w * 0.6 &&
          cy >= state.y - h * 1.05 &&
          cy <= state.y + h * 0.15
        ) {
          return el;
        }
      }
      return null;
    },
    [scene.elements, currentTime]
  );

  // Mouse Down handler
  const handleMouseDown = (e: React.MouseEvent) => {
    // If middle click or pan tool active: pan viewport
    if (e.button === 1 || isPanMode) {
      setDragMode('pan');
      setDragStart({
        mouseX: e.clientX,
        mouseY: e.clientY,
        initialX: 0,
        initialY: 0,
        initialScaleX: 1,
        initialScaleY: 1,
        initialRotation: 0,
        panStartX: panOffset.x,
        panStartY: panOffset.y,
      });
      return;
    }

    if (e.button !== 0) return; // Only primary button
    const coords = getCanvasCoords(e);

    // Check if clicking existing selected element transform gizmos
    if (selectedElementId) {
      const selEl = scene.elements.find((el) => el.id === selectedElementId);
      if (selEl) {
        const state = getElementStateAtTime(selEl, currentTime);
        const w = 90 * Math.abs(state.scaleX);
        const h = 140 * Math.abs(state.scaleY);

        // Check rotation handle
        const rotX = state.x;
        const rotY = state.y - h - 24;
        const distToRot = Math.hypot(coords.x - rotX, coords.y - rotY);
        if (distToRot < 20) {
          setDragMode('rotate');
          setDragStart({
            mouseX: coords.x,
            mouseY: coords.y,
            initialX: state.x,
            initialY: state.y,
            initialScaleX: state.scaleX,
            initialScaleY: state.scaleY,
            initialRotation: state.rotation,
            panStartX: 0,
            panStartY: 0,
          });
          return;
        }

        // Check corner scale handles
        const corners = [
          { x: state.x - w * 0.5, y: state.y - h },
          { x: state.x + w * 0.5, y: state.y - h },
          { x: state.x + w * 0.5, y: state.y },
          { x: state.x - w * 0.5, y: state.y },
        ];
        for (const c of corners) {
          if (Math.hypot(coords.x - c.x, coords.y - c.y) < 16) {
            setDragMode('scale');
            setDragStart({
              mouseX: coords.x,
              mouseY: coords.y,
              initialX: state.x,
              initialY: state.y,
              initialScaleX: state.scaleX,
              initialScaleY: state.scaleY,
              initialRotation: state.rotation,
              panStartX: 0,
              panStartY: 0,
            });
            return;
          }
        }

        // Check inside bounding box to move
        if (
          coords.x >= state.x - w * 0.5 &&
          coords.x <= state.x + w * 0.5 &&
          coords.y >= state.y - h &&
          coords.y <= state.y
        ) {
          setDragMode('move');
          setDragStart({
            mouseX: coords.x,
            mouseY: coords.y,
            initialX: state.x,
            initialY: state.y,
            initialScaleX: state.scaleX,
            initialScaleY: state.scaleY,
            initialRotation: state.rotation,
            panStartX: 0,
            panStartY: 0,
          });
          return;
        }
      }
    }

    // Try selecting another element under cursor
    const hit = findElementAt(coords.x, coords.y);
    if (hit) {
      onSelectElement(hit.id);
      const state = getElementStateAtTime(hit, currentTime);
      setDragMode('move');
      setDragStart({
        mouseX: coords.x,
        mouseY: coords.y,
        initialX: state.x,
        initialY: state.y,
        initialScaleX: state.scaleX,
        initialScaleY: state.scaleY,
        initialRotation: state.rotation,
        panStartX: 0,
        panStartY: 0,
      });
    } else {
      // Clicked on empty canvas
      onSelectElement(null);
    }
  };

  // Mouse Move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragMode || !dragStart) return;

    if (dragMode === 'pan') {
      const dx = e.clientX - dragStart.mouseX;
      const dy = e.clientY - dragStart.mouseY;
      setPanOffset({
        x: dragStart.panStartX + dx,
        y: dragStart.panStartY + dy,
      });
      return;
    }

    if (!selectedElementId) return;
    const coords = getCanvasCoords(e);
    const dx = coords.x - dragStart.mouseX;
    const dy = coords.y - dragStart.mouseY;

    if (dragMode === 'move') {
      onUpdateElementTransform(selectedElementId, {
        x: Math.round(dragStart.initialX + dx),
        y: Math.round(dragStart.initialY + dy),
      });
    } else if (dragMode === 'scale') {
      // Scale proportionally relative to origin
      const currentDist = Math.hypot(coords.x - dragStart.initialX, coords.y - dragStart.initialY);
      const startDist = Math.hypot(dragStart.mouseX - dragStart.initialX, dragStart.mouseY - dragStart.initialY);
      if (startDist > 10) {
        const factor = currentDist / startDist;
        const signX = dragStart.initialScaleX >= 0 ? 1 : -1;
        const signY = dragStart.initialScaleY >= 0 ? 1 : -1;
        onUpdateElementTransform(selectedElementId, {
          scaleX: Number((Math.max(0.2, Math.abs(dragStart.initialScaleX * factor)) * signX).toFixed(2)),
          scaleY: Number((Math.max(0.2, Math.abs(dragStart.initialScaleY * factor)) * signY).toFixed(2)),
        });
      }
    } else if (dragMode === 'rotate') {
      const angleRad = Math.atan2(coords.y - dragStart.initialY, coords.x - dragStart.initialX);
      const startAngleRad = Math.atan2(dragStart.mouseY - dragStart.initialY, dragStart.mouseX - dragStart.initialX);
      const deltaDeg = (angleRad - startAngleRad) * (180 / Math.PI);
      const newRot = Math.round((dragStart.initialRotation + deltaDeg) % 360);
      onUpdateElementTransform(selectedElementId, {
        rotation: newRot,
      });
    }
  };

  // Mouse Up handler
  const handleMouseUp = () => {
    setDragMode(null);
    setDragStart(null);
  };

  // Drag over & drop for new assets from sidebar
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) return;
      const asset = JSON.parse(raw) as AssetDefinition;
      const coords = getCanvasCoords(e);
      onAddElementFromDrop(asset, Math.round(coords.x), Math.round(coords.y));
    } catch (err) {
      // Ignored non-asset drops
    }
  };

  // Keyboard navigation / nudging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElementId) return;
      // Do not capture if typing in input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteSelected();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 2;
        const selEl = scene.elements.find((el) => el.id === selectedElementId);
        if (!selEl) return;
        const curX = selEl.x;
        const curY = selEl.y;

        let newX = curX;
        let newY = curY;
        if (e.key === 'ArrowLeft') newX -= step;
        if (e.key === 'ArrowRight') newX += step;
        if (e.key === 'ArrowUp') newY -= step;
        if (e.key === 'ArrowDown') newY += step;

        onUpdateElementTransform(selectedElementId, { x: newX, y: newY });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, scene.elements, onDeleteSelected, onUpdateElementTransform]);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-[#0a0a0d] relative overflow-hidden flex items-center justify-center select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Floating Canvas Viewport Tools (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-[#141720]/90 backdrop-blur border border-[#272d3b] rounded-lg p-1 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
          title="Zoom In"
          aria-label="Zoom In"
          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#202533] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-mono-numbers text-neutral-300 px-1 font-semibold">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#202533] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-[1px] bg-[#272d3b] mx-0.5" />
        <button
          onClick={() => {
            if (!containerRef.current) return;
            const { clientWidth, clientHeight } = containerRef.current;
            const scaleX = (clientWidth - 60) / 1920;
            const scaleY = (clientHeight - 60) / 1080;
            setZoom(Math.min(scaleX, scaleY, 0.85));
            setPanOffset({ x: 0, y: 0 });
          }}
          title="Fit Canvas to Viewport"
          aria-label="Fit Canvas to Viewport"
          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#202533] transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsPanMode(!isPanMode)}
          title="Pan Tool (or Space + Drag)"
          aria-label="Pan Tool"
          className={`p-1.5 rounded transition-colors ${
            isPanMode ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400 hover:text-white hover:bg-[#202533]'
          }`}
        >
          <Move className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setShowGizmos(!showGizmos)}
          title="Toggle Selection Handles"
          aria-label="Toggle Selection Handles"
          className={`p-1.5 rounded transition-colors ${
            showGizmos ? 'text-amber-400' : 'text-neutral-600 hover:text-neutral-400'
          }`}
        >
          {showGizmos ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Canvas Frame Container with Zoom & Pan */}
      <div
        className="transition-transform duration-75 relative"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          cursor: isPanMode ? 'grab' : dragMode === 'move' ? 'grabbing' : 'default',
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Shadow Theater Stage Outer Bezel Frame */}
        <div className="relative shadow-2xl rounded-sm p-1.5 bg-[#1b1716] border border-[#382b26]">
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            onMouseDown={handleMouseDown}
            className="block w-[1920px] h-[1080px] bg-black shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};
