import React, { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

function ParticleNetwork() {
  const pointsRef = useRef();
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(3000); // 1000 particles
    for (let i = 0; i < 3000; i++) {
      positions[i] = (Math.random() - 0.5) * 25; // Spread particles
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    pointsRef.current.rotation.y += delta * 0.02;
    pointsRef.current.rotation.x += delta * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesPosition.length / 3} array={particlesPosition} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#2563EB" transparent opacity={0.3} sizeAttenuation={true} depthWrite={false} />
    </points>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.hero-element', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    });

    gsap.from('.stat-card', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.4
    });

    // Count up animation for numbers
    gsap.utils.toArray('.stat-number').forEach(element => {
      const endValue = parseFloat(element.getAttribute('data-value'));
      const format = element.getAttribute('data-format');
      
      gsap.to(element, {
        innerHTML: endValue,
        duration: 0.8,
        delay: 0.5,
        ease: 'power2.out',
        snap: { innerHTML: 1 },
        onUpdate: function() {
          let val = Math.round(this.targets()[0].innerHTML);
          if (format === 'k') val = val.toLocaleString() + '+';
          else if (format === '%') val = val + '%';
          this.targets()[0].innerHTML = val;
        }
      });
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-color)' }}>
      
      {/* Three.js Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        <Canvas camera={{ position: [0, 0, 10] }}>
          <ParticleNetwork />
        </Canvas>
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '60px', maxWidth: '800px' }}>
          <h1 className="page-title hero-element" style={{ fontSize: '64px', marginBottom: '24px', lineHeight: 1.1 }}>
            Predictive Parking Intelligence Engine
          </h1>
          <p className="hero-element" style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.5 }}>
            AI-powered congestion prediction and parking enforcement optimization for Bengaluru.
          </p>
          
          <div className="hero-element" style={{ display: 'flex', gap: '16px' }}>
            <button className="primary-btn" onClick={() => navigate('/dashboard')}>
              Initialize Command Center
            </button>
            <button className="secondary-btn" onClick={() => navigate('/copilot')}>
              View AI Dashboard
            </button>
          </div>
        </div>

        <div className="cards-grid" style={{ marginTop: '40px' }}>
          {[
            { label: 'Historical Violations', value: 300000, format: 'k' },
            { label: 'Prediction Accuracy', value: 92, format: '%' },
            { label: 'Critical Zones', value: 40, format: '' },
            { label: 'AI Confidence', value: 90, format: '%' }
          ].map((stat, i) => (
            <div key={i} className="card stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="card-title" style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '15px' }}>{stat.label}</span>
              <span className="metric-number stat-number" data-value={stat.value} data-format={stat.format}>0</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Home;
