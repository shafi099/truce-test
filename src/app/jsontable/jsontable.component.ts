import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';

import {
  ClientSideRowModelModule,
  ColDef,
  ColumnAutoSizeModule,

  CustomFilterModule,
  DateFilterModule,
  GridOptions,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  RowSelectionModule,
  RowSelectionOptions,
  RowStyleModule,
  TextFilterModule,
  ValidationModule,
} from "ag-grid-community";
import { ColumnFilterModule } from 'ag-grid-community/dist/types/src/filter/filterModule';



ModuleRegistry.registerModules([
  TextFilterModule, 
  NumberFilterModule, 
  DateFilterModule, 
  CustomFilterModule,
  RowSelectionModule,
  RowStyleModule,
  ClientSideRowModelModule,
  PaginationModule,
  ColumnAutoSizeModule,
  ValidationModule /* Development Only */,
]);

@Component({
  selector: 'app-jsontable',
  templateUrl: './jsontable.component.html',
  styleUrls: ['./jsontable.component.scss']
})
export class JsontableComponent implements OnInit {

  @ViewChild('agGrid') agGrid!: AgGridAngular;

  modules = [ClientSideRowModelModule];
  myForm!: FormGroup;

  gridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      filter: true,
      floatingFilter: true,
      resizable: true,
    },
    // rowHeight: 30, 
    // headerHeight: 30,
    animateRows: true,
    onGridReady: (params) => {
      params.api.sizeColumnsToFit(); // Auto adjust on grid load
    }
  };
  
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
  };

  rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: 'multiRow',
    checkboxes: true,
    headerCheckbox: true,
    enableClickSelection: true,

  }

  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', flex: 1, minWidth: 80,
      cellRenderer: (params: any) => `<span class="fw-bold">${params.value}</span>` 
    },
    { field: 'ruleName', headerName: 'Rule Name', flex: 2, minWidth: 150,
      menuTabs: ["filterMenuTab"],
      cellRenderer: (params: any) => `<span class="fw-bold">${params.value}</span>` 
    },
    { field: 'active', headerName: 'Active', flex: 1, minWidth: 75,
      cellRenderer: (params: any) => 
        `<span style="color: ${params.value ? 'green' : 'red'}; font-size: 20px;">&#8226;</span>`
    },
    { field: 'type', headerName: 'Type', flex: 1, minWidth: 100 },
    { field: 'subType', headerName: 'Sub Type', flex: 2, minWidth: 150 },
    { field: 'domain', headerName: 'Domain', flex: 1, minWidth: 100 },
    { field: 'impacted', headerName: 'Impacted', flex: 1, minWidth: 100, filter: 'agNumberColumnFilter',
      cellRenderer: (params: any) => params.value > 0 ? `<span class="fw-bold">${this.toIndianFormat(params.value)}</span>` : '<span class="fw-bold">0<span>' 
    },
    { field: 'favourite', headerName: 'Favourite', flex: 1, minWidth: 100,
      cellRenderer: (params: any) => {
        const checked = params.value === "Y";
        return `<span class="${checked ? 'text-success fw-bold' : 'text-muted'}">
                  ${checked ? 'Yes ⭐' : ''}
                </span>`;
      }
      
     },
    { field: 'scheduled', headerName: 'Scheduled', flex: 1, minWidth: 120,
      cellRenderer: (params: any) => {
        const checked = params.value === "Y";
        return `<span class="${checked ? 'text-success fw-medium' : 'text-danger fw-medium'}">${checked ? 'Yes' : 'No'}</span>`;
      }
     },
    { field: 'lastScheduledDate', headerName: 'Last Scheduled Date', flex: 2, minWidth: 180 },
    { field: 'alert', headerName: 'Alert', flex: 1, minWidth: 100,
      cellRenderer: (params: any) => {
        const checked = params.value === "Y";
        return `<span class="${checked ? 'text-success fw-medium' : 'text-danger fw-medium'}">${checked ? 'Yes' : 'No'}</span>`;
      }
    }
  ];
  

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();

  }

  // utilities 

  initializeForm(){
    this.myForm = this.fb.group({
      id: [null, Validators.required],
      ruleName: [null, Validators.required],
      active: [false],
      type: ['Match'],
      subType: [''],
      domain: [''],
      impacted: [''],
      favourite: ['N'],
      scheduled: ['Y'],
      lastScheduledDate: [''],
      alert: ['N']
    });
  }

  isLoading: boolean = false ;
  errors: boolean = false ;

  submitForm() {
    if (this.myForm.valid) {

      this.isLoading = true ;
      const formData = this.myForm.value ;

      if(formData?.lastScheduledDate) formData['lastScheduledDate'] = this.formatDate(formData['lastScheduledDate']);

      setTimeout(()=>{
        this.rowData.push(formData);
        this.myForm.reset();
        this.initializeForm();
        this.isLoading= false ;
        this.errors = false ;
      }, 100)
      
    }else{
      this.errors = true ;
    }
  }

  selectedRows : any = '';
  getSelected(agGrid: any){
    const rows = agGrid.getSelectedRows();
    if(rows.length > 0) this.selectedRows = JSON.stringify(rows);
    else this.selectedRows = "No Rows Selected"
  }

  formatDate(inputDate: any) {
    const date = new Date(inputDate);
    
    const day = String(date.getDate()).padStart(2, '0'); // Pad single digit days with a leading zero
    const month = date.toLocaleString('en-GB', { month: 'short' }); // Get month in short format (e.g., "Jan", "Feb")
    const year = date.getFullYear();
    const hours = String(date.getHours() % 12 || 12).padStart(2, '0'); // 12-hour format
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Pad single digit minutes with a leading zero
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM'; // Determine AM or PM
    
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  }

  toCamelCaseWithSpaces(input: any): any {
    this.myForm.get('ruleName')?.setValue(input.target.value.replace(/(?:^|\s)([a-zA-Z])/g, (match: any) => match.toUpperCase()))
  }
  

  toIndianFormat(number: any) {
    const str = number.toString();
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    const result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    return result;
  }


  public rowData: any = [
    {
      "id": 997,
      "ruleName": "2DS - Trace Changes",
      "active": false,
      "type": "Match",
      "subType": "2DS - Trace Changes",
      "domain": "",
      "impacted": 0,
      "favourite": "N",
      "scheduled": "Y",
      "lastScheduledDate": "01-May-2024 01:15 PM",
      "alert": "Y"
    },
    {
      "id": 996,
      "ruleName": "Trace Changes",
      "active": "Y",
      "type": "Match",
      "subType": "2DS - Trace Changes",
      "domain": "",
      "impacted": 0,
      "favourite": "N",
      "scheduled": "N",
      "lastScheduledDate": "01-May-2024 01:15 PM",
      "alert": "N"
    },
    {
      "id": 986,
      "ruleName": "File Monitor",
      "active": "Y",
      "type": "Match",
      "subType": "1DS - File Monitor",
      "domain": "",
      "impacted": 57994,
      "favourite": "N",
      "scheduled": "Y",
      "lastScheduledDate": "01-May-2024 01:15 PM",
      "alert": "Y"
    },
    {
      "id": 985,
      "ruleName": "testreve1",
      "active": "Y",
      "type": "Match",
      "subType": "1DS - File Monitor",
      "domain": "",
      "impacted": 13773,
      "favourite": "N",
      "scheduled": "N",
      "lastScheduledDate": "01-May-2024 01:15 PM",
      "alert": "N"
    }
  ];
  
}
