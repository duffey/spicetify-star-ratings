!async function(){for(;!Spicetify.React||!Spicetify.ReactDOM;)await new Promise(t=>setTimeout(t,10));var u,o,f,l,m,d,p,y,b,i,r,s,g,h,a,c,n,S,v,k,w,E,x,P,N,R,t;u=Spicetify.React,o=Spicetify.React,m={},d={},p={},g=[],E=w=k=v=S=n=c=a=s=r=i=b=y=l=f=null,N=P=x=!(h=[]),R=()=>Spicetify.Player.data.item.uri,t=async function(){for(;!Spicetify?.showNotification;)await new Promise(t=>setTimeout(t,100));F(f=function(){var t={halfStarRatings:!0,likeThreshold:"4.0",hideHearts:!1,enableKeyboardShortcuts:!0,showPlaylistStars:!0,nowPlayingStarsPosition:"left",skipThreshold:"disabled"};settings={};try{var e=JSON.parse(K("starRatings:settings"));if(!e||"object"!=typeof e)throw"";settings=e}catch{return L("starRatings:settings",t),t}let i=!1;for(const r of Object.keys(t))settings.hasOwnProperty(r)||(settings[r]=t[r],i=!0);return i&&L("starRatings:settings",settings),settings}()),await pt();const t={"5.0":Spicetify.Keyboard.KEYS.NUMPAD_0,.5:Spicetify.Keyboard.KEYS.NUMPAD_1,"1.0":Spicetify.Keyboard.KEYS.NUMPAD_2,1.5:Spicetify.Keyboard.KEYS.NUMPAD_3,"2.0":Spicetify.Keyboard.KEYS.NUMPAD_4,2.5:Spicetify.Keyboard.KEYS.NUMPAD_5,"3.0":Spicetify.Keyboard.KEYS.NUMPAD_6,3.5:Spicetify.Keyboard.KEYS.NUMPAD_7,"4.0":Spicetify.Keyboard.KEYS.NUMPAD_8,4.5:Spicetify.Keyboard.KEYS.NUMPAD_9},e=rt(t),i=(r=t,()=>{for(const t of Object.values(r))Spicetify.Keyboard._deregisterShortcut({key:t,ctrl:!0,alt:!0})});var r;const a=()=>{E&&E[0].remove(),c=null,lt(t)};new Spicetify.Menu.Item("Star Ratings",!1,()=>{Spicetify.PopupModal.display({title:"Star Ratings",content:J({settings:f,registerKeyboardShortcuts:e,deregisterKeyboardShortcuts:i,updateTracklist:ot,restoreTracklist:nt,redrawNowPlayingStars:a}),isLarge:!0})}).register(),s=new MutationObserver(()=>{ot()}),Spicetify.Player.addEventListener("songchange",()=>{var t=Spicetify.Player.data.item.uri;t in m&&"disabled"!==f.skipThreshold&&m[t]<=parseFloat(f.skipThreshold)?Spicetify.Player.next():ct()}),Spicetify.Platform.History.listen(async()=>{await st()}),new Spicetify.ContextMenu.Item("Use as Rated folder",t=>{I(l=t[0]),P=!0,pt().finally(()=>{P=!1})},ut).register(),new Spicetify.ContextMenu.Item("Sort by rating",t=>{var e,i;Spicetify.PopupModal.display({title:"Modify Custom order?",content:({onClickCancel:e,onClickOK:i}=[{onClickCancel:()=>{Spicetify.PopupModal.hide()},onClickOK:()=>{Spicetify.PopupModal.hide(),N=!0,A("Sorting..."),X(t[0],m).finally(()=>{N=!1})}}][0],o.createElement("div",{className:"parent-div"},o.createElement("p",null,"This will modify the ",o.createElement("b",null,"Custom order")," of the playlist."),o.createElement("div",{className:"button-div"},o.createElement(W,{name:"Cancel",className:"cancel-button",onButtonClick:e}),o.createElement(W,{name:"Sort",className:"ok-button",onButtonClick:i}))))})},dt).register();var n=new MutationObserver(async()=>{await lt(t)});await lt(t),n.observe(document.body,{childList:!0,subtree:!0})},(async()=>{await t()})();function A(t){Spicetify.showNotification(t)}function K(t){return Spicetify.LocalStorage.get(t)}function L(t,e){Spicetify.LocalStorage.set(t,e)}async function C(){return Spicetify.Platform.RootlistAPI.getContents()}function q(t){return t.match(/spotify:playlist:(.*)/)[1]}async function T(t,e){t=q(t);await Spicetify.CosmosAsync.del(`https://api.spotify.com/v1/playlists/${t}/tracks`,{tracks:[{uri:e}]})}async function H(t){return(await Spicetify.CosmosAsync.get("sp://core-playlist/v1/playlist/"+t)).items}async function U(t){return 1===(await Spicetify.CosmosAsync.get("sp://desktop/v1/version")).version.localeCompare(t,void 0,{numeric:!0,sensitivity:"base"})}function D(t,e){var i,r,a,n=document.createElement("span"),o="stars-"+t,l=(n.className="stars",n.id=o,n.style.whiteSpace="nowrap",n.style.alignItems="center",n.style.display="flex",[]);for(let t=0;t<5;t++){u=o,i=t+1,c=e,a=r=s=void 0,s="http://www.w3.org/2000/svg",r=document.createElementNS(s,"svg"),u=u+"-"+i,r.id=u,r.style.minHeight=c+"px",r.style.minWidth=c+"px",r.setAttributeNS(null,"width",c+"px"),r.setAttributeNS(null,"height",c+"px"),r.setAttributeNS(null,"viewBox","0 0 32 32"),i=document.createElementNS(s,"defs"),r.append(i),c=document.createElementNS(s,"linearGradient"),i.append(c),c.id=u+"-gradient",i=document.createElementNS(s,"stop"),c.append(i),i.id=u+"-gradient-first",i.setAttributeNS(null,"offset","50%"),i.setAttributeNS(null,"stop-color","var(--spice-button-disabled)"),a=document.createElementNS(s,"stop"),c.append(a),a.id=u+"-gradient-second",a.setAttributeNS(null,"offset","50%"),a.setAttributeNS(null,"stop-color","var(--spice-button-disabled)"),u=document.createElementNS(s,"path"),r.append(u),u.setAttributeNS(null,"fill",`url(#${c.id})`),u.setAttributeNS(null,"d","M20.388,10.918L32,12.118l-8.735,7.749L25.914,31.4l-9.893-6.088L6.127,31.4l2.695-11.533L0,12.118l11.547-1.2L16.026,0.6L20.388,10.918z");var[s,c,u]=[r,i,a];n.append(s),l.push([s,c,u])}return[n,l]}function M(e,t){var i=t/=.5;for(let t=0;t<5;t++){var r=e[t][1],a=e[t][2];r.setAttributeNS(null,"stop-color","var(--spice-button-disabled)"),a.setAttributeNS(null,"stop-color","var(--spice-button-disabled)")}for(let t=0;t<i;t++){var n=Math.floor(t/2),o=e[n][1],n=e[n][2];(t%2==0?o:n).setAttributeNS(null,"stop-color","var(--spice-button)")}}function j(t,e,i){e=e.getBoundingClientRect(),e=event.clientX-e.left;let r=i+1;return 8<e||!t.halfStarRatings||(r-=.5),0===i&&e<3&&(r-=t.halfStarRatings?.5:1),r}function F(t){L("starRatings:settings",JSON.stringify(t))}function Y(t){L("starRatings:playlistUris",JSON.stringify(t))}function I(t){L("starRatings:ratedFolderUri",t)}function $(){return u.createElement("svg",{width:16,height:16,viewbox:"0 0 16 16",fill:"currentColor",dangerouslySetInnerHTML:{__html:Spicetify.SVGIcons.check}})}function O({settings:e,name:t,field:i,onclick:r}){let[a,n]=Spicetify.React.useState(e[i]);var o=a?"checkbox":"checkbox disabled";return u.createElement("div",{className:"popup-row"},u.createElement("label",{className:"col description"},t),u.createElement("div",{className:"col action"},u.createElement("button",{className:o,onClick:function(){var t=!a;e[i]=t,n(t),F(e),r&&r()}},u.createElement($,null))))}function G({settings:e,name:t,field:i,options:r,onclick:a}){const[n,o]=Spicetify.React.useState(e[i]);var l,s,c=[];for([l,s]of Object.entries(r))c.push(u.createElement("option",{value:s},l));return u.createElement("div",{className:"popup-row"},u.createElement("label",{className:"col description"},t),u.createElement("div",{className:"col action"},u.createElement("select",{value:n,onChange:function(t){o(t.target.value),e[i]=t.target.value,F(e),a&&a()}},c)))}function _({label:t,numberKey:e}){return u.createElement("li",{className:"main-keyboardShortcutsHelpModal-sectionItem"},u.createElement("span",{className:"Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-sectionItemName"},t),u.createElement("kbd",{className:"Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key"},"Ctrl"),u.createElement("kbd",{className:"Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key"},"Alt"),u.createElement("kbd",{className:"Type__TypeElement-goli3j-0 ipKmGr main-keyboardShortcutsHelpModal-key"},e))}function z({value:t}){return u.createElement("h2",{className:"Type__TypeElement-goli3j-0 bcTfIx main-keyboardShortcutsHelpModal-sectionHeading"},t)}function J({settings:r,registerKeyboardShortcuts:t,deregisterKeyboardShortcuts:e,updateTracklist:i,restoreTracklist:a,redrawNowPlayingStars:n}){return u.createElement("div",null,u.createElement(z,{value:"Settings"}),u.createElement(O,{settings:r,name:"Half star ratings",field:"halfStarRatings"}),u.createElement(O,{settings:r,name:"Hide hearts",field:"hideHearts",onclick:function(t){var e=document.querySelector(".control-button-heart");e&&(e.style.display=r.hideHearts?"none":"flex");for(const i of e=document.querySelectorAll(".main-trackList-rowHeartButton"))i.style.display=r.hideHearts?"none":"flex"}}),u.createElement(O,{settings:r,name:"Enable keyboard shortcuts",field:"enableKeyboardShortcuts",onclick:function(){(r.enableKeyboardShortcuts?t:e)()}}),u.createElement(O,{settings:r,name:"Show playlist stars",field:"showPlaylistStars",onclick:function(){(r.showPlaylistStars?i:a)()}}),u.createElement(G,{settings:r,name:"Auto-like/dislike threshold",field:"likeThreshold",options:{Disabled:"disabled","3.0":"3.0",3.5:"3.5","4.0":"4.0",4.5:"4.5","5.0":"5.0"}}),u.createElement(G,{settings:r,name:"Now playing stars position",field:"nowPlayingStarsPosition",options:{Left:"left",Right:"right"},onclick:function(){n()}}),u.createElement(G,{settings:r,name:"Skip threshold",field:"skipThreshold",options:{Disabled:"disabled","0.0":"0.0",.5:"0.5","1.0":"1.0",1.5:"1.5","2.0":"2.0",2.5:"2.5","3.0":"3.0",3.5:"3.5","4.0":"4.0",4.5:"4.5"}}),u.createElement(z,{value:"Keyboard Shortcuts"}),u.createElement("ul",null,u.createElement(_,{label:"Rate current track 0.5 stars",numberKey:"1"}),u.createElement(_,{label:"Rate current track 1 star",numberKey:"2"}),u.createElement(_,{label:"Rate current track 1.5 stars",numberKey:"3"}),u.createElement(_,{label:"Rate current track 2 stars",numberKey:"4"}),u.createElement(_,{label:"Rate current track 2.5 stars",numberKey:"5"}),u.createElement(_,{label:"Rate current track 3 stars",numberKey:"6"}),u.createElement(_,{label:"Rate current track 3.5 stars",numberKey:"7"}),u.createElement(_,{label:"Rate current track 4 stars",numberKey:"8"}),u.createElement(_,{label:"Rate current track 4.5 stars",numberKey:"9"}),u.createElement(_,{label:"Rate current track 5 stars",numberKey:"0"})))}function W({name:t,className:e,onButtonClick:i}){return o.createElement("button",{className:e,onClick:i},t)}function V(t,e){return t.items.find(t=>"folder"===t.type&&t.name===e)}async function Q(i,t){const r=[];for(const[a,e]of Object.entries(t))if(!(e.length<=1)){const n=Math.max(...e);e.filter(t=>t!=n).forEach(t=>{var e=i[t];console.log(`Removing track ${a} with lower rating ${t} and higher rating ${n} from lower rated playlist ${e}.`),r.push(T(e,a))})}await Promise.all(r)}async function X(i,r){const a=["5.0","4.5","4.0","3.5","3.0","2.5","2.0","1.5","1.0","0.5","0.0"];var n=await H(i);if(0!==n.length){var o={};for(const p of a)o[p]=[];for(const f of n)o[(r[f.link]??0).toFixed(1)].push(f.rowId);let t=function(t){for(const e of a)if(0<t[e].length)return t[e][0];return null}(o);var l,s,c,u,n=n[0].rowId,d=t===n;let e=!0;for(const m of a)0!==o[m].length&&(!d&&e?(l=i,s=o[m],c=t,u=void 0,u=await U("1.2.5.1006.g22820f93"),await Spicetify.Platform.PlaylistAPI.move(l,s.map(t=>({uid:t})),{before:u?{uid:c}:c})):(l=i,s=o[m],u=t,c=void 0,c=await U("1.2.5.1006.g22820f93"),await Spicetify.Platform.PlaylistAPI.move(l,s.map(t=>({uid:t})),{after:c?{uid:u}:u})),e=!1,t=o[m].slice(-1)[0])}}function Z(t){return t.match(/spotify:track:(.*)/)[1]}function B(){return document.querySelector(".main-nowPlayingWidget-nowPlaying .control-button-heart")}function tt(){var t;v&&(t=function(t,e){let i=0,r=0;for(const o of e.albumUnion.tracks.items){var a=t[o.track.uri];a&&(i+=parseFloat(a),r+=1)}let n=0;return 0<r&&(n=i/r),n=(Math.round(2*n)/2).toFixed(1)}(m,k),M(w[1],t.toString()))}async function et(t,e,i){m[t]=i,e&&(a=e.toFixed(1),a=p[a],d[a],await T(a,t)),l||(await Spicetify.Platform.RootlistAPI.createFolder("Rated",{before:""}),a=V(await C(),"Rated"),I(l=a.uri));var r,a=i.toFixed(1);let n=p[a];n||(n=(i=a,o=l,await(navigator.platform.startsWith("Linux")&&navigator.userAgent.includes("Spotify/1.1.84.716")?Spicetify.Platform.RootlistAPI.createPlaylist(i,{after:o}):Spicetify.Platform.RootlistAPI.createPlaylist(i,{after:{uri:o}}))),r=n,await!setTimeout(async()=>{await Spicetify.CosmosAsync.post(`sp://core-playlist/v1/playlist/${r}/set-base-permission`,{permission_level:"BLOCKED"})},1e3),p[a]=n,Y(p),d[n]=a);var i=n,o=t;i=q(i);try{await Spicetify.CosmosAsync.post(`https://api.spotify.com/v1/playlists/${i}/tracks`,{uris:[o]})}catch(t){await new Promise(t=>setTimeout(t,500)),await Spicetify.CosmosAsync.post(`https://api.spotify.com/v1/playlists/${i}/tracks`,{uris:[o]})}await 0,A((e?"Moved":"Added")+" to "+d[n])}function it(o,l,s,c,u){return()=>{if(!(x||P||N)){x=!0;var[,r]=s,r=r[o][0];const a=c(),n=m[a];let t=null!==l?l:j(f,r,o);r=u();r&&"disabled"!==f.likeThreshold&&("true"!==r.ariaChecked&&t>=parseFloat(f.likeThreshold)&&r.click(),"true"===r.ariaChecked)&&t<parseFloat(f.likeThreshold)&&r.click();let e=null,i=null;(e=n===t?(i=0,async function(t,e){delete m[t];var e=e.toFixed(1),e=p[e],i=d[e];await T(e,t),A("Removed from "+i)}(a,t)):(i=t,et(a,n,t))).finally(()=>{(tracklistStarData=function(t){var e="stars-"+t;if(!(t=document.getElementById(e)))return null;var i=[];for(let t=1;t<=5;t++){var r=e+"-"+t,a=document.getElementById(r),n=document.getElementById(r+"-gradient-first"),r=document.getElementById(r+"-gradient-second");i.push([a,n,r])}return[t,i]}(Z(a)))&&(M(tracklistStarData[1],i),tracklistStarData[0].style.visibility=n===t?"hidden":"visible"),ct(),tt(),x=!1})}}}function rt(i){return()=>{for(var[t,e]of Object.entries(i))Spicetify.Keyboard.registerShortcut({key:e,ctrl:!0,alt:!0},it(0,parseFloat(t),E,R,B))}}function at(t,i,r){const[e,a]=t;e.addEventListener("mouseout",function(){var t;M(a,(t=i(),m[t]??0))});for(let e=0;e<5;e++){const n=a[e][0];n.addEventListener("mousemove",function(){var t=j(f,n,e);M(a,t)}),n.addEventListener("click",it(e,null,t,i,r))}}function nt(){document.querySelectorAll(".main-trackList-trackListHeaderRow").forEach(t=>{t.style["grid-template-columns"]=y});for(const i of g)for(const r of i.getElementsByClassName("main-trackList-trackListRow")){var t,e=r.querySelector(".starRatings");e&&(r.style["grid-template-columns"]=b,e.remove(),e=r.querySelector(".main-trackList-rowSectionEnd"),t=parseInt(e.getAttribute("aria-colindex")),e.setAttribute("aria-colindex",(t-1).toString()))}}function ot(){if(f.showPlaylistStars){h=g;let e=(g=Array.from(document.querySelectorAll(".main-trackList-indexable"))).length!==h.length;for(let t=0;t<g.length;t++)g[t].isEqualNode(h[t])||(e=!0);e&&(b=y=null);const c=[null,null,null,null,"[index] 16px [first] 4fr [var1] 2fr [var2] 1fr [last] minmax(120px,1fr)","[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] 2fr [last] minmax(120px,1fr)","[index] 16px [first] 6fr [var1] 4fr [var2] 3fr [var3] minmax(120px,2fr) [var3] 2fr [last] minmax(120px,1fr)"];let i=null;document.querySelectorAll(".main-trackList-trackListHeaderRow").forEach(t=>{var e=t.querySelector(".main-trackList-rowSectionEnd"),e=parseInt(e.getAttribute("aria-colindex"));(y=y||getComputedStyle(t).gridTemplateColumns)&&c[e]&&(t.style["grid-template-columns"]=c[e],i=c[e])});for(const t of g)for(const u of t.getElementsByClassName("main-trackList-trackListRow")){var r=()=>u.getElementsByClassName("main-addButton-button")[0]??u.querySelector(".main-trackList-rowHeartButton")??u.querySelector("button[class*='buttonTertiary-iconOnly']")??u.querySelector("button[aria-label='Add to playlist']"),a=r(),n=0<u.getElementsByClassName("stars").length;o=u;const d=(o=Object.values(o))?(o=o[0]?.pendingProps?.children[0]?.props?.children)?.props?.uri||o?.props?.children?.props?.uri||o?.props?.children?.props?.children?.props?.uri||o[0]?.props?.uri:null;var o=d.includes("track");let t=u.querySelector(".starRatings");if(t||(l=u.querySelector(".main-trackList-rowSectionEnd"),s=parseInt(l.getAttribute("aria-colindex")),l.setAttribute("aria-colindex",(s+1).toString()),(t=document.createElement("div")).setAttribute("aria-colindex",s.toString()),t.role="gridcell",t.style.display="flex",t.classList.add("main-trackList-rowSectionVariable"),t.classList.add("starRatings"),u.insertBefore(t,l),b=b||getComputedStyle(u).gridTemplateColumns,c[s]&&(u.style["grid-template-columns"]=i||c[s])),a&&d&&!n&&o){var l=D(Z(d),16);const p=l[0];var s=l[1],a=m[d]??0;t.appendChild(p),M(s,a),r().style.display=f.hideHearts?"none":"flex",at(l,()=>d,r),p.style.visibility=void 0!==m[d]?"visible":"hidden",u.addEventListener("mouseover",()=>{p.style.visibility="visible"}),u.addEventListener("mouseout",()=>{p.style.visibility=void 0!==m[d]?"visible":"hidden"})}}}}async function lt(t){i=r,(r=document.querySelector("main"))&&!r.isEqualNode(i)&&(i&&s.disconnect(),ot(),s.observe(r,{childList:!0,subtree:!0})),B()&&(B().style.display=f.hideHearts?"none":"flex"),a=c;var e="left"===f.nowPlayingStarsPosition?".main-nowPlayingWidget-nowPlaying .main-trackInfo-container":".main-nowPlayingBar-right div";(c=document.querySelector(e))&&!c.isEqualNode(a)&&((E=D("now-playing",16))[0].style.marginLeft="8px",E[0].style.marginRight="8px","left"===f.nowPlayingStarsPosition?c.after(E[0]):c.prepend(E[0]),at(E,R,B),ct(),f.enableKeyboardShortcuts)&&rt(t)(),n=S,(S=document.querySelector(".main-actionBar-ActionBar .main-playButton-PlayButton"))&&!S.isEqualNode(n)&&(w=D("album",32),S.after(w[0]),await st(),tt())}async function st(){var t,e;w&&(t=Spicetify.Platform.History.location.pathname.match(/album\/(.*)/),v=t?t[1]:null,w[0].style.display=v?"flex":"none",v)&&(t="spotify:album:"+v,e=Spicetify.GraphQL.Definitions.queryAlbumTracks,k=await(e=(await Spicetify.GraphQL.Request(e,{uri:t,offset:0,limit:500})).data),tt())}function ct(){var t,e;E&&(e=(t=Spicetify.Player.data.item.uri).includes("track"),E[0].style.display=e?"flex":"none",e=m[t]??0,M(E[1],e))}function ut(t){return Spicetify.URI.fromString(t[0]).type===Spicetify.URI.Type.FOLDER}function dt(t){switch(Spicetify.URI.fromString(t[0]).type){case Spicetify.URI.Type.PLAYLIST:case Spicetify.URI.Type.PLAYLIST_V2:return!0}return!1}async function pt(){l=K("starRatings:ratedFolderUri"),m={},d={},p=function(){try{var t=JSON.parse(K("starRatings:playlistUris"));if(t&&"object"==typeof t)return t;throw""}catch{return L("starRatings:playlistUris","{}"),{}}}();let t=null;var e,i,r,a;l?(e=await C(),t=(i=l,e.items.find(t=>"folder"===t.type&&t.uri===i))):(e=await C(),(t=V(e,"Rated"))&&I(l=t.uri)),t?(r=!1,[r,p]=function(t,e){var i={};let r=!1;for(const[a,n]of Object.entries(t))e.items.find(t=>t.uri===n)?i[a]=n:r=!0;return[r,i]}(p,t),a=!1,[a,p]=function(e,t){const i={...e};let r=!1;const a=["0.0","0.5","1.0","1.5","2.0","2.5","3.0","3.5","4.0","4.5","5.0"].filter(t=>!e.hasOwnProperty(t));return t.items.filter(t=>a.includes(t.name)).forEach(t=>{i[t.name]=t.uri,r=!0}),[r,i]}(p,t),(a||r)&&Y(p),a=await async function(e){var i=Object.keys(e),r=await Promise.all(i.map(t=>H(e[t]))),a={};for(let t=0;t<i.length;t++)a[i[t]]=r[t];return a}(p),m=function(t){var e,i,r={};for([e,i]of Object.entries(t))for(const n of i){var a=n.link;let t=[];(t=r[a]?r[a]:t).push(e),r[a]=t}return r}(a),await Q(p,m),m=function(t){var e,i,r={};for([e,i]of Object.entries(t))r[e]=Math.max(...i);return r}(m),d=function(e,t){const i={};return t.items.filter(t=>Object.values(e).includes(t.uri)).forEach(t=>{i[t.uri]=t.name}),i}(p,t)):0<Object.keys(p).length&&(Y(p={}),I(l=""))}(async()=>{var t;document.getElementById("starDratings")||((t=document.createElement("style")).id="starDratings",t.textContent=String.raw`
  .popup-row::after{content:"";display:table;clear:both}.popup-row .col{display:flex;padding:10px 0;align-items:center}.popup-row .col.description{float:left;padding-right:15px}.popup-row .col.action{float:right;text-align:right}.popup-row .div-title{color:var(--spice-text)}.popup-row .divider{height:2px;border-width:0;background-color:var(--spice-button-disabled)}.popup-row .space{margin-bottom:20px;visibility:hidden}button.checkbox{align-items:center;border:0;border-radius:50%;background-color:rgba(var(--spice-rgb-shadow),.7);color:var(--spice-text);cursor:pointer;display:flex;-webkit-margin-start:12px;margin-inline-start:12px;padding:8px}button.checkbox.disabled{color:rgba(var(--spice-rgb-text),.3)}select{color:var(--spice-text);background:rgba(var(--spice-rgb-shadow),.7);border:0;height:32px}::-webkit-scrollbar{width:8px}.login-button{background-color:var(--spice-button);border-radius:8px;border-style:none;box-sizing:border-box;color:var(--spice-text);cursor:pointer;display:inline-block;font-size:14px;font-weight:500;height:40px;line-height:20px;list-style:none;margin:10px;outline:0;padding:5px 10px;position:relative;text-align:center;text-decoration:none;vertical-align:baseline;touch-action:manipulation}.parent-div{display:flex;flex-direction:column;gap:8px}.button-div{margin-top:24px;display:flex;gap:16px;justify-content:flex-end}.cancel-button{background-color:transparent;font-weight:700;border:0;color:var(--spice-text);display:inline-flex;border-radius:500px;font-size:inherit;min-block-size:48px;align-items:center;padding-inline:32px}.cancel-button:hover{transform:scale(1.04)}.ok-button{background-color:var(--spice-button-active);font-weight:700;border:0;color:var(--spice-main);display:inline-flex;border-radius:500px;font-size:inherit;min-block-size:48px;align-items:center;padding-inline:32px}.ok-button:hover{transform:scale(1.04)}
      `.trim(),document.head.appendChild(t))})()}();