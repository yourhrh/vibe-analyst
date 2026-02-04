import{j as e}from"./jsx-runtime-u17CrQMm.js";import{c as p}from"./utils-fNskMoFt.js";function y({low:s,base:m,high:n,current:r,safetyMargin:g,className:w}){const h=Math.min(s,r)*.95,v=Math.max(n,r)*1.05-h,a=j=>(j-h)/v*100,b=a(r),u=a(s),f=a(n),x=r>n;return e.jsxs("div",{className:p("space-y-2",w),children:[e.jsxs("div",{className:"relative h-3 w-full rounded-full bg-[#f5f3ef]",children:[e.jsx("div",{className:"absolute top-0 h-full rounded-full bg-[#e2b857]/25",style:{left:`${u}%`,width:`${f-u}%`}}),e.jsx("div",{className:"absolute top-0 h-full w-0.5 bg-[#e2b857]",style:{left:`${a(m)}%`}}),g!==void 0&&e.jsx("div",{className:"absolute top-0 h-full w-0.5 bg-[#8b8fa3]/50",style:{left:`${a(g)}%`}}),e.jsx("div",{className:p("absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md",x?"bg-[#c75a3a]":"bg-[#e2b857]"),style:{left:`${b}%`}})]}),e.jsxs("div",{className:"relative h-5 text-xs",children:[e.jsxs("span",{className:"absolute -translate-x-1/2 font-mono text-[#8b8fa3]",style:{left:`${u}%`},children:["$",s]}),e.jsxs("span",{className:"absolute -translate-x-1/2 font-mono font-semibold text-[#1a1a2e]",style:{left:`${a(m)}%`},children:["$",m]}),e.jsxs("span",{className:"absolute -translate-x-1/2 font-mono text-[#8b8fa3]",style:{left:`${f}%`},children:["$",n]})]}),e.jsx("div",{className:"relative h-4",children:e.jsxs("span",{className:p("absolute -translate-x-1/2 text-xs font-medium",x?"text-[#c75a3a]":"text-[#e2b857]"),style:{left:`${b}%`},children:["▲ 현재 $",r]})})]})}y.__docgenInfo={description:"",methods:[],displayName:"RangeBar",props:{low:{required:!0,tsType:{name:"number"},description:""},base:{required:!0,tsType:{name:"number"},description:""},high:{required:!0,tsType:{name:"number"},description:""},current:{required:!0,tsType:{name:"number"},description:""},safetyMargin:{required:!1,tsType:{name:"number"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const S={title:"Design System/RangeBar",component:y,parameters:{layout:"centered"},tags:["autodocs"],decorators:[s=>e.jsx("div",{style:{width:480},children:e.jsx(s,{})})]},t={name:"적정가 범위 내 (Gold)",args:{low:189,base:215,high:235,current:228}},o={name:"고평가 (Terracotta)",args:{low:189,base:215,high:235,current:258}},c={name:"저평가",args:{low:189,base:215,high:235,current:175}},l={name:"안전마진 포함",args:{low:189,base:215,high:235,current:205,safetyMargin:193}},i={name:"좁은 범위 (확신 높음)",args:{low:210,base:215,high:220,current:218}},d={name:"넓은 범위 (불확실성 높음)",args:{low:150,base:215,high:310,current:228}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: '적정가 범위 내 (Gold)',
  args: {
    low: 189,
    base: 215,
    high: 235,
    current: 228
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: '고평가 (Terracotta)',
  args: {
    low: 189,
    base: 215,
    high: 235,
    current: 258
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: '저평가',
  args: {
    low: 189,
    base: 215,
    high: 235,
    current: 175
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: '안전마진 포함',
  args: {
    low: 189,
    base: 215,
    high: 235,
    current: 205,
    safetyMargin: 193
  }
}`,...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: '좁은 범위 (확신 높음)',
  args: {
    low: 210,
    base: 215,
    high: 220,
    current: 218
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: '넓은 범위 (불확실성 높음)',
  args: {
    low: 150,
    base: 215,
    high: 310,
    current: 228
  }
}`,...d.parameters?.docs?.source}}};const T=["WithinRange","Overvalued","Undervalued","WithSafetyMargin","NarrowRange","WideRange"];export{i as NarrowRange,o as Overvalued,c as Undervalued,d as WideRange,l as WithSafetyMargin,t as WithinRange,T as __namedExportsOrder,S as default};
