import{j as e}from"./jsx-runtime-u17CrQMm.js";import{F as a}from"./financial-number-Vs9yldyA.js";import"./utils-fNskMoFt.js";const p={title:"Design System/FinancialNumber",component:a,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{format:{control:"select",options:["currency","percent","ratio","plain"]},size:{control:"select",options:["sm","md","lg"]}}},s={args:{value:394e9,format:"currency",size:"lg"}},r={args:{value:394e9,format:"currency",change:8.2,size:"lg"}},n={args:{value:394e9,format:"currency",change:-3.1,size:"lg"}},c={args:{value:30.7,format:"percent",change:2.4}},t={args:{value:28.5,format:"ratio"}},i={args:{value:15e5,format:"plain",change:-1.2}},l={render:()=>e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"flex items-baseline gap-4",children:[e.jsx("span",{className:"w-12 text-xs text-[#8b8fa3]",children:"sm"}),e.jsx(a,{value:394e9,format:"currency",change:8.2,size:"sm"})]}),e.jsxs("div",{className:"flex items-baseline gap-4",children:[e.jsx("span",{className:"w-12 text-xs text-[#8b8fa3]",children:"md"}),e.jsx(a,{value:394e9,format:"currency",change:8.2,size:"md"})]}),e.jsxs("div",{className:"flex items-baseline gap-4",children:[e.jsx("span",{className:"w-12 text-xs text-[#8b8fa3]",children:"lg"}),e.jsx(a,{value:394e9,format:"currency",change:8.2,size:"lg"})]})]})},o={render:()=>e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsxs("div",{className:"flex items-baseline gap-4",children:[e.jsx("span",{className:"w-24 text-xs text-[#8b8fa3]",children:"Trillions"}),e.jsx(a,{value:25e11,format:"currency",size:"lg"})]}),e.jsxs("div",{className:"flex items-baseline gap-4",children:[e.jsx("span",{className:"w-24 text-xs text-[#8b8fa3]",children:"Billions"}),e.jsx(a,{value:394e9,format:"currency",size:"lg"})]}),e.jsxs("div",{className:"flex items-baseline gap-4",children:[e.jsx("span",{className:"w-24 text-xs text-[#8b8fa3]",children:"Millions"}),e.jsx(a,{value:125e5,format:"currency",size:"lg"})]}),e.jsxs("div",{className:"flex items-baseline gap-4",children:[e.jsx("span",{className:"w-24 text-xs text-[#8b8fa3]",children:"Thousands"}),e.jsx(a,{value:8500,format:"currency",size:"lg"})]})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: 394_000_000_000,
    format: 'currency',
    size: 'lg'
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: 394_000_000_000,
    format: 'currency',
    change: 8.2,
    size: 'lg'
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    value: 394_000_000_000,
    format: 'currency',
    change: -3.1,
    size: 'lg'
  }
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: 30.7,
    format: 'percent',
    change: 2.4
  }
}`,...c.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    value: 28.5,
    format: 'ratio'
  }
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    value: 1_500_000,
    format: 'plain',
    change: -1.2
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-4">
        <span className="w-12 text-xs text-[#8b8fa3]">sm</span>
        <FinancialNumber value={394_000_000_000} format="currency" change={8.2} size="sm" />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-12 text-xs text-[#8b8fa3]">md</span>
        <FinancialNumber value={394_000_000_000} format="currency" change={8.2} size="md" />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-12 text-xs text-[#8b8fa3]">lg</span>
        <FinancialNumber value={394_000_000_000} format="currency" change={8.2} size="lg" />
      </div>
    </div>
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-xs text-[#8b8fa3]">Trillions</span>
        <FinancialNumber value={2_500_000_000_000} format="currency" size="lg" />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-xs text-[#8b8fa3]">Billions</span>
        <FinancialNumber value={394_000_000_000} format="currency" size="lg" />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-xs text-[#8b8fa3]">Millions</span>
        <FinancialNumber value={12_500_000} format="currency" size="lg" />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="w-24 text-xs text-[#8b8fa3]">Thousands</span>
        <FinancialNumber value={8_500} format="currency" size="lg" />
      </div>
    </div>
}`,...o.parameters?.docs?.source}}};const d=["Currency","CurrencyWithPositiveChange","CurrencyWithNegativeChange","Percent","Ratio","Plain","SizeComparison","Abbreviations"];export{o as Abbreviations,s as Currency,n as CurrencyWithNegativeChange,r as CurrencyWithPositiveChange,c as Percent,i as Plain,t as Ratio,l as SizeComparison,d as __namedExportsOrder,p as default};
