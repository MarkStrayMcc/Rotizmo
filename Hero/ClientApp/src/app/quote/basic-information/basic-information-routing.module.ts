import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import DeactivateGuard from '@app/routeguards/deactivate-guard/deactivate-guard';
import { BasicInformationShellComponent } from './basic-information-shell/basic-information-shell.component';

const appRoutes = [
    { path: "quote/basic-information", component: BasicInformationShellComponent, canDeactivate: [DeactivateGuard] }
];

@NgModule({
    imports: [
      RouterModule.forRoot(appRoutes)
    ],
    exports: [RouterModule]
})
export class BasicInformationRoutingModule { }