import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Zap, Brain, Users, Copy, Clock, TrendingUp,
  Shield, BarChart3, MessageSquare, ChevronRight, Star,
  CheckCircle2, XCircle, Calculator, Sparkles
} from 'lucide-react'

/* ═══════════════════════════════════════
   SECTION DATA
   ═══════════════════════════════════════ */

const executores = [
  {
    icon: Brain, name: 'Agente',
    desc: 'A mente que toma decisão por você',
    detail: 'Analisa contexto, prioriza e decide a próxima ação — como um gerente incansável.'
  },
  {
    icon: BarChart3, name: 'Analyst',
    desc: 'Quem pesquisa e gera o relatório',
    detail: 'Monitora tendências, compila dados e entrega insights prontos para ação.'
  },
  {
    icon: Zap, name: 'Worker',
    desc: 'O que faz a tarefa repetitiva sem errar',
    detail: 'Executa processos operacionais com precisão e velocidade, 24 horas por dia.'
  },
  {
    icon: Copy, name: 'Clone',
    desc: 'Sua voz, seu jeito, em escala',
    detail: 'Atende clientes com a personalidade do dono — ninguém percebe a diferença.'
  },
]

const beforeAfter = [
  { metric: 'Tempo do processo', before: '17-25 dias', after: '4-6 dias' },
  { metric: 'Pontos de falha', before: '55 pontos', after: '~5 pontos' },
  { metric: 'Visibilidade', before: '0%', after: '100%' },
  { metric: 'Resposta WhatsApp', before: '2-6 horas', after: '< 30 segundos' },
  { metric: 'Relatório diário', before: 'Nenhum', after: 'Automático às 7h' },
]

const planos = [
  {
    name: 'Essencial', badge: 'LOCAL',
    price: 'R$ 497', period: '/mês',
    desc: 'Para negócios locais que querem começar',
    features: [
      'WhatsApp com voz do dono (Clone)',
      'Relatório matinal automático',
      'Follow-up de cliente sumido',
      'Confirmação de agenda',
      'Suporte via WhatsApp',
    ],
    cta: 'Começar agora', highlight: false,
  },
  {
    name: 'Governança', badge: 'REGIONAL',
    price: 'R$ 2.997', period: '/mês',
    desc: 'Para empresas que precisam de controle total',
    features: [
      'Tudo do Essencial +',
      '4 Executores dedicados',
      'Squads por área (vendas, ops, RH)',
      'Dashboard de governança',
      'Quality Gates com aprovação',
      'Onboarding em 3 semanas',
      'Suporte prioritário',
    ],
    cta: 'Agendar demonstração', highlight: true,
  },
  {
    name: 'Enterprise', badge: 'INDUSTRIAL',
    price: 'Sob consulta', period: '',
    desc: 'Para indústrias com processos complexos',
    features: [
      'Tudo do Governança +',
      'Mapeamento completo de processos',
      'Orquestração por departamento',
      'Dashboard executivo real-time',
      'Treinamento da equipe',
      'SLA dedicado',
      'Eliminação de loops de retrabalho',
    ],
    cta: 'Falar com Gabriel', highlight: false,
  },
]

const faqs = [
  {
    q: 'Isso é um chatbot?',
    a: 'Não. Chatbot responde perguntas fixas. A Experia orquestra processos inteiros — toma decisões, executa tarefas, gera relatórios e evolui com o seu negócio.'
  },
  {
    q: 'Quanto tempo leva para implementar?',
    a: 'De 1 a 3 semanas. Semana 1: mapeamos seu processo. Semana 2: configuramos os executores. Semana 3: você governa.'
  },
  {
    q: 'Preciso saber de tecnologia?',
    a: 'Zero. Você recebe relatórios no WhatsApp/Telegram e toma decisões. A tecnologia fica invisível.'
  },
  {
    q: 'E se não funcionar?',
    a: 'Garantia de 30 dias. Se não ver resultado, devolvemos seu investimento. Sem burocracia.'
  },
]

/* ═══════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════ */

export default function Landing() {
  const navigate = useNavigate()
  const goQuiz = () => navigate('/quiz')

  return (
    <div>
      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(5, 5, 8, 0.8)',
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield style={{ width: 24, height: 24, color: 'var(--color-primary)' }} />
            <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              <span className="text-gradient">Experia</span>
            </span>
          </div>
          <button className="btn btn-primary" onClick={goQuiz} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            Diagnóstico Gratuito <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </nav>

      {/* ═══ SECTION 01: HERO ═══ */}
      <section className="section" style={{ paddingTop: 160, paddingBottom: 120, position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="hero-bg"><div className="grid-pattern" /></div>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div className="animate-fade-in-up">
            <div className="badge badge-primary" style={{ marginBottom: 24 }}>
              <Sparkles style={{ width: 14, height: 14 }} />
              CONTROL ROOM EDITION v1.0
            </div>
          </div>

          <h1 className="font-display animate-fade-in-up" style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: '-0.03em',
            marginBottom: 20, maxWidth: 800, margin: '0 auto 20px',
          }}>
            Um sócio que <span className="text-gradient">nunca tira férias</span> e nunca pede aumento.
          </h1>

          <p className="animate-fade-in-up" style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--color-text-secondary)', maxWidth: 600,
            margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            Governança digital para o seu negócio — sem contratar mais ninguém. 
            Seus processos rodando 24/7 com quem entende do <em>seu</em> negócio.
          </p>

          <div className="animate-fade-in-up" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={goQuiz}>
              Quero ver funcionando <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
            <a href="#como-funciona" className="btn btn-outline btn-lg">
              Como funciona
            </a>
          </div>

          {/* Trust metrics */}
          <div className="animate-fade-in-up" style={{
            display: 'flex', justifyContent: 'center', gap: 40,
            marginTop: 64, flexWrap: 'wrap',
          }}>
            {[
              { value: '75%', label: 'Redução de tempo' },
              { value: '24/7', label: 'Operação autônoma' },
              { value: '30 dias', label: 'Garantia total' },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <div className="font-display text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{m.value}</div>
                <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ═══ SECTION 02: PROBLEMA ═══ */}
      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', letterSpacing: '0.15em' }}>O PROBLEMA</span>
          <h2 className="font-display" style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 800,
            lineHeight: 1.2, marginTop: 12, marginBottom: 20,
          }}>
            Quantas micro-tarefas existem no <span className="text-gradient">seu processo</span> hoje?
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: 600, margin: '0 auto 40px', fontSize: '1.05rem' }}>
            Cada "mandei email, tô esperando" é um ponto de falha. 
            Cada handoff manual é um cliente que pode ir pro concorrente.
          </p>

          {/* Chaos visualization */}
          <div className="glass-card" style={{
            maxWidth: 700, margin: '0 auto', padding: '40px 32px',
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 16,
            }}>
              {['WhatsApp', 'Email', 'Agenda', 'Cobranças', 'Follow-up', 'Relatórios', 'Estoque', 'Redes Sociais', 'Contratos'].map((t, i) => (
                <div key={t} style={{
                  padding: '14px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  background: 'rgba(239, 68, 68, 0.05)',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  position: 'relative',
                }}>
                  <XCircle style={{ width: 12, height: 12, color: 'var(--color-danger)', opacity: 0.6, position: 'absolute', top: 6, right: 6 }} />
                  {t}
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Manual · {2 + i} falhas/sem
                  </div>
                </div>
              ))}
            </div>
            <p className="font-mono" style={{
              marginTop: 24, fontSize: '0.85rem', color: 'var(--color-danger)',
            }}>
              ⚠ 55 pontos de falha identificados no processo manual médio
            </p>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ═══ SECTION 03: MÉTRICAS ═══ */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', letterSpacing: '0.15em' }}>OS NÚMEROS</span>
          <h2 className="font-display" style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 800,
            lineHeight: 1.2, marginTop: 12, marginBottom: 48,
          }}>
            <span className="text-gradient-accent">75% de redução</span> — mesmas tarefas, execução radicalmente diferente
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 2, maxWidth: 900, margin: '0 auto',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            border: '1px solid var(--color-border)',
          }}>
            {/* Header row */}
            <div style={{ padding: 16, background: 'var(--color-surface)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>MÉTRICA</div>
            <div style={{ padding: 16, background: 'rgba(239, 68, 68, 0.08)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-danger)', letterSpacing: '0.1em' }}>ANTES</div>
            <div style={{ padding: 16, background: 'rgba(16, 185, 129, 0.08)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-primary)', letterSpacing: '0.1em' }}>COM EXPERIA</div>
            {/* Data rows */}
            {beforeAfter.map(row => (
              <Fragment key={row.metric}>
                <div style={{ padding: '14px 16px', background: 'var(--color-surface)', fontSize: '0.9rem', borderTop: '1px solid var(--color-border)' }}>{row.metric}</div>
                <div style={{ padding: '14px 16px', background: 'rgba(239, 68, 68, 0.04)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)' }}>{row.before}</div>
                <div style={{ padding: '14px 16px', background: 'rgba(16, 185, 129, 0.04)', fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600, borderTop: '1px solid var(--color-border)' }}>{row.after}</div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ═══ SECTION 04: 4 EXECUTORES ═══ */}
      <section className="section section-alt" id="como-funciona">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', letterSpacing: '0.15em' }}>OS EXECUTORES</span>
            <h2 className="font-display" style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 800,
              lineHeight: 1.2, marginTop: 12,
            }}>
              4 mentes trabalhando pelo seu negócio — <span className="text-gradient">sem parar</span>
            </h2>
          </div>

          <div className="stagger" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {executores.map(ex => {
              const Icon = ex.icon
              return (
                <div key={ex.name} className="glass-card animate-fade-in-up" style={{ padding: 28 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-glow)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon style={{ width: 22, height: 22, color: 'var(--color-primary)' }} />
                  </div>
                  <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 6 }}>{ex.name}</h3>
                  <p style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: 10 }}>{ex.desc}</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{ex.detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ═══ SECTION 05: COMO FUNCIONA ═══ */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', letterSpacing: '0.15em' }}>3 SEMANAS</span>
          <h2 className="font-display" style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 800,
            lineHeight: 1.2, marginTop: 12, marginBottom: 48,
          }}>
            Do caos ao <span className="text-gradient">controle total</span> — em 3 passos
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24, maxWidth: 960, margin: '0 auto',
          }}>
            {[
              { step: '01', title: 'Mapeamos', desc: 'Entendemos como seu negócio opera hoje — cada etapa, cada handoff, cada ponto de falha.', icon: MessageSquare },
              { step: '02', title: 'Configuramos', desc: 'Os 4 executores são personalizados com a voz, estilo e processos do SEU negócio.', icon: Zap },
              { step: '03', title: 'Você governa', desc: 'Receba relatórios, tome decisões, acompanhe tudo — sem precisar operar.', icon: Shield },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.step} className="glass-card" style={{ padding: 32, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <span className="font-mono text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>{s.step}</span>
                    <Icon style={{ width: 22, height: 22, color: 'var(--color-text-muted)' }} />
                  </div>
                  <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ═══ SECTION 06: ANTES vs DEPOIS ═══ */}
      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--color-accent)', letterSpacing: '0.15em' }}>TRANSFORMAÇÃO</span>
          <h2 className="font-display" style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 800,
            lineHeight: 1.2, marginTop: 12, marginBottom: 48,
          }}>
            O dia a dia do seu negócio — <span className="text-gradient-accent">antes e depois</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 800, margin: '0 auto' }}>
            {/* Before */}
            <div className="glass-card" style={{ padding: 28, borderColor: 'rgba(239, 68, 68, 0.2)', textAlign: 'left' }}>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginBottom: 16, letterSpacing: '0.1em' }}>❌ HOJE</div>
              {[
                'Responde WhatsApp entre tarefas',
                'Perde leads por demora',
                '"Mandei email, tô esperando"',
                'Sem relatório, sem visibilidade',
                'Trabalha 12h/dia e não cresce',
              ].map(t => (
                <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <XCircle style={{ width: 16, height: 16, color: 'var(--color-danger)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{t}</span>
                </div>
              ))}
            </div>
            {/* After */}
            <div className="glass-card" style={{ padding: 28, borderColor: 'rgba(16, 185, 129, 0.2)', textAlign: 'left' }}>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginBottom: 16, letterSpacing: '0.1em' }}>✅ COM EXPERIA</div>
              {[
                'Respostas em < 30 segundos, 24/7',
                'Zero leads perdidos',
                'Rastreabilidade total de cada etapa',
                'Relatório completo às 7h da manhã',
                'Foco no que importa: crescer',
              ].map(t => (
                <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ═══ SECTION 07: CALCULADORA ═══ */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--color-accent)', letterSpacing: '0.15em' }}>CALCULADORA DE IMPACTO</span>
          <h2 className="font-display" style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 800,
            lineHeight: 1.2, marginTop: 12, marginBottom: 16,
          }}>
            Quanto dinheiro você está <span className="text-gradient-accent">deixando na mesa</span>?
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500, margin: '0 auto 40px' }}>
            Clientes perdidos por demora × seu ticket médio = receita invisível que escapa todo mês.
          </p>

          <div className="glass-card" style={{
            maxWidth: 500, margin: '0 auto', padding: 36,
            borderColor: 'rgba(245, 158, 11, 0.2)',
          }}>
            <Calculator style={{ width: 32, height: 32, color: 'var(--color-accent)', marginBottom: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'left' }}>
              <div>
                <label className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>
                  CLIENTES PERDIDOS POR MÊS
                </label>
                <input id="calc-clients" type="number" defaultValue={5} min={0} style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                  color: 'var(--color-text)', fontFamily: 'var(--font-mono)',
                  fontSize: '1.1rem',
                }}
                onChange={() => {
                  const clients = parseInt((document.getElementById('calc-clients') as HTMLInputElement).value) || 0
                  const ticket = parseInt((document.getElementById('calc-ticket') as HTMLInputElement).value) || 0
                  const result = document.getElementById('calc-result')
                  if (result) result.textContent = `R$ ${(clients * ticket).toLocaleString('pt-BR')}`
                }}
                />
              </div>
              <div>
                <label className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>
                  TICKET MÉDIO (R$)
                </label>
                <input id="calc-ticket" type="number" defaultValue={200} min={0} style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                  color: 'var(--color-text)', fontFamily: 'var(--font-mono)',
                  fontSize: '1.1rem',
                }}
                onChange={() => {
                  const clients = parseInt((document.getElementById('calc-clients') as HTMLInputElement).value) || 0
                  const ticket = parseInt((document.getElementById('calc-ticket') as HTMLInputElement).value) || 0
                  const result = document.getElementById('calc-result')
                  if (result) result.textContent = `R$ ${(clients * ticket).toLocaleString('pt-BR')}`
                }}
                />
              </div>
              <div style={{
                padding: 20, borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent-glow)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                textAlign: 'center',
              }}>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-accent)', marginBottom: 6, letterSpacing: '0.15em' }}>RECEITA MENSAL INVISÍVEL</div>
                <div id="calc-result" className="font-display glow-accent" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                  R$ 1.000
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 8 }}>
                  A Experia custa menos que isso.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ═══ SECTION 08: SOCIAL PROOF ═══ */}
      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', letterSpacing: '0.15em' }}>CASES EM CONSTRUÇÃO</span>
          <h2 className="font-display" style={{
            fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 800,
            lineHeight: 1.2, marginTop: 12, marginBottom: 40,
          }}>
            Negócios do <span className="text-gradient">ABC Paulista</span> já estão testando
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, maxWidth: 800, margin: '0 auto' }}>
            {[
              { emoji: '🥦', name: 'Hortifruti', status: 'Trial ativo', type: 'Comércio local' },
              { emoji: '🍺', name: 'Restaurante', status: 'Em configuração', type: 'Gastronomia' },
              { emoji: '📱', name: 'Assistência Técnica', status: 'Trial 15 dias', type: 'Serviços' },
            ].map(c => (
              <div key={c.name} className="glass-card" style={{ padding: 24, textAlign: 'left' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{c.emoji}</div>
                <h4 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{c.name}</h4>
                <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: 6 }}>{c.status}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{c.type}</p>
              </div>
            ))}
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 32, fontStyle: 'italic' }}>
            Depoimentos completos serão publicados após conclusão dos trials.
          </p>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ═══ SECTION 09: PLANOS ═══ */}
      <section className="section" id="planos">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', letterSpacing: '0.15em' }}>INVESTIMENTO</span>
          <h2 className="font-display" style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 800,
            lineHeight: 1.2, marginTop: 12, marginBottom: 48,
          }}>
            Escolha o nível de <span className="text-gradient">governança</span>
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20, maxWidth: 960, margin: '0 auto', alignItems: 'stretch',
          }}>
            {planos.map(plan => (
              <div key={plan.name} className="glass-card" style={{
                padding: 32, textAlign: 'left', position: 'relative',
                borderColor: plan.highlight ? 'rgba(16, 185, 129, 0.3)' : undefined,
                background: plan.highlight ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(15, 15, 24, 0.8))' : undefined,
              }}>
                {plan.highlight && (
                  <div className="badge badge-primary" style={{ position: 'absolute', top: -12, right: 20 }}>
                    <Star style={{ width: 12, height: 12 }} /> RECOMENDADO
                  </div>
                )}
                <div className="badge badge-accent" style={{ marginBottom: 16 }}>{plan.badge}</div>
                <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>{plan.name}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>{plan.desc}</p>
                <div style={{ marginBottom: 24 }}>
                  <span className="font-display" style={{ fontSize: '2rem', fontWeight: 900 }}>{plan.price}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                      <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}
                  onClick={goQuiz}
                  style={{ width: '100%' }}
                >
                  {plan.cta} <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ═══ SECTION: FAQ ═══ */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 700 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', letterSpacing: '0.15em' }}>FAQ</span>
            <h2 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 12 }}>
              Perguntas frequentes
            </h2>
          </div>
          {faqs.map(f => (
            <div key={f.q} className="glass-card" style={{ padding: '20px 24px', marginBottom: 12 }}>
              <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{f.q}</h4>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="section-divider" />

      {/* ═══ SECTION 10: CTA FINAL ═══ */}
      <section className="section" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="font-display" style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900,
            lineHeight: 1.15, marginBottom: 16, maxWidth: 700, margin: '0 auto 16px',
          }}>
            Não é IA. É o seu negócio <span className="text-gradient">operando como deveria</span>.
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500, margin: '0 auto 36px', fontSize: '1.05rem' }}>
            Faça o diagnóstico gratuito e descubra quanto do seu faturamento está escapando.
          </p>
          <button className="btn btn-primary btn-lg" onClick={goQuiz}>
            Fazer diagnóstico gratuito <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '32px 0', textAlign: 'center',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <Shield style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
            <span className="font-display" style={{ fontWeight: 700 }}>
              <span className="text-gradient">Experia</span> Solutions
            </span>
          </div>
          <p className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
            Governança Digital Autônoma — Control Room Edition v1.0
          </p>
          <p className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
            © 2026 Experia Solutions. ABC Paulista, SP.
          </p>
        </div>
      </footer>
    </div>
  )
}
