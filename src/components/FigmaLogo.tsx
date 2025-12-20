export default function FigmaLogo() {
    // Shared box styles
    const rectStyle = "absolute w-[36px] h-[35px] bg-[#FFE9D9]";
  
    // MATH EXPLANATION:
    // Container Center: 77px
    // Box Width: 36px (Half: 18px)
    // Top Center Box Start: 77 - 18 = 59px
    
    // To make the sides "stick" like the right one:
    // Right Box Left: 95px (Gap of 0px from center box)
    // Left Box Left:  23px (Calculated to match 95px symmetrically)
    
    return (
      <div className="relative w-[154px] h-[96px]">
        
        {/* --- BOTTOM ROW (Fixed Base) --- */}
        {/* Perfectly spaced with 23px gaps */}
        <div className={rectStyle} style={{ left: '0px', top: '61px' }} />
        <div className={rectStyle} style={{ left: '59px', top: '61px' }} />
        <div className={rectStyle} style={{ left: '118px', top: '61px' }} />
  
        {/* --- TOP ROW (The Arch) --- */}
  
        {/* 1. Left Arch Box */}
        {/* Fixed: Moved from 9px to 23px to match the right side */}
        <div 
          className={rectStyle} 
          style={{ 
            left: '23px', 
            top: '11px', 
            transform: 'rotate(45deg)', // Standardized angle
            transformOrigin: 'center center'
          }} 
        />
  
        {/* 2. Top Center Box (Keystone) */}
        <div className={rectStyle} style={{ left: '59px', top: '0px', zIndex: 10 }} />
  
        {/* 3. Right Arch Box */}
        {/* This was the "good" one, we kept it at 95px */}
        <div 
          className={rectStyle} 
          style={{ 
            left: '95px', 
            top: '11px', 
            transform: 'rotate(-45deg)', // Standardized angle
            transformOrigin: 'center center'
          }} 
        />
      </div>
    );
  }