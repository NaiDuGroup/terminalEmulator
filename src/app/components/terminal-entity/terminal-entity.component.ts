import { AfterViewChecked, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-terminal-entity',
  templateUrl: './terminal-entity.component.html',
  styleUrls: ['./terminal-entity.component.scss']
})
export class TerminalEntityComponent implements OnInit, AfterViewChecked {

  currentCommand = "";
  output: String[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    const objDiv = document.getElementById("body");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  keydownEvent(event: KeyboardEvent) {
    
    if (event.code == "Enter" || event.code == "NumpadEnter") {
      if (this.currentCommand) {
        this.output.push(this.currentCommand);
        this.currentCommand = "";
      }
      
    }
  }
}
