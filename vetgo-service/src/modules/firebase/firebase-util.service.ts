import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class FirebaseUtilService {
  private readonly logger = new Logger(FirebaseUtilService.name);

  constructor(private readonly httpService: HttpService) {}

   private createUser(userName: string, pwd: string, apiKey: string): Observable<AxiosResponse<{localId: string,idToken: string}>> {
    const createUserUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${apiKey}`;
    const payload = {
      email: userName,
      password: pwd,
      returnSecureToken: true,
    };
      return this.httpService.post(createUserUrl, payload);
  }

  private loginUser(email: string, password: string, apiKey: string): Observable<AxiosResponse<{localId: string,idToken: string}>> {
    const signInUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${apiKey}`;
    const payload = {
      email: email,
      password: password,
      returnSecureToken: true,
    };
      return this.httpService.post(signInUrl, payload).pipe(
        catchError((err) => {
          Logger.log(err);
          return of(err.response.data);
        })
      );
  }

 public getToken(apiKey: string): Observable<string> {
    const defaultUser = {
      userName: "dev.vetgo@gmail.com",
      pwd: "Vetgo@k40cntt",
    };
    try {
    return this.loginUser(defaultUser.userName, defaultUser.pwd, apiKey).pipe(
             switchMap((res) => {
                Logger.log(res);
                if(res.data?.idToken) {
                  Logger.log(res);
                    return of(res.data.idToken);
                } else {
                  Logger.log('--2132321312');
                    return this.createUser(defaultUser.userName, defaultUser.pwd, apiKey).pipe(map((res) => res.data.idToken));
                }
             }),
             catchError((err) => {
              Logger.log(err);
              return this.createUser(defaultUser.userName, defaultUser.pwd, apiKey).pipe(map((res) => res.data.idToken));
             })

        );
    } catch (error) {
      this.logger.error('Failed to get token', error);
      throw error;
    }
  }
}