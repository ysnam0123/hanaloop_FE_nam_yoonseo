# CarbonLoop 기술 면접 설명 가이드

이 문서는 CarbonLoop 프로젝트를 기술 면접에서 설명하기 위한 화면별, 기능별 코드 해설서입니다.

## 1. 전체 구조

CarbonLoop는 탄소 활동 데이터를 입력하고, 배출계수를 적용해 배출량을 계산한 뒤, 데이터 품질 검토와 경영진용 감축 인사이트까지 연결하는 탄소관리 플랫폼입니다.

주요 기술 스택은 다음과 같습니다.

- Next.js App Router: 화면과 API Route를 같은 프로젝트 안에서 관리
- React + TypeScript: 컴포넌트 기반 UI와 타입 안정성 확보
- TanStack React Query: 서버 데이터 캐싱, 로딩 상태, mutation 후 캐시 무효화
- Supabase: 활동 데이터, 배출계수, 사용자, 목표 데이터 저장
- Tailwind CSS: 화면 스타일링
- Recharts: 대시보드 차트 렌더링
- xlsx: Excel 업로드 파일 파싱

핵심 데이터 흐름은 다음과 같습니다.

1. 사용자가 화면에서 활동 데이터, 배출계수, 목표를 입력합니다.
2. 클라이언트는 `lib/api/*` 함수를 통해 Next.js API Route를 호출합니다.
3. API Route는 `lib/supabase.ts`의 Supabase client로 DB에 접근합니다.
4. React Query hook이 응답 데이터를 캐싱하고 화면에 전달합니다.
5. 대시보드/보고서/품질검토는 같은 활동 데이터를 서로 다른 관점으로 집계합니다.

## 2. 공통 레이아웃과 Provider

### 담당 코드

- `app/layout.tsx`
- `app/providers.tsx`
- `components/layout/AppShell.tsx`
- `components/layout/Header.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/Toast.tsx`
- `app/globals.css`

### 코드 설명

`app/layout.tsx`는 전체 앱의 최상위 레이아웃입니다. `Providers`, `ToastProvider`, `AppShell`을 감싸서 모든 화면에서 공통 상태와 UI를 사용할 수 있게 했습니다.

`app/providers.tsx`는 React Query의 `QueryClientProvider`와 직접 만든 `AuthProvider`를 제공합니다. QueryClient는 `staleTime`을 60초로 설정해 너무 잦은 재요청을 줄이고, `refetchOnWindowFocus`를 꺼서 화면 전환 중 불필요한 refetch를 줄였습니다.

`AppShell`은 좌측 사이드바, 본문 영역, 목표 설정 모달을 한 번에 관리합니다. 목표 설정 모달은 특정 페이지 내부가 아니라 앱 전체 레이아웃에 배치되어 어느 화면에서든 사이드바 버튼으로 열 수 있습니다.

`Header`는 화면 제목, 연도 선택, 로그인 상태를 표시합니다. 로그인 전에는 로그인 버튼을 보여주고, 로그인 후에는 사용자 이름/역할과 로그아웃 버튼을 보여줍니다.

`Sidebar`는 주요 메뉴를 제공합니다. `usePathname()`으로 현재 경로를 확인해 활성 메뉴를 표시하고, `useAuth()`로 로그인 사용자의 역할을 확인해 경영진에게만 `목표 설정` 버튼을 보여줍니다.

`globals.css`에는 클릭 가능한 요소의 `cursor: pointer` 전역 규칙과 비활성 요소의 `cursor: not-allowed` 규칙을 넣었습니다. 버튼마다 반복해서 클래스를 넣는 대신, 기본 UX 규칙을 전역에서 통일했습니다.

### 면접 답변 포인트

- 공통 레이아웃과 화면 기능을 분리해서 각 페이지가 비즈니스 로직에 집중하도록 만들었습니다.
- React Query Provider와 AuthProvider를 최상단에 배치해 모든 화면에서 데이터 캐시와 로그인 상태를 공유합니다.
- 경영진 전용 기능은 Sidebar에서 UI 노출을 제한하고, GoalSettingsModal 내부에서도 role을 다시 검사합니다.

## 3. 로그인과 권한 처리

### 담당 코드

- `components/auth/AuthProvider.tsx`
- `components/auth/LoginModal.tsx`
- `app/api/users/login/route.ts`
- `types/auth.ts`

### 코드 설명

현재 로그인은 데모용 로그인입니다. Supabase Auth를 붙인 구조는 아니고, `app_users` 테이블에 있는 `login_id`, `password`, `role`을 직접 조회합니다.

`LoginModal`은 아이디와 비밀번호를 입력받아 `/api/users/login`으로 POST 요청을 보냅니다. 성공하면 `AuthProvider`의 `login()`을 호출합니다.

`AuthProvider`는 로그인 사용자를 React Context에 저장하고, 동시에 `localStorage`에도 저장합니다. 새로고침 후에도 로그인 상태를 유지하기 위한 간단한 방식입니다.

`types/auth.ts`는 사용자 역할을 `executive`, `operator`로 제한합니다. 화면에서는 `ROLE_LABEL`을 사용해 각각 `경영진`, `실무진`으로 표시합니다.

### 면접 답변 포인트

- 지금은 데모 프로젝트라 실제 인증 시스템 대신 앱 내부 사용자 테이블로 역할 기반 UI를 구현했습니다.
- 실제 서비스로 확장한다면 Supabase Auth, 비밀번호 해시, RLS 정책을 추가해야 합니다.
- 권한은 UI 노출 제어와 저장 시 role 검사를 함께 두어 실수로 버튼이 노출돼도 저장 단계에서 한 번 더 막습니다.

## 4. 개요 대시보드

### 담당 코드

- `app/dashboard/page.tsx`
- `hooks/dashboard/useCalculations.ts`
- `app/api/calculations/route.ts`
- `components/dashboard/OverviewCards.tsx`
- `components/dashboard/MonthlyChart.tsx`
- `components/dashboard/DonutChart.tsx`
- `components/dashboard/ScopeLineChart.tsx`
- `components/dashboard/SiteEmissionPanel.tsx`
- `components/dashboard/GoalProgressCard.tsx`
- `components/dashboard/ReductionActionPlanner.tsx`
- `components/dashboard/ActionRequiredPanel.tsx`
- `lib/activityQuality.ts`

### 코드 설명

대시보드는 경영진이 전체 탄소 현황을 빠르게 판단하는 화면입니다.

`app/dashboard/page.tsx`는 선택된 연도 상태를 가지고 있고, 세 가지 데이터를 가져옵니다.

- `useCalculationsQuery(year)`: 총 배출량, 월별/유형별/Scope별/사업장별 집계
- `useGoalQuery(year)`: 해당 연도의 감축 목표
- `useActivitiesQuery({ year })`: 품질 검토에 사용할 원본 활동 데이터

`app/api/calculations/route.ts`는 Supabase `activities`를 조회해 배출량을 계산합니다. 배출량 공식은 `amount * factor_value_snapshot`입니다. `factor_value_snapshot`은 활동 입력 시점의 배출계수 값을 저장한 컬럼이라, 나중에 배출계수가 바뀌어도 과거 활동의 배출량이 흔들리지 않습니다.

계산 API는 한 번의 루프에서 여러 집계를 만듭니다.

- `totalEmission`: 연간 총 배출량
- `monthlyByType`: 월별 전기/원소재/운송 배출량
- `typeRatio`: 활동 유형별 비중
- `siteRatio`: 사업장별 비중
- `scopeMonthly`: Scope 1/2/3 월별 추이
- `insight`: 가장 배출량이 큰 `사업장 + 유형` 조합과 10% 감축 예상량

`ReductionActionPlanner`는 단순 차트에서 끝나지 않고, 현재 데이터 기준으로 실행 가능한 액션 카드까지 제안합니다. 예를 들어 `김포공장 원소재 사용량 10% 절감` 같은 형태로 표시합니다.

`ActionRequiredPanel`은 품질 검토 결과를 대시보드 우측에 요약합니다. 경영진도 보고서 발행 전 어떤 데이터 문제가 남아 있는지 볼 수 있습니다.

### 면접 답변 포인트

- 대시보드는 원본 데이터를 직접 화면에서 계산하지 않고, API Route에서 집계한 결과를 받아 렌더링합니다.
- 감축 인사이트는 단순히 유형별 비중만 보는 것이 아니라 `사업장 + 유형` 조합을 기준으로 액션 단위를 만들었습니다.
- 품질 검토 결과를 대시보드에도 노출해, 경영진 관점에서 데이터 신뢰도와 감축 우선순위를 함께 보도록 설계했습니다.

## 5. 데이터 허브

### 담당 코드

- `app/activities/page.tsx`
- `components/activities/table/ActivityTable.tsx`
- `components/activities/table/ActivityToolbar.tsx`
- `components/activities/activityModal/ActivityModal.tsx`
- `components/activities/activityModal/TypeSelector.tsx`
- `components/activities/activityModal/FactorSelector.tsx`
- `components/activities/activityModal/EmissionPreview.tsx`
- `components/activities/bottomStats/BottomStats.tsx`
- `components/activities/duplicateModal/DuplicateModal.tsx`
- `components/activities/deleteModal/DeleteModal.tsx`
- `hooks/activities/*`
- `app/api/activities/route.ts`
- `app/api/activities/[id]/route.ts`
- `app/api/activities/merge/route.ts`

### 코드 설명

데이터 허브는 실무자가 활동 데이터를 입력하고, 수정하고, 품질 문제를 처리하는 화면입니다.

`app/activities/page.tsx`는 화면의 중심 컨테이너입니다. 내부에서 다음 상태를 관리합니다.

- 선택 연도
- 월/사업장/유형/검색/상태 필터
- 목록 탭과 품질 검토 탭
- 신규 입력 모달, 수정 모달, 삭제 모달, 중복 처리 모달

활동 목록은 `useActivitiesQuery`로 가져옵니다. 서버 API는 `year`, `month`, `site`, `type` 필터를 받아 Supabase 쿼리에 적용합니다. 검색어와 품질 상태 필터는 클라이언트에서 한 번 더 필터링합니다.

`ActivityTable`은 활동 데이터를 표로 보여주고, 각 행의 상태를 `qualityStatusById`로 표시합니다. 상태는 `정상`, `중복`, `계수 불일치`, `계수 누락`, `이상치`, `필수값 누락`으로 구분됩니다.

`ActivityModal`은 신규 입력과 수정을 같은 컴포넌트로 처리합니다. `mode`가 `create`면 기본값을 세팅하고, `edit`이면 기존 데이터를 폼 상태로 복원합니다. 유형을 선택하면 `TYPE_UNIT` 기준으로 단위를 자동 결정하고, `FactorSelector`는 해당 단위와 호환되는 활성 배출계수만 보여줍니다.

저장 시에는 활동량이 0보다 큰지, 배출계수가 선택됐는지 검증합니다. 저장 요청은 `useSaveActivityMutation`을 거쳐 POST 또는 PUT API로 전달됩니다.

`app/api/activities/route.ts`의 POST는 선택된 배출계수의 현재 `factor_value`를 조회해 `factor_value_snapshot`에 저장합니다. 이 방식은 배출계수 버전이 나중에 바뀌어도 과거 활동 데이터 계산이 유지되도록 하기 위한 설계입니다.

`app/api/activities/[id]/route.ts`의 PUT은 수정 시 배출계수가 바뀐 경우에만 새 계수값을 다시 snapshot으로 저장합니다. 배출계수가 바뀌지 않으면 기존 snapshot을 유지합니다.

`app/api/activities/merge/route.ts`는 중복 데이터 처리용입니다. `delete` 액션은 선택 행을 삭제하고, `merge` 액션은 선택 행의 활동량을 합산한 뒤 첫 번째 행만 남깁니다.

### 면접 답변 포인트

- 데이터 허브는 실무자 워크플로우 중심이라 입력, 수정, Excel 업로드, 중복 처리, 품질 검토로 이어지도록 만들었습니다.
- 배출량은 DB 컬럼으로 저장하지 않고 API 응답에서 `amount * factor_value_snapshot`으로 계산합니다. derived value의 불일치 위험을 줄이기 위한 선택입니다.
- 배출계수는 현재 활성 계수를 선택하지만, 활동 데이터에는 snapshot을 저장해 과거 계산 기준을 보존합니다.

## 6. 데이터 품질 검토

### 담당 코드

- `lib/activityQuality.ts`
- `components/activities/quality/QualityReview.tsx`
- `components/dashboard/ActionRequiredPanel.tsx`
- `components/activities/table/ActivityTable.tsx`
- `components/activities/duplicateModal/DuplicateModal.tsx`

### 코드 설명

품질 검토는 활동 데이터를 보고서에 쓰기 전에 실무자가 확인해야 할 문제를 자동 분류하는 기능입니다.

`getActivityQuality()`는 활동 배열을 받아 `summary`, `issues`, `statusById`를 반환합니다.

판정 우선순위는 다음과 같습니다.

1. 필수값 누락
2. 계수 누락
3. 계수 불일치
4. 중복 행
5. 이상치 후보
6. 정상

필수값 누락은 날짜, 유형, 설명, 단위, 활동량 중 필수값이 없거나 활동량이 0 이하인 경우입니다.

계수 누락은 `factor_id`가 없거나 `factor_value_snapshot`이 없거나 0 이하인 경우입니다.

계수 불일치는 활동 유형/설명/단위와 연결된 배출계수 이름/단위가 맞지 않는 경우입니다. 예를 들어 `원소재` 데이터에 `운송(트럭)` 계수가 연결되면 불일치로 잡힙니다.

중복 행은 API에서 `date + site + type + description` 조합이 2건 이상인지 계산해 `is_duplicate`를 내려주고, 품질 검토에서는 이를 중복 상태로 분류합니다.

이상치 후보는 같은 활동 유형 평균 대비 활동량이 2.5배 이상 큰 경우입니다.

`QualityReview`는 카드 형태로 각 이슈 수를 보여주고, 카드 클릭 시 해당 상태로 목록 필터를 이동시킵니다. 개별 이슈의 `해결하기`는 중복이면 중복 모달을 열고, 나머지는 수정 모달을 엽니다.

### 면접 답변 포인트

- 품질 검토는 DB 컬럼으로 고정 저장하지 않고, 현재 필터 기준 활동 데이터에서 동적으로 계산합니다.
- 같은 행이 여러 문제를 가질 수 있어도 실무자가 처리할 우선순위가 필요하므로 명시적인 판정 순서를 두었습니다.
- 단순히 `factor_id` 존재 여부만 보는 것이 아니라 유형-계수 불일치까지 잡도록 확장했습니다.

## 7. Excel 업로드

### 담당 코드

- `components/activities/table/ActivityToolbar.tsx`
- `hooks/activities/useImportActivities.ts`
- `lib/api/activities.ts`
- `app/api/activities/import/route.ts`

### 코드 설명

Excel 업로드는 실무자가 대량 활동 데이터를 빠르게 넣기 위한 기능입니다.

`ActivityToolbar`의 파일 input은 숨겨져 있고, `Excel 업로드` 버튼을 누르면 input을 클릭합니다. 파일이 선택되면 `useImportActivitiesMutation`이 `/api/activities/import`로 `FormData`를 전송합니다.

`app/api/activities/import/route.ts`는 `request.formData()`로 파일을 받고, `xlsx` 라이브러리로 첫 번째 시트를 JSON 배열로 변환합니다.

고정 헤더는 다음을 사용합니다.

- `일자(원본)`
- `사업장`
- `활동 유형`
- `설명`
- `량`
- `단위`

배출계수 매칭은 현재 활성 계수 목록을 미리 가져온 뒤, 설명과 계수명을 공백 제거/소문자 변환 후 부분 문자열 비교로 수행합니다. 매칭 성공 시 활동 데이터를 insert하고, 실패 시 해당 행의 오류 정보를 `errors` 배열에 담아 반환합니다.

### 면접 답변 포인트

- Excel 파일은 JSON body가 아니라 `FormData`로 전송해야 하므로 API에서 `request.formData()`를 사용했습니다.
- 업로드 결과는 전체 실패가 아니라 행 단위 성공/실패로 나눠 반환해 실무자가 일부 데이터라도 반영할 수 있게 했습니다.
- 현재 매칭은 문자열 기반이라, 실서비스에서는 계수 후보 추천 UI나 수동 매핑 검토 단계가 추가되면 더 안정적입니다.

## 8. 배출계수 라이브러리

### 담당 코드

- `app/factors/page.tsx`
- `components/factors/FactorOverview.tsx`
- `components/factors/FactorCards.tsx`
- `components/factors/factorTable/FactorTable.tsx`
- `components/factors/factorModal/FactorModal.tsx`
- `components/factors/factorModal/NameSelector.tsx`
- `components/factors/factorModal/FactorFields.tsx`
- `components/factors/HistoryModal.tsx`
- `hooks/factors/*`
- `app/api/factors/route.ts`
- `app/api/factors/[id]/route.ts`
- `app/api/factors/[id]/activate/route.ts`
- `app/api/factors/[id]/deactivate/route.ts`
- `lib/factorInsights.ts`

### 코드 설명

배출계수 화면은 활동 데이터 계산의 기준이 되는 계수와 버전 이력을 관리합니다.

`app/factors/page.tsx`는 전체 계수 목록을 `useAllFactorsQuery()`로 가져옵니다. 활성 계수는 카드로 보여주고, 전체 이력은 테이블로 보여줍니다.

`FactorModal`은 기존 계수명에 새 버전을 추가하거나, 완전히 새로운 계수 항목을 등록할 수 있게 구성했습니다. 기존 항목을 선택하면 현재 활성 계수의 Scope와 단위를 자동으로 채워 사용자의 입력 오류를 줄입니다.

`FactorModal`의 `applyNow` 옵션은 새 계수를 저장하면서 바로 활성화할지 결정합니다. `/api/factors/route.ts`는 `is_active`가 true인 경우 같은 이름의 기존 활성 계수를 비활성화하고 새 계수를 insert합니다. 이로써 같은 계수명에 대해 현재 적용 계수가 하나만 유지되도록 했습니다.

`HistoryModal`은 같은 이름의 계수 이력을 보여주고, 과거 버전을 다시 활성화할 수 있습니다. 활성화 API는 선택한 계수와 같은 이름의 기존 활성 계수를 비활성화한 뒤 선택 계수를 활성화합니다.

`lib/factorInsights.ts`는 활성 계수 수, 검토 필요 항목, 활동 유형별 단위 커버리지, 중복 활성 계수 충돌 여부를 계산합니다.

### 면접 답변 포인트

- 배출계수는 버전 관리가 중요하기 때문에 overwrite하지 않고 새 row를 추가하는 방식으로 이력을 유지했습니다.
- 활동 데이터는 저장 시점의 계수값을 snapshot으로 저장하므로, 계수 버전이 바뀌어도 과거 배출량이 바뀌지 않습니다.
- 단위 호환성 검사를 통해 활동 유형에 맞는 계수만 선택되도록 UX 단계에서 실수를 줄였습니다.

## 9. 목표 설정 기능

### 담당 코드

- `components/goals/GoalSettingsModal.tsx`
- `hooks/goals/useGoal.ts`
- `lib/api/goals.ts`
- `app/api/goals/route.ts`
- `components/layout/Sidebar.tsx`
- `components/dashboard/GoalProgressCard.tsx`

### 코드 설명

목표 설정은 경영진 전용 기능입니다. Sidebar에서 로그인 사용자의 role이 `executive`일 때만 `목표 설정` 버튼을 보여줍니다.

`GoalSettingsModal`은 기준연도, 목표연도, 감축 목표율, 집중 관리 유형을 입력받습니다. 기준연도 배출량은 `useCalculationsQuery(baselineYear)`로 가져오고, 목표 배출량은 `baselineEmission * (1 - reductionRate / 100)`로 계산합니다.

저장 전 `user?.role !== 'executive'`이면 저장을 막습니다. 저장 요청은 `/api/goals`로 전달되고, `carbon_goals` 테이블에 저장됩니다.

대시보드의 `GoalProgressCard`는 현재 배출량과 목표 배출량을 비교해 진행률과 추가 감축 필요 여부를 보여줍니다.

### 면접 답변 포인트

- 목표 설정은 경영진 의사결정 기능이라 role 기반 UI 제어를 적용했습니다.
- 목표 배출량을 사용자가 직접 계산하지 않아도 되도록 기준 배출량과 감축률에서 자동 계산합니다.
- 목표는 대시보드와 보고서에서 재사용되므로 별도 테이블과 API로 분리했습니다.

## 10. 보고서 화면

### 담당 코드

- `app/reports/page.tsx`
- `lib/reportSummary.ts`
- `hooks/dashboard/useCalculations.ts`
- `hooks/activities/useActivities.ts`
- `hooks/goals/useGoal.ts`
- `lib/activityQuality.ts`

### 코드 설명

보고서 화면은 월간/연간 보고서를 미리보기 형태로 보여줍니다.

`ReportsPage`는 `reportType` 상태로 연간/월간을 전환합니다. 연간 보고서는 `useCalculationsQuery(year)`의 집계 데이터를 활용하고, 월간 보고서는 해당 월의 활동 데이터를 `getReportActivitySummary()`로 직접 요약합니다.

보고서에는 다음 정보가 포함됩니다.

- 총 배출량
- 전년 대비 또는 전월 대비 변화율
- 데이터 건수
- 품질 점수
- Executive Summary
- Scope별 배출량
- 활동별 배출량
- 사업장별 배출량
- 전략적 인사이트
- 데이터 품질 요약
- 보고 전 확인 문구

`getReportActivitySummary()`는 활동 데이터 배열을 받아 Scope별, 유형별, 사업장별 합계와 비중을 계산합니다.

현재 `CSV 다운로드`, `PDF 내보내기`, `보고서 인쇄`, `공유 링크 복사` 버튼은 UI placeholder입니다. 이후 실제 내보내기 기능을 연결할 수 있도록 화면 구조만 먼저 잡아둔 상태입니다.

### 면접 답변 포인트

- 보고서는 대시보드와 같은 데이터를 사용하지만, 의사결정 화면이 아니라 제출/공유 문서 형태로 재구성했습니다.
- 연간/월간 계산 방식이 달라서 연간은 계산 API 결과를, 월간은 필터링된 활동 데이터 요약을 사용합니다.
- 품질 점수를 보고서 안에 포함해, 데이터 문제가 남은 상태에서 보고서가 나가지 않도록 경고합니다.

## 11. API Route와 데이터 계층

### 담당 코드

- `lib/supabase.ts`
- `lib/api/activities.ts`
- `lib/api/calculations.ts`
- `lib/api/factors.ts`
- `lib/api/goals.ts`
- `app/api/*`

### 코드 설명

이 프로젝트는 클라이언트 컴포넌트가 Supabase에 직접 접근하지 않고, Next.js API Route를 거쳐 접근합니다.

클라이언트의 API 호출 함수는 `lib/api/*`에 모아두었습니다. 예를 들어 활동 저장은 `saveActivity()`, 계수 저장은 `saveFactor()`, 목표 저장은 `saveGoal()`처럼 기능 단위 함수로 분리했습니다.

React Query hook은 `hooks/*`에 있고, hook 내부에서 `lib/api/*` 함수를 호출합니다. mutation 성공 후에는 관련 캐시를 무효화합니다.

예를 들어 활동 데이터를 저장하면 다음 캐시를 무효화합니다.

- `activities`: 활동 목록 갱신
- `calculations`: 대시보드 집계 갱신

이렇게 해서 입력/수정/삭제 후 대시보드와 보고서가 오래된 데이터를 보여주지 않도록 했습니다.

### 면접 답변 포인트

- API 호출 함수, React Query hook, 화면 컴포넌트를 분리해 관심사를 나눴습니다.
- mutation 이후 관련 query를 invalidate해서 데이터 정합성을 유지했습니다.
- Supabase 접근을 API Route로 모아두면 추후 권한 검증, 로깅, 서버 검증을 한 곳에서 강화하기 쉽습니다.

## 12. Supabase 데이터 모델과 마이그레이션

### 담당 코드

- `supabase/migrations/202606070001_add_users_goals_and_activity_site.sql`
- `supabase/migrations/202606070002_add_demo_login_and_site_samples.sql`
- `supabase/migrations/202606070003_add_quality_review_sample_activities.sql`
- `types/activities.ts`
- `types/factor.ts`
- `types/goals.ts`
- `types/auth.ts`

### 코드 설명

주요 테이블은 다음 역할을 합니다.

- `activities`: 활동 데이터. 날짜, 사업장, 유형, 설명, 활동량, 단위, 연결 계수, 계수 snapshot을 저장합니다.
- `emission_factors`: 배출계수. 이름, Scope, 계수값, 단위, 버전, 적용 시작일, 활성 여부를 저장합니다.
- `app_users`: 데모 로그인 사용자와 역할을 저장합니다.
- `carbon_goals`: 기준연도/목표연도/감축률/목표 배출량을 저장합니다.

`202606070001`은 `activities.site`를 추가하고, 사용자/목표 테이블을 만듭니다.

`202606070002`는 데모 로그인 계정과 사업장 샘플 데이터를 추가합니다.

`202606070003`은 품질 검토 기능을 보여주기 위한 QA 샘플 데이터를 추가합니다. 중복 행, 계수 누락, 계수 불일치, 이상치, 필수값 누락을 모두 확인할 수 있습니다.

### 면접 답변 포인트

- 마이그레이션을 통해 DB 구조 변경과 데모 seed 데이터를 코드로 남겼습니다.
- 활동 데이터에 `site`를 추가해 사업장별 대시보드와 보고서 집계를 가능하게 했습니다.
- 품질 검토 샘플 데이터도 migration으로 관리해 시연 환경을 재현 가능하게 했습니다.

## 13. 타입 설계

### 담당 코드

- `types/activities.ts`
- `types/dashboard.ts`
- `types/factor.ts`
- `types/goals.ts`
- `types/auth.ts`

### 코드 설명

도메인별 타입을 `types` 폴더에 분리했습니다.

`Activity`는 DB 원본 필드와 API에서 계산한 `emission`, `is_duplicate`, join된 `emission_factors` 정보를 함께 표현합니다.

`DashboardData`는 계산 API의 응답 구조를 타입으로 고정합니다. 차트와 카드가 이 타입을 기준으로 데이터를 받아 렌더링합니다.

`Factor`는 배출계수 버전과 활성 여부를 표현합니다.

`CarbonGoal`은 목표 설정 결과를 표현합니다.

`AppUser`와 `UserRole`은 로그인 사용자와 권한 분기를 표현합니다.

### 면접 답변 포인트

- 화면과 API 사이의 데이터 계약을 타입으로 명시해 런타임 실수를 줄였습니다.
- 특히 대시보드 데이터는 여러 차트가 공유하기 때문에 `DashboardData`로 응답 구조를 고정했습니다.

## 14. 성능과 상태 관리

### 코드 설명

React Query를 사용한 이유는 서버 상태를 직접 `useEffect + useState`로 관리하면 로딩, 에러, 캐싱, refetch, mutation 후 갱신 로직이 흩어지기 때문입니다.

이 프로젝트에서는 다음 방식으로 상태를 나눴습니다.

- 서버 상태: React Query
- 로그인 사용자: Auth Context + localStorage
- 화면 내부 UI 상태: 각 page/component의 `useState`
- 파생 데이터: `useMemo`

예를 들어 품질 검토 결과는 DB에 따로 저장하지 않고, 활동 데이터가 바뀔 때 `useMemo(() => getActivityQuality(activities), [activities])`로 재계산합니다.

### 면접 답변 포인트

- 서버 상태와 UI 상태를 분리했습니다.
- mutation 성공 후 필요한 query만 invalidate해 화면 간 데이터 정합성을 맞췄습니다.
- 품질 검토 같은 파생 데이터는 저장하지 않고 원본 데이터에서 계산해 단일 진실원을 유지했습니다.

## 15. 현재 한계와 개선 방향

기술 면접에서 솔직히 말하면 좋은 한계입니다.

- 인증은 데모용입니다. 실제 서비스에서는 Supabase Auth, password hashing, RLS 정책이 필요합니다.
- Excel 배출계수 매칭은 문자열 유사도 중심입니다. 실무에서는 수동 매핑 확인 UI가 필요합니다.
- 보고서 내보내기 버튼은 현재 UI placeholder입니다. PDF/CSV 생성 API를 연결해야 합니다.
- 품질 검토는 현재 클라이언트 계산입니다. 데이터가 많아지면 서버 집계 또는 DB view로 옮길 수 있습니다.
- 감축 액션 플래너는 현재 제안형 카드입니다. 실제 액션 상태 관리 테이블을 만들면 담당자/승인/완료 추적까지 확장할 수 있습니다.

## 16. 면접용 요약 답변

### 프로젝트를 한 문장으로 설명한다면

CarbonLoop는 기업의 탄소 활동 데이터를 입력하고, 배출계수 버전 기준으로 배출량을 계산하며, 품질 검토와 경영진용 감축 인사이트, 보고서까지 연결하는 탄소관리 플랫폼입니다.

### 가장 중요한 기술적 설계는 무엇인가요?

활동 데이터에 배출량을 직접 저장하지 않고 `amount * factor_value_snapshot`으로 계산하도록 설계한 점입니다. 배출계수는 시간이 지나며 버전이 바뀔 수 있기 때문에, 활동 입력 당시의 계수값을 snapshot으로 저장해 과거 배출량의 기준을 보존했습니다.

### React Query를 왜 사용했나요?

활동 데이터, 배출계수, 목표, 대시보드 집계는 모두 서버 상태입니다. React Query를 사용하면 캐싱, 로딩, 에러, mutation 후 refetch를 일관되게 처리할 수 있습니다. 특히 활동 데이터를 수정하면 `activities`와 `calculations` query를 invalidate해서 데이터 허브와 대시보드가 함께 최신화되도록 했습니다.

### 품질 검토는 어떻게 동작하나요?

활동 데이터 배열을 `getActivityQuality()`에 넣으면 필수값 누락, 계수 누락, 계수 불일치, 중복 행, 이상치 후보를 순서대로 판정합니다. 결과는 요약 카드, 테이블 상태 배지, 보고서 품질 요약, 대시보드 조치 필요 패널에서 재사용됩니다.

### 경영진과 실무진 역할은 어떻게 나눴나요?

실무진은 데이터 입력과 품질 검토를 중심으로 사용하고, 경영진은 대시보드, 보고서, 목표 설정을 중심으로 사용합니다. 코드에서는 `AuthProvider`로 사용자 role을 저장하고, Sidebar에서 경영진에게만 목표 설정 버튼을 노출합니다. 저장 단계에서도 role을 확인해 한 번 더 막습니다.

### 가장 확장 가능성이 큰 기능은 무엇인가요?

감축 액션 플래너입니다. 현재는 가장 배출량이 큰 사업장+유형 조합을 찾아 10% 절감 시 예상 감축량을 제안합니다. 여기에 액션 테이블을 추가하면 담당자, 승인자, 상태, 완료일, 실제 감축량까지 관리할 수 있어 단순 대시보드를 실행 관리 플랫폼으로 확장할 수 있습니다.
