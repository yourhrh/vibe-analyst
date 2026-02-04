import{j as e}from"./jsx-runtime-u17CrQMm.js";import{c as p}from"./utils-fNskMoFt.js";import{F as g}from"./financial-number-Vs9yldyA.js";function a({label:r,value:i,format:m="currency",change:u,subtitle:o,className:d}){return e.jsxs("div",{className:p("rounded-lg border border-[#e5e3df] bg-white px-4 py-3",d),children:[e.jsx("p",{className:"text-xs font-medium text-[#8b8fa3]",children:r}),e.jsx("div",{className:"mt-1",children:e.jsx(g,{value:i,format:m,change:u,size:"lg"})}),o&&e.jsx("p",{className:"mt-1 text-xs text-[#8b8fa3]",children:o})]})}a.__docgenInfo={description:"",methods:[],displayName:"StatCard",props:{label:{required:!0,tsType:{name:"string"},description:""},value:{required:!0,tsType:{name:"number"},description:""},format:{required:!1,tsType:{name:"union",raw:"'currency' | 'percent' | 'ratio' | 'plain'",elements:[{name:"literal",value:"'currency'"},{name:"literal",value:"'percent'"},{name:"literal",value:"'ratio'"},{name:"literal",value:"'plain'"}]},description:"",defaultValue:{value:"'currency'",computed:!1}},change:{required:!1,tsType:{name:"number"},description:""},subtitle:{required:!1,tsType:{name:"string"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const b={title:"Design System/StatCard",component:a,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{format:{control:"select",options:["currency","percent","ratio","plain"]}},decorators:[r=>e.jsx("div",{style:{width:200},children:e.jsx(r,{})})]},t={name:"매출",args:{label:"매출",value:394e9,format:"currency",change:8.2}},n={name:"영업이익률",args:{label:"영업이익률",value:30.7,format:"percent",change:2.4}},s={name:"PER",args:{label:"PER",value:28.5,format:"ratio",subtitle:"업종 평균 32.1x"}},c={name:"하락 수치",args:{label:"순이익",value:94e9,format:"currency",change:-3.1}},l={name:"재무 하이라이트 그리드 (IDEO Screen 4)",decorators:[r=>e.jsx("div",{style:{width:600},children:e.jsx(r,{})})],render:()=>e.jsxs("div",{className:"grid grid-cols-3 gap-3",children:[e.jsx(a,{label:"매출",value:394e9,format:"currency",change:8.2}),e.jsx(a,{label:"영업이익률",value:30.7,format:"percent",change:2.4}),e.jsx(a,{label:"순이익",value:94e9,format:"currency",change:-3.1}),e.jsx(a,{label:"PER",value:28.5,format:"ratio",subtitle:"업종 평균 32.1x"}),e.jsx(a,{label:"ROE",value:175.5,format:"percent",change:12.3}),e.jsx(a,{label:"부채비율",value:176.3,format:"percent",change:-5.2})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: '매출',
  args: {
    label: '매출',
    value: 394_000_000_000,
    format: 'currency',
    change: 8.2
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: '영업이익률',
  args: {
    label: '영업이익률',
    value: 30.7,
    format: 'percent',
    change: 2.4
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'PER',
  args: {
    label: 'PER',
    value: 28.5,
    format: 'ratio',
    subtitle: '업종 평균 32.1x'
  }
}`,...s.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: '하락 수치',
  args: {
    label: '순이익',
    value: 94_000_000_000,
    format: 'currency',
    change: -3.1
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: '재무 하이라이트 그리드 (IDEO Screen 4)',
  decorators: [Story => <div style={{
    width: 600
  }}>
        <Story />
      </div>],
  render: () => <div className="grid grid-cols-3 gap-3">
      <StatCard label="매출" value={394_000_000_000} format="currency" change={8.2} />
      <StatCard label="영업이익률" value={30.7} format="percent" change={2.4} />
      <StatCard label="순이익" value={94_000_000_000} format="currency" change={-3.1} />
      <StatCard label="PER" value={28.5} format="ratio" subtitle="업종 평균 32.1x" />
      <StatCard label="ROE" value={175.5} format="percent" change={12.3} />
      <StatCard label="부채비율" value={176.3} format="percent" change={-5.2} />
    </div>
}`,...l.parameters?.docs?.source}}};const x=["Revenue","OperatingMargin","PERatio","NegativeChange","FinancialHighlights"];export{l as FinancialHighlights,c as NegativeChange,n as OperatingMargin,s as PERatio,t as Revenue,x as __namedExportsOrder,b as default};
