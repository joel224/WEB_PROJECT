type FigmaLogoProps = {
    className?: string;
  };
  
  export default function FigmaLogo({ className }: FigmaLogoProps) {
    return (
      <svg 
        width="154" 
        height="96" 
        viewBox="0 0 154 96" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* 1. Bottom Left */}
        <rect id="cube-start-1" y="61" width="36" height="35" fill="#FFE9D9"/>
        {/* 2. Bottom Center */}
        <rect id="cube-start-2" x="59" y="61" width="36" height="35" fill="#FFE9D9"/>
        {/* 3. Bottom Right */}
        <rect id="cube-start-3" x="118" y="61" width="36" height="35" fill="#FFE9D9"/>
        
        {/* 4. Top Left Angled */}
        {/* Note: Bounding box tracking works even with rotation */}
        <rect id="cube-start-4" x="32.709" y="11" width="36" height="35" transform="rotate(42.6414 32.709 11)" fill="#FFE9D9"/>
        
        {/* 5. Top Center */}
        <rect id="cube-start-5" x="59" width="36" height="35" fill="#FFE9D9"/>
        
        {/* 6. Top Right Angled */}
        <rect id="cube-start-6" x="120.771" y="10.9988" width="36" height="35" transform="rotate(47.4257 120.771 10.9988)" fill="#FFE9D9"/>
      </svg>
    );
  }