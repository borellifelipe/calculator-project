class CalcController {
  constructor() {
    this._audio = new Audio('click.mp3');
    this._audioOnOff = false;
    this._lastOperator = '';
    this._lastNumber = '';
    this._operation = [];
    this._locale = 'pt-BR';

    this._displayCalcEl = document.querySelector("#display");
    this._dateEl = document.querySelector("#data");
    this._timeEl = document.querySelector("#hora");

    this._history = []; // ✅ histórico

    this.initialize();
    this.initButtonsEvents();
    this.initKeyboard();
  }

  initialize() {
    this.setDisplayDateTime();
    setInterval(() => {
      this.setDisplayDateTime();
    }, 1000);

    this.setLastNumberToDisplay();
    this.pasteFromClipboard();
  }

  // =========================
  // HISTÓRICO
  // =========================
  addToHistory(valorAtual, valorOperacao, operacao, resultado) {
    const historico = `${valorAtual} ${operacao} ${valorOperacao} = ${resultado}`;
    this._history.push(historico);

    console.log("Histórico:", this._history);
  }

  getHistory() {
    return this._history;
  }

  // =========================
  // ÁUDIO
  // =========================
  toggleAudio() {
    this._audioOnOff = !this._audioOnOff;
  }

  playAudio() {
    if (this._audioOnOff) {
      this._audio.currentTime = 0;
      this._audio.play();
    }
  }

  // =========================
  // CLIPBOARD
  // =========================
  pasteFromClipboard() {
    document.addEventListener('paste', e => {
      let text = e.clipboardData.getData('Text');
      this.displayCalc = parseFloat(text);
    });
  }

  copyToClipboard() {
    let input = document.createElement('input');
    input.value = this.displayCalc;
    document.body.appendChild(input);

    input.select();
    document.execCommand("copy");
    input.remove();
  }

  // =========================
  // TECLADO
  // =========================
  initKeyboard() {
    document.addEventListener('keyup', e => {
      this.playAudio();

      switch (e.key) {
        case 'Escape':
          this.clearAll();
          break;

        case 'Backspace':
          this.clearEntry();
          break;

        case '+':
        case '-':
        case '/':
        case '*':
        case '%':
          this.addOperation(e.key);
          break;

        case 'Enter':
        case '=':
          this.calc();
          console.table(this._history); // debug
          break;

        case ".":
        case ",":
          this.addDot();
          break;

        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          this.addOperation(parseInt(e.key));
          break;

        case 'c':
          if (e.ctrlKey) this.copyToClipboard();
          break;
      }
    });
  }

  // =========================
  // OPERAÇÕES
  // =========================
  clearAll() {
    this._operation = [];
    this._lastNumber = "";
    this._lastOperator = "";
    this.setLastNumberToDisplay();
  }

  clearEntry() {
    this._operation.pop();
    this.setLastNumberToDisplay();
  }

  getLastOperation() {
    return this._operation[this._operation.length - 1];
  }

  isOperator(value) {
    return ["+", "-", "*", "/", "%"].includes(value);
  }

  setLastOperation(value) {
    this._operation[this._operation.length - 1] = value;
  }

  pushOperation(value) {
    this._operation.push(value);

    if (this._operation.length > 3) {
      this.calc();
    }
  }

  getResult() {
    try {
      return eval(this._operation.join(""));
    } catch (e) {
      this.setError();
    }
  }

  // =========================
  // CALC (CORRIGIDO)
  // =========================
  calc() {

    let last = '';
    this._lastOperator = this.getLastItem();

    if (this._operation.length < 3) {
      let firstItem = this._operation[0];
      this._operation = [firstItem, this._lastOperator, this._lastNumber];
    }

    if (this._operation.length > 3) {
      last = this._operation.pop();
      this._lastNumber = this.getResult();
    } else if (this._operation.length == 3) {
      this._lastNumber = this.getLastItem(false);
    }

    let result = this.getResult();

    // ✅ SALVA HISTÓRICO AQUI (CORRETO)
    if (
      this._operation.length === 3 &&
      !isNaN(this._operation[0]) &&
      !isNaN(this._operation[2])
    ) {
      let result = this.getResult();

if (
  this._operation.length === 3 &&
  !isNaN(this._operation[0]) &&
  !isNaN(this._operation[2])
) {
  let valorAtual = Number(this._operation[0]);
  let operacao = this._operation[1];
  let valorOperacao = Number(this._operation[2]);

  this.addToHistory(valorAtual, valorOperacao, operacao, result);
}

      this._operation = [result];
    } else {
      this._operation = [result];
      if (last) this._operation.push(last);
    }

    this.setLastNumberToDisplay();
  }

  // =========================
  // AUX
  // =========================
  getLastItem(isOperator = true) {
    let lastItem;

    for (let i = this._operation.length - 1; i >= 0; i--) {
      if (this.isOperator(this._operation[i]) == isOperator) {
        lastItem = this._operation[i];
        break;
      }
    }

    if (!lastItem) {
      lastItem = isOperator ? this._lastOperator : this._lastNumber;
    }

    return lastItem;
  }

  setLastNumberToDisplay() {
    let lastNumber = this.getLastItem(false);
    if (!lastNumber) lastNumber = 0;

    this.displayCalc = lastNumber;
  }

  addOperation(value) {
    if (isNaN(this.getLastOperation())) {

      if (this.isOperator(value)) {
        this.setLastOperation(value);
      } else {
        this.pushOperation(value);
        this.setLastNumberToDisplay();
      }

    } else {

      if (this.isOperator(value)) {
        this.pushOperation(value);
      } else {
        let newValue = this.getLastOperation().toString() + value.toString();
        this.setLastOperation(newValue);
        this.setLastNumberToDisplay();
      }
    }
  }

  addDot() {
    let lastOperation = this.getLastOperation();

    if (typeof lastOperation === 'string' && lastOperation.includes('.')) return;

    if (this.isOperator(lastOperation) || !lastOperation) {
      this.pushOperation('0.');
    } else {
      this.setLastOperation(lastOperation.toString() + '.');
    }

    this.setLastNumberToDisplay();
  }

  setError() {
    this.displayCalc = "error";
  }

  // =========================
  // DISPLAY
  // =========================
  setDisplayDateTime() {
    this.displayDate = this.currentDate.toLocaleDateString(this._locale);
    this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
  }

  get displayCalc() {
    return this._displayCalcEl.innerHTML;
  }

  set displayCalc(value) {
    if (value.toString().length > 10) {
      this.setError();
      return;
    }

    this._displayCalcEl.innerHTML = value;
  }

  get displayTime() {
    return this._timeEl.innerHTML;
  }

  set displayTime(value) {
    this._timeEl.innerHTML = value;
  }

  get displayDate() {
    return this._dateEl.innerHTML;
  }

  set displayDate(value) {
    this._dateEl.innerHTML = value;
  }

  get currentDate() {
    return new Date();
  }

  // =========================
  // BOTÕES
  // =========================
  addEventListenerAll(element, events, fn) {
    events.split(' ').forEach(event => {
      element.addEventListener(event, fn, false);
    });
  }

  execBtn(value) {
    this.playAudio();

    switch (value) {
      case 'ac': this.clearAll(); break;
      case 'ce': this.clearEntry(); break;
      case 'soma': this.addOperation("+"); break;
      case 'subtracao': this.addOperation("-"); break;
      case 'divisao': this.addOperation("/"); break;
      case 'multiplicacao': this.addOperation("*"); break;
      case 'porcento': this.addOperation("%"); break;
      case 'igual':
        this.calc();
        console.table(this._history);
        break;
      case "ponto": this.addDot(); break;

      default:
        if (!isNaN(parseInt(value))) {
          this.addOperation(parseInt(value));
        } else {
          this.setError();
        }
        break;
    }
  }

  initButtonsEvents() {
    let buttons = document.querySelectorAll("#buttons > g, #parts > g");

    buttons.forEach(btn => {
      this.addEventListenerAll(btn, 'click drag', e => {
        let textBtn = btn.className.baseVal.replace("btn-", "");
        this.execBtn(textBtn);
      });

      this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
        btn.style.cursor = "pointer";
      });
    });
  }
}