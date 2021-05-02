import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../../services/auth.service";
import {UserService} from "../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../services/notifications/notifications.service";
import {MatDialog} from "@angular/material/dialog";
import {SettingsService} from "../../../../services/settings.service";
import {LastUrlService} from "../../../../services/last-url.service";
import {LocalStorageService} from "../../../../services/local-storage.service";

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  constructor(
      private http: HttpClient,
      private router: Router,
      private route: ActivatedRoute,
      private formBuilder: FormBuilder,
      private authService: AuthService,
      public userService: UserService,
      private translate: TranslateService,
      private notify: NotificationService,
      private dialog: MatDialog,
      public serviceSettings: SettingsService,
      private routerExtService: LastUrlService,
      private localeStorageService: LocalStorageService,
  ) { }

  ngOnInit(): void {
  }

}
