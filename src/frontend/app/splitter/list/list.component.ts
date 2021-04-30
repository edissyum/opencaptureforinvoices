import {Component, OnInit, ViewChild} from '@angular/core';
import {LocalStorageService} from "../../../services/local-storage.service";
import {API_URL} from "../../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {AuthService} from "../../../services/auth.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {UserService} from "../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../services/notifications/notifications.service";
import { DomSanitizer } from '@angular/platform-browser';
import {PageEvent} from "@angular/material/paginator";
import {ConfirmDialogComponent} from "../../../services/confirm-dialog/confirm-dialog.component";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})

export class SplitterListComponent implements OnInit {
    batches             = [] as  any;
    gridColumns         = 4;
    page                = 1;
    searchText: string  = "";
    paginationInfos     = {
        length: 0,
        pageSize: 10,
        pageIndex: 1,
    }

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
        public dialog: MatDialog,
        ) { }

    ngOnInit(): void {
        this.localeStorageService.save('splitter_or_verifier', 'splitter')
        this.loadBatches();
    }

    toggleGridColumns() {
        this.gridColumns = this.gridColumns === 3 ? 4 : 3;
    }

    loadBatches(): void{
        let headers = this.authService.headers;
        this.http.get(API_URL + '/ws/splitter/batches', {headers}).pipe(
            tap((data: any) => {
                this.batches                = data.batches;
                this.paginationInfos.length = this.batches.length;
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe()
    }

    sanitize(url:string){
        return this._sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
    }

    adaptImagesUrl(): void {
        for (let i = 0; i < this.batches.length; i++) {
            this.batches[i]['image_url'] = this._sanitizer.bypassSecurityTrustResourceUrl(this.batches[i]['image_url']);
        }
    }

    onPageChange($event: PageEvent) {
        this.paginationInfos.pageIndex  = $event.pageIndex + 1;
        this.paginationInfos.pageSize   = $event.pageSize;
    }

    openConfirmDialog(id: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('SPLITTER.confirm_batch_delete'),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "400px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.deleteBatch(id)
            }
        });
    }

    deleteBatch(id: number): void{
        let headers = this.authService.headers;
        this.http.put(API_URL + '/ws/splitter/status', {
            'id'    : id,
            'status': 'DEL',
        } ,{headers}).pipe(
            tap((data: any) => {
                this.batches.forEach( (batch: any, index: number) => {
                 if(batch.id === id) this.batches.splice(index,1);
                });
                this.notify.success(this.translate.instant('SPLITTER.batch_deleted'));
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe()
    }
}
