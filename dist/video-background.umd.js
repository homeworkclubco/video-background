(function(d,a){typeof exports=="object"&&typeof module<"u"?a(exports):typeof define=="function"&&define.amd?define(["exports"],a):(d=typeof globalThis<"u"?globalThis:d||self,a(d.VideoBackground={}))})(this,(function(d){"use strict";const a={src:"",autoplay:!0,muted:!0,loop:!0,mobile:!0,volume:1,"start-at":0,"end-at":0,"play-button":!1,"mute-button":!1,"seek-bar":!1,poster:null,"aspect-ratio":"16/9","no-cookie":!0,"fit-box":!1,lazy:!1,"always-play":!1,"force-on-low-battery":!1,title:"Video background","video-id":"","unlisted-hash":""},A=/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([^"&?\/\s]{11})/i,x=/(?:vimeo\.com\/(?:video\/|channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|)(\d+)(?:|\/\?))/i,V=/\.(mp4|webm|ogv|ogm|ogg|avi|m4v|mov|qt)(\?.*)?$/i;function m(r){if(!r)return null;const t=r.match(A);if(t&&t[1])return{id:t[1],type:"youtube",link:r};const e=r.match(x);if(e&&e[1]){const s={id:e[1],type:"vimeo",link:r},n=/\/[^\/\:\.]+(\:|\/)([^:?\/]+)\s?$/,o=/(\?|&)h=([^=&#?]+)/,h=r.match(n),l=r.match(o);return h?s.unlisted=h[2]:l&&(s.unlisted=l[2]),s}return r.match(V)?{id:r,type:"html5",link:r}:null}function f(){return/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Windows Phone/i.test(navigator.userAgent)}const C=`
  :host {
    display: block;
    position: relative;
    overflow: hidden;
    min-height: 200px;
  }

  .vb-wrapper {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .vb-wrapper.has-controls {
    pointer-events: auto;
  }

  /* Player container sits above poster; video fades in when playing, covering it */
  .vb-player {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
  }

  .vb-player iframe,
  .vb-player video {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .vb-player.vb-fit-box iframe,
  .vb-player.vb-fit-box video {
    width: 100% !important;
    height: 100% !important;
    top: 0;
    left: 0;
    transform: none;
  }

  .vb-poster {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 0;
  }

  .vb-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--vb-overlay-bg, transparent);
    pointer-events: auto;
  }

  .vb-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 6px;
    pointer-events: auto;
  }

  .vb-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--vb-controls-size, 36px);
    height: var(--vb-controls-size, 36px);
    border-radius: 50%;
    border: none;
    background: var(--vb-controls-bg, rgba(0, 0, 0, 0.5));
    color: var(--vb-controls-color, #fff);
    cursor: pointer;
    padding: 0;
    filter: drop-shadow(0px 0px 1px rgba(0,0,0,0.5));
    opacity: 1;
    transition: opacity 250ms ease-in-out;
  }

  .vb-btn:hover { opacity: 0.7; }

  .vb-btn:focus-visible {
    outline: 2px solid var(--vb-controls-color, #fff);
    outline-offset: 2px;
  }

  .vb-btn svg {
    width: calc(var(--vb-controls-size, 36px) * 0.55);
    height: calc(var(--vb-controls-size, 36px) * 0.55);
  }

  /* Seek bar */
  .vb-seek-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: var(--vb-seek-bg, rgba(255, 255, 255, 0.4));
    z-index: 2;
    pointer-events: auto;
  }

  .vb-seek-progress {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    overflow: hidden;
    background: transparent !important;
    border: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .vb-seek-progress::-webkit-progress-bar { background: transparent; }

  .vb-seek-progress::-webkit-progress-value {
    background: var(--vb-seek-progress-bg, #fff);
  }

  .vb-seek-progress::-moz-progress-bar {
    background: var(--vb-seek-progress-bg, #fff);
  }

  .vb-seek-range {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    position: absolute;
    top: calc(50% - 10px);
    left: 0;
    z-index: 2;
    display: block;
    width: 100%;
    height: 20px;
    margin: 0;
    cursor: pointer;
    background: transparent;
  }

  .vb-seek-range::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    height: 6px;
    background: transparent;
    border: 0;
  }

  .vb-seek-range::-moz-range-track {
    width: 100%;
    height: 6px;
    background: transparent;
    border: 0;
  }

  .vb-seek-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    margin-top: 3px;
    cursor: pointer;
    background: var(--vb-seek-thumb-color, #fff);
    border: 0;
    border-radius: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }

  .vb-seek-range::-moz-range-thumb {
    width: 12px;
    height: 12px;
    cursor: pointer;
    background: var(--vb-seek-thumb-color, #fff);
    border: 0;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }

  .vb-seek-bar:hover .vb-seek-range::-webkit-slider-thumb { opacity: 1; }
  .vb-seek-bar:hover .vb-seek-range::-moz-range-thumb { opacity: 1; }
`;class y{constructor(t,e,i){this.playerElement=null,this.player=null,this.paused=!1,this.currentState="notstarted",this.duration=0,this.percentComplete=0,this.isIntersecting=!1,this.initialPlay=!1,this.initialVolume=!1,this.config=t,this.container=e,this.hostElement=i,this.muted=t.muted,this.volume=t.volume,this.currentTime=t["start-at"]||0,this.isMobile=f(),t["start-at"]&&(this.percentComplete=this.timeToPercentage(t["start-at"]))}timeToPercentage(t){const e=this.config["start-at"];if(t<=e)return 0;if(this.duration&&t>=this.duration)return 100;if(t<=0)return 0;const i=t-e,s=this.duration-e;return s?Math.round(i/s*1e3)/10:0}percentageToTime(t){const e=this.config["start-at"];if(!this.duration)return e||0;if(t>100)return this.duration;if(t<=0)return e||0;const i=this.duration-e;let s=t*i/100;return s=Math.round(s*1e3)/1e3,s>i&&(s=i),e&&(s+=e),s}setDuration(t){if(this.duration===t)return;const e=this.config["end-at"];if(e){if(t>e){this.duration=e;return}if(t<e){this.duration=t;return}}else{this.duration=t;return}t<=0&&(this.duration=e)}setStartAt(t){this.config["start-at"]=t}setEndAt(t){this.config["end-at"]=t,this.duration>t&&(this.duration=t),this.currentTime>t&&this.onVideoEnded()}shouldPlay(){return this.currentState==="ended"&&!this.config.loop?!1:!!(this.config["always-play"]&&this.currentState!=="playing"||this.isIntersecting&&this.config.autoplay&&this.currentState!=="playing")}dispatchEvent(t){this.hostElement.dispatchEvent(new CustomEvent(t,{bubbles:!0,detail:this}))}stylePlayerElement(t){t&&(t.style.position="absolute")}resize(){const t=this.playerElement;if(!t||this.config["fit-box"])return;const e=this.container,i=e.offsetWidth,s=e.offsetHeight;if(!i||!s)return;const n=this.config["aspect-ratio"];let o;if(n.includes("/")){const[v,b]=n.split("/").map(Number);o=v/b}else if(n.includes(":")){const[v,b]=n.split(":").map(Number);o=v/b}else o=parseFloat(n);(!o||isNaN(o))&&(o=16/9);const h=i/s;let l,c;const P=100;h<o?(c=s+P,l=c*o):(l=i+P,c=l/o),t.style.width=`${l}px`,t.style.height=`${c}px`}mobileLowBatteryAutoplayHack(){if(!this.config["force-on-low-battery"]||!this.isMobile||!this.config.mobile)return;const t=()=>{!this.initialPlay&&this.config.autoplay&&this.config.muted&&(this.softPlay(),!this.isIntersecting&&!this.config["always-play"]&&this.softPause())};document.addEventListener("touchstart",t,{once:!0})}onVideoEnded(){if(this.dispatchEvent("vb-ended"),!this.config.loop){this.pause();return}this.seekTo(this.config["start-at"])}}const S={[-1]:"notstarted",0:"ended",1:"playing",2:"paused",3:"buffering",5:"cued"};let u=null;function L(){return u||(u=new Promise(r=>{var i;if((i=window.YT)!=null&&i.Player){r();return}const t=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{t&&t(),r()};const e=document.createElement("script");e.src="https://www.youtube.com/iframe_api",document.head.appendChild(e)}),u)}class z extends y{constructor(t,e,i){super(t,e,i),this.iframe=null,this.timeUpdateTimer=null,this.playerReady=!1}async init(){await L();const t=document.createElement("iframe");t.setAttribute("frameborder","0"),t.setAttribute("allow","autoplay; mute"),t.setAttribute("tabindex","-1"),t.setAttribute("aria-hidden","true"),this.config.title&&t.setAttribute("title",this.config.title),t.src=this.buildSrcURL(),t.style.position="absolute",this.container.appendChild(t),this.iframe=t,this.playerElement=t,this.player=new window.YT.Player(t,{events:{onReady:()=>this.onVideoPlayerReady(),onStateChange:e=>this.onVideoStateChange(e.data)}})}buildSrcURL(){const t=this.config["video-id"],e=this.config["no-cookie"]?"https://www.youtube-nocookie.com/embed/":"https://www.youtube.com/embed/",i=new URLSearchParams({enablejsapi:"1",disablekb:"1",controls:"0",rel:"0",iv_load_policy:"3",cc_load_policy:"0",playsinline:"1",showinfo:"0",modestbranding:"1",fs:"0"});return this.config.muted&&i.set("mute","1"),this.config.autoplay&&i.set("autoplay","1"),this.config.loop&&(i.set("loop","1"),i.set("playlist",t)),`${e}${t}?${i.toString()}`}onVideoPlayerReady(){this.playerReady=!0,this.resize(),this.mobileLowBatteryAutoplayHack(),this.config.autoplay&&(this.config["always-play"]||this.isIntersecting)&&(this.config["start-at"]&&this.player.seekTo(this.config["start-at"],!0),this.player.playVideo()),this.setDuration(this.player.getDuration()),this.dispatchEvent("vb-ready")}startTimeUpdateTimer(){this.timeUpdateTimer||(this.timeUpdateTimer=setInterval(()=>this.onVideoTimeUpdate(),250))}stopTimeUpdateTimer(){this.timeUpdateTimer&&(clearInterval(this.timeUpdateTimer),this.timeUpdateTimer=null)}onVideoStateChange(t){const e=S[t]??"notstarted";this.currentState=e,e==="notstarted"&&this.config.autoplay&&(this.config["start-at"]&&this.player.seekTo(this.config["start-at"],!0),this.player.playVideo()),e==="ended"?(this.stopTimeUpdateTimer(),this.onVideoEnded()):e==="playing"?this.onVideoPlay():e==="paused"&&this.onVideoPause()}onVideoPlay(){this.initialPlay||(this.initialPlay=!0,this.iframe&&(this.iframe.style.opacity="1"));const t=this.config["start-at"];t&&this.player.getCurrentTime()<t&&this.player.seekTo(t,!0),this.duration&&this.player.getCurrentTime()>=this.duration&&this.player.seekTo(t||0,!0),this.duration||this.setDuration(this.player.getDuration()),this.startTimeUpdateTimer(),this.dispatchEvent("vb-play")}onVideoPause(){this.stopTimeUpdateTimer(),this.dispatchEvent("vb-pause")}onVideoTimeUpdate(){const t=this.player.getCurrentTime();if(t===this.currentTime)return;if(this.currentTime=t,this.percentComplete=this.timeToPercentage(t),this.config["end-at"]&&this.duration&&t>=this.duration){this.onVideoEnded();return}this.dispatchEvent("vb-timeupdate")}play(){var t;this.paused=!1,this.playerReady&&((t=this.player)==null||t.playVideo())}pause(){var t;this.paused=!0,this.stopTimeUpdateTimer(),this.playerReady&&((t=this.player)==null||t.pauseVideo())}softPlay(){!this.player||this.currentState==="playing"||this.playerReady&&this.player.playVideo()}softPause(){!this.player||this.currentState==="paused"||(this.stopTimeUpdateTimer(),this.playerReady&&this.player.pauseVideo())}mute(){var t;this.muted=!0,this.playerReady&&((t=this.player)==null||t.mute()),this.dispatchEvent("vb-mute")}unmute(){var t;this.muted=!1,this.playerReady&&(this.initialVolume||(this.initialVolume=!0,this.setVolume(this.config.volume)),(t=this.player)==null||t.unMute()),this.dispatchEvent("vb-unmute")}seek(t){this.seekTo(this.percentageToTime(t))}seekTo(t){var e;this.playerReady&&((e=this.player)==null||e.seekTo(t,!0)),this.dispatchEvent("vb-seeked")}setVolume(t){var e;this.volume=t,this.playerReady&&((e=this.player)==null||e.setVolume(t*100))}getVolume(){return this.playerReady&&this.player?this.player.getVolume()/100:this.volume}setSource(t){var e;this.config["video-id"]=t,this.playerReady&&((e=this.player)==null||e.loadVideoById({videoId:t}))}destroy(){var t;this.stopTimeUpdateTimer(),this.playerReady=!1,(t=this.player)==null||t.destroy(),this.player=null,this.iframe=null,this.playerElement=null}}let p=null;function M(){return p||(p=new Promise((r,t)=>{var i;if((i=window.Vimeo)!=null&&i.Player){r();return}const e=document.createElement("script");e.src="https://player.vimeo.com/api/player.js",e.onload=()=>r(),e.onerror=()=>t(new Error("Failed to load Vimeo player API")),document.head.appendChild(e)}),p)}class I extends y{constructor(t,e,i){super(t,e,i),this.iframe=null,this.player=null}async init(){await M();const t=document.createElement("iframe");t.setAttribute("frameborder","0"),t.setAttribute("allow","autoplay; fullscreen; picture-in-picture"),t.setAttribute("title","Background video"),t.setAttribute("loading","lazy"),t.setAttribute("tabindex","-1"),t.setAttribute("aria-hidden","true"),t.src=this.generateSrcURL(),this.stylePlayerElement(t),this.container.appendChild(t),this.iframe=t,this.playerElement=t,this.player=new window.Vimeo.Player(t),this.player.on("loaded",()=>this.onVideoPlayerReady()),this.player.on("ended",()=>this.onVimeoEnded()),this.player.on("play",()=>this.onVideoPlay()),this.player.on("pause",()=>this.onVideoPause()),this.player.on("bufferstart",()=>{this.currentState="buffering"}),this.player.on("timeupdate",e=>this.onVideoTimeUpdate(e))}generateSrcURL(){const t=this.config["video-id"],e=new URLSearchParams({background:"1",controls:"0",autopause:"0"});this.config.muted&&e.set("muted","1"),this.config.autoplay&&e.set("autoplay","1"),this.config.loop&&e.set("loop","1"),this.config["no-cookie"]&&e.set("dnt","1"),this.config["start-at"]&&e.set("t",String(this.config["start-at"]));const i=this.config["unlisted-hash"];return i&&e.set("h",i),`https://player.vimeo.com/video/${t}?${e.toString()}`}async onVideoPlayerReady(){this.mobileLowBatteryAutoplayHack(),this.resize(),this.config["start-at"]&&await this.seekTo(this.config["start-at"]),this.config.autoplay&&(this.config["always-play"]||this.isIntersecting)&&await this.player.play().catch(()=>{});const t=await this.player.getDuration();this.setDuration(t),this.dispatchEvent("vb-ready")}onVideoTimeUpdate(t){this.currentTime=t.seconds,!this.duration&&t.duration&&this.setDuration(t.duration),this.percentComplete=this.timeToPercentage(t.seconds);const e=this.config["end-at"];if(e&&t.seconds>=e){this.onVimeoEnded();return}this.dispatchEvent("vb-timeupdate")}async onVideoPlay(){this.currentState="playing",this.initialPlay||(this.initialPlay=!0,this.iframe&&(this.iframe.style.opacity="1")),await this.player.setLoop(this.config.loop);const t=this.config["start-at"],e=this.config["end-at"];if(t&&this.currentTime<t&&await this.player.setCurrentTime(t),e&&this.currentTime>=e){this.onVimeoEnded();return}this.dispatchEvent("vb-play")}onVideoPause(){this.currentState="paused",this.dispatchEvent("vb-pause")}onVimeoEnded(){this.currentState="ended",this.onVideoEnded()}play(){var t;this.paused=!1,(t=this.player)==null||t.play()}pause(){var t;this.paused=!0,(t=this.player)==null||t.pause()}softPlay(){var t;this.paused||(t=this.player)==null||t.play()}softPause(){var t;this.paused||(t=this.player)==null||t.pause()}mute(){var t;this.muted=!0,(t=this.player)==null||t.setMuted(!0),this.dispatchEvent("vb-mute")}unmute(){var t;this.muted=!1,(t=this.player)==null||t.setMuted(!1),this.dispatchEvent("vb-unmute")}seek(t){this.seekTo(this.percentageToTime(t))}async seekTo(t){this.player&&await this.player.setCurrentTime(t)}setVolume(t){var e;this.volume=t,(e=this.player)==null||e.setVolume(t)}async getVolume(){return this.player?this.player.getVolume():this.volume}setSource(t){this.config["video-id"]=t,this.iframe&&(this.iframe.src=this.generateSrcURL())}destroy(){var t;(t=this.player)==null||t.destroy(),this.player=null,this.iframe=null,this.playerElement=null}}const R={mp4:"video/mp4",webm:"video/webm",ogv:"video/ogg",ogg:"video/ogg",mov:"video/mp4",m4v:"video/mp4",avi:"video/mp4",qt:"video/mp4"};function U(r){var e;const t=((e=r.split("?")[0].split(".").pop())==null?void 0:e.toLowerCase())??"";return R[t]??"video/mp4"}class O extends y{constructor(t,e,i){super(t,e,i),this.video=null}init(){const t=document.createElement("video");t.setAttribute("playsinline",""),t.setAttribute("tabindex","-1"),t.setAttribute("aria-hidden","true"),this.config.muted&&t.setAttribute("muted",""),this.config.autoplay&&t.setAttribute("autoplay",""),t.muted=this.config.muted,t.loop=this.config.loop,t.autoplay=this.config.autoplay,t.volume=this.config.volume,this.stylePlayerElement(t),this.appendSource(t,this.config.src),this.container.appendChild(t),this.video=t,this.playerElement=t,t.addEventListener("loadedmetadata",()=>this.onLoadedMetadata()),t.addEventListener("durationchange",()=>this.onDurationChange()),t.addEventListener("canplay",()=>this.onCanPlay()),t.addEventListener("timeupdate",()=>this.onVideoTimeUpdate()),t.addEventListener("play",()=>this.onVideoPlay()),t.addEventListener("pause",()=>this.onVideoPause()),t.addEventListener("waiting",()=>{this.currentState="buffering"}),t.addEventListener("ended",()=>{this.currentState="ended",this.onVideoEnded()})}appendSource(t,e){const i=document.createElement("source");i.src=e,i.type=U(e),t.appendChild(i)}onLoadedMetadata(){this.video&&this.setDuration(this.video.duration)}onDurationChange(){this.video&&this.setDuration(this.video.duration)}onCanPlay(){var t;if(this.mobileLowBatteryAutoplayHack(),!this.initialPlay&&this.config.autoplay&&(this.isIntersecting||this.config["always-play"])){const e=(t=this.video)==null?void 0:t.play();e&&e.catch(()=>{})}this.dispatchEvent("vb-ready")}onVideoTimeUpdate(){if(!this.video)return;this.currentTime=this.video.currentTime,this.percentComplete=this.timeToPercentage(this.video.currentTime);const t=this.config["end-at"];if(t&&this.video.currentTime>=t){this.onVideoEnded();return}this.dispatchEvent("vb-timeupdate")}onVideoPlay(){this.currentState="playing",this.initialPlay||(this.initialPlay=!0,this.video&&(this.video.style.opacity="1"));const t=this.config["start-at"];t&&this.video&&this.video.currentTime<t&&(this.video.currentTime=t),this.dispatchEvent("vb-play")}onVideoPause(){this.currentState="paused",this.dispatchEvent("vb-pause")}play(){var t;this.paused=!1,(t=this.video)==null||t.play()}pause(){var t;this.paused=!0,(t=this.video)==null||t.pause()}softPlay(){var t;this.paused||(t=this.video)==null||t.play()}softPause(){var t;this.paused||(t=this.video)==null||t.pause()}mute(){this.muted=!0,this.video&&(this.video.muted=!0),this.dispatchEvent("vb-mute")}unmute(){this.muted=!1,this.video&&(this.video.muted=!1),this.dispatchEvent("vb-unmute")}seek(t){this.seekTo(this.percentageToTime(t))}seekTo(t){this.video&&("fastSeek"in this.video?this.video.fastSeek(t):this.video.currentTime=t)}setVolume(t){this.volume=t,this.video&&(this.video.volume=t)}getVolume(){return this.video?this.video.volume:this.volume}setSource(t){this.video&&(this.config.src=t,this.video.innerHTML="",this.appendSource(this.video,t),this.video.load())}destroy(){this.video&&(this.video.pause(),this.video.src="",this.video.innerHTML=""),this.video=null,this.playerElement=null,this.player=null}}const g='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>',w='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',k='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',E='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';function B(r,t){const e=document.createElement("button");e.className="vb-btn vb-play-btn",e.setAttribute("part","play-btn"),e.setAttribute("role","switch"),e.setAttribute("aria-pressed",String(!r.paused)),e.setAttribute("aria-label",r.paused?"Play":"Pause"),e.innerHTML=r.paused?g:w;function i(){const s=r.currentState==="playing";e.innerHTML=s?w:g,e.setAttribute("aria-pressed",String(s)),e.setAttribute("aria-label",s?"Pause":"Play")}return e.addEventListener("click",()=>{r.currentState==="playing"?r.pause():r.play()}),t.addEventListener("vb-play",i),t.addEventListener("vb-pause",i),t.addEventListener("vb-ended",i),e}function N(r,t){const e=document.createElement("button");e.className="vb-btn vb-mute-btn",e.setAttribute("part","mute-btn"),e.setAttribute("role","switch"),e.setAttribute("aria-pressed",String(r.muted)),e.setAttribute("aria-label",r.muted?"Unmute":"Mute"),e.innerHTML=r.muted?E:k;function i(){e.innerHTML=r.muted?E:k,e.setAttribute("aria-pressed",String(r.muted)),e.setAttribute("aria-label",r.muted?"Unmute":"Mute")}return e.addEventListener("click",()=>{r.muted?r.unmute():r.mute(),i()}),t.addEventListener("vb-mute",i),t.addEventListener("vb-unmute",i),e}function D(r,t){const e=document.createElement("div");e.className="vb-seek-bar",e.setAttribute("part","seek-bar");const i=document.createElement("progress");i.className="vb-seek-progress",i.setAttribute("min","0"),i.setAttribute("max","100"),i.value=0,i.setAttribute("aria-hidden","true");const s=document.createElement("input");s.type="range",s.className="vb-seek-range",s.setAttribute("aria-label","Seek"),s.min="0",s.max="100",s.step="0.1",s.value="0",e.appendChild(i),e.appendChild(s);let n=!1,o=null;function h(l){i.value=l,s.value=String(l)}return s.addEventListener("input",()=>{n=!0,i.value=parseFloat(s.value)}),s.addEventListener("change",()=>{r.seek(parseFloat(s.value)),o&&cancelAnimationFrame(o),o=requestAnimationFrame(()=>{n=!1,o=null})}),t.addEventListener("vb-timeupdate",()=>{n||h(r.percentComplete)}),t.addEventListener("vb-ended",()=>{h(0)}),e}const H=["src","autoplay","muted","loop","mobile","volume","start-at","end-at","play-button","mute-button","seek-bar","poster","aspect-ratio","no-cookie","fit-box","lazy","always-play","force-on-low-battery","title"];class T extends HTMLElement{constructor(){super(),this.provider=null,this.config={...a},this.resizeObserver=null,this.intersectionObserver=null,this.initialized=!1,this.onVisibilityChange=()=>{this.provider&&(document.hidden?this.provider.softPause():(this.provider.isIntersecting||this.config["always-play"])&&this.provider.softPlay())},this.shadow=this.attachShadow({mode:"open"});const t=document.createElement("style");t.textContent=C,this.shadow.appendChild(t),this.wrapper=document.createElement("div"),this.wrapper.className="vb-wrapper",this.playerContainer=document.createElement("div"),this.playerContainer.className="vb-player",this.posterEl=document.createElement("div"),this.posterEl.className="vb-poster",this.posterEl.setAttribute("aria-hidden","true"),this.controlsEl=document.createElement("div"),this.controlsEl.className="vb-controls",this.controlsEl.setAttribute("aria-label","Video controls");const e=document.createElement("div");e.className="vb-overlay",this.overlaySlot=document.createElement("slot"),e.appendChild(this.overlaySlot),this.wrapper.appendChild(this.playerContainer),this.wrapper.appendChild(this.posterEl),this.wrapper.appendChild(this.controlsEl),this.wrapper.appendChild(e),this.shadow.appendChild(this.wrapper)}static get observedAttributes(){return[...H]}connectedCallback(){this.readAttributes(),this.initProvider()}disconnectedCallback(){this.destroy()}attributeChangedCallback(t,e,i){var s,n,o;if(e!==i){if(t==="src"&&this.initialized){this.destroy(),this.readAttributes(),this.initProvider();return}if(t==="volume"&&i!==null){const h=parseFloat(i);isNaN(h)||(s=this.provider)==null||s.setVolume(Math.max(0,Math.min(1,h)))}t==="muted"&&(i!==null&&i!=="false"?(n=this.provider)==null||n.mute():(o=this.provider)==null||o.unmute()),(t==="play-button"||t==="mute-button"||t==="seek-bar")&&this.provider&&(this.config[t]=i!==null&&i!=="false",this.buildControls()),t==="poster"&&(this.config.poster=i,this.setPoster())}}readAttributes(){const t=o=>this.getAttribute(o),e=(o,h)=>{const l=t(o);return l===null?h:l!=="false"},i=(o,h)=>{const l=t(o);return l!==null&&!isNaN(parseFloat(l))?parseFloat(l):h},s=t("src")??"",n=m(s);this.config={...a,src:s,autoplay:e("autoplay",a.autoplay),muted:e("muted",a.muted),loop:e("loop",a.loop),mobile:e("mobile",a.mobile),volume:i("volume",a.volume),"start-at":i("start-at",a["start-at"]),"end-at":i("end-at",a["end-at"]),"play-button":e("play-button",a["play-button"]),"mute-button":e("mute-button",a["mute-button"]),"seek-bar":e("seek-bar",a["seek-bar"]),poster:t("poster"),"aspect-ratio":t("aspect-ratio")??a["aspect-ratio"],"no-cookie":e("no-cookie",a["no-cookie"]),"fit-box":e("fit-box",a["fit-box"]),lazy:e("lazy",a.lazy),"always-play":e("always-play",a["always-play"]),"force-on-low-battery":e("force-on-low-battery",a["force-on-low-battery"]),title:t("title")??a.title,"video-id":(n==null?void 0:n.id)??"","unlisted-hash":(n==null?void 0:n.unlisted)??""},this.config.autoplay&&f()&&(this.config.muted=!0)}initProvider(){const t=this.config.src;if(!t)return;if(!this.config.mobile&&f()){this.showPosterOnly();return}const e=m(t);if(!e)return;const i=e.type;this.setPoster();let s;i==="youtube"?s=new z(this.config,this.playerContainer,this):i==="vimeo"?s=new I(this.config,this.playerContainer,this):s=new O(this.config,this.playerContainer,this),this.provider=s,this.initialized=!0;const n=()=>{const o=s.init();o instanceof Promise&&o.catch(h=>console.error("[video-background] Provider init error:",h)),this.buildControls(),this.setupObservers()};if(this.config.lazy&&"IntersectionObserver"in window){const o=new IntersectionObserver(h=>{var l;(l=h[0])!=null&&l.isIntersecting&&(o.disconnect(),n())},{threshold:0});o.observe(this)}else n()}setPoster(){let t=this.config.poster;if(!t){const e=m(this.config.src);if((e==null?void 0:e.type)==="youtube"&&e.id)t=`https://img.youtube.com/vi/${e.id}/hqdefault.jpg`;else if((e==null?void 0:e.type)==="vimeo"&&e.id){const i=e.unlisted?`/${e.unlisted}`:"";t=`https://vumbnail.com/${e.id}${i}.jpg`}}this.posterEl.style.backgroundImage=t?`url(${t})`:""}showPosterOnly(){this.posterEl.style.opacity="1"}buildControls(){this.controlsEl.innerHTML="",this.provider&&(this.config["play-button"]&&this.controlsEl.appendChild(B(this.provider,this)),this.config["mute-button"]&&this.controlsEl.appendChild(N(this.provider,this)),this.config["seek-bar"]&&this.controlsEl.appendChild(D(this.provider,this)))}setupObservers(){!this.config["always-play"]&&"IntersectionObserver"in window?(this.intersectionObserver=new IntersectionObserver(t=>{const e=t[0];!e||!this.provider||(this.provider.isIntersecting=e.isIntersecting,e.isIntersecting?this.provider.softPlay():this.provider.softPause())},{threshold:0}),this.intersectionObserver.observe(this)):this.provider&&(this.provider.isIntersecting=!0),"ResizeObserver"in window&&(this.resizeObserver=new ResizeObserver(()=>{var t;return(t=this.provider)==null?void 0:t.resize()}),this.resizeObserver.observe(this)),document.addEventListener("visibilitychange",this.onVisibilityChange)}destroy(){var t,e,i;(t=this.resizeObserver)==null||t.disconnect(),(e=this.intersectionObserver)==null||e.disconnect(),document.removeEventListener("visibilitychange",this.onVisibilityChange),(i=this.provider)==null||i.destroy(),this.provider=null,this.playerContainer.innerHTML="",this.controlsEl.innerHTML="",this.initialized=!1}play(){var t;(t=this.provider)==null||t.play()}pause(){var t;(t=this.provider)==null||t.pause()}mute(){var t;(t=this.provider)==null||t.mute()}unmute(){var t;(t=this.provider)==null||t.unmute()}seek(t){var e;(e=this.provider)==null||e.seek(t)}seekTo(t){var e;(e=this.provider)==null||e.seekTo(t)}setVolume(t){var e;(e=this.provider)==null||e.setVolume(t)}get currentTime(){var t;return((t=this.provider)==null?void 0:t.currentTime)??0}get duration(){var t;return((t=this.provider)==null?void 0:t.duration)??0}get percentComplete(){var t;return((t=this.provider)==null?void 0:t.percentComplete)??0}get paused(){var t;return((t=this.provider)==null?void 0:t.paused)??!0}get activeProvider(){return this.provider}get src(){return this.getAttribute("src")??""}set src(t){this.setAttribute("src",t)}get volume(){return parseFloat(this.getAttribute("volume")??"1")}set volume(t){this.setAttribute("volume",String(t))}get poster(){return this.getAttribute("poster")}set poster(t){t===null?this.removeAttribute("poster"):this.setAttribute("poster",t)}}customElements.get("video-background")||customElements.define("video-background",T),d.VideoBackgroundElement=T,Object.defineProperty(d,Symbol.toStringTag,{value:"Module"})}));
