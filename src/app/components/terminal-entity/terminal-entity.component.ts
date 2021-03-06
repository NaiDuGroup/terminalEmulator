import { AfterViewChecked, Component, OnInit } from '@angular/core';

import { OpenWeatherMapHttpService } from '../../servicies';

@Component({
  selector: 'app-terminal-entity',
  templateUrl: './terminal-entity.component.html',
  styleUrls: ['./terminal-entity.component.scss']
})
export class TerminalEntityComponent implements OnInit, AfterViewChecked {

  userName: string = "kivork@kivork-2021";

  preferences = {
    // cursor: "black",
    backgroundColor: "rgb(29, 29, 29)",
    textColor: "#fff",
    textSize: 16,
  }

  currentCommand = "";
  output: string[] = [];

  commandsHistory: string[] = [];
  counterForCommandHistory: number = 0;

  constructor(
    private _httpService: OpenWeatherMapHttpService,
  ) {
    this.output.push("This is a Technical Task provided by Kivork 2021!");
    this.output.push("Welcome to this awesome terminal!");
    this.output.push("What can you do here? :D");
    this.output.push(" ");
    this.output.push("Get current weather measurements by city name:");
    this.output.push("        weather <cityName>");
    this.output.push(" ");
    this.output.push("Clear the screen:");
    this.output.push("        clear");
    this.output.push(" ");
    this.output.push("Get help:");
    this.output.push("        help");
  }

  ngOnInit(): void {

    if (sessionStorage.getItem("autosave")) {
      let autosave = JSON.parse(sessionStorage.getItem('autosave'));
      this.currentCommand = autosave.currCmd;
      this.output = autosave.output;
      this.commandsHistory = autosave.cmdsHistory;
      this.counterForCommandHistory = autosave.counter;
      this.preferences.textSize = autosave.textSize;
      this.preferences.textColor = autosave.textColor;
      this.preferences.backgroundColor = autosave.backgroundColor;
    }

    this.setBgColor(this.preferences.backgroundColor);
    this.setTextColor(this.preferences.textColor);
    this.setTextSize();

    const terminal = document.getElementById("terminal");
    const input = document.getElementById('input');

    document.addEventListener('mouseover', () => {
      input.focus();
    });

    document.addEventListener('click', () => {
      input.focus();
    });

  }

  ngAfterViewChecked(): void {
    const objDiv = document.getElementById("body");
    objDiv.scrollTop = objDiv.scrollHeight;

    this.setTextColor(this.preferences.textColor);
    this.setTextSize();
  }

  handleCommand() {

    if (this.currentCommand.trim()) {
      let parsedInput = this.currentCommand.toLowerCase().trim().replace(/\s+/g, ' ').split(' ');

      switch (parsedInput[0]) {
        case "weather":
          this.weatherCmnds(parsedInput[1]);
          break;
        case "clear":
          this.output = [];
          break;
        case "help":
          this.showHelpMessage();
          break;
        default:
          this.output.push(this.currentCommand + ": Command not found");
      }
    } else {
      return;
    }
  }

  showHelpMessage() {
    this.output.push("This is a Technical Task provided by Kivork 2021!");
    this.output.push("Welcome to this awesome terminal!");
    this.output.push("What can you do here? :D");
    this.output.push(" ");
    this.output.push("Get current weather measurements by city name:");
    this.output.push("        weather <cityName>");
    this.output.push(" ");
    this.output.push("Clear the screen:");
    this.output.push("        clear");
    this.output.push(" ");
    this.output.push("Get help:");
    this.output.push("        help");
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
      this.moveCaretToEnd(document.getElementById('input'));
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
      counter: this.counterForCommandHistory,
      textColor: this.preferences.textColor,
      backgroundColor: this.preferences.backgroundColor,
      textSize: this.preferences.textSize
    };

    sessionStorage.setItem("autosave", JSON.stringify(autosave));
  }

  weatherCmnds(city: string) {
    if (city) {
      this._httpService.getWeatherByName(city).subscribe((resp) => {
        this.output.push("  ");
        this.output.push("Country: " + resp.sys.country);
        this.output.push("City: " + resp.name);
        this.output.push("Temperature: " + resp.main.temp + "C");
        this.output.push("Description: " + resp.weather[0].description);
        this.output.push("  ");
      }, err => {
        this.output.push("  ");
        this.output.push("    Oooops! " + err.error.message);
        this.output.push("  ");
      });
    } else {
      this.output.push("    -type   weather <command>");
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

  setBgColor(color: string) {
    this.preferences.backgroundColor = color;

    document.getElementById('body').style.backgroundColor = color;
    document.getElementById('input').style.backgroundColor = color;
    this.saveToSessionStorage();
  }

  setTextColor(color: string) {
    this.preferences.textColor = color;

    const spans = document.getElementsByClassName('output') as HTMLCollectionOf < HTMLElement > ;
    for (let i = 0; i < spans.length; i++) {
      spans[i].style.color = this.preferences.textColor;
    }

    const symbols = document.getElementsByClassName('body-input--symbols') as HTMLCollectionOf < HTMLElement > ;
    for (let i = 0; i < symbols.length; i++) {
      symbols[i].style.color = this.preferences.textColor;
    }

    document.getElementById('input').style.color = this.preferences.textColor;
    this.saveToSessionStorage();
  }

  setTextSize(cmd ? : string) {
    if (cmd == "+") {
      this.preferences.textSize++;
    }
    if (cmd == "-") {
      this.preferences.textSize--;
    }

    const spans = document.getElementsByClassName('output') as HTMLCollectionOf < HTMLElement > ;
    for (let i = 0; i < spans.length; i++) {
      spans[i].style.fontSize = this.preferences.textSize + "px";
    }

    const symbols = document.getElementsByClassName('body-input--symbols') as HTMLCollectionOf < HTMLElement > ;
    for (let i = 0; i < symbols.length; i++) {
      symbols[i].style.fontSize = this.preferences.textSize + "px";
    }
    document.getElementById('input').style.fontSize = this.preferences.textSize + "px";
    document.getElementById('root').style.fontSize = this.preferences.textSize + "px";

    this.saveToSessionStorage();
  }

  moveCaretToEnd(el) {
    if (typeof el.selectionStart == "number") {
      el.selectionStart = el.selectionEnd = 99;
    } else if (typeof el.createTextRange != "undefined") {
      el.focus();
      const range = el.createTextRange();
      range.collapse(false);
      range.select();
    }
  }
}
