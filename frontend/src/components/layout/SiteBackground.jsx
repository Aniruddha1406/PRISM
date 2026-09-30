import { useLocation } from 'react-router-dom';

export default function SiteBackground() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const tint = isAdmin ? 'rgba(11,25,44,0.55)' : 'rgba(11,25,44,0.28)';

  return (
    <div className="site-bg">
      <picture>
        <source media="(prefers-reduced-data: reduce)" srcSet="/assets/background-640.webp" />
        <source media="(max-width: 640px)" srcSet="/assets/background-640.webp" />
        <source media="(max-width: 1280px)" srcSet="/assets/background-1280.webp" />
        <source media="(max-width: 1920px)" srcSet="/assets/background-1920.webp" />
        <img 
          src="/assets/background-2560.webp" 
          alt="" 
          className="site-bg-img"
          decoding="async"
        />
      </picture>
      <div className="site-bg-tint" style={{ backgroundColor: tint }}></div>
    </div>
  );
}
