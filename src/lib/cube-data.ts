import { PlaceHolderImages } from './placeholder-images';

export type CubeData = {
  id: number;
  image: string;
  start: { x: number; y: number; w: number; rotation: number };
  end: { x: number; y: number; w: number; rotation: number };
};

// Center of screen is roughly x: 960, y: 600
const CX = 960;
const CY = 600;

export const cubesData: CubeData[] = [
  // 1. Top Left
  {
    id: 1,
    image: PlaceHolderImages[0].imageUrl,
    start: { x: CX, y: CY, w: 0, rotation: 0 }, // Starts hidden in center
    end: { x: CX - 350, y: CY - 200, w: 180, rotation: 15 },
  },
  // 2. Top Right
  {
    id: 2,
    image: PlaceHolderImages[1].imageUrl,
    start: { x: CX, y: CY, w: 0, rotation: 0 },
    end: { x: CX + 350, y: CY - 200, w: 180, rotation: -15 },
  },
  // 3. Middle Left (Far left)
  {
    id: 3,
    image: PlaceHolderImages[2].imageUrl,
    start: { x: CX, y: CY, w: 0, rotation: 0 },
    end: { x: CX - 480, y: CY + 50, w: 180, rotation: -10 },
  },
  // 4. Middle Right (Far right)
  {
    id: 4,
    image: PlaceHolderImages[3].imageUrl,
    start: { x: CX, y: CY, w: 0, rotation: 0 },
    end: { x: CX + 480, y: CY + 50, w: 180, rotation: 10 },
  },
  // 5. Bottom Left
  {
    id: 5,
    image: PlaceHolderImages[4].imageUrl,
    start: { x: CX, y: CY, w: 0, rotation: 0 },
    end: { x: CX - 350, y: CY + 300, w: 180, rotation: 25 },
  },
  // 6. Bottom Right
  {
    id: 6,
    image: PlaceHolderImages[5].imageUrl,
    start: { x: CX, y: CY, w: 0, rotation: 0 },
    end: { x: CX + 350, y: CY + 300, w: 180, rotation: -25 },
  },
];
