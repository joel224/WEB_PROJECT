export type CubeData = {
  id: number;
  image: string;
  startOffset: { x: number; y: number; rotationZ: number };
  end: { x: number; y: number; w: number; rotation: number };
  endMobile: { x: number; y: number; w: number; rotation: number };
};

const DW = 1920; 
const DH = 1200;

// --- HELPER ---
const getPos = (svgX: number, svgY: number, width: number, height: number) => {
  const centerX = 154 / 2;
  const centerY = 96 / 2;
  
  const x = (svgX + width/2) - centerX;
  const y = centerY - (svgY + height/2);
  
  return { x, y };
}

export const cubesData: CubeData[] = [
  // --- CUBE 1 (Top Left) ---
  {
    id: 1, 
    image: '/images/cube1.png', 
    startOffset: { ...getPos(0, 61, 36, 35), rotationZ: 0 },
    end: { x: 1920/2 - 280, y: 1200/2 - 375, w: 200, rotation: 0 },
    endMobile: { x: -180, y: -300, w: 120, rotation: 10 },
  },

  // --- CUBE 2 (Top Right) ---
  {
    id: 2, 
    image: '/images/cube2.png', 
    startOffset: { ...getPos(59, 61, 36, 35), rotationZ: 0 },
    end: { x: 1920/2 + 280, y: 1200/2 - 375, w: 200, rotation: 0 },
    endMobile: { x: 180, y: -300, w: 120, rotation: -10 },
  },

  // --- CUBE 3 (Mid Left - HIDDEN ON MOBILE) ---
  {
    id: 3, 
    image: '/images/cube3.png', 
    startOffset: { ...getPos(118, 61, 36, 35), rotationZ: 0 },
    end: { x: 1920/2 - 650, y: 1200/2, w: 200, rotation: 0 },
    // Fix: Normal Width (150) so it doesn't "shrink". 
    // We will hide it via Opacity in Scene.tsx
    endMobile: { x: -220, y: 0, w: 150, rotation: 15 },
  },

  // --- CUBE 4 (Mid Right - HIDDEN ON MOBILE) ---
  {
    id: 4, 
    image: '/images/cube4.png', 
    startOffset: { ...getPos(32.7, 11, 36, 35), rotationZ: -42.64 },
    end: { x: 1920/2 + 650, y: 1200/2, w: 200, rotation: 0 },
    // Fix: Normal Width (150)
    endMobile: { x: 220, y: 0, w: 150, rotation: -15 },
  },

  // --- CUBE 5 (Bottom Left) ---
  {
    id: 5, 
    image: '/images/cube5.png', 
    startOffset: { ...getPos(59, 0, 36, 35), rotationZ: 0 },
    end: { x: 1920/2 - 280, y: 1200/2 + 375, w: 200, rotation: 0 },
    endMobile: { x: -180, y: 300, w: 120, rotation: -10 },
  },

  // --- CUBE 6 (Bottom Right) ---
  {
    id: 6, 
    image: '/images/cube6.png', 
    startOffset: { ...getPos(120.7, 11, 36, 35), rotationZ: -47.43 },
    end: { x: 1920/2 + 280, y: 1200/2 + 375, w: 200, rotation: 0 },
    endMobile: { x: 180, y: 300, w: 120, rotation: 10 },
  },
];