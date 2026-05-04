import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{w as E,e as S,u as T}from"./index-BEIOxGzJ.js";import{N as K}from"./index-D64y-501.js";import{I as N}from"./Icon-CFQYxru2.js";import{u as R}from"./useTranslation-D8Le7MfU.js";import{M as W}from"./index-DRMefcSP.js";import"./index-Bc2G9s8g.js";import"./index-Dy83Z4lh.js";import"./i18nInstance-DBIXdvxg.js";const I=[{key:"home",to:"/m/home",icon:"home",labelKey:"nav.home"},{key:"team",to:"/m/team",icon:"team",labelKey:"nav.team"},{key:"leave",to:"/m/leave",icon:"calendar",labelKey:"nav.leave"},{key:"my",to:"/m/my",icon:"user",labelKey:"nav.my"}];function M({badges:r={}}){const{t:l}=R();return e.jsx("nav",{className:"flex justify-around",style:{height:64,padding:"6px 10px 14px",borderTop:"1px solid var(--grey-200)",background:"var(--white)",flexShrink:0},children:I.map(a=>{const B=N[a.icon],c=r[a.key];return e.jsx(K,{to:a.to,"aria-label":l(a.labelKey),className:"flex flex-1 flex-col items-center justify-center gap-[3px] relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm",style:({isActive:t})=>({color:t?"var(--brand)":"var(--grey-400)",fontSize:11,fontWeight:500,textDecoration:"none",transition:"color var(--motion-fast) var(--ease-standard)"}),children:({isActive:t})=>e.jsxs(e.Fragment,{children:[e.jsx(B,{width:22,height:22,"aria-hidden":!0}),e.jsx("span",{"aria-current":t?"page":void 0,style:{color:t?"var(--grey-900)":"var(--grey-400)",fontWeight:t?600:500},children:l(a.labelKey)}),c?e.jsx("span",{className:"absolute",style:{top:4,right:"28%",background:"var(--danger)",color:"#fff",fontSize:10,fontWeight:700,minWidth:16,height:16,padding:"0 4px",borderRadius:999,display:"inline-flex",alignItems:"center",justifyContent:"center"},children:c}):null]})},a.key)})})}const q={title:"shared/ui/TabBar",component:M,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[r=>e.jsx(W,{initialEntries:["/m/home"],children:e.jsx("div",{style:{width:380,background:"var(--white)"},children:e.jsx(r,{})})})]},o={},s={args:{badges:{leave:3}}},i={args:{badges:{team:1,leave:2,my:9}}},n={play:async({canvasElement:r})=>{const a=E(r).getAllByRole("link");await S(a.length).toBe(4),await T.click(a[1])}};var m,d,u;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:"{}",...(u=(d=o.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var p,g,y;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    badges: {
      leave: 3
    }
  }
}`,...(y=(g=s.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var h,v,f;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    badges: {
      team: 1,
      leave: 2,
      my: 9
    }
  }
}`,...(f=(v=i.parameters)==null?void 0:v.docs)==null?void 0:f.source}}};var x,b,k,j,w;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    const links = c.getAllByRole("link");
    await expect(links.length).toBe(4);
    await userEvent.click(links[1]);
  }
}`,...(k=(b=n.parameters)==null?void 0:b.docs)==null?void 0:k.source},description:{story:"Interaction: clicking a tab should be routable. Even though our story uses\nMemoryRouter (no real navigation), `userEvent.click` should still complete\nwithout throwing, proving NavLink wires up correctly.",...(w=(j=n.parameters)==null?void 0:j.docs)==null?void 0:w.description}}};const G=["Default","WithBadge","MultiBadge","PlayClickTab"];export{o as Default,i as MultiBadge,n as PlayClickTab,s as WithBadge,G as __namedExportsOrder,q as default};
