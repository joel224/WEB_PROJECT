export type CubeData = {
  id: number;
  start: {
    x: number;
    y: number;
    w: number;
    rotation: number;
  };
  end: {
    x: number;
    y: number;
    w: number;
    rotation: number;
  };
  image: string;
};

export const cubesData: CubeData[] = [
  {
    id: 1,
    start: { x: 841, y: 480, w: 36, rotation: 0 },
    end: { x: 403.3, y: 223.26, w: 151.3, rotation: 0.04 },
    image: 'https://picsum.photos/seed/1/400/600',
  },
  {
    id: 2,
    start: { x: 900, y: 500, w: 36, rotation: 25 },
    end: { x: 750, y: 150, w: 160, rotation: -0.05 },
    image: 'https://picsum.photos/seed/2/400/600',
  },
  {
    id: 3,
    start: { x: 950, y: 450, w: 36, rotation: -15 },
    end: { x: 1100, y: 300, w: 140, rotation: 0.02 },
    image: 'https://picsum.photos/seed/3/400/600',
  },
  {
    id: 4,
    start: { x: 880, y: 550, w: 36, rotation: 10 },
    end: { x: 500, y: 700, w: 170, rotation: 0.08 },
    image: 'https://picsum.photos/seed/4/400/600',
  },
  {
    id: 5,
    start: { x: 920, y: 420, w: 36, rotation: -30 },
    end: { x: 1300, y: 650, w: 155, rotation: -0.03 },
    image: 'https://picsum.photos/seed/5/400/600',
  },
  {
    id: 6,
    start: { x: 980, y: 520, w: 36, rotation: 5 },
    end: { x: 900, y: 900, w: 165, rotation: 0.01 },
    image: 'https://picsum.photos/seed/6/400/600',
  },
];
