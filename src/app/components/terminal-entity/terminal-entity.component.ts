import { stringify } from '@angular/compiler/src/util';
import {
  AfterViewChecked,
  Component,
  OnInit
} from '@angular/core';
import { tap } from 'rxjs/operators';

import { OpenWeatherMapHttpService } from '../../servicies';

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

  constructor(
    private _httpService: OpenWeatherMapHttpService,
  ) {}

  ngOnInit(): void {
    if (sessionStorage.getItem("autosave")) {
      let autosave = JSON.parse(sessionStorage.getItem('autosave'));
      this.currentCommand = autosave.currCmd;
      this.output = autosave.output;
      this.commandsHistory = autosave.cmdsHistory;
      this.counterForCommandHistory = autosave.counter;
    }
  }

  ngAfterViewChecked(): void {
    const objDiv = document.getElementById("body");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  handleCommand() {

    if (this.currentCommand.trim()) {
      let parsedInput = this.currentCommand.toLowerCase().trim().replace(/\s+/g, ' ').split(' ');

      switch(parsedInput[0]) {
        case "weather":
          this.weatherCmnds(parsedInput[1]);
          break;
        default:
          this.output.push(this.currentCommand + ": Command not found");
      }
    } else {
      return;
    }

    
  }

  keydownEvent(event: KeyboardEvent) {
    if (event.code == "Enter" || event.code == "NumpadEnter") {
      this.addCommand();
      this.writeToOutput();
      this.handleCommand();
      this.clearInput();
      this.saveToSessionStorage();
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


  saveToSessionStorage() {
    let autosave = {
      currCmd: this.currentCommand,
      output: this.output,
      cmdsHistory: this.commandsHistory,
      counter: this.counterForCommandHistory
    };

    sessionStorage.setItem("autosave", JSON.stringify(autosave));
  }

  weatherCmnds(city: string) {

    setTimeout(() => {
      this._httpService.getWeatherByName(city).pipe(
        tap((resp) =>{
          console.log(resp);
          this.output.push("Country: " + resp.sys.country);
          this.output.push("City: " + resp.name);
          this.output.push("Temperature: " + resp.main.temp + "C")
          this.output.push("Description: " + resp.weather[0].description)
        })
      ).subscribe()
    }, 1000);
    
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
