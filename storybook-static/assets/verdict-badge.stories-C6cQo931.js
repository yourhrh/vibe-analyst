import{j as e}from"./jsx-runtime-u17CrQMm.js";import{c as l}from"./utils-fNskMoFt.js";const p={강력매수:"bg-[#e2b857]/15 text-[#b8922e] border-[#e2b857]/30",매수고려:"bg-[#4a9079]/10 text-[#3a7361] border-[#4a9079]/30",관망:"bg-[#8b8fa3]/10 text-[#6b6f82] border-[#8b8fa3]/30",매수부적합:"bg-[#c75a3a]/10 text-[#a84a2e] border-[#c75a3a]/30"},u={sm:"px-2 py-0.5 text-xs",md:"px-3 py-1 text-sm",lg:"px-4 py-1.5 text-base"};function r({verdict:n,size:o="md",className:m}){return e.jsx("span",{className:l("inline-flex items-center rounded-full border font-medium",p[n],u[o],m),children:n})}r.__docgenInfo={description:"",methods:[],displayName:"VerdictBadge",props:{verdict:{required:!0,tsType:{name:"union",raw:"'강력매수' | '매수고려' | '관망' | '매수부적합'",elements:[{name:"literal",value:"'강력매수'"},{name:"literal",value:"'매수고려'"},{name:"literal",value:"'관망'"},{name:"literal",value:"'매수부적합'"}]},description:""},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:"",defaultValue:{value:"'md'",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}}};const x={title:"Design System/VerdictBadge",component:r,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{verdict:{control:"select",options:["강력매수","매수고려","관망","매수부적합"]},size:{control:"select",options:["sm","md","lg"]}}},a={name:"강력매수 (Gold)",args:{verdict:"강력매수",size:"md"}},s={name:"매수고려 (Sage Green)",args:{verdict:"매수고려",size:"md"}},t={name:"관망 (Slate Gray)",args:{verdict:"관망",size:"md"}},d={name:"매수부적합 (Terracotta)",args:{verdict:"매수부적합",size:"md"}},c={name:"전체 판정 비교",render:()=>e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsx(r,{verdict:"강력매수"}),e.jsx(r,{verdict:"매수고려"}),e.jsx(r,{verdict:"관망"}),e.jsx(r,{verdict:"매수부적합"})]})},i={name:"크기 비교",render:()=>e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(r,{verdict:"강력매수",size:"sm"}),e.jsx(r,{verdict:"강력매수",size:"md"}),e.jsx(r,{verdict:"강력매수",size:"lg"})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: '강력매수 (Gold)',
  args: {
    verdict: '강력매수',
    size: 'md'
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: '매수고려 (Sage Green)',
  args: {
    verdict: '매수고려',
    size: 'md'
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: '관망 (Slate Gray)',
  args: {
    verdict: '관망',
    size: 'md'
  }
}`,...t.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: '매수부적합 (Terracotta)',
  args: {
    verdict: '매수부적합',
    size: 'md'
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: '전체 판정 비교',
  render: () => <div className="flex flex-wrap items-center gap-3">
      <VerdictBadge verdict="강력매수" />
      <VerdictBadge verdict="매수고려" />
      <VerdictBadge verdict="관망" />
      <VerdictBadge verdict="매수부적합" />
    </div>
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: '크기 비교',
  render: () => <div className="flex items-center gap-3">
      <VerdictBadge verdict="강력매수" size="sm" />
      <VerdictBadge verdict="강력매수" size="md" />
      <VerdictBadge verdict="강력매수" size="lg" />
    </div>
}`,...i.parameters?.docs?.source}}};const f=["StrongBuy","Buy","Hold","NotRecommended","AllVerdicts","SizeComparison"];export{c as AllVerdicts,s as Buy,t as Hold,d as NotRecommended,i as SizeComparison,a as StrongBuy,f as __namedExportsOrder,x as default};
