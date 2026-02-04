import{j as e}from"./jsx-runtime-u17CrQMm.js";import{c as s}from"./utils-fNskMoFt.js";function r({label:m,score:d,maxScore:u=5,size:i="md",className:p}){const x=d/u*100;return e.jsxs("div",{className:s("flex items-center gap-3",p),children:[e.jsx("span",{className:s("shrink-0 text-[#1a1a2e]",i==="sm"?"w-24 text-xs":"w-32 text-sm"),children:m}),e.jsx("div",{className:"flex-1",children:e.jsx("div",{className:s("w-full rounded-full bg-[#f5f3ef]",i==="sm"?"h-1.5":"h-2"),children:e.jsx("div",{className:"h-full rounded-full bg-[#e2b857] transition-all duration-500",style:{width:`${x}%`}})})}),e.jsxs("span",{className:s("shrink-0 font-mono text-[#8b8fa3]",i==="sm"?"text-xs":"text-sm"),children:[d,"/",u]})]})}r.__docgenInfo={description:"",methods:[],displayName:"ScoreBar",props:{label:{required:!0,tsType:{name:"string"},description:""},score:{required:!0,tsType:{name:"number"},description:""},maxScore:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"5",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"}]},description:"",defaultValue:{value:"'md'",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}}};const g={title:"Design System/ScoreBar",component:r,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md"]}},decorators:[m=>e.jsx("div",{style:{width:420},children:e.jsx(m,{})})]},a={args:{label:"경제적 해자",score:4,maxScore:5}},o={args:{label:"수익성",score:5,maxScore:5}},c={args:{label:"부채 건전성",score:2,maxScore:5}},l={args:{label:"성장성",score:3,maxScore:5,size:"sm"}},t={name:"버핏 분석 기준 (전체)",render:()=>e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx(r,{label:"경제적 해자",score:4}),e.jsx(r,{label:"경영진 역량",score:5}),e.jsx(r,{label:"재무 건전성",score:4}),e.jsx(r,{label:"수익 안정성",score:3}),e.jsx(r,{label:"적정 가격",score:2})]})},n={args:{label:"종합 점수",score:78,maxScore:100}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    label: '경제적 해자',
    score: 4,
    maxScore: 5
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    label: '수익성',
    score: 5,
    maxScore: 5
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: '부채 건전성',
    score: 2,
    maxScore: 5
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: '성장성',
    score: 3,
    maxScore: 5,
    size: 'sm'
  }
}`,...l.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: '버핏 분석 기준 (전체)',
  render: () => <div className="flex flex-col gap-3">
      <ScoreBar label="경제적 해자" score={4} />
      <ScoreBar label="경영진 역량" score={5} />
      <ScoreBar label="재무 건전성" score={4} />
      <ScoreBar label="수익 안정성" score={3} />
      <ScoreBar label="적정 가격" score={2} />
    </div>
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    label: '종합 점수',
    score: 78,
    maxScore: 100
  }
}`,...n.parameters?.docs?.source}}};const b=["Default","HighScore","LowScore","SmallSize","BuffettCriteria","CustomMax"];export{t as BuffettCriteria,n as CustomMax,a as Default,o as HighScore,c as LowScore,l as SmallSize,b as __namedExportsOrder,g as default};
