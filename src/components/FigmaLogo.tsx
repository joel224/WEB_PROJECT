export default function FigmaLogo() {
    // Common style for all rectangles
    const rectStyle = "absolute w-[36px] h-[35px] bg-beige";
  
    return (
      // Container size based on Group 1: 154px x 96px
      <div className="relative w-[154px] h-[96px]">
        
        {/* --- Bottom Row --- */}
        
        {/* Rectangle 2 (Left) */}
        <div className={rectStyle} style={{ left: '0px', top: '61px' }} />
        
        {/* Rectangle 7 (Middle) */}
        <div className={rectStyle} style={{ left: '59px', top: '61px' }} />
        
        {/* Rectangle 6 (Right) */}
        <div className={rectStyle} style={{ left: '118px', top: '61px' }} />
  
        {/* --- Top Arc --- */}
  
        {/* Rectangle 3 (Left Angled) */}
        <div 
          className={rectStyle} 
          style={{ 
            left: '9px', 
            top: '11px', 
            transform: 'rotate(42.64deg)' 
          }} 
        />
  
        {/* Rectangle 4 (Top Center) */}
        <div className={rectStyle} style={{ left: '59px', top: '0px' }} />
  
        {/* Rectangle 5 (Right Angled) */}
        <div 
          className={rectStyle} 
          style={{ 
            left: '95px', 
            top: '11px', 
            transform: 'rotate(47.43deg)' 
          }} 
        />
      </div>
    );
  }