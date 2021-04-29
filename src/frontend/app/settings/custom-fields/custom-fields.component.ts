import {Component, ComponentFactoryResolver, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {API_URL} from "../../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {UserService} from "../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../services/notifications/notifications.service";

@Component({
  selector: 'app-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss'],
})
export class CustomFieldsComponent implements OnInit {
  form!: FormGroup;
  addCustomFieldsOpenState: boolean = true;
  inactiveFields: any[]             = [];
  activeFields:   any[]             = [];
  addFieldInputs: any[]             = [
    {
      controlType : 'textbox',
      label_short : 'key',
      label       : this.translate.instant('GLOBAL.key'),
      required    : true,
    },
    {
      controlType : 'textbox',
      label_short : 'label',
      label       : this.translate.instant('GLOBAL.label'),
      required    : true,
    },
    {
      controlType : 'dropdown',
      label_short : 'type',
      label       : this.translate.instant('GLOBAL.type'),
      options: [
        {key: 'textbox', value: this.translate.instant('GLOBAL.textbox')},
        {key: 'textarea', value: this.translate.instant('GLOBAL.textarea')},
        {key: 'select', value: this.translate.instant('GLOBAL.select')},
        {key: 'checkBok', value: this.translate.instant('GLOBAL.checkbox')},
      ],
      required    : true,
    },
    {
      controlType : 'dropdown',
      label_short : 'module',
      label       : this.translate.instant('GLOBAL.module'),
      options: [
        {key: 'splitter', value: this.translate.instant('SPLITTER.splitter')},
        {key: 'verifier', value: this.translate.instant('VERIFIER.verifier')},
      ],
      required    : true,
    },
  ]

  constructor(
      private http: HttpClient,
      private router: Router,
      private route: ActivatedRoute,
      private formBuilder: FormBuilder,
      private authService: AuthService,
      public userService: UserService,
      private translate: TranslateService,
      private notify: NotificationService,
      private resolver: ComponentFactoryResolver
  ) {
    this.form = this.toFormGroup();
    this.retrieveCustomFields()
  }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex);
    } else {
      this.enableCustomField(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
    }
  }

  toFormGroup( ) {
    const group: any = {};
    this.addFieldInputs.forEach(input => {
      group[input.label_short] = input.required ? new FormControl(input.value || '', Validators.required)
                                        : new FormControl(input.value || '');
    });
    return new FormGroup(group);
  }

  moveToActive(index: number) {
    this.enableCustomField(
        this.inactiveFields,
        this.activeFields,
        index,
        this.activeFields.length);
  }

  moveToInactive(index: number) {
    this.enableCustomField(
        this.activeFields,
        this.inactiveFields,
        index,
        this.inactiveFields.length);
  }

  retrieveCustomFields(){
    let headers   = this.authService.headers;
    let newField;
    this.http.get(API_URL + '/ws/customFields/list',{headers}).pipe(
    tap((data: any) => {
        data.customFields.forEach((field: { id: any;
          label_short : string;
          module      : string;
          label       : string;
          type        : string;
          enabled     : boolean;
        }) =>{
          newField = {
            'id'          : field.id,
            'label_short' : field.label_short,
            'module'      : field.module,
            'label'       : field.label,
            'type'        : field.type,
            'enabled'     : field.enabled,
          }
          field.enabled?  this.activeFields.push(newField):  this.inactiveFields.push(newField);
        }
      )
    }),
    catchError((err: any) => {
        console.debug(err);
        return of(false);
    })
    ).subscribe()
  }

  AddCustomField() {
    let headers   = this.authService.headers;
    let newField  = this.form.getRawValue()
    newField = {
      'label_short' : newField.label_short,
      'label'       : newField.label,
      'type'        : newField.type,
      'module'      : newField.module,
      'enabled'     : newField.enabled,
    };

    this.http.post(API_URL + '/ws/customFields/add', newField,{headers}).pipe(
        tap((data: any) => {
          newField['id'] = data.id;

          this.activeFields.push(newField);
          this.notify.success(this.translate.instant('SETTINGS.field_added'));
          this.form.reset();
        }),
        catchError((err: any) => {
            console.debug(err);
            return of(false);
        })
    ).subscribe()
  }

  enableCustomField(oldList : any[],
                    newList : any[],
                    oldIndex: number,
                    newIndex: number){
    let headers       = this.authService.headers;
    let updatedField  = oldList[oldIndex];

    updatedField      = {
      'id'          :  updatedField['id'],
      'label_short' :  updatedField['label_short'],
      'module'      :  updatedField['module'],
      'label'       :  updatedField['label'],
      'type'        :  updatedField['type'],
      'enabled'     : !updatedField['enabled']
    };

    this.http.post(API_URL + '/ws/customFields/update', updatedField,{headers}).pipe(
    tap((data: any) => {
      transferArrayItem(
        oldList,
        newList,
        oldIndex,
        newIndex,
      );
      this.notify.success(this.translate.instant('SETTINGS.field_updated'));
    }),
    catchError((err: any) => {
        console.debug(err);
        return of(false);
    })
    ).subscribe()
  }
}
