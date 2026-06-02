import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'inherit' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '60px',
        borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0,
        background: '#fff', zIndex: 100
      }}>
        <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
          Atlas.AI
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/login" style={{
            fontSize: '14px', fontWeight: '500', color: '#333',
            textDecoration: 'none', padding: '8px 16px',
            border: '1px solid #e5e5e5', borderRadius: '8px'
          }}>
            Login
          </Link>
          <Link href="/signup" style={{
            fontSize: '14px', fontWeight: '500', color: '#fff',
            textDecoration: 'none', padding: '8px 18px',
            background: '#000', borderRadius: '8px'
          }}>
            Create free account
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '90px 20px 60px' }}>
        <div style={{
          display: 'inline-block', fontSize: '12px', fontWeight: '600',
          background: '#f0fdf4', color: '#16a34a', padding: '4px 12px',
          borderRadius: '20px', marginBottom: '20px', letterSpacing: '0.05em'
        }}>
          AI-POWERED APP BUILDER
        </div>
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 58px)', fontWeight: '800',
          lineHeight: '1.15', marginBottom: '20px',
          letterSpacing: '-1px', color: '#0a0a0a'
        }}>
          Build any web app —<br />
          from idea to deployed
        </h1>
        <p style={{
          fontSize: '18px', color: '#666', maxWidth: '520px',
          margin: '0 auto 36px', lineHeight: '1.6'
        }}>
          Atlas researches your idea, creates an editable plan,
          and generates production-ready code using AI agents.
          No coding required.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            background: '#000', color: '#fff', padding: '13px 28px',
            borderRadius: '10px', fontSize: '15px', fontWeight: '600',
            textDecoration: 'none'
          }}>
            Start building free →
          </Link>
          <Link href="/login" style={{
            background: '#f5f5f5', color: '#333', padding: '13px 28px',
            borderRadius: '10px', fontSize: '15px', fontWeight: '500',
            textDecoration: 'none'
          }}>
            Sign in
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div style={{
        maxWidth: '900px', margin: '0 auto', padding: '40px 20px 80px'
      }}>
        <h2 style={{
          textAlign: 'center', fontSize: '28px', fontWeight: '700',
          marginBottom: '40px', color: '#0a0a0a'
        }}>
          How Atlas works
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {[
            { step: '01', icon: '🔍', title: 'Research', desc: 'Atlas researches your idea — competitors, features, tech stack, and pitfalls.' },
            { step: '02', icon: '🗺️', title: 'Blueprint', desc: 'Get an editable visual plan with pages, features, API routes, and database tables.' },
            { step: '03', icon: '⚡', title: 'Generate', desc: '5 AI agents build your frontend, backend, database, and tests in parallel.' },
            { step: '04', icon: '🚀', title: 'Deploy', desc: 'One click pushes your app to GitHub and deploys it live on Vercel.' },
          ].map(item => (
            <div key={item.step} style={{
              background: '#fafafa', border: '1px solid #f0f0f0',
              borderRadius: '14px', padding: '24px'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{item.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#aaa', letterSpacing: '0.1em', marginBottom: '6px' }}>
                STEP {item.step}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#0a0a0a' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What makes it different */}
      <div style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '60px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '12px' }}>
            Not just another code generator
          </h2>
          <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px' }}>
            Every other AI builder takes your prompt and starts coding immediately.
            Atlas <strong>researches first</strong>, <strong>plans with you</strong>,
            checks for risks, then builds — so what you get actually makes sense.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {['Research before building', 'Visual Intent Graph', 'Risk Radar', 'Multi-agent generation', 'App DNA marketplace', 'AI usability testing'].map(f => (
              <span key={f} style={{
                fontSize: '13px', padding: '6px 14px', background: '#fff',
                border: '1px solid #e5e5e5', borderRadius: '20px', color: '#333'
              }}>
                ✓ {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '70px 20px' }}>
        <h2 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '12px' }}>
          Ready to build your app?
        </h2>
        <p style={{ color: '#888', marginBottom: '24px', fontSize: '15px' }}>
          Free to start. No credit card required.
        </p>
        <Link href="/signup" style={{
          background: '#000', color: '#fff', padding: '14px 32px',
          borderRadius: '10px', fontSize: '16px', fontWeight: '600',
          textDecoration: 'none'
        }}>
          Create free account →
        </Link>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #f0f0f0', padding: '20px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontSize: '14px', fontWeight: '700' }}>Atlas.AI</span>
        <span style={{ fontSize: '12px', color: '#aaa' }}>Built with Atlas.AI</span>
      </div>

    </div>
  )
}