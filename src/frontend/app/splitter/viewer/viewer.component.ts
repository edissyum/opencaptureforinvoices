import {Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren} from '@angular/core';
import {API_URL} from "../../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "../../../services/local-storage.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {UserService} from "../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../services/notifications/notifications.service";
import {DomSanitizer} from "@angular/platform-browser";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {DocumentTreeComponent} from "../document-tree/document-tree.component";
import {MatDialog} from "@angular/material/dialog";
import {element} from "protractor";



export interface Batch {
    id              : number,
    image_url       : string,
    file_name       : string,
    page_number     : number,
    creation_date   : string,
}

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class SplitterViewerComponent implements OnInit {
    form!: FormGroup;
    metaDataOpenState           = true;
    showZoomPage: boolean       = false;
    batchId : number            = -1;
    batches: Batch[]            = [];
    customFields: any           = [];
    documents: any              = [];
    documentsHistory: any       = [];
    documentsIds :string[]      = [];
    zoomImageUrl: string        = "";
    toolSelectedOption: string  = "";
    selectedItemName: string    = "";

    constructor(
        private localeStorageService: LocalStorageService,
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        private translate: TranslateService,
        private notify: NotificationService,
        private _sanitizer: DomSanitizer,
        public dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        this.batchId = this.route.snapshot.params['id'];
        this.loadBatches();
        this.loadPages();
        this.loadCustomFields();
        this.form = this.toFormGroup();
    }

    loadBatches(): void{
        let headers = this.authService.headers;
        this.http.get(API_URL + '/ws/splitter/batches', {headers}).pipe(
          tap((data: any) => {
              data.batches.forEach((batch: Batch) =>
                this.batches.push(
                    {
                        id              : batch.id,
                        image_url       : batch.image_url,
                        file_name       : batch.file_name,
                        page_number     : batch.page_number,
                        creation_date   : batch.creation_date,
                    }
                )
              )
          }),
          catchError((err: any) => {
              this.notify.error(err);
              return of(false);
          })
        ).subscribe()
    }

    loadPages(): void{
        let headers = this.authService.headers;
        this.http.get(API_URL + '/ws/splitter/pages/' + this.batchId, {headers}).pipe(
          tap((data: any) => {
            for (let i=0; i < data['page_lists'].length; i++) {
                this.documents[i] = {
                    id               : "document-" + i,
                    documentTypeName : "Document " + (i + 1),
                    pages            : [],
                };
                for (let page of data['page_lists'][i]) {
                    this.documents[i].pages.push({
                        id              : page['id'],
                        imageUrl        : page['image_url'],
                        showZoomButton  : false,
                        zoomImage       : false,
                        checkBox        : false,
                    });
                }
            }
            this.documentsHistory = this.documents;
          }),
          catchError((err: any) => {
              this.notify.error(err);
              return of(false);
          })
        ).subscribe()
    }

    toFormGroup( ) {
        const group: any = { };
            this.customFields.forEach((input: {
                label_short : string;
                required    : any;
                value       : any;
            }) => {
              group[input.label_short] = input.required ? new FormControl(input.value || '', Validators.required)
                                                : new FormControl(input.value || '');
            });
        return new FormGroup(group);
    }

    /* -- Custom fields -- */
    loadCustomFields(){
        let headers   = this.authService.headers;
        let newField;
        this.http.get(API_URL + '/ws/customFields/list',{headers}).pipe(
        tap((data: any) => {
          data.customFields.forEach((field: {
              id            : any;
              label_short   :  any;
              module        : any;
              label         : any;
              type          : any;
              enabled       : any;
          }) =>{
              newField = {
                'id'            : field.id,
                'label_short'   : field.label_short,
                'module'        : field.module,
                'label'         : field.label,
                'type'          : field.type,
                'enabled'       : field.enabled,
              }
              if(field.enabled)
                  this.customFields.push(newField);
            }
          )
        }),
        catchError((err: any) => {
            console.debug(err);
            return of(false);
        })
        ).subscribe()
    }
    /* -- End custom fields -- */

    /* -- Begin documents control -- */
    addId(i: number) {
        let id = 'cdk-drop-list-' + i
        if(!this.documentsIds.includes(id))
            this.documentsIds.push(id);
        return id;
    }

    sanitize(url:string){
        return this._sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
    }

    drop(event: CdkDragDrop<any[]>) {
        if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        }
        else {
          transferArrayItem(event.previousContainer.data,
                            event.container.data,
                            event.previousIndex,
                            event.currentIndex);
        }
    }

    openDocumentTypeDialog(document: any): void {
        const dialogRef = this.dialog.open(DocumentTreeComponent, {
            width   : '800px',
            height  : '900px',
            data    : {}
        });
        dialogRef.afterClosed().subscribe((result: any) => {
            document.documentTypeName = result.item;
            document.documentTypeKey = result.key;
        });
    }

    deleteDocument(documentIndex: number) {
        this.documents = this.deleteItemFromList(this.documents, documentIndex);
    }
    /* End documents control */

    /* Begin tools bar */
    deleteItemFromList(list: any[], index: number){
        delete list[index];
        list = list.filter((x: any): x is any => x !== null);
        return list;
    }

    deleteSelectedPages(){
        for(let document of this.documents){
            for(let i=0; i<document.pages.length; i++){
                if(document.pages[i].checkBox){
                    document.pages = this.deleteItemFromList(document.pages, i);
                    i--;
                }
            }
        }
    }

    setAllPagesTo(check: boolean){
        for(let document of this.documents){
            for(let page of document.pages){
                page.checkBox = check;
            }
        }
    }

    undoAll(){
        window.location.reload();
    }

    sendSelectedPages(){
        let selectedOptionIndex = this.toolSelectedOption.split('-').pop();
        if (selectedOptionIndex)
            for(let document of this.documents){
                for(let i=0; i<document.pages.length; i++){
                    if(document.pages[i].checkBox) {
                        transferArrayItem(document.pages,
                            this.documents[selectedOptionIndex].pages, i,
                            this.documents[selectedOptionIndex].pages.length);
                    }
                }
            }
    }

    changeBatch(batchId: number) {
        window.location.href = "/splitter/viewer/" + batchId;
    }

    addDocument() {
        this.documents.push({
            id: "document-" + this.documents.length,
            documentTypeName: "Document " + (this.documents.length + 1),
            pages: [],
        })
    }

    isElementInViewport(el: any) {
        let rect = el.getBoundingClientRect();

        return (
            rect.bottom >= 0 &&
            rect.right >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    validate() {
        let headers = this.authService.headers;
        this.http.post(API_URL + '/ws/splitter/validate', {"documents": this.documents},{headers}).pipe(
          tap((data: any) => {
              console.log(data);
          }),
          catchError((err: any) => {
              this.notify.error(err);
              return of(false);
          })
        ).subscribe()
    }
    /* -- End tools bar -- */
}
