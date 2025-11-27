import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

function PageTransition({ children }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
}

export default PageTransition;
