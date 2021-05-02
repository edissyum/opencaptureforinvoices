import {Injectable, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {LocalStorageService} from "./local-storage.service";
import {LastUrlService} from "./last-url.service";
import {Title} from "@angular/platform-browser";

@Injectable({
    providedIn: 'root'
})

export class SettingsService {
    isMenuOpen: boolean = true;
    selectedSetting: string = "users";
    selectedParentSetting: string = "general";
    settingListOpenState: boolean = true;
    settingsParent: any[] = [
        {
            "id": "general",
            "label": this.translate.instant("SETTINGS.general"),
        },
        {
            "id": "splitter",
            "label": this.translate.instant("SETTINGS.splitter"),
        },
    ];
    settings: any = {
        "general": [
            {
                "id"      : "users",
                "label"   : this.translate.instant("SETTINGS.users_list"),
                "icon"    : "fas fa-user",
                "route"   : '/settings/general/users',
                "actions" : [
                    {
                        "id"    : 'users_new',
                        "label" : this.translate.instant("USER.add"),
                        "route" : "/settings/general/users/new",
                        "icon"  : "fas fa-plus"
                    }
                ]
            },
            {
                "id"      : "roles",
                "label"   : this.translate.instant("SETTINGS.roles_list"),
                "icon"    : "fas fa-users",
                "route"   : "/settings/general/roles",
                "actions" : [
                    {
                        "label" : this.translate.instant("ROLE.add"),
                        "route" : "/settings/general/roles/new",
                        "icon"  : "fas fa-plus"
                    }
                ]
            },
            {
                "id": "custom-fields",
                "label": this.translate.instant("SETTINGS.custom_fields"),
                "route"   : "/settings/customFields",
                "icon": "fas fa-code",
            },
            {
                "id": "version-update",
                "label": this.translate.instant("SETTINGS.version_and_update"),
                "icon": "fas fa-sync",
            },
            {
                "id": "about-us",
                "label": this.translate.instant("SETTINGS.abouts_us"),
                "icon": "fas fa-address-card",
            }
        ],
        "splitter": [
            {
                "id": "separator",
                "label": this.translate.instant("SETTINGS.document_separator"),
                "icon": "fas fa-qrcode",
                "route"   : "/settings/separator",
            },
            {
                "id": "document-type",
                "label": this.translate.instant("SETTINGS.document_type"),
                "icon": "fas fa-file",
                "route"   : "/settings/documentType",
            },
            {
                "id": "connector",
                "label": this.translate.instant("SETTINGS.connector_EDM"),
                "icon": "fas fa-link",
                "route"   : "/settings/connector",
            }
        ]
    };

    constructor(
        private titleService: Title,
        private translate: TranslateService,
        private routerExtService: LastUrlService,
        private localeStorageService: LocalStorageService
    ) {}

    init(){
        let lastUrl = this.routerExtService.getPreviousUrl()
        if (lastUrl.includes('roles') || lastUrl == '/' || lastUrl.includes('users')){
            let selectedSettings = this.localeStorageService.get('selectedSettings')
            let selectedParentSettings = this.localeStorageService.get('selectedParentSettings')

            if (selectedSettings)
                this.setSelectedSettings(selectedSettings)

            if (selectedParentSettings)
                this.setSelectedParentSettings(selectedParentSettings)
        }else{
            this.localeStorageService.remove('selectedSettings')
            this.localeStorageService.remove('selectedParentSettings')
            this.setSelectedSettings("users")
            this.setSelectedParentSettings('general')
        }
    }

    getTitle(){
        let title = this.titleService.getTitle()
        title = title.split(' - ')[0]
        return title
    }

    changeSetting(settingId: string, settingParentId: string) {
        this.setSelectedSettings(settingId)
        this.setSelectedParentSettings(settingParentId)
        this.localeStorageService.save('selectedSettings', settingId)
        this.localeStorageService.save('selectedParentSettings',settingParentId)
    }

    getIsMenuOpen(){
        return this.isMenuOpen;
    }

    getSelectedSetting(){
        return this.selectedSetting;
    }

    getSelectedParentSetting(){
        return this.selectedParentSetting;
    }

    getSettingListOpenState(){
        return this.settingListOpenState;
    }

    getSettingsParent(){
        return this.settingsParent;
    }

    getSettings(){
        return this.settings;
    }

    getSelectedSettingInfo(value: any){
        let data : any[] = []
        this.settings[this.selectedParentSetting].forEach((element: any) =>{
            if (element['id'] == this.selectedSetting){
                data = element[value]
            }
        })
        return data
    }

    setIsMenuOpen(value: boolean){
        this.isMenuOpen = value;
    }

    setSelectedSettings(value: string){
        this.selectedSetting = value;
    }

    setSelectedParentSettings(value: string){
        this.selectedParentSetting = value;
    }

    setSettingListOpenState(value: boolean){
        this.settingListOpenState = value;
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
}
