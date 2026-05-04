import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{I as s}from"./Icon-CFQYxru2.js";import"./index-Bc2G9s8g.js";const u=Object.keys(s),I={title:"shared/ui/Icon",tags:["autodocs"],parameters:{layout:"padded"}},r={render:()=>e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gap:16,textAlign:"center",color:"var(--grey-700)"},children:u.map(a=>{const y=s[a];return e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:4},children:[e.jsx(y,{width:28,height:28}),e.jsx("span",{style:{fontSize:11,color:"var(--grey-500)"},children:a})]},a)})})},n={render:()=>e.jsx(s.home,{width:32,height:32})},t={render:()=>e.jsx("div",{style:{color:"var(--brand)"},children:e.jsx(s.check,{width:48,height:48})})};var o,c,i;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: 16,
    textAlign: "center",
    color: "var(--grey-700)"
  }}>
      {names.map(n => {
      const Ic = Icon[n];
      return <div key={n} style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4
      }}>
            <Ic width={28} height={28} />
            <span style={{
          fontSize: 11,
          color: "var(--grey-500)"
        }}>{n}</span>
          </div>;
    })}
    </div>
}`,...(i=(c=r.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};var d,l,p;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <Icon.home width={32} height={32} />
}`,...(p=(l=n.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};var m,g,h;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div style={{
    color: "var(--brand)"
  }}>
      <Icon.check width={48} height={48} />
    </div>
}`,...(h=(g=t.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};const j=["Gallery","Single","Brand"];export{t as Brand,r as Gallery,n as Single,j as __namedExportsOrder,I as default};
