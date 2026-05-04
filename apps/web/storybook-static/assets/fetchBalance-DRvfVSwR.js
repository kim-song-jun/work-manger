import{a as t,H as r}from"./client-DvqTn1SX.js";async function e(){try{return(await t("/v1/leave/balance")).data}catch(a){if(a instanceof r&&a.status===404)return null;throw a}}export{e as f};
