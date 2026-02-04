import{j as r}from"./jsx-runtime-u17CrQMm.js";import{c as f}from"./utils-fNskMoFt.js";import{r as n}from"./index-CqIc3cxq.js";const j=(...s)=>s.filter((e,a,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===a).join(" ").trim();const y=s=>s.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();const C=s=>s.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,a,o)=>o?o.toUpperCase():a.toLowerCase());const h=s=>{const e=C(s);return e.charAt(0).toUpperCase()+e.slice(1)};var _={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};const $=s=>{for(const e in s)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};const E=n.forwardRef(({color:s="currentColor",size:e=24,strokeWidth:a=2,absoluteStrokeWidth:o,className:x="",children:l,iconNode:v,...b},P)=>n.createElement("svg",{ref:P,..._,width:e,height:e,stroke:s,strokeWidth:o?Number(a)*24/Number(e):a,className:j("lucide",x),...!l&&!$(b)&&{"aria-hidden":"true"},...b},[...v.map(([w,N])=>n.createElement(w,N)),...Array.isArray(l)?l:[l]]));const S=(s,e)=>{const a=n.forwardRef(({className:o,...x},l)=>n.createElement(E,{ref:l,iconNode:e,className:j(`lucide-${y(h(s))}`,`lucide-${s}`,o),...x}));return a.displayName=h(s),a};const k=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],A=S("check",k);const B=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],I=S("loader-circle",B);function t({label:s,status:e,description:a,className:o}){return r.jsxs("div",{className:f("flex items-start gap-3 rounded-lg border px-4 py-3 transition-all",e==="completed"&&"border-[#4a9079]/20 bg-[#4a9079]/5",e==="in_progress"&&"border-[#e2b857]/30 bg-[#e2b857]/5",e==="pending"&&"border-[#e5e3df] bg-white opacity-50",e==="error"&&"border-[#c75a3a]/20 bg-[#c75a3a]/5",o),children:[r.jsxs("div",{className:"mt-0.5 shrink-0",children:[e==="completed"&&r.jsx("div",{className:"flex h-5 w-5 items-center justify-center rounded-full bg-[#4a9079]",children:r.jsx(A,{className:"h-3 w-3 text-white",strokeWidth:3})}),e==="in_progress"&&r.jsx(I,{className:"h-5 w-5 animate-spin text-[#e2b857]"}),e==="pending"&&r.jsx("div",{className:"h-5 w-5 rounded-full border-2 border-[#e5e3df]"}),e==="error"&&r.jsx("div",{className:"flex h-5 w-5 items-center justify-center rounded-full bg-[#c75a3a]",children:r.jsx("span",{className:"text-xs font-bold text-white",children:"!"})})]}),r.jsxs("div",{className:"min-w-0 flex-1",children:[r.jsxs("p",{className:f("text-sm font-medium",e==="completed"&&"text-[#3a7361]",e==="in_progress"&&"text-[#1a1a2e]",e==="pending"&&"text-[#8b8fa3]",e==="error"&&"text-[#c75a3a]"),children:[s,e==="in_progress"&&"..."]}),a&&e==="completed"&&r.jsx("p",{className:"mt-0.5 text-xs text-[#8b8fa3]",children:a})]})]})}t.__docgenInfo={description:"",methods:[],displayName:"ProgressStep",props:{label:{required:!0,tsType:{name:"string"},description:""},status:{required:!0,tsType:{name:"union",raw:"'pending' | 'in_progress' | 'completed' | 'error'",elements:[{name:"literal",value:"'pending'"},{name:"literal",value:"'in_progress'"},{name:"literal",value:"'completed'"},{name:"literal",value:"'error'"}]},description:""},description:{required:!1,tsType:{name:"string"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const T={title:"Design System/ProgressStep",component:t,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{status:{control:"select",options:["pending","in_progress","completed","error"]}},decorators:[s=>r.jsx("div",{style:{width:400},children:r.jsx(s,{})})]},c={args:{label:"재무제표 수집 완료",status:"completed",description:"매출 $394B, 영업이익률 30.7%"}},i={args:{label:"리포트 작성 중",status:"in_progress"}},d={args:{label:"투자자 분석",status:"pending"}},p={args:{label:"데이터 수집 실패",status:"error"}},m={name:"분석 파이프라인 (IDEO Screen 3)",render:()=>r.jsxs("div",{className:"flex flex-col gap-2",children:[r.jsx(t,{label:"재무제표 수집 완료",status:"completed",description:"매출 $394B, 영업이익률 30.7%"}),r.jsx(t,{label:"뉴스 및 시장 데이터 수집 완료",status:"completed",description:"최근 30일 뉴스 12건"}),r.jsx(t,{label:"종합 리포트 작성 중",status:"in_progress"}),r.jsx(t,{label:"투자자 관점 분석",status:"pending"}),r.jsx(t,{label:"밸류에이션 계산",status:"pending"})]})},g={name:"전체 완료",render:()=>r.jsxs("div",{className:"flex flex-col gap-2",children:[r.jsx(t,{label:"재무제표 수집 완료",status:"completed",description:"매출 $394B, 영업이익률 30.7%"}),r.jsx(t,{label:"뉴스 수집 완료",status:"completed",description:"최근 30일 뉴스 12건"}),r.jsx(t,{label:"종합 리포트 작성 완료",status:"completed"}),r.jsx(t,{label:"투자자 분석 완료",status:"completed",description:"6명 투자자 의견 수렴"}),r.jsx(t,{label:"밸류에이션 계산 완료",status:"completed",description:"DCF $215, RIM $208"})]})},u={name:"에러 상태 포함",render:()=>r.jsxs("div",{className:"flex flex-col gap-2",children:[r.jsx(t,{label:"재무제표 수집 완료",status:"completed",description:"매출 $394B, 영업이익률 30.7%"}),r.jsx(t,{label:"뉴스 수집 실패",status:"error"}),r.jsx(t,{label:"종합 리포트 작성",status:"pending"})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: '재무제표 수집 완료',
    status: 'completed',
    description: '매출 $394B, 영업이익률 30.7%'
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    label: '리포트 작성 중',
    status: 'in_progress'
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: '투자자 분석',
    status: 'pending'
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: '데이터 수집 실패',
    status: 'error'
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: '분석 파이프라인 (IDEO Screen 3)',
  render: () => <div className="flex flex-col gap-2">
      <ProgressStep label="재무제표 수집 완료" status="completed" description="매출 $394B, 영업이익률 30.7%" />
      <ProgressStep label="뉴스 및 시장 데이터 수집 완료" status="completed" description="최근 30일 뉴스 12건" />
      <ProgressStep label="종합 리포트 작성 중" status="in_progress" />
      <ProgressStep label="투자자 관점 분석" status="pending" />
      <ProgressStep label="밸류에이션 계산" status="pending" />
    </div>
}`,...m.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: '전체 완료',
  render: () => <div className="flex flex-col gap-2">
      <ProgressStep label="재무제표 수집 완료" status="completed" description="매출 $394B, 영업이익률 30.7%" />
      <ProgressStep label="뉴스 수집 완료" status="completed" description="최근 30일 뉴스 12건" />
      <ProgressStep label="종합 리포트 작성 완료" status="completed" />
      <ProgressStep label="투자자 분석 완료" status="completed" description="6명 투자자 의견 수렴" />
      <ProgressStep label="밸류에이션 계산 완료" status="completed" description="DCF $215, RIM $208" />
    </div>
}`,...g.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: '에러 상태 포함',
  render: () => <div className="flex flex-col gap-2">
      <ProgressStep label="재무제표 수집 완료" status="completed" description="매출 $394B, 영업이익률 30.7%" />
      <ProgressStep label="뉴스 수집 실패" status="error" />
      <ProgressStep label="종합 리포트 작성" status="pending" />
    </div>
}`,...u.parameters?.docs?.source}}};const W=["Completed","InProgress","Pending","Error","AnalysisPipeline","AllCompleted","WithError"];export{g as AllCompleted,m as AnalysisPipeline,c as Completed,p as Error,i as InProgress,d as Pending,u as WithError,W as __namedExportsOrder,T as default};
