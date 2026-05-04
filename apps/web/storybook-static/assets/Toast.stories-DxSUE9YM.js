import{j as r}from"./jsx-runtime-DFAAy_2V.js";import{T as a,u as j}from"./Toast-CpwYUjI5.js";import"./index-Bc2G9s8g.js";const P={title:"shared/ui/Toast",tags:["autodocs"]};function t({tone:n,msg:f}){const{show:T}=j();return r.jsxs("button",{type:"button",onClick:()=>T(f,n),style:{padding:"10px 16px",borderRadius:6,background:"var(--brand)",color:"#fff",border:"none"},children:["Show ",n??"default"]})}const e={render:()=>r.jsx(a,{children:r.jsx(t,{msg:"저장되었습니다"})})},s={render:()=>r.jsx(a,{children:r.jsx(t,{tone:"success",msg:"신청이 완료되었습니다"})})},o={render:()=>r.jsx(a,{children:r.jsx(t,{tone:"danger",msg:"네트워크 오류가 발생했습니다"})})};var c,d,m;e.parameters={...e.parameters,docs:{...(c=e.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <ToastProvider>
      <Demo msg="저장되었습니다" />
    </ToastProvider>
}`,...(m=(d=e.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var u,i,p;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <ToastProvider>
      <Demo tone="success" msg="신청이 완료되었습니다" />
    </ToastProvider>
}`,...(p=(i=s.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};var g,l,x;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <ToastProvider>
      <Demo tone="danger" msg="네트워크 오류가 발생했습니다" />
    </ToastProvider>
}`,...(x=(l=o.parameters)==null?void 0:l.docs)==null?void 0:x.source}}};const b=["Default","Success","Danger"];export{o as Danger,e as Default,s as Success,b as __namedExportsOrder,P as default};
