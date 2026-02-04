Feature: 홈 화면

  사용자가 Vibe Analyst에 처음 접속했을 때 보이는 화면

  Scenario: 홈 화면이 정상적으로 표시된다
    Given 사용자가 홈 화면에 접속한다
    Then "Vibe Analyst" 제목이 보인다
    And "전설적 투자자 6인의 관점으로 미국 주식을 분석합니다" 설명이 보인다
