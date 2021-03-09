import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  count = 1;
  

  ngOnInit(): void {
    if (sessionStorage.getItem("count")) {
      let count = JSON.parse(sessionStorage.getItem("count"));
      this.count = count;
    }
  }

  addTerminal() {
    this.count = this.count + 1;
    this._saveToSessionStorage();
  }

  deleteTerminal() {
    this.count = this.count - 1;
    this._saveToSessionStorage();
  }

  private _saveToSessionStorage() {
    sessionStorage.setItem("count", JSON.stringify(this.count));
  }
}