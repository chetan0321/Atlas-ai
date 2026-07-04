import Link from 'next/link'
import AtlasLogo from '@/components/AtlasLogo'

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a14', color: '#fff',
      fontFamily: 'inherit', overflowX: 'hidden',
      backgroundImage: `radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)`,
      backgroundSize: '28px 28px'
    }}>

      {/* Purple glow behind hero */}
      <div style={{
        position: 'fixed', top: '-80px', left: '50%', transform: 'translateX(-50%)',
        width: '900px', height: '600px', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(100,40,220,0.22) 0%, transparent 65%)'
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '58px',
        background: 'rgba(10,10,20,0.75)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Logo */}
        <AtlasLogo size={22} textSize={16} />

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Link href="/login" style={{
            fontSize: '14px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
            padding: '7px 16px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)'
          }}>
            Sign in
          </Link>
          <Link href="#how" style={{
            fontSize: '14px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
            padding: '7px 16px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)'
          }}>
            Docs
          </Link>
          <Link href="/signup" style={{
            fontSize: '14px', fontWeight: '600', color: '#fff',
            textDecoration: 'none', padding: '7px 20px',
            background: '#fff', color: '#000',
            borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            Get started ↗
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '96px 20px 64px', position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          fontSize: '11px', fontWeight: '600', letterSpacing: '0.09em',
          padding: '5px 14px 5px 10px', borderRadius: '20px', marginBottom: '32px',
          border: '1px solid rgba(139,92,246,0.5)',
          background: 'rgba(139,92,246,0.12)', color: '#b4a0ff'
        }}>
          <span style={{
            fontSize: '14px', display: 'flex', alignItems: 'center'
          }}>🌐</span>
          AI-POWERED APP BUILDER
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 6.5vw, 74px)', fontWeight: '800',
          lineHeight: '1.06', letterSpacing: '-2.5px', marginBottom: '22px',
          color: '#fff'
        }}>
          Build any web app —<br />from idea to deployed
        </h1>

        <p style={{
          fontSize: '17px', color: 'rgba(255,255,255,0.48)', maxWidth: '480px',
          margin: '0 auto 40px', lineHeight: '1.65'
        }}>
          Atlas researches your idea, plans with you, then ships production code. No coding required.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            background: '#fff', color: '#000', padding: '13px 28px',
            borderRadius: '10px', fontSize: '15px', fontWeight: '700',
            textDecoration: 'none'
          }}>
            Start building free
          </Link>
          <Link href="#how" style={{
            background: 'rgba(255,255,255,0.07)', color: '#fff', padding: '13px 28px',
            borderRadius: '10px', fontSize: '15px', fontWeight: '500',
            textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{
              width: '22px', height: '22px', borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px'
            }}>▶</span>
            Watch demo
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div id="how" style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'rgba(255,255,255,0.88)' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {[
            { num: '1', icon: '🔍', title: 'Define your idea', desc: 'Describe your concept in natural language. Atlas understands the core intent.' },
            { num: '2', icon: '🗺️', title: 'Plan the architecture', desc: 'Atlas generates a comprehensive technical plan, database schema, and API structure.' },
            { num: '3', icon: '⚡', title: 'Generate the code', desc: 'Multi-agent AI writes production-ready, testable code across the entire stack.' },
            { num: '4', icon: '🚀', title: 'Deploy & iterate', desc: 'Instant one-click deployment to a global edge network. Iterate with new instructions.' },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: '22px 20px'
            }}>
              <div style={{ fontSize: '30px', marginBottom: '14px' }}>{item.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '7px', color: '#fff' }}>
                {item.num}. {item.title}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '36px' }}>
          {[
            { icon: '🔮', label: 'Research before building', color: 'rgba(139,92,246,0.18)', border: 'rgba(139,92,246,0.4)', text: '#c4b5fd' },
            { icon: '🕸️', label: 'Visual Intent Graph', color: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', text: '#93c5fd' },
            { icon: '🛡️', label: 'Risk Radar', color: 'rgba(239,68,68,0.14)', border: 'rgba(239,68,68,0.35)', text: '#fca5a5' },
            { icon: '🤖', label: 'Multi-agent generation', color: 'rgba(34,197,94,0.14)', border: 'rgba(34,197,94,0.35)', text: '#86efac' },
          ].map(f => (
            <span key={f.label} style={{
              fontSize: '13px', padding: '7px 16px', fontWeight: '500',
              background: f.color, border: `1px solid ${f.border}`,
              borderRadius: '20px', color: f.text,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              {f.icon} {f.label}
            </span>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '80px 20px', textAlign: 'center', position: 'relative', zIndex: 1
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Ready to ship your app?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '28px', fontSize: '15px' }}>
          Free to start. No credit card required.
        </p>
        <Link href="/signup" style={{
          background: '#fff', color: '#000', padding: '14px 36px',
          borderRadius: '10px', fontSize: '15px', fontWeight: '700',
          textDecoration: 'none', display: 'inline-block'
        }}>
          Start building now
        </Link>
      </div>

      {/* Footer */}
      <div style={{
        padding: '18px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <AtlasLogo size={16} showText={false} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>© 2024 Atlas.AI Inc.</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Terms', 'Privacy', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </div>

    </div>
  )
}