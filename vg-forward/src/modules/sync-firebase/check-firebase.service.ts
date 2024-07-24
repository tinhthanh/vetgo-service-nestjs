import { Injectable, Logger } from "@nestjs/common";
import { FirebaseCurlService } from "../firebase/firebase-curl.service";
import { FirebaseUtilService } from "../firebase/firebase-util.service";
import { GithubService } from "../github/github.service";
import { TelegramService } from "../telegram/telegram.service";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

// tính năng này để kéo nhưng thú cưng bi thieu
@Injectable()
export class CheckFirebaseService {
    private readonly logger = new Logger(CheckFirebaseService.name);
    private readonly  config = {
        'petplus2025': {
          firebase: {
            apiKey: "AIzaSyCEb0Gmc3Ull2ENRp78H6MUWOYFnF1iTVo",
            authDomain: "petplus2025.firebaseapp.com",
            databaseURL: "https://petplus2025-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "petplus2025",
            storageBucket: "petplus2025.appspot.com",
            messagingSenderId: "329671720857",
            appId: "1:329671720857:web:6666065878760afbafdd08",
            measurementId: "G-WPENH7P36Z"
          },
          retailer: 'petplus2025',
          sheetId: "AKfycbwoR88HlfAJ0o0hFapH_NfhbRBlwlk1GSEnk60SAO7LXqHFATwZwDdc95Uu5TL-2FJq"
        }
      };
      constructor(
        private readonly firebase: FirebaseCurlService,
        private readonly firebaseAuth: FirebaseUtilService,
        private readonly githubService: GithubService,
        private readonly bot: TelegramService,
        private readonly httpService: HttpService
      ) {}
    async  checkData() {
        for (const [key, value] of Object.entries(this.config)) { 
            const mCus = await  this.githubService.getTable(key, 'CUSTOMER');
            const mPet = await  this.githubService.getTable(key, 'PET');
            if(mPet) {
              const listPet =  Object.values(mPet);
               for(let i = 0 ; i < listPet.length ; i++) {
                 if(!mCus[(listPet[i] as any)?.customerId] && ((listPet[i] as any).id || '').startsWith('E')) {
                    console.warn(listPet[i]);

                 }
               }
            }
          const mHistory = await  this.githubService.getTable(key, 'HISTORY');
          if(mHistory) {
            const listH =  Object.values(mHistory);
            for(let i = 0 ; i < listH.length ; i++) {
                const h = (listH[i] as any);
              if(h?.doctorId !== 'ADMIN' && (!mCus[h?.customerId] || !mPet[h?.petId])) {
                //  console.warn(listH[i]);
                
                  if(!mCus[h?.customerId]) { // khong co khach hang di qau chu nhat lay
                    const cus = await this.getCusById(h.customerId ,key );
                    if(cus?.status === 404) {
                      console.error('Không tìm thấy từ server chú nhất');
                   } else {
                      // recheck data
                      if(cus && cus.id === h?.customerId) {
                          // di sync data
                        //  console.warn(cus);
                        const token = await firstValueFrom(this.firebaseAuth.getToken(value.firebase.apiKey));
                        this.logger.log("Token : " + token);
                        console.warn(cus);
                        await this.firebase.updateById(value.firebase.databaseURL, 'CUSTOMER' , h?.customerId , cus, token);
                        break
                      } else {
                          console.error('id meo giong');
                      }
                   }
                  }
                  if(!mPet[h?.petId]) { // khong co thu cung di qua chu nhat lay
                    const pet = await this.getPetById(h.petId ,key );
                    if(pet?.status === 404) {
                       console.error('Không tìm thấy từ server chú nhất' ,h.petId );
                    } else {
                       // recheck data
                       if(pet && pet.id === h.petId) {
                           // di sync data
                           const token = await firstValueFrom(this.firebaseAuth.getToken(value.firebase.apiKey));
                           this.logger.log("Token : " + token);
                           await this.firebase.updateById(value.firebase.databaseURL, 'PET' , pet.id , pet, token);
                           this.logger.log("sync done ",  pet.id );
                       } else {
                           console.error('id meo giong');
                       }
                    }
                  }
                
              }
            }
            this.logger.log('Done');
          }
        }
      }
      async getPetById(id: string, realm: string): Promise<any> {
        const url = `https://api.moonpet.vn/public/api/dynamic/table/PET/${id}`;
        const headers = {
          'realm': realm,
        };
        try {
          const response = await firstValueFrom(
            this.httpService.get(url, { headers })
          );
          return response.data;
        } catch (error) {
          console.error(error);
          throw new Error('Failed to fetch data');
        }
      }
      async getCusById(id: string, realm: string): Promise<any> {
        const url = `https://api.moonpet.vn/public/api/dynamic/table/CUSTOMER/${id}`;
        const headers = {
          'realm': realm,
        };
        try {
          const response = await firstValueFrom(
            this.httpService.get(url, { headers })
          );
          return response.data;
        } catch (error) {
          console.error(error);
          throw new Error('Failed to fetch data');
        }
      }
      async  syncCusById(phone: string) {
        for (const [key, value] of Object.entries(this.config)) { 
          const cus = await this.getCusById(phone ,key );
          if(cus?.status === 404) {
            console.error('Không tìm thấy từ server chú nhất');
         } else { 
          const token = await firstValueFrom(this.firebaseAuth.getToken(value.firebase.apiKey));
          this.logger.log("Token : " + token);
          this.logger.log(cus);
          await this.firebase.updateById(value.firebase.databaseURL, 'CUSTOMER' ,phone , cus, token);
          this.logger.log("DONE : ");
         }
        }
      }
}