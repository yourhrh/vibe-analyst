# C4 Architecture Diagrams

## 구조

```
c4/
├── blueprint/                     ← 목표 아키텍처 (청사진)
│   ├── context-diagram.md         시스템 전체 맥락 + 외부 시스템
│   ├── container-diagram.md       src/ 폴더 구조 + 역할
│   └── component-diagram.md       파일 단위 구성 + 수정 가이드
│
├── current/                       ← 현재 구현 상태 (동일 C4 구조)
│   ├── context-diagram.md         외부 시스템 연결 현황
│   ├── container-diagram.md       폴더별 🟢🟡🔴 구현 현황
│   ├── component-diagram.md       파일 단위 구현 현황 + 타입/Props 상세
│   └── code/                      ← Code 레벨 (모듈별 상세)
│       ├── types.md               types/ 4개 파일 인터페이스 전체
│       ├── infra.md               infra/ 4개 Port 인터페이스
│       ├── design-system.md       tokens + fonts 설정
│       ├── app.md                 layout, pages, globals.css
│       └── components-ui.md       shadcn 18개 + IDEO 커스텀 6개
│
├── context-diagram.md             → 리다이렉트
├── container-diagram.md           → 리다이렉트
└── component-diagram.md           → 리다이렉트
```

## 사용법

| 질문 | 문서 |
|------|------|
| "최종적으로 뭘 만들어야 하지?" | `blueprint/` |
| "지금 뭐가 되어 있지?" | `current/` |

## 문서 업데이트 규칙

코드 변경 시 `current/` 문서도 함께 업데이트:
- Container 추가/완료 → `current/container-diagram.md`
- 파일 추가/완료 → `current/component-diagram.md`
- 코드 상세 변경 → `current/code/{모듈}.md`
