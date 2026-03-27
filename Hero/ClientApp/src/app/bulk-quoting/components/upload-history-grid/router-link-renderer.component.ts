import { Component, NgZone } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

export interface IRouterLinkRendererComponentOptions {
  routerLinkParams?: any[];
  linkDescription?: string;
  textOnly?: string;
}

@Component({
  template: `
  <a *ngIf="params.textOnly == null; else textOnlyBlock" 
   [routerLink]="params.routerLinkParams">
      {{ params.linkDescription }}
  </a>
`

})
export class RouterLinkRendererComponent implements ICellRendererAngularComp {
  params: IRouterLinkRendererComponentOptions;

  agInit(params: any): void {
      this.params = params.routerLinkRendererComponentOptions(params);
  }

  refresh(params: any): boolean {
      return true;
  }
}