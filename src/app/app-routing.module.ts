import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JsontableComponent } from './jsontable/jsontable.component';

const routes: Routes = [
  {
    path: "", component: JsontableComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
