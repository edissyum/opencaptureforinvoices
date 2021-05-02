import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { LoginRedirectService } from '../services/login-redirect.service';
import { LoginRequiredService } from '../services/login-required.service';
import { PrivilegesService } from "../services/privileges.service";

import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from "./not-found/not-found.component";
import { RegisterComponent } from "./register/register.component";
import { UserProfileComponent } from "./profile/profile.component";
import { SplitterViewerComponent } from "./splitter/viewer/viewer.component";
import { SplitterListComponent } from "./splitter/list/list.component";
import { VerifierViewerComponent } from './verifier/viewer/viewer.component';
import { VerifierListComponent } from './verifier/list/list.component';
import { UploadComponent } from "./upload/upload.component";
import { HasPrivilegeService } from "../services/has-privilege.service";

const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent , data: { title: marker('GLOBAL.home'), image: 'assets/imgs/logo_opencapture.png' }, canActivate: [LoginRequiredService]},
    {path: 'login', component: LoginComponent , data: { title: marker('GLOBAL.login')}, canActivate: [LoginRedirectService]},
    {path: 'register', component: RegisterComponent , data: { title: marker('GLOBAL.register')}, canActivate: [LoginRedirectService]},
    {path: 'logout', component: LogoutComponent , canActivate: [LoginRequiredService]},
    {path: 'profile/:id', component: UserProfileComponent, canActivate: [LoginRequiredService]},

    {
        path: 'splitter/viewer/:id',
        component: SplitterViewerComponent,
        data: {title: marker('SPLITTER.viewer'), privilege: 'splitter' },
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'splitter/list',
        component: SplitterListComponent,
        data: {title: marker('SPLITTER.list'), privilege: 'splitter'},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ],

    },
    {path: 'splitter', redirectTo: 'splitter/list', pathMatch: 'full'},

    {
        path: 'verifier/viewer',
        component: VerifierViewerComponent,
        data: {title: marker('VERIFIER.viewer'), privilege: 'verifier'},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'verifier/list',
        component: VerifierListComponent,
        data: {title: marker('VERIFIER.list'), privilege: 'verifier'},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {path: 'verifier', redirectTo: 'verifier/list', pathMatch: 'full'},
    {
        path: 'upload',
        component: UploadComponent,
        data: {title: marker('GLOBAL.upload'), privilege: 'upload'},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },

    {path: '404', component: NotFoundComponent}, // This two routes (** and 404) need to be the last of const routes: Routes variable
    {path: '**', redirectTo: '404'}, // if routes doesn't exists, redirect to 404, display a popup and then redirect to login
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {useHash: true})
    ],
    exports: [RouterModule]
})

export class AppRoutingModule {}
