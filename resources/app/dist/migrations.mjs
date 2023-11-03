import{DOCUMENT_OWNERSHIP_LEVELS}from"../common/constants.mjs";import{isEmpty}from"../common/utils/helpers.mjs";import{createPassword}from"./core/auth.mjs";import*as path from"path";import*as fs from"fs";import Files from"./files/files.mjs";async function migrateExtractBase64(e){for(const e of db.documents){logger.info(`Extracting base64 data for ${e.documentName} documents`);const t=await e.find();await Promise.all(t.map((async t=>{try{const a=await e.sanitizeUserInput(t.toObject()),o=t.updateSource(a);if(!isEmpty(o))return t.save()}catch(e){logger.warn(e)}})))}}async function migrateJournalEntryPages(e){const t=await db.JournalEntry.find();for(const e of t)e.save()}async function migrateDeleteFOW(e){logger.info("Clearing legacy fog of war storage."),await db.FogExploration.db.clear()}async function migrateDarknessActivationRange(e){logger.info("Migrating darkness activation thresholds for Ambient Light sources");const t=await db.Scene.find();for(let e of t){let t=!1;for(let a of e.lights)a.darknessThreshold&&(a.updateSource({"darkness.min":a.darknessThreshold,"darkness.max":1,darknessThreshold:0}),t=!0);t&&(e.save(),logger.info(`Migrated darkness activation thresholds for light sources in Scene ${e.name}`))}}async function migrateWallSoundRestriction(e){logger.info("Migrating sound restriction for Wall objects.");const t=await db.Scene.find();for(let e of t){let t=!1;for(let a of e.walls)void 0!==a.sense&&(a.updateSource({sound:a.sense}),t=!0);t&&(e.save(),logger.info(`Migrated sound restriction for Wall objects in Scene ${e.name}`))}}async function migrateActiveEffectOrigins(e){const t=[db.Actor,db.Item];for(let e of t){logger.info(`Migrating Active Effect origin identifiers for ${e.documentName} documents`);const t=await e.find();for(let e of t){let t=!1;for(let a of e.effects)a.origin&&-1!==a.origin.indexOf("OwnedItem")&&(a.updateSource({origin:a.origin.replace("OwnedItem","Item")}),t=!0);t&&await e.save()}}}async function migrateSceneDefaultPermission(e){const t=await db.Scene.find();logger.info(`Migrating default Scene ownership for ${t.length} Scenes`);for(let e of t)e.updateSource({"ownership.default":Math.min(e.ownership.default,DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)}),await e.save();logger.info(`Completed default ownership migration for ${t.length} Scenes`)}async function migrateUserPasswords(e){const t=await db.User.find();logger.info(`Migrating access keys to passwords for ${t.length} Users`);for(let e of t){if(e.passwordSalt)continue;const{hash:t,salt:a}=createPassword(e.password);e.updateSource({password:t,passwordSalt:a}),await e.save()}logger.info(`Completed migration of access keys to passwords for ${t.length} Users`)}async function migrateChatMessages(e){const t=path.join(e.path,"data","chat.db"),a=path.join(e.path,"data","messages.db"),o=fs.statSync(a,{throwIfNoEntry:!1});if(o&&!(o.size>0)&&fs.existsSync(t)){logger.info(`Migrating ChatMessage database. Copying '${t}' -> '${a}'`),await db.ChatMessage.disconnect();try{await Files.copyLargeFile(t,a)}catch(e){return void logger.error(`Migration failed: ${e.message}`)}return fs.unlinkSync(t),db.ChatMessage.connect()}}async function migrateCompendiumEntityField(e){e.data.packs?.length&&e.data._source.packs.forEach((e=>{e.entity&&(e.type||(e.type=e.entity))}))}export default{"0.7.3":[migrateDeleteFOW],"0.8.1":[migrateDarknessActivationRange,migrateWallSoundRestriction],"0.8.4":[migrateActiveEffectOrigins],"0.8.7":[migrateUserPasswords,migrateSceneDefaultPermission],9.224:[migrateChatMessages],9.225:[migrateCompendiumEntityField],10.262:[migrateExtractBase64],10.263:[migrateJournalEntryPages]};