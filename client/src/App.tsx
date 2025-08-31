import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { useScrollAnimation, initScrollAnimations } from './hooks/useScrollAnimation';

function App() {
  const { reobserve } = useScrollAnimation();

  useEffect(() => {
    // Initialize scroll animations
    initScrollAnimations();
    
    // Set up a global observer for dynamic content
    const observer = new MutationObserver(() => {
      // Re-observe when DOM changes (for dynamic content)
      setTimeout(reobserve, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [reobserve]);

  return <RouterProvider router={router} />;
}

export default App;
