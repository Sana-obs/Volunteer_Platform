import{o as e}from"./Typography-jDwHmxA4.js";import{a as t,i as n}from"./Input-Do-Eknyl.js";var r=e();function i({label:e=``,name:i,register:a,registerOptions:o,placeholder:s=``,rows:c=5,fullWidth:l=!0,disabled:u=!1,error:d=``,required:f=!1,className:p=``,...m}){let h=a?a(i,o):{};return(0,r.jsxs)(`div`,{className:`flex flex-col gap-2 ${l?`w-full`:``}`,children:[e&&(0,r.jsxs)(`label`,{htmlFor:i,className:`mb-1 text-sm font-medium text-heading`,children:[e,f&&(0,r.jsx)(`span`,{className:`text-primary ml-1`,children:`*`})]}),(0,r.jsx)(`textarea`,{id:i,name:i,rows:c,placeholder:s,disabled:u,"aria-invalid":!!d,"aria-describedby":d?`${i}-error`:void 0,className:`
          px-4 py-3
          rounded-xl
          ${t}
          text-heading
          ${n}
          outline-none
          resize-none
          transition-all duration-200

          ${u?`opacity-50 cursor-not-allowed`:`cursor-text`}

          ${d?`border-danger focus:border-danger`:`focus:border-primary focus:ring-2 focus:ring-primary/20`}

          ${p}
        `,...h,...m}),d&&(0,r.jsx)(`p`,{id:`${i}-error`,className:`mt-1 text-xs text-danger`,children:d})]})}export{i as t};