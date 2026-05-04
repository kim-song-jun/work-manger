import{j as r}from"./jsx-runtime-DFAAy_2V.js";import{r as w}from"./index-Bc2G9s8g.js";import{w as x,u as C,e as T}from"./index-BEIOxGzJ.js";import{S as s}from"./SegmentedControl-Bx-dS1va.js";const A={title:"shared/ui/SegmentedControl",component:s,tags:["autodocs"]};function f(){const[e,o]=w.useState("today");return r.jsx(s,{value:e,onChange:o,options:[{value:"today",label:"오늘"},{value:"week",label:"이번주"}]})}function b(){const[e,o]=w.useState("day");return r.jsx(s,{value:e,onChange:o,options:[{value:"day",label:"일"},{value:"week",label:"주"},{value:"month",label:"월"}]})}const a={render:()=>r.jsx(f,{})},n={render:()=>r.jsx(b,{})},t={render:()=>r.jsx(b,{}),play:async({canvasElement:e})=>{const c=x(e).getByRole("tab",{name:"월"});await C.click(c),await T(c).toHaveAttribute("aria-selected","true")}};var l,i,m;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <ControlledTwo />
}`,...(m=(i=a.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var d,u,p;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <ControlledThree />
}`,...(p=(u=n.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var g,h,v,y,S;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <ControlledThree />,
  play: async ({
    canvasElement
  }) => {
    const c = within(canvasElement);
    const month = c.getByRole("tab", {
      name: "월"
    });
    await userEvent.click(month);
    await expect(month).toHaveAttribute("aria-selected", "true");
  }
}`,...(v=(h=t.parameters)==null?void 0:h.docs)==null?void 0:v.source},description:{story:"Interaction test: clicking the second segment selects it.\nStorybook 8 `play` runs in-browser via @storybook/test.",...(S=(y=t.parameters)==null?void 0:y.docs)==null?void 0:S.description}}};const B=["TwoSegments","ThreeSegments","PlaySelect"];export{t as PlaySelect,n as ThreeSegments,a as TwoSegments,B as __namedExportsOrder,A as default};
