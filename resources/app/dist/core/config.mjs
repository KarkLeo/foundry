import crypto from"crypto";import fs from"fs";import os from"os";import path from"path";import{ApplicationConfiguration}from"../../common/config.mjs";import*as fields from"../../common/data/fields.mjs";import{PASSWORD_SAFE_STRING}from"../../common/constants.mjs";import{getSalt,hashPassword}from"./auth.mjs";import{mergeObject}from"../../common/utils/helpers.mjs";import Files from"../files/files.mjs";import License from"./license.mjs";class ConfigPathField extends fields.StringField{static get _defaults(){return mergeObject(super._defaults,{required:!0,blank:!1,nullable:!0,initial:null,mustExist:!0})}_validateType(e){const i=path.isAbsolute(e)?e:path.join(paths.config,e);if(this.mustExist&&!fs.existsSync(i))throw new Error(`File path "${i}" does not exist`)}_cast(e){return Files.standardizePath(e)}initialize(e,i,t={}){return null===e?null:path.isAbsolute(e)?e:path.join(paths.config,e)}}export default class ServerConfiguration extends ApplicationConfiguration{static defineSchema(){const e=super.defineSchema();return e.awsConfig=new ConfigPathField(e.awsConfig.options),e.dataPath=new ConfigPathField({validate:this._validateDataPath,mustExist:!1,...e.dataPath.options}),e.demo=new fields.SchemaField({worldName:new fields.StringField({required:!0,blank:!1,nullable:!0,initial:null}),sourceZip:new ConfigPathField({initial:null}),resetSeconds:new fields.NumberField({required:!0,integer:!0,positive:!0,initial:3600})}),e.serviceConfig=new ConfigPathField,e.sslCert=new ConfigPathField(e.sslCert.options),e.sslKey=new ConfigPathField(e.sslKey.options),e.hotReload=new fields.BooleanField({initial:!1}),e}debug;noupdate;noIPDiscovery;demoMode;isElectron;isNode;isSSL;service;static _validateDataPath(e){const i=global.paths,t=path.dirname(i.root),s="resources"===path.basename(t)?path.dirname(t):i.root,o=path.relative(s,e);if(!o.startsWith("..")&&!path.isAbsolute(o))throw new Error(`The data path ${e} must not be inside the application location ${i.root}.`)}initialize(e){this.isElectron=process.versions.hasOwnProperty("electron"),this.isNode=!this.isElectron,this.isSSL=!!this.sslKey&&!!this.sslCert,"port"in e&&(this.validate({changes:{port:e.port},clean:!0,fallback:!1}),this.port=Number(e.port)),!0===e.noupnp&&(this.upnp=!1),!0===e.hotReload&&(this.hotReload=!0),e.world&&(this.world=String(e.world)),this.debug=e.debug&&fs.existsSync(`${paths.root}/server`),this.noupdate=!!e.noupdate,this.noIPDiscovery=!!e.noipdiscovery,e.nobackups&&this.updateSource({noBackups:!0}),e.demo&&this._initializeDemoMode(e.demo),this.demoMode=!!this.demo.sourceZip,"adminPassword"in e&&!this.adminPassword&&this.setAdministratorPassword(e.adminPassword),this.service="serviceKey"in e?this._initializeServiceProvider(e.serviceKey):{id:os.hostname().replace(/[^\x00-\x7F]/g,"?")},this.log()}_initializeServiceProvider(e){if(!this.serviceConfig)throw new Error("A serviceKey was provided but no service configuration file is present.");const i=JSON.parse(fs.readFileSync(this.serviceConfig,"utf8")),t=crypto.createPublicKey(License.PUBLIC_KEY),s=crypto.createVerify("SHA256"),o=JSON.stringify({id:i.id,key:e});if(s.write(o),s.end(),!s.verify(t,i.signature,"base64"))throw new Error("Invalid service configuration provider credentials");return logger.info(`Service provider configuration successfully loaded for ${i.id}`),i.key=e,i}_initializeDemoMode(e){if(e=fs.existsSync(e)?e:path.join(paths.config,e),!fs.existsSync(e))throw new Error(`Invalid demo mode configuration path ${e}`);const i=JSON.parse(fs.readFileSync(e,"utf8"));this.updateSource({demo:i})}save(e){e=e??global.paths.options;const i=this.toObject();return delete i.adminPassword,delete i.noBackups,this.demoMode||delete i.demo,fs.writeFileSync(e,JSON.stringify(i,null,2)),logger.info(`Saved application configuration options to ${e}`),this}static load(){const e=global.paths,i=JSON.parse(fs.readFileSync(e.options,"utf8"));i.dataPath=e.user;const t=path.join(e.config,"admin.txt");i.adminPassword=fs.existsSync(t)?fs.readFileSync(t,"utf8"):null;const s=new this(i,{strict:!0,fallback:!0});for(const e of Object.values(s.validationFailures))e&&global.startupMessages.push({level:"error",message:e.toString()});return s}vend(){const e=this.toObject();for(let i of Object.keys(e))ApplicationConfiguration.schema.has(i)||delete e[i];return e}log(e){e=e||global.logger;const i=this.toObject(),t=e=>e&&"string"==typeof e?"*".repeat(6)+"/"+path.basename(e):e;for(let e of["awsConfig","sslKey","sslCert","serviceConfig"])i[e]=t(i[e]);i.demo.sourceZip=t(i.demo.sourceZip),delete i.dataPath,this.adminPassword&&(i.adminPassword=PASSWORD_SAFE_STRING),this.demoMode||delete i.demo,e.info(`Application Options:\n${JSON.stringify(i,null,2)}`)}setAdministratorPassword(e){if(e===PASSWORD_SAFE_STRING)return!1;const i=path.join(global.paths.config,"admin.txt");if(!e){if("adminPassword"in this.update({adminPassword:null})){try{fs.unlinkSync(i)}catch(e){}return!0}return!1}if("string"!=typeof e)throw new Error("The administrator password must be a string");const t=getSalt(this.passwordSalt),s=hashPassword(e,t);return"adminPassword"in this.update({adminPassword:s})&&(fs.writeFileSync(i,s),logger.info(`Server administrator password updated in "${i}"`),!0)}}