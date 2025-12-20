// src/lib/cube-data.ts

export type CubeData = {
  id: number;
  image: string;
  start: { x: number; y: number; w: number; rotation: number; rotationZ: number; rotationY: number };
  end: { x: number; y: number; w: number; rotation: number };
};

const DW = 1920; 
const DH = 1200;

export const cubesData: CubeData[] = [
  // --- BOTTOM ROW OF LOGO ---
  {
    id: 1, // Bottom Left
    image: '/images/cube1.png', // CHANGED to .png
    // Start: Rotate Y 180 (Math.PI) to show the solid beige back face
    start: { x: 841 + 18, y: 480 + 17.5, w: 36, rotation: 0, rotationZ: 0, rotationY: Math.PI },
    end: { x: DW/2 - 350, y: DH/2 - 200, w: 180, rotation: 15 },
  },
  {
    id: 2, // Bottom Center
    image: '/images/cube2.png', // CHANGED to .png
    start: { x: 900 + 18, y: 480 + 17.5, w: 36, rotation: 0, rotationZ: 0, rotationY: Math.PI },
    end: { x: DW/2 + 350, y: DH/2 - 200, w: 180, rotation: -15 },
  },
  {
    id: 3, // Bottom Right
    image: '/images/cube3.png', // CHANGED to .png
    start: { x: 959 + 18, y: 480 + 17.5, w: 36, rotation: 0, rotationZ: 0, rotationY: Math.PI },
    end: { x: DW/2 - 480, y: DH/2 + 50, w: 180, rotation: -10 },
  },

  // --- TOP ROW OF LOGO ---
  {
    id: 4, // Top Left (Angled)
    image: '/images/cube4.png', // CHANGED to .png
    start: { x: 864, y: 441, w: 36, rotation: 0, rotationZ: 45, rotationY: Math.PI },
    end: { x: DW/2 + 480, y: DH/2 + 50, w: 180, rotation: 10 },
  },
  {
    id: 5, // Top Center (Keystone)
    image: '/images/cube5.png', // CHANGED to .png
    start: { x: 900 + 18, y: 419 + 17.5, w: 36, rotation: 0, rotationZ: 0, rotationY: Math.PI },
    end: { x: DW/2 - 350, y: DH/2 + 300, w: 180, rotation: 25 },
  },
  {
    id: 6, // Top Right (Angled)
    image: '/images/cube6.png', // CHANGED to .png
    start: { x: 954, y: 441, w: 36, rotation: 0, rotationZ: -45, rotationY: Math.PI },
    end: { x: DW/2 + 350, y: DH/2 + 300, w: 180, rotation: -25 },
  },
];