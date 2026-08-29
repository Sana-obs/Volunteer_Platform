var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},s=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),c=(e,n)=>{let r={};for(var i in e)t(r,i,{get:e[i],enumerable:!0});return n||t(r,Symbol.toStringTag,{value:`Module`}),r},l=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},u=(n,r,a)=>(a=n==null?{}:e(i(n)),l(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n)),d=e=>a.call(e,`module.exports`)?e[`module.exports`]:l(t({},`__esModule`,{value:!0}),e),f=s((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.iterator;function m(e){return typeof e!=`object`||!e?null:(e=p&&e[p]||e[`@@iterator`],typeof e==`function`?e:null)}var h={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g=Object.assign,_={};function v(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}v.prototype.isReactComponent={},v.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function y(){}y.prototype=v.prototype;function b(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}var x=b.prototype=new y;x.constructor=b,g(x,v.prototype),x.isPureReactComponent=!0;var S=Array.isArray;function C(){}var w={H:null,A:null,T:null,S:null},T=Object.prototype.hasOwnProperty;function E(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function D(e,t){return E(e.type,t,e.props)}function O(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function k(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var A=/\/+/g;function j(e,t){return typeof e==`object`&&e&&e.key!=null?k(``+e.key):t.toString(36)}function M(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(C,C):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function N(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,N(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+j(e,0):a,S(o)?(i=``,c!=null&&(i=c.replace(A,`$&/`)+`/`),N(o,r,i,``,function(e){return e})):o!=null&&(O(o)&&(o=D(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(A,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(S(e))for(var u=0;u<e.length;u++)a=e[u],s=l+j(a,u),c+=N(a,r,i,s,o);else if(u=m(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+j(a,u++),c+=N(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return N(M(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function P(e,t,n){if(e==null)return e;var r=[],i=0;return N(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function F(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var I=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},L={map:P,forEach:function(e,t,n){P(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return P(e,function(){t++}),t},toArray:function(e){return P(e,function(e){return e})||[]},only:function(e){if(!O(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=L,e.Component=v,e.Fragment=r,e.Profiler=a,e.PureComponent=b,e.StrictMode=i,e.Suspense=l,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=w,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return w.H.useMemoCache(e)}},e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=g({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!T.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return E(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)T.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return E(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=O,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:F}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=w.T,n={};w.T=n;try{var r=e(),i=w.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(C,I)}catch(e){I(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),w.T=t}},e.unstable_useCacheRefresh=function(){return w.H.useCacheRefresh()},e.use=function(e){return w.H.use(e)},e.useActionState=function(e,t,n){return w.H.useActionState(e,t,n)},e.useCallback=function(e,t){return w.H.useCallback(e,t)},e.useContext=function(e){return w.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return w.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return w.H.useEffect(e,t)},e.useEffectEvent=function(e){return w.H.useEffectEvent(e)},e.useId=function(){return w.H.useId()},e.useImperativeHandle=function(e,t,n){return w.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return w.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return w.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return w.H.useMemo(e,t)},e.useOptimistic=function(e,t){return w.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return w.H.useReducer(e,t,n)},e.useRef=function(e){return w.H.useRef(e)},e.useState=function(e){return w.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return w.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return w.H.useTransition()},e.version=`19.2.7`})),p=s(((e,t)=>{t.exports=f()})),m=s((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.fragment`);function r(e,n,r){var i=null;if(r!==void 0&&(i=``+r),n.key!==void 0&&(i=``+n.key),`key`in n)for(var a in r={},n)a!==`key`&&(r[a]=n[a]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:i,ref:n===void 0?null:n,props:r}}e.Fragment=n,e.jsx=r,e.jsxs=r})),h=s(((e,t)=>{t.exports=m()})),g={HOME:`/`,ABOUT:`/about`,PARTICIPATES:`/participates`,VOLUNTEER_PROFILE:`/volunteer-profile`,ORGANIZATION_PROFILE:`/organization-profile`,LOGIN:`/login`,REGISTER:`/register`,FORGOT_PASSWORD:`/forgot-password`,RESET_PASSWORD:`/reset-password`,EXPLORE:`/explore`,MY_VOLUNTEERING:`/my-volunteering`,MY_JOURNEY:`/my-journey`,DASHBOARD:`/dashboard`,MY_CAUSES:`/my-causes`,CREATE_CAUSE:`/my-causes/new`,APPLICANTS:`/my-causes/applicants`,OPPORTUNITIES:`/opportunities`,OPPORTUNITY_DETAILS:`/opportunities/:id`,ORGANIZATIONS:`/organizations`,NOTIFICATIONS:`/notifications`,ADMIN_DASHBOARD:`/admin`,ADMIN_ORGANIZATIONS:`/admin/organizations`,ADMIN_VOLUNTEERS:`/admin/volunteers`,ADMIN_OPPORTUNITIES:`/admin/opportunities`,ADMIN_CATEGORIES:`/admin/categories`,ADMIN_CITIES:`/admin/cities`,ADMIN_PROFILE:`/admin/profile`,ADMIN_SETTINGS:`/admin/settings`},_=[{from:`/Login`,to:g.LOGIN},{from:`/Register`,to:g.REGISTER},{from:`/signUp`,to:g.REGISTER},{from:`/volunteerProfile`,to:g.VOLUNTEER_PROFILE},{from:`/orgProfile`,to:g.ORGANIZATION_PROFILE},{from:`/admin/catalog`,to:g.ADMIN_CATEGORIES},{from:`/achievements`,to:g.MY_JOURNEY}],v={TYPE:`type`},y=u(p(),1),b=h();function x({as:e=`button`,variant:t=`primary`,size:n=`medium`,children:r,onClick:i,disabled:a=!1,fullWidth:o=!1,className:s=``,type:c=`button`,isLoading:l=!1,loadingText:u=`Saving...`,...d}){let f={primary:`bg-primary text-bg hover:bg-primary/90`,secondary:`bg-secondary text-bg hover:bg-secondary/90`,ghost:`bg-bg border border-heading/20 text-heading hover:bg-heading/5`,outlineLight:`bg-transparent border border-white/70 text-white hover:bg-white/10`,success:`bg-success text-white hover:bg-successHover`,danger:`bg-danger text-white hover:bg-dangerHover`},p={small:`px-3 py-2 text-sm`,medium:`px-5 py-2.5 text-base`,large:`px-7 py-3 text-lg`},m=a||l,h=e===`button`,[g,_]=(0,y.useState)([]),v=t===`ghost`?`bg-heading/10`:`bg-white/30`;function x(e){if(!m&&!(typeof window<`u`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches)){let t=e.currentTarget.getBoundingClientRect(),n=Math.max(t.width,t.height)*2,r=`${Date.now()}-${Math.random()}`;_(i=>[...i,{id:r,size:n,x:e.clientX-t.left-n/2,y:e.clientY-t.top-n/2}]),setTimeout(()=>{_(e=>e.filter(e=>e.id!==r))},600)}i?.(e)}let S=[`relative overflow-hidden rounded-xl font-medium transition-all duration-200`,h?``:`inline-flex items-center justify-center`,`focus:outline-none focus:ring-2 focus:ring-primary/40`,f[t],p[n],m?`opacity-60 cursor-not-allowed pointer-events-none`:`cursor-pointer active:scale-[0.98]`,o?`w-full`:``,s].filter(Boolean).join(` `);return(0,b.jsxs)(e,{type:h?c:void 0,className:S,onClick:m?void 0:x,disabled:h?m:void 0,"aria-disabled":!h&&m?!0:void 0,...d,children:[l?u:r,g.map(e=>(0,b.jsx)(`span`,{"aria-hidden":`true`,className:`pointer-events-none absolute rounded-full animate-button-ripple ${v}`,style:{left:e.x,top:e.y,width:e.size,height:e.size}},e.id))]})}var S={display:`
    font-display
    text-4xl sm:text-5xl md:text-6xl
    leading-[1.15]
    font-bold
    text-heading
  `,sectionTitle:`
    font-display
    text-3xl sm:text-4xl md:text-5xl
    leading-[1.2]
    font-bold
    text-heading
  `,h1:`
    font-display
    text-3xl sm:text-4xl md:text-5xl
    leading-tight
    font-bold
    text-heading
  `,h2:`
    font-display
    text-2xl sm:text-3xl md:text-4xl
    leading-tight
    font-bold
    text-heading
  `,h3:`
    font-display
    text-xl sm:text-2xl md:text-3xl
    leading-snug
    font-bold
    text-heading
  `,h4:`
    font-display
    text-lg sm:text-xl md:text-2xl
    leading-snug
    font-semibold
    text-heading
  `,h5:`
    font-display
    text-base sm:text-lg md:text-xl
    leading-normal
    font-semibold
    text-heading
  `,h6:`
    font-display
    text-sm sm:text-base md:text-lg
    leading-normal
    font-semibold
    text-heading
  `,subtitle:`
    font-display
    text-xl md:text-2xl
    leading-tight
    font-bold
    text-primary
    capitalize
  `,lead:`
    font-body
    text-lg md:text-xl
    leading-relaxed
    text-body
  `,body:`
    font-body
    text-base
    leading-6
    text-body
  `,bodySm:`
    font-body
    text-sm
    leading-5
    text-body
  `,caption:`
    font-body
    text-xs
    leading-4
    text-body
  `,overline:`
    font-body
    text-xs
    leading-4
    uppercase
    tracking-[0.12em]
    text-body
  `},C={inherit:``,primary:`text-primary`,heading:`text-heading`,body:`text-body`,black:`text-black`,white:`text-white`,danger:`text-danger`,muted:`text-heading/60`},w={inherit:``,left:`text-left`,center:`text-center`,right:`text-right`,justify:`text-justify`},T={normal:``,medium:`font-medium`,semibold:`font-semibold`,bold:`font-bold`,extrabold:`font-extrabold`};function E(e){return{display:`h1`,sectionTitle:`h2`,subtitle:`h3`,lead:`p`,body:`p`,bodySm:`p`,caption:`span`,overline:`span`,h1:`h1`,h2:`h2`,h3:`h3`,h4:`h4`,h5:`h5`,h6:`h6`}[e]||`p`}function D({variant:e=`body`,as:t,children:n,className:r=``,color:i=`inherit`,align:a=`inherit`,weight:o=`normal`,gutterBottom:s=!1,truncate:c=!1,...l}){return(0,y.createElement)(t||E(e),{className:[S[e]||S.body,C[i],w[a],T[o],s?`mb-4`:``,c?`truncate overflow-hidden whitespace-nowrap`:``,r].filter(Boolean).join(` `),...l},n)}export{g as a,s as c,d,u as f,_ as i,o as l,x as n,h as o,v as r,p as s,D as t,c as u};