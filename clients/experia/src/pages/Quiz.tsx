import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, Shield, ChevronRight,
  Building2, Users, Workflow, Clock, Target, Sparkles,
  AlertTriangle, CheckCircle2, TrendingUp
} from 'lucide-react'

/* ═══════════════════════════════════════
   QUIZ DATA
   ═══════════════════════════════════════ */

interface Question {
  id: string
  question: string
  icon: typeof Building2
  options: { label: string; value: string; points: number }[]
}

const questions: Question[] = [
  {
    id: 'business', icon: Building2,
    question: 'Qual é o tipo do seu negócio?',
    options: [
      { label: '🏪 Comércio local (loja, mercado, bazar)', value: 'local', points: 1 },
      { label: '🏥 Saúde (clínica, consultório, estética)', value: 'saude', points: 2 },
      { label: '🏢 Serviços (escritório, imobiliária, consultoria)', value: 'servicos', points: 2 },
      { label: '🏭 Indústria / Distribuição', value: 'industria', points: 3 },
      { label: '🍽️ Alimentação (restaurante, delivery, café)', value: 'alimentacao', points: 1 },
      { label: '🔧 Outro', value: 'outro', points: 1 },
    ],
  },
  {
    id: 'team', icon: Users,
    question: 'Quantas pessoas trabalham no seu negócio?',
    options: [
      { label: 'Só eu', value: '1', points: 1 },
      { label: '2 a 5 pessoas', value: '2-5', points: 2 },
      { label: '6 a 20 pessoas', value: '6-20', points: 3 },
      { label: '21 a 100 pessoas', value: '21-100', points: 4 },
      { label: 'Mais de 100', value: '100+', points: 5 },
    ],
  },
  {
    id: 'steps', icon: Workflow,
    question: 'Do contato inicial até a venda, quantas etapas existem no seu processo?',
    options: [
      { label: '1 a 3 etapas (simples)', value: '1-3', points: 1 },
      { label: '4 a 7 etapas', value: '4-7', points: 3 },
      { label: '8 a 15 etapas', value: '8-15', points: 5 },
      { label: 'Mais de 15 (complexo)', value: '15+', points: 8 },
      { label: 'Não sei — nunca contei', value: 'unknown', points: 6 },
    ],
  },
  {
    id: 'lost', icon: AlertTriangle,
    question: 'Já perdeu cliente esta semana por demora na resposta?',
    options: [
      { label: 'Sim, com certeza', value: 'yes', points: 5 },
      { label: 'Provavelmente sim', value: 'probably', points: 4 },
      { label: 'Não sei (essa dói mais)', value: 'unknown', points: 6 },
      { label: 'Não, consigo responder rápido', value: 'no', points: 1 },
    ],
  },
  {
    id: 'time', icon: Clock,
    question: 'Quanto tempo PESSOAL você gasta por dia em tarefas que poderiam ser automáticas?',
    options: [
      { label: 'Menos de 1 hora', value: '<1h', points: 1 },
      { label: '1 a 3 horas', value: '1-3h', points: 3 },
      { label: '3 a 5 horas', value: '3-5h', points: 5 },
      { label: 'Mais de 5 horas', value: '5h+', points: 8 },
    ],
  },
  {
    id: 'goal', icon: Target,
    question: 'O que você quer mais para o seu negócio?',
    options: [
      { label: '⏰ Mais tempo (parar de apagar incêndio)', value: 'tempo', points: 2 },
      { label: '💰 Mais dinheiro (parar de perder oportunidades)', value: 'dinheiro', points: 2 },
      { label: '📊 Mais controle (saber o que está acontecendo)', value: 'controle', points: 2 },
      { label: '🚀 Tudo isso', value: 'tudo', points: 3 },
    ],
  },
]

/* ═══════════════════════════════════════
   RESULT PROFILES
   ═══════════════════════════════════════ */

function getProfile(totalPoints: number, answers: Record<string, string>) {
  const businessType = answers.business || 'outro'
  const businessLabels: Record<string, string> = {
    local: 'comércio local', saude: 'clínica/consultório',
    servicos: 'empresa de serviços', industria: 'indústria/distribuição',
    alimentacao: 'negócio de alimentação', outro: 'negócio',
  }
  const biz = businessLabels[businessType] || 'negócio'

  if (totalPoints >= 25) {
    return {
      level: '🔴 CRÍTICO', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)',
      failurePoints: Math.round(totalPoints * 2.2),
      monthlyLoss: totalPoints * 380,
      headline: `Seu ${biz} tem um nível CRÍTICO de vulnerabilidade operacional.`,
      desc: 'Você está perdendo dinheiro todos os dias com processos manuais, falhas de handoff e leads que escapam. A boa notícia: a correção é rápida.',
      plan: 'Governança',
    }
  } else if (totalPoints >= 15) {
    return {
      level: '🟡 ALTO', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)',
      failurePoints: Math.round(totalPoints * 1.8),
      monthlyLoss: totalPoints * 250,
      headline: `Seu ${biz} tem vulnerabilidades importantes que estão custando dinheiro.`,
      desc: 'Você consegue operar, mas está gastando tempo demais em tarefas que poderiam rodar sozinhas. Cada hora perdida é receita que não entra.',
      plan: 'Essencial',
    }
  } else {
    return {
      level: '🟢 MODERADO', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)',
      failurePoints: Math.round(totalPoints * 1.5),
      monthlyLoss: totalPoints * 150,
      headline: `Seu ${biz} está razoavelmente organizado — mas tem espaço para crescer.`,
      desc: 'Você tem boas práticas, mas ainda existem pontos de falha que impedem o próximo nível de escala. A Experia pode ser o acelerador.',
      plan: 'Essencial',
    }
  }
}

/* ═══════════════════════════════════════
   QUIZ COMPONENT
   ═══════════════════════════════════════ */

export default function Quiz() {
  const navigate = useNavigate()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [points, setPoints] = useState<Record<string, number>>({})
  const [showResult, setShowResult] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const q = questions[currentQ]
  const progress = ((currentQ) / questions.length) * 100
  const totalPoints = Object.values(points).reduce((a, b) => a + b, 0)

  const selectOption = (value: string, pts: number) => {
    setSelectedOption(value)
    setTimeout(() => {
      setAnswers(prev => ({ ...prev, [q.id]: value }))
      setPoints(prev => ({ ...prev, [q.id]: pts }))
      setSelectedOption(null)

      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1)
      } else {
        setShowResult(true)
      }
    }, 300)
  }

  const goBack = () => {
    if (currentQ > 0) setCurrentQ(prev => prev - 1)
  }

  const profile = getProfile(totalPoints + (points[q?.id] || 0), answers)

  /* ── RESULT SCREEN ── */
  if (showResult) {
    const finalPoints = Object.values(points).reduce((a, b) => a + b, 0)
    const p = getProfile(finalPoints, answers)

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          {/* Back to home */}
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 32, fontSize: '0.85rem',
          }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Voltar ao site
          </button>

          <div className="animate-fade-in-up">
            <div className="badge" style={{
              color: p.color, borderColor: p.borderColor,
              background: p.borderColor.replace('0.3', '0.1'),
              marginBottom: 20,
            }}>
              <Sparkles style={{ width: 14, height: 14 }} />
              RESULTADO DO DIAGNÓSTICO
            </div>

            <h1 className="font-display" style={{
              fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.2, marginBottom: 12,
            }}>
              {p.headline}
            </h1>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 32 }}>
              {p.desc}
            </p>
          </div>

          {/* Metrics cards */}
          <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div className="glass-card" style={{ padding: 24, textAlign: 'center', borderColor: p.borderColor }}>
              <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>NÍVEL DE RISCO</div>
              <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: p.color }}>{p.level}</div>
            </div>
            <div className="glass-card" style={{ padding: 24, textAlign: 'center', borderColor: p.borderColor }}>
              <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>PONTOS DE FALHA</div>
              <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: p.color }}>{p.failurePoints}</div>
            </div>
          </div>

          <div className="glass-card animate-fade-in-up" style={{
            padding: 28, marginBottom: 32, textAlign: 'center',
            borderColor: 'rgba(245, 158, 11, 0.3)',
            background: 'rgba(245, 158, 11, 0.05)',
          }}>
            <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-accent)', letterSpacing: '0.15em', marginBottom: 8 }}>
              RECEITA MENSAL ESTIMADA QUE ESTÁ ESCAPANDO
            </div>
            <div className="font-display glow-accent" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-accent)' }}>
              R$ {p.monthlyLoss.toLocaleString('pt-BR')}
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: 12 }}>
              Baseado nos seus {p.failurePoints} pontos de falha e no perfil do seu negócio.
            </p>
          </div>

          {/* Recommendation */}
          <div className="glass-card animate-fade-in-up" style={{
            padding: 28, marginBottom: 32,
            borderColor: 'rgba(16, 185, 129, 0.3)',
            background: 'rgba(16, 185, 129, 0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <CheckCircle2 style={{ width: 20, height: 20, color: 'var(--color-primary)' }} />
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', letterSpacing: '0.1em' }}>PLANO RECOMENDADO</span>
            </div>
            <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
              Experia <span className="text-gradient">{p.plan}</span>
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 20 }}>
              Com o plano {p.plan}, você eliminaria aproximadamente {Math.round(p.failurePoints * 0.75)} dos seus {p.failurePoints} pontos de falha — 
              recuperando até R$ {Math.round(p.monthlyLoss * 0.75).toLocaleString('pt-BR')}/mês em receita invisível.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/5511999999999?text=${encodeURIComponent(
                  `Olá Gabriel! Fiz o diagnóstico da Experia e meu resultado foi: ${p.level} com ${p.failurePoints} pontos de falha. Quero saber mais sobre o plano ${p.plan}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
              >
                Falar com Gabriel <ArrowRight style={{ width: 18, height: 18 }} />
              </a>
              <button className="btn btn-outline" onClick={() => navigate('/#planos')}>
                Ver todos os planos
              </button>
            </div>
          </div>

          {/* Trust bar */}
          <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              { icon: Shield, label: 'Garantia 30 dias' },
              { icon: TrendingUp, label: '75% redução' },
              { icon: Clock, label: 'Implementação 3 sem.' },
            ].map(t => (
              <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <t.icon style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
                <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ── QUESTION SCREEN ── */
  const Icon = q.icon
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield style={{ width: 20, height: 20, color: 'var(--color-primary)' }} />
          <span className="font-display text-gradient" style={{ fontWeight: 700, fontSize: '0.95rem' }}>Experia</span>
          <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: 8 }}>DIAGNÓSTICO</span>
        </div>
        <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {currentQ + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--color-surface)' }}>
        <div style={{
          height: '100%', background: 'var(--color-primary)',
          width: `${progress}%`, transition: 'width 0.4s ease',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
        }} />
      </div>

      {/* Question content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 560, width: '100%' }} className="animate-fade-in">
          {/* Back button */}
          {currentQ > 0 && (
            <button onClick={goBack} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: 32, fontSize: '0.85rem', padding: 0,
            }}>
              <ArrowLeft style={{ width: 16, height: 16 }} /> Voltar
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-glow)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon style={{ width: 20, height: 20, color: 'var(--color-primary)' }} />
            </div>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
              PERGUNTA {currentQ + 1}
            </span>
          </div>

          <h2 className="font-display" style={{
            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800,
            lineHeight: 1.3, marginBottom: 32,
          }}>
            {q.question}
          </h2>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => selectOption(opt.value, opt.points)}
                className="glass-card"
                style={{
                  padding: '16px 20px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textAlign: 'left', fontSize: '0.95rem',
                  background: selectedOption === opt.value ? 'var(--color-primary-glow)' : undefined,
                  borderColor: selectedOption === opt.value ? 'rgba(16, 185, 129, 0.4)' : undefined,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>{opt.label}</span>
                <ChevronRight style={{ width: 16, height: 16, color: 'var(--color-text-muted)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
