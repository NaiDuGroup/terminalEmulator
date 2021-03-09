import { AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';

import { HelpService, WeatherService } from '../../servicies';

@Component({
  selector: 'app-terminal-entity',
  templateUrl: './terminal-entity.component.html',
  styleUrls: ['./terminal-entity.component.scss'],
  providers: [ WeatherService, HelpService ]
})
export class TerminalEntityComponent implements OnInit, AfterViewInit {
  @Input() sessionNum: number;
  @ViewChildren("output") private _output: QueryList<any>;
  @ViewChild("content") private _content: ElementRef;

  userName: string = "kivork@kivork-2021";

  preferences = {
    cursor: "#fff",
    backgroundColor: "#000",
    textColor: "#fff",
    textSize: 16,
  }

  output: string[] = [];
  stackOfCommands: string[] = [];
  commandInProgress: string = "";
  inputValue: string = "";
    
  commandsHistory: string[] = [];
  counterForCommandHistory: number = 0;

  isCommandInProgress: boolean = false;

  private _colors: string[] = ["red","black","blue","green","orange"];
  
  constructor(
    private _weatherService: WeatherService,
    private _helpService: HelpService
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

    // Used to get random color of the Terminal, in case it is not stored in SessionStore
    this.preferences.backgroundColor = this._colors[Math.floor(Math.random() * Math.floor(5))];
  }

  ngOnInit(): void {

    if (sessionStorage.getItem("autosave" + this.sessionNum)) {
      let autosave = JSON.parse(sessionStorage.getItem("autosave" + this.sessionNum));
      this.inputValue = autosave.currCmd;
      this.output = autosave.output;
      this.commandsHistory = autosave.cmdsHistory;
      this.counterForCommandHistory = autosave.counter;
      this.preferences.cursor = autosave.cursor;
      this.preferences.textSize = autosave.textSize;
      this.preferences.textColor = autosave.textColor;
      this.preferences.backgroundColor = autosave.backgroundColor;
    }

    this.setCaretColor(this.preferences.cursor);
    this.setBgColor(this.preferences.backgroundColor);
    this.setTextColor(this.preferences.textColor);
    this.setTextSize();
  }

  ngAfterViewInit(): void {
    this._scrollToBottom();
    this.setTextColor(this.preferences.textColor);
    this.setTextSize();
    this._output.changes.subscribe(() => {
      this._scrollToBottom();
      this.setTextColor(this.preferences.textColor);
      this.setTextSize();
    })
    
  }

  mouseEvent(event: MouseEvent): void {
     document.getElementById(`input${this.sessionNum}`).focus();
    event.preventDefault();
  }

  keydownEvent(event: KeyboardEvent): void {
    
    if (event.code == "Enter" || event.code == "NumpadEnter") {
      this._addCommandToHistory();
      this.commandInProgress += this.inputValue;
      this._clearInput();
      this.stackOfCommands.push(this.commandInProgress);
      this.commandInProgress = "";
      this._handleCommand();
      this._saveToSessionStorage();
    }

    if (event.code == "ArrowUp") {
      event.preventDefault();
      if (this.counterForCommandHistory > 0) {
        this.inputValue = this.commandsHistory[this.counterForCommandHistory - 1 ];
        this.counterForCommandHistory--;
      } 
    }

    if (event.code == "ArrowDown") {
      event.preventDefault();
      if (this.counterForCommandHistory < this.commandsHistory.length) {
        this.inputValue = this.commandsHistory[this.counterForCommandHistory + 1 ];
        this.counterForCommandHistory++;
      }
    }    
}

  private _handleCommand(): void {
    if (this.isCommandInProgress) return;
    if (!this.stackOfCommands.length) return;
    
    this.isCommandInProgress = true;
    const action = this.stackOfCommands.shift();

    this._writeToOutput({ line: `${this.userName}:~$ ${action}` });
  

    if (action.trim()) {
      let parsedInput = action.toLowerCase().trim().replace(/\s+/g, ' ').split(' ');

      switch (parsedInput[0]) {
        case "weather":
          this._weatherService.call(parsedInput[1]).subscribe(
            (line: any) => this._writeToOutput(line),
            () => {},
            () => {
              this.isCommandInProgress = false;
              this._handleCommand();
            } 
          );
          break;
        case "clear":
          this.output = [];
          this.isCommandInProgress = false;
          this._handleCommand();
          break;
        case "help":
          this._helpService.call().subscribe(
            (line: any) => this._writeToOutput(line),
            () => {},
            () => {
              this.isCommandInProgress = false;
              this._handleCommand();
            }
          );
          break;
        default:
          this.output.push(action + ": Command not found");
          this.isCommandInProgress = false;
          this._handleCommand();
      }
    } else {
      this.isCommandInProgress = false;
      this._handleCommand();
    }
  }

  private _saveToSessionStorage(): void {
    let autosave = {
      currCmd: this.inputValue,
      output: this.output,
      cmdsHistory: this.commandsHistory,
      counter: this.counterForCommandHistory,
      cursor: this.preferences.cursor,
      textColor: this.preferences.textColor,
      backgroundColor: this.preferences.backgroundColor,
      textSize: this.preferences.textSize
    };

    sessionStorage.setItem("autosave" + this.sessionNum, JSON.stringify(autosave));
  }

  private _addCommandToHistory(): void {
    if (this.inputValue.trim() != "") {
      this.commandsHistory = this.commandsHistory.filter(el => this.inputValue.trim() != el);
      this.commandsHistory.push(this.inputValue.trim());
      this.counterForCommandHistory = this.commandsHistory.length;
    }
  }

  private _clearInput() {
    this.inputValue = "";
  }

  private _writeToOutput({
    line,
    newLine = true
  }: {
    line: string;
    newLine?: boolean;
  }): void {
    const inputValueDuringExecution = this.inputValue;
    this.commandInProgress += inputValueDuringExecution;
    this.inputValue = "";

    if (inputValueDuringExecution) this.output[this.output.length - 1] += inputValueDuringExecution;

    if (!newLine) {
      this.output.pop();
    }

    this.output.push(line);
  }

  setCaretColor(color: string): void {
    this.preferences.cursor = color;
    this._saveToSessionStorage();
  }

  setBgColor(color: string): void {
    this.preferences.backgroundColor = color;
    this._saveToSessionStorage();
  }

  setTextColor(color: string): void {
    this.preferences.textColor = color;
    this._saveToSessionStorage();
  }

  setTextSize(cmd ? : string): void {

    if (cmd == "-" && this.preferences.textSize > 10) {
      this.preferences.textSize -= 1;
    }
    if (cmd == "+" && this.preferences.textSize < 40) {
      this.preferences.textSize += 1;
    }

    this._saveToSessionStorage();
  }

  private _scrollToBottom = () => {
    try {
      this._content.nativeElement.scrollTop = this._content.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
