import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavigationBar } from '@/shared/ui'

const EMAIL = 'techeer.team.g@gmail.com'
const OFFICER = '조성훈'
const PHONE = '010-2835-7183'
const EFFECTIVE = '2026년 7월 28일'

/**
 * 개인정보 처리방침 (공개) — Chrome 웹스토어 배포용. 인증 없이 누구나 접속.
 * Google 데이터 사용 공개 양식(개인 식별 정보·인증 정보·웹사이트 콘텐츠 수집,
 * 제3자 판매/전송 금지, 신용·대출 목적 사용 금지)을 반영한다.
 */
export function PrivacyPage() {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <NavigationBar title="개인정보 처리방침" onBack={() => navigate(-1)} />

      <div style={{ padding: '8px var(--spacing-xl) 48px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <p style={{ margin: '4px 0 2px', fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>찍어보카(Jjikovoca)</p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-tertiary)' }}>시행일: {EFFECTIVE}</p>

        <p style={intro}>
          찍어보카(이하 “서비스”)는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 등 관련 법령과 Google 개발자 프로그램 정책을 준수합니다. 본 방침은
          서비스가 어떤 개인정보를 수집·이용하고, 어떻게 보호하는지를 설명합니다.
        </p>

        <Section title="1. 수집하는 개인정보 항목">
          <p style={p}>서비스는 다음의 최소한의 개인정보를 수집합니다.</p>
          <Ul items={[
            <><b>개인 식별 정보</b> — 이메일 주소, 닉네임 (회원가입·식별 목적)</>,
            <><b>인증 정보</b> — 비밀번호 (단방향 암호화하여 저장, 원문 미보관)</>,
            <><b>웹사이트·서비스 콘텐츠</b> — 이용자가 촬영·업로드한 시험지 이미지, 그로부터 추출한 단어와 학습 기록</>,
          ]} />
          <p style={note}>서비스는 건강 정보, 금융·결제 정보, 개인적인 커뮤니케이션, 위치 정보, 웹 브라우징 기록, 사용자 활동(키 입력·마우스 로깅 등)을 수집하지 않습니다.</p>
        </Section>

        <Section title="2. 개인정보의 수집·이용 목적">
          <Ul items={[
            <>회원 식별 및 로그인 인증</>,
            <>핵심 기능 제공 — 촬영한 시험지 이미지에서 단어를 추출하고, 문맥에 맞는 뜻·예문·발음이 담긴 단어 카드를 생성</>,
            <>학습 관리 — 복습 일정(라이트너 박스), 학습 통계·경험치 등 학습 진행 상황 제공</>,
            <>서비스 개선 및 오류 대응</>,
          ]} />
        </Section>

        <Section title="3. AI 처리 및 제3자 제공">
          <p style={p}>
            단어 카드 생성을 위해 촬영 이미지는 Google Gemini API로 전송되어 분석됩니다. 이는 서비스 제공을 위한 처리이며, 해당 처리 외의 목적으로 이용되지 않습니다.
          </p>
          <p style={p}>서비스는 다음을 준수합니다.</p>
          <Ul items={[
            <>승인된 사용 사례를 제외하고 사용자 데이터를 제3자에 판매하거나 전송하지 않습니다.</>,
            <>항목의 전용 목적과 관련 없는 목적으로 사용자 데이터를 사용하거나 전송하지 않습니다.</>,
            <>신용도 판단 또는 대출을 위해 사용자 데이터를 사용하거나 전송하지 않습니다.</>,
          ]} />
        </Section>

        <Section title="4. 보유 및 이용 기간, 파기">
          <p style={p}>
            개인정보는 수집·이용 목적이 달성되면 지체 없이 파기합니다. 회원 탈퇴 시 단어 카드·오답노트·학습 기록 등 이용자 데이터는 삭제되며 복구할 수 없습니다.
            단, 관계 법령에 따라 보존이 필요한 결제·거래 기록 등은 해당 기간 동안 별도 보관 후 파기합니다.
          </p>
        </Section>

        <Section title="5. 이용자의 권리">
          <p style={p}>
            이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요청할 수 있으며, 서비스 내 “회원 탈퇴”를 통해 계정과 개인정보의 삭제를 요청할 수 있습니다.
          </p>
        </Section>

        <Section title="6. 안전성 확보 조치">
          <Ul items={[
            <>전송 구간 암호화(HTTPS)를 통한 데이터 보호</>,
            <>비밀번호의 단방향 암호화 저장</>,
            <>접근 권한 관리 및 최소 수집 원칙 적용</>,
          ]} />
        </Section>

        <Section title="7. 문의처">
          <p style={p}>
            개인정보 처리에 관한 문의는 개인정보 보호책임자에게 연락해 주세요.<br />
            개인정보 보호책임자: {OFFICER}<br />
            이메일: <a href={`mailto:${EMAIL}`} style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>{EMAIL}</a><br />
            연락처: <a href={`tel:${PHONE.replace(/-/g, '')}`} style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>{PHONE}</a>
          </p>
        </Section>

        <p style={{ ...note, marginTop: 28 }}>
          본 서비스는 Google 개발자 프로그램 정책을 준수합니다. 본 방침은 관련 법령·정책 변경 또는 서비스 변경에 따라 개정될 수 있으며, 개정 시 본 페이지를 통해 공지합니다.
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</h2>
      {children}
    </section>
  )
}

function Ul({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ margin: '4px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((it, i) => (
        <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{it}</li>
      ))}
    </ul>
  )
}

const intro = { margin: '18px 0 0', fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-secondary)' } as const
const p = { margin: '4px 0 0', fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-secondary)' } as const
const note = { margin: '10px 0 0', fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-tertiary)' } as const
