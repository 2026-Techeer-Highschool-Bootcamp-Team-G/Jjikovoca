import { createBrowserRouter } from 'react-router-dom'
import { App } from './App'
import { StudyLayout } from './StudyLayout'
import { RequireAuth } from './RequireAuth'
import { HomePage } from '@/pages/home'
import { WrongNotePage } from '@/pages/wrong-note'
import { MathReviewPage } from '@/pages/math-review'
import { ReportPage } from '@/pages/report'
import { MyPage } from '@/pages/my'
import { CapturePage } from '@/pages/capture'
import { FlashcardPage } from '@/pages/flashcard'
import { ClozePage } from '@/pages/cloze'
import { ExamPage } from '@/pages/exam'
import { ArchivePage } from '@/pages/archive'
import { OnboardingPage } from '@/pages/onboarding'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { NotificationsPage } from '@/pages/notifications'
import { PaywallPage } from '@/pages/paywall'
import { PayPage } from '@/pages/pay'
import { PayDonePage } from '@/pages/pay-done'
import { LimitPage } from '@/pages/limit'
import { SearchPage } from '@/pages/search'
import { WithdrawPage } from '@/pages/withdraw'
import { ExportPage } from '@/pages/export'
import { ExportDonePage } from '@/pages/export-done'
import { StudyPickPage } from '@/pages/study-pick'
import { CardDonePage } from '@/pages/card-done'
import { MathProblemPage } from '@/pages/math-problem'
import { CaptureTwoPage } from '@/pages/capture-2'
import { CaptureThreePage } from '@/pages/capture-3'
import { CaptureFourPage } from '@/pages/capture-4'
import { CaptureFivePage } from '@/pages/capture-5'
import { ClozeCorrectPage } from '@/pages/cloze-correct'
import { ClozeWrongPage } from '@/pages/cloze-wrong'
import { MathAnswerPage } from '@/pages/math-answer'
import { MathVerdictCorrectPage } from '@/pages/math-verdict-correct'
import { MathVerdictWrongPage } from '@/pages/math-verdict-wrong'
import { StudyPickThreePage } from '@/pages/study-pick-3'
import { ReportScrollPage } from '@/pages/report-scroll'
import { ExamSelectPage } from '@/pages/exam-select'

/**
 * 라우트 ↔ pages 슬라이스 1:1 (문서 12 §0).
 * 공개 = 인증 불필요(로그인/회원가입/온보딩).
 * 보호 = RequireAuth 가드 하위 — 미인증이면 /login 으로. App = 하단 탭 5개 /
 *        StudyLayout = 탭 없는 학습·플로우 화면(자체 NavigationBar).
 */
export const router = createBrowserRouter([
  // 공개 — 인증 불필요
  {
    element: <StudyLayout />,
    children: [
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  // 보호 — 인증 필요(가드가 미인증 시 /login 으로 리다이렉트)
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'wrong-note', element: <WrongNotePage /> },
          { path: 'report', element: <ReportPage /> },
          { path: 'my', element: <MyPage /> },
        ],
      },
      {
        element: <StudyLayout />,
        children: [
          { path: 'flashcard', element: <FlashcardPage /> },
          { path: 'cloze', element: <ClozePage /> },
          { path: 'math-review', element: <MathReviewPage /> },
          { path: 'exam', element: <ExamPage /> },
          { path: 'archive', element: <ArchivePage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'paywall', element: <PaywallPage /> },
          { path: 'pay', element: <PayPage /> },
          { path: 'pay-done', element: <PayDonePage /> },
          { path: 'limit', element: <LimitPage /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'withdraw', element: <WithdrawPage /> },
          { path: 'export', element: <ExportPage /> },
          { path: 'export-done', element: <ExportDonePage /> },
          { path: 'study-pick', element: <StudyPickPage /> },
          { path: 'card-done', element: <CardDonePage /> },
          { path: 'math-problem', element: <MathProblemPage /> },
          { path: 'capture', element: <CapturePage /> },
          { path: 'capture-2', element: <CaptureTwoPage /> },
          { path: 'capture-3', element: <CaptureThreePage /> },
          { path: 'capture-4', element: <CaptureFourPage /> },
          { path: 'capture-5', element: <CaptureFivePage /> },
          { path: 'cloze-correct', element: <ClozeCorrectPage /> },
          { path: 'cloze-wrong', element: <ClozeWrongPage /> },
          { path: 'math-answer', element: <MathAnswerPage /> },
          { path: 'math-verdict-correct', element: <MathVerdictCorrectPage /> },
          { path: 'math-verdict-wrong', element: <MathVerdictWrongPage /> },
          { path: 'study-pick-3', element: <StudyPickThreePage /> },
          { path: 'report-scroll', element: <ReportScrollPage /> },
          { path: 'exam-select', element: <ExamSelectPage /> },
        ],
      },
    ],
  },
])
