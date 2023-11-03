import{BaseModule}from"../../common/packages/module.mjs";import{isNewerVersion}from"../../common/utils/helpers.mjs";import ServerPackageMixin from"./package.mjs";import Collection from"../../common/utils/collection.mjs";import path from"path";import fs from"fs";import Files from"../files/files.mjs";export default class Module extends(ServerPackageMixin(BaseModule)){static#e;static getPackages({system:e,coreTranslation:t=!1,enforceCompatibility:s=!1}={}){return super.getPackages({enforceCompatibility:s}).reduce(((s,i)=>(t&&!i.providesCoreTranslation||e&&!i.supportsSystem(e)||s.set(i.id,i),s)),new Collection)}static getCoreTranslationOptions(){const e=this.getPackages({coreTranslation:!0}).reduce(((e,t)=>{let s=new Set;for(let i of t.languages){const a=e[i.lang]=e[i.lang]||{id:i.lang,label:"",modules:[]};a.label||(a.label=i.name),s.has(i.lang)||a.modules.push({id:t.id,label:t.title,path:i.path}),s.add(i.lang)}return e}),{en:{id:"en",label:"English",modules:[{id:"core",label:"Default",path:"lang/en.json"}]}});let t=[e.en];return e.en.modules=e.en.modules.slice(0,1),delete e.en,t.concat(Object.values(e))}static getCoreTranslationStyles(){if(!this.#e){const e=(config.options.language??"en.core").split(".")[1],t=this.getPackages({coreTranslation:!0}).get(e);this.#e=t?.styles||[]}return this.#e}get providesCoreTranslation(){return this.coreTranslation&&this.languages.size}isCompatibleWithSystem(e){if(!this.relationships?.systems?.size)return!0;const t=this.relationships.systems.find((t=>t.id===e.id));return!!t&&this.constructor.testDependencyCompatibility(t.compatibility,e)}supportsSystem(e){return!this.relationships?.systems?.size||!!this.relationships.systems.find((t=>t.id===e.id))}static create(e){if(e.id=e.id.slugify({strict:!0}),e.id.startsWith(".."))throw new Error("You are not allowed to create a Module outside of the modules directory path.");const t=path.join(this.baseDir,e.id);if(fs.existsSync(t))throw new Error(`A Module already exists in the requested directory ${e.id}.`);const s=new Module(e,{installed:!0});return fs.mkdirSync(t),s.save(),Files.writeFileSyncSafe(path.join(t,".gitattributes"),"packs/** binary\n"),globalThis.logger.info(`${vtt} | Created Module "${s.id}"`),this.packages&&this.packages.set(s.id,s),s.vend()}updateManifest(e){return this.updateSource(e),this.save(),this.vend()}static createOrUpdate(e){const t=this.get(e.id);return t?t.updateManifest(e):this.create(e)}}