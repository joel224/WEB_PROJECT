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
        <rect y="61" width="36" height="35" fill="#FFE9D9"/>
        <rect x="59" y="61" width="36" height="35" fill="#FFE9D9"/>
        <rect x="118" y="61" width="36" height="35" fill="#FFE9D9"/>
        <rect x="32.709" y="11" width="36" height="35" transform="rotate(42.6414 32.709 11)" fill="#FFE9D9"/>
        <rect x="59" width="36" height="35" fill="#FFE9D9"/>
        <rect x="120.771" y="10.9988" width="36" height="35" transform="rotate(47.4257 120.771 10.9988)" fill="#FFE9D9"/>
      </svg>
    );
  }