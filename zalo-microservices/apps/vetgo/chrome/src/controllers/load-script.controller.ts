import { FirebaseDatabase }  from './common.firebase';
import { environment } from "../environment";
import { RealtimeDbCrud } from './firebase-crud';
import { DeviceRemoteModel } from 'src/models/device-remote.model';

export module LoadScriptController {

    export const loadScriptByDomain  = (domain: string, actionType: string):  Promise<any> => {
        return new Promise( (resolve, _) => {
          const db = new RealtimeDbCrud<DeviceRemoteModel>(FirebaseDatabase);
          db.list(`ENV/${environment.environmentName}/script`).then( (list : any[]) => {
            const l =  (list || []).filter( it => it.domain === domain && it.actionType ===  actionType.toUpperCase());
            if(l.length !== 0) {
              resolve(l[0].code);
            } else {
              resolve("console.log('empty...')");
            }
          });
        });
    }
}