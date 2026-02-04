// Generated from: tests/features/analyze.feature
import { test } from "playwright-bdd";

test.describe('분석 페이지', () => {

  test('분석 페이지 스켈레톤이 표시된다', async ({ Given, Then, And, page }) => { 
    await Given('사용자가 "AAPL" 분석 페이지에 접속한다', null, { page }); 
    await Then('"AAPL" 티커가 대문자로 표시된다', null, { page }); 
    await And('"분석 페이지 준비 중" 안내가 보인다', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/analyze.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":5,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given 사용자가 \"AAPL\" 분석 페이지에 접속한다","stepMatchArguments":[{"group":{"start":5,"value":"\"AAPL\"","children":[{"start":6,"value":"AAPL","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then \"AAPL\" 티커가 대문자로 표시된다","stepMatchArguments":[{"group":{"start":0,"value":"\"AAPL\"","children":[{"start":1,"value":"AAPL","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And \"분석 페이지 준비 중\" 안내가 보인다","stepMatchArguments":[{"group":{"start":0,"value":"\"분석 페이지 준비 중\"","children":[{"start":1,"value":"분석 페이지 준비 중","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end