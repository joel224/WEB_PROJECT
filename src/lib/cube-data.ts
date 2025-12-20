export type CubeData = {
  id: number;
  image: string;
  start: { x: number; y: number; w: number; rotation: number; rotationZ: number; rotationY: number };
  end: { x: number; y: number; w: number; rotation: number };
};

const DW = 1920; 
const DH = 1200;

// Offsets from Figma Group 1 position
const GROUP_X = 841;
const GROUP_Y = 419;

// Helper: 36px width / 2 = 18px offset for center
const HALF_SIZE = 18;

export const cubesData: CubeData[] = [
  // --- BOTTOM ROW (Straight Rectangles) ---

  // 1. Bottom Left (SVG: rect x="0" y="61")
  {
    id: 1, 
    image: '/images/cube1.png', 
    start: { 
      x: GROUP_X + 0 + HALF_SIZE,    // 859
      y: GROUP_Y + 61 + HALF_SIZE,   // 498
      w: 36, 
      rotation: 0, 
      rotationZ: 0, 
      rotationY: Math.PI 
    },
    end: { x: DW/2 - 350, y: DH/2 - 200, w: 180, rotation: 15 },
  },
  
  // 2. Bottom Center (SVG: rect x="59" y="61")
  {
    id: 2, 
    image: '/images/cube2.png', 
    start: { 
      x: GROUP_X + 59 + HALF_SIZE,   // 918
      y: GROUP_Y + 61 + HALF_SIZE,   // 498
      w: 36, 
      rotation: 0, 
      rotationZ: 0, 
      rotationY: Math.PI 
    },
    end: { x: DW/2 + 350, y: DH/2 - 200, w: 180, rotation: -15 },
  },
  
  // 3. Bottom Right (SVG: rect x="118" y="61")
  {
    id: 3, 
    image: '/images/cube3.png', 
    start: { 
      x: GROUP_X + 118 + HALF_SIZE,  // 977
      y: GROUP_Y + 61 + HALF_SIZE,   // 498
      w: 36, 
      rotation: 0, 
      rotationZ: 0, 
      rotationY: Math.PI 
    },
    end: { x: DW/2 - 480, y: DH/2 + 50, w: 180, rotation: -10 },
  },

  // --- TOP ROW (Rotated & Straight) ---

  // 4. Top Left Angled (SVG: x="32.709" y="11" rotate="42.6414")
  // Note: SVG rotates around the top-left corner (32.709, 11).
  // We need to place the center of our 3D cube roughly where the center of that rotated rect ends up.
  // Visual adjustment: Move X slightly right and Y down to account for the pivot.
  {
    id: 4, 
    image: '/images/cube4.png', 
    start: { 
      x: GROUP_X + 32.709 + 12, // Adjusted for pivot
      y: GROUP_Y + 11 + 24,     // Adjusted for pivot
      w: 36, 
      rotation: 0, 
      rotationZ: -42.64,        // NEGATIVE for Three.js (Counter-Clockwise)
      rotationY: Math.PI 
    },
    end: { x: DW/2 + 480, y: DH/2 + 50, w: 180, rotation: 10 },
  },

  // 5. Top Center (SVG: rect x="59" y="0")
  {
    id: 5, 
    image: '/images/cube5.png', 
    start: { 
      x: GROUP_X + 59 + HALF_SIZE,  // 918
      y: GROUP_Y + 0 + HALF_SIZE,   // 437
      w: 36, 
      rotation: 0, 
      rotationZ: 0, 
      rotationY: Math.PI 
    },
    end: { x: DW/2 - 350, y: DH/2 + 300, w: 180, rotation: 25 },
  },

  // 6. Top Right Angled (SVG: x="120.771" y="10.9988" rotate="47.4257")
  // Similar logic to #4, adjusted for the pivot point being on the left.
  {
    id: 6, 
    image: '/images/cube6.png', 
    start: { 
      x: GROUP_X + 120.771 - 10,  // Shift Left slightly
      y: GROUP_Y + 11 + 25,       // Shift Down
      w: 36, 
      rotation: 0, 
      rotationZ: -47.43,          // NEGATIVE for Three.js
      rotationY: Math.PI 
    },
    end: { x: DW/2 + 350, y: DH/2 + 300, w: 180, rotation: -25 },
  },
];