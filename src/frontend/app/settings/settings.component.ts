import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { Location } from '@angular/common';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {SettingsService} from "../../services/settings.service";

@Component({
    selector: 'app-panel',
    template: ``
})

export class SettingsComponent implements OnInit {
    isMenuOpen : boolean            = this.serviceSettings.getIsMenuOpen();
    selectedSetting : string        = this.serviceSettings.getSelectedSetting();
    selectedParentSetting : string  = this.serviceSettings.getSelectedParentSetting();
    settingListOpenState : boolean  = this.serviceSettings.getSettingListOpenState();
    settings : any                  = this.serviceSettings.getSettings()

    constructor(
        private http: HttpClient,
        private router: Router,
        public userService: UserService,
        public serviceSettings: SettingsService,
    ) { }

    ngOnInit(): void {
        this.serviceSettings.init()
        this.selectedSetting = this.serviceSettings.getSelectedSetting();
        this.selectedParentSetting = this.serviceSettings.getSelectedParentSetting();
        this.settings = this.serviceSettings.getSettings();
        this.settings[this.selectedParentSetting].forEach((element: any) =>{
            if (element['id'] == this.selectedSetting){
                let routeToGo = element.route;
                if (routeToGo)
                    this.router.navigateByUrl(routeToGo);
            }
        })
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
}
