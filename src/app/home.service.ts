import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';


const endpoint = `${environment.url + environment.api}/esapapi001`;

var header = new HttpHeaders().set('Authorization', "Basic " + btoa(environment.auth))


@Injectable({
  providedIn: 'root',
})
export class HomeService {

  //teste ------
  private dadosURL = 'assets/Dados.json';
  private detalheURL = 'assets/detalhe.json';
  //------------

  constructor(private httpClient: HttpClient) {}

  public getDados(filtros:any): Observable<any> {
    return this.httpClient.get<any>(endpoint,{headers:header, params:filtros});
  }

  public getDetalhe(chave: string): Observable<any> {
    return this.httpClient.get<any>(endpoint + '/' + chave,{headers:header});

  }

  public getRelat(filtros:any): Observable<any> {
    return this.httpClient.get<any>(endpoint + '/report',{headers:header, params:filtros});

  }

  public getDados2(): Observable<any> {
    return this.httpClient.get<any>(this.dadosURL);
  }

  public getdetalhe2(): Observable<any> {
    return this.httpClient.get<any>(this.detalheURL);
  }

}
