import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

export default async function PublicMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('menus')
    .select('restaurant, cuisine, created_at, menu')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const { restaurant, cuisine, created_at, menu } = data
  const date = new Date(created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: '#f7f3ee', fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1c1109,#2e1c0c)', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 36, fontWeight: 400, color: '#f7f3ee', letterSpacing: '-1px', marginBottom: 8 }}>
          {restaurant}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>Cuisine {cuisine}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>Menu du {date}</div>
      </div>

      {/* Analyse */}
      {menu.analyse && (
        <div style={{ maxWidth: 720, margin: '28px auto 0', padding: '0 24px' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(120,80,50,.11)', borderRadius: 16, padding: '18px 22px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#c75c32', marginBottom: 8 }}>Analyse du chef</div>
            <div style={{ fontSize: 14, color: '#5a3d28', lineHeight: 1.75 }}>{menu.analyse}</div>
          </div>
        </div>
      )}

      {/* Jours */}
      <div style={{ maxWidth: 720, margin: '20px auto 40px', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {JOURS.map(jour => {
          const j = menu.jours?.[jour]
          if (!j?.midi?.plat && !j?.soir?.plat) return null
          return (
            <div key={jour} style={{ background: '#fff', border: '1px solid rgba(120,80,50,.11)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(90deg,rgba(199,92,50,.07),transparent)', padding: '12px 22px', borderBottom: '1px solid rgba(120,80,50,.08)' }}>
                <span style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 400, fontStyle: 'italic', color: '#1c1109' }}>{jour}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: j?.midi?.plat && j?.soir?.plat ? '1fr 1fr' : '1fr', gap: 0 }}>
                {j?.midi?.plat && (
                  <div style={{ padding: '16px 22px', borderRight: j?.soir?.plat ? '1px solid rgba(120,80,50,.08)' : 'none' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9a7860', marginBottom: 10 }}>☀️ Déjeuner {j.midi.prix && `· ${j.midi.prix}`}</div>
                    {[{n:'Entrée',v:j.midi.entree},{n:'Plat',v:j.midi.plat},{n:'Dessert',v:j.midi.dessert}].map(c => c.v && (
                      <div key={c.n} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: '#9a7860', textTransform: 'uppercase', letterSpacing: '.05em' }}>{c.n}</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#1c1109' }}>{c.v}</div>
                      </div>
                    ))}
                  </div>
                )}
                {j?.soir?.plat && (
                  <div style={{ padding: '16px 22px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9a7860', marginBottom: 10 }}>🌙 Dîner {j.soir.prix && `· ${j.soir.prix}`}</div>
                    {[{n:'Entrée',v:j.soir.entree},{n:'Plat',v:j.soir.plat},{n:'Dessert',v:j.soir.dessert}].map(c => c.v && (
                      <div key={c.n} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: '#9a7860', textTransform: 'uppercase', letterSpacing: '.05em' }}>{c.n}</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#1c1109' }}>{c.v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Conseil */}
      {menu.conseil && (
        <div style={{ maxWidth: 720, margin: '0 auto 40px', padding: '0 24px' }}>
          <div style={{ background: 'rgba(45,106,79,.08)', border: '1px solid rgba(45,106,79,.15)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#2d6a4f', marginBottom: 6 }}>Conseil du chef</div>
            <div style={{ fontSize: 13, color: '#1c1109', lineHeight: 1.7 }}>{menu.conseil}</div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '20px 0 40px', fontSize: 12, color: '#9a7860' }}>
        Généré par <a href="/" style={{ color: '#c75c32', textDecoration: 'none', fontWeight: 600 }}>MenuMind</a>
      </div>
    </div>
  )
}
