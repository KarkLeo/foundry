import path from"path";export default class AbstractFileStorage{constructor(t,...e){this.storageName=t}get configuration(){const t=config.files.configuration;return this.storageName in t||(t[this.storageName]={}),t[this.storageName]}async createDirectory(t,e={}){throw new Error("Not Implemented")}async getFiles({target:t,extensions:e,wildcard:r,bucket:o,type:a}={}){throw new Error("Not Implemented")}async upload(t,e={}){throw new Error("Not Implemented")}toClientPaths(t,e){return t.map((t=>this.toClientPath(t,e)))}toClientPath(t,e){throw new Error("Not Implemented")}}