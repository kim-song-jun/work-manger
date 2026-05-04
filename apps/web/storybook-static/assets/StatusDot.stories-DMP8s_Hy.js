import{j as s}from"./jsx-runtime-DFAAy_2V.js";import{S as e}from"./StatusDot-Cm-aXYW4.js";import"./index-Bc2G9s8g.js";const I={title:"shared/ui/StatusDot",component:e,tags:["autodocs"],args:{status:"office",size:10},argTypes:{status:{control:"select",options:["office","wfh","leave","break","off"]},size:{control:{type:"number",min:6,max:24}},ring:{control:"boolean"}}},a={args:{status:"office"}},r={args:{status:"wfh"}},t={args:{status:"leave"}},o={args:{status:"break"}},n={args:{status:"off"}},c={render:()=>s.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[s.jsx(e,{status:"office"}),s.jsx(e,{status:"wfh"}),s.jsx(e,{status:"leave"}),s.jsx(e,{status:"break"}),s.jsx(e,{status:"off"})]})},u={args:{ring:!0,size:14}};var i,f,m;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    status: "office"
  }
}`,...(m=(f=a.parameters)==null?void 0:f.docs)==null?void 0:m.source}}};var p,d,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    status: "wfh"
  }
}`,...(l=(d=r.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};var g,S,x;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    status: "leave"
  }
}`,...(x=(S=t.parameters)==null?void 0:S.docs)==null?void 0:x.source}}};var h,v,j;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    status: "break"
  }
}`,...(j=(v=o.parameters)==null?void 0:v.docs)==null?void 0:j.source}}};var b,k,D;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    status: "off"
  }
}`,...(D=(k=n.parameters)==null?void 0:k.docs)==null?void 0:D.source}}};var y,w,O;c.parameters={...c.parameters,docs:{...(y=c.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: 12,
    alignItems: "center"
  }}>
      <StatusDot status="office" />
      <StatusDot status="wfh" />
      <StatusDot status="leave" />
      <StatusDot status="break" />
      <StatusDot status="off" />
    </div>
}`,...(O=(w=c.parameters)==null?void 0:w.docs)==null?void 0:O.source}}};var z,W,R;u.parameters={...u.parameters,docs:{...(z=u.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    ring: true,
    size: 14
  }
}`,...(R=(W=u.parameters)==null?void 0:W.docs)==null?void 0:R.source}}};const L=["Office","Wfh","Leave","Break","Off","All","WithRing"];export{c as All,o as Break,t as Leave,n as Off,a as Office,r as Wfh,u as WithRing,L as __namedExportsOrder,I as default};
