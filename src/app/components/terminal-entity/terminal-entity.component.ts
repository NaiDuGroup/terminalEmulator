import {
  AfterViewChecked,
  Component,
  OnInit
} from '@angular/core';

@Component({
  selector: 'app-terminal-entity',
  templateUrl: './terminal-entity.component.html',
  styleUrls: ['./terminal-entity.component.scss']
})
export class TerminalEntityComponent implements OnInit, AfterViewChecked {

  userName: string = "kivork@kivork-2021"

  currentCommand = "";
  output: string[] = [];

  commandsHistory: string[] = [];
  counterForCommandHistory: number = 0;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    const objDiv = document.getElementById("body");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  keydownEvent(event: KeyboardEvent) {

    if (event.code == "Enter" || event.code == "NumpadEnter") {
      this.addCommand();
      this.writeToOutput();
      this.clearInput();
    }

    if (event.code == "ArrowUp") {
      if (this.counterForCommandHistory > 0) { 
        this.currentCommand = this.commandsHistory[this.counterForCommandHistory - 1];
        this.counterForCommandHistory--;
      }
    }

    if (event.code == "ArrowDown") {
      if (this.counterForCommandHistory < this.commandsHistory.length) {
        this.currentCommand = this.commandsHistory[this.counterForCommandHistory];
        this.counterForCommandHistory++;
      }
    }
  }

  addCommand() {
    if (this.commandsHistory.length > 0 && this.currentCommand.trim()) {
      if (this.currentCommand.trim() !== this.commandsHistory[this.commandsHistory.length - 1]) {
        this.commandsHistory.push(this.currentCommand.trim());
      }
    } else {
      if (this.currentCommand.trim()) {
        this.commandsHistory.push(this.currentCommand.trim());
      }
    }
    this.counterForCommandHistory = this.commandsHistory.length;
  }

  clearInput() {
    this.currentCommand = "";
  }

  writeToOutput() {
    this.output.push(this.userName + ":~$ " + this.currentCommand);
  }
}
