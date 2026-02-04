// Generated from: tests/features/home.feature
import { test } from "playwright-bdd";

test.describe('홈 화면', () => {

  test('홈 화면이 정상적으로 표시된다', async ({ Given, Then, And, page }) => { 
    await Given('사용자가 홈 화면에 접속한다', null, { page }); 
    await Then('"Vibe Analyst" 제목이 보인다', null, { page }); 
    await And('"전설적 투자자 6인의 관점으로 미국 주식을 분석합니다" 설명이 보인다', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/home.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":5,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given 사용자가 홈 화면에 접속한다","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then \"Vibe Analyst\" 제목이 보인다","stepMatchArguments":[{"group":{"start":0,"value":"\"Vibe Analyst\"","children":[{"start":1,"value":"Vibe Analyst","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And \"전설적 투자자 6인의 관점으로 미국 주식을 분석합니다\" 설명이 보인다","stepMatchArguments":[{"group":{"start":0,"value":"\"전설적 투자자 6인의 관점으로 미국 주식을 분석합니다\"","children":[{"start":1,"value":"전설적 투자자 6인의 관점으로 미국 주식을 분석합니다","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end