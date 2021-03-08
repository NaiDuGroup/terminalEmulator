import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { HelpService, WeatherService } from '../../servicies';

@Component({
  selector: 'app-terminal-entity',
  templateUrl: './terminal-entity.component.html',
  styleUrls: ['./terminal-entity.component.scss'],
  providers: [ WeatherService, HelpService ]
})
export class TerminalEntityComponent implements OnInit, AfterViewInit {
  @ViewChildren('output') private _output: QueryList<any>;
  @ViewChild('content') private _content: ElementRef;

  userName: string = "kivork@kivork-2021";

  preferences = {
    // cursor: "black",
    backgroundColor: "#1d1d1d",
    textColor: "#fff",
    textSize: 16,
  }

  output: string[] = [];
  stackOfCommands: string[] = [];
  commandInProgress: string = "";
  inputValue: string = "";
    
  commandsHistory: string[] = [];
  counterForCommandHistory: number = 0;

  _isCommandInProgress: boolean = false;
  
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
  }

  ngOnInit(): void {
    if (sessionStorage.getItem("autosave")) {
      let autosave = JSON.parse(sessionStorage.getItem('autosave'));
      this.inputValue = autosave.currCmd;
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
      console.log(event);
      event.preventDefault();
      if (this.counterForCommandHistory > 0) {
        this.inputValue = this.commandsHistory[this.counterForCommandHistory - 1];
        this.counterForCommandHistory--;
      }
    }

    if (event.code == "ArrowDown") {
      event.preventDefault();
      if (this.counterForCommandHistory < this.commandsHistory.length) {
        this.inputValue = this.commandsHistory[this.counterForCommandHistory];
        this.counterForCommandHistory++;
      }
    }    
}

  private _handleCommand(): void {
    if (this._isCommandInProgress) return;
    if (!this.stackOfCommands.length) return;
    
    this._isCommandInProgress = true;
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
              this._isCommandInProgress = false;
              this._handleCommand();
            } 
          );
          break;
        case "clear":
          this.output = [];
          this._isCommandInProgress = false;
          this._handleCommand();
          break;
        case "help":
          this._helpService.call().subscribe(
            (line: any) => this._writeToOutput(line),
            () => {},
            () => {
              this._isCommandInProgress = false;
              this._handleCommand();
            }
          );
          break;
        default:
          this.output.push(action + ": Command not found");
          this._isCommandInProgress = false;
          this._handleCommand();
      }
    } else {
      this._isCommandInProgress = false;
      this._handleCommand();
    }
  }

  private _saveToSessionStorage(): void {
    let autosave = {
      currCmd: this.inputValue,
      output: this.output,
      cmdsHistory: this.commandsHistory,
      counter: this.counterForCommandHistory,
      textColor: this.preferences.textColor,
      backgroundColor: this.preferences.backgroundColor,
      textSize: this.preferences.textSize
    };

    sessionStorage.setItem("autosave", JSON.stringify(autosave));
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

  setBgColor(color: string): void {
    this.preferences.backgroundColor = color;

    document.getElementById('body').style.backgroundColor = color;
    document.getElementById('input').style.backgroundColor = color;
    this._saveToSessionStorage();
  }

  setTextColor(color: string): void {
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
    this._saveToSessionStorage();
  }

  setTextSize(cmd ? : string): void {
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

    this._saveToSessionStorage();
  }

  private _scrollToBottom = () => {
    try {
      this._content.nativeElement.scrollTop = this._content.nativeElement.scrollHeight;
    } catch (err) {}
  }

  // hideInputPanel() { 
  //   const symbols = document.getElementsByClassName('body-input--symbols') as HTMLCollectionOf < HTMLElement > ;
  //   for (let i = 0; i < symbols.length; i++) {
  //     symbols[i].style.color = this.preferences.backgroundColor;
  //   }
  //   document.getElementById('root').style.color = this.preferences.backgroundColor;
  // }

  // showInputPanel() {
  //   const symbols = document.getElementsByClassName('body-input--symbols') as HTMLCollectionOf < HTMLElement > ;
  //   for (let i = 0; i < symbols.length; i++) {
  //     symbols[i].style.color = this.preferences.textColor;
  //   }
  //   document.getElementById('root').style.color = "chartreuse";
  // }
}
