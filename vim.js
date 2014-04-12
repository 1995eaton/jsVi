var cu, ed;
var L = console.log.bind(console);
var buffer;
var lCol;
var history = [];
var histIndex = 0;
function Cursor(ta, fg, bg) {
  this.fg = fg;
  this.bg = bg;
  this.el = document.createElement("div");
  this.el.style.position = "absolute";
  this.el.style.backgroundColor = bg;
  this.el.style.color = fg;
  this.el.style.padding = "0";
  this.el.style.fontFamily = "monospace";
  this.history = [];
  this.el.style.margin = "0";
  this.el.style.fontSize = "10pt";
  this.el.innerText = ta.value[0];
  this.el.style.zIndex = "50";
  ta.parentNode.insertBefore(this.el, ta);
  this.x = ta.offsetLeft;
  this.pauseBlink = true;
  this.y = ta.offsetTop + 1;
  this.line = 0;
  this.pos = 0;
  this.column = 0;
  this.el.style.top = this.y + "px";
  this.el.style.left = this.x + "px";
};
var oldLen = 0;
var LCW;
function fillLines() {
  var lines = ed.el.value.split("\n");
  var len = lines.length - 1;
  if (len === oldLen) {
    return false;
  }
  oldLen = len;
  lCol.innerHTML = "";
  var totH = 0;
  var liH;
  var ls = len.toString().length;
  console.log(ls);
  LCW = 13 * ls;
  lCol.style.width = LCW + "px";
  ed.el.parentNode.style.width = window.innerWidth - LCW + "px";
  ed.el.parentNode.style.left = LCW + "px";
  for (var i = 0; i < len; i++) {
    var li = document.createElement("li");
    li.innerText = i;
    lCol.appendChild(li);
    if (!liH) liH = li.offsetHeight;
  }
  totH = liH * len;
  while (totH < document.body.scrollTop + window.innerHeight) {
    var li = document.createElement("li");
    li.innerText = "~";
    lCol.appendChild(li);
    totH += liH;
  }
}

Editor.prototype.setMode = function(mode) {
  this.el.spellcheck = false;
  if (this.mode !== "INSERT" && mode === "INSERT") {
  }
  this.modeText.innerText = "-- " + mode + " --";
}

Cursor.prototype.refresh = function() {
  var lines = ed.el.value.split("\n");
  var cur = lines[this.line];
  if (this.line >= lines.length) {
    cu.move("top");
    cu.move("bottom");
    return;
  }
  if (cur[this.column]) {
    this.el.innerHTML = cur[this.column].replace(" ", "&nbsp;");
  } else {
    this.el.innerHTML = "&nbsp;";
    this.move("last");
  }
};

Cursor.prototype.moveTo = function(x, y) {
  this.column = x;
  this.line = y;
  this.x = this.column * this.el.offsetWidth;
  this.y = this.line * this.el.offsetHeight;
  this.el.style.left = this.x + "px";
  this.el.style.top = this.y + "px";
  this.refresh();
};

function Editor(ta) {
  this.el = ta;
  this.id = "editor";
  this.modeText = document.createElement("div");
  this.el.parentNode.appendChild(this.modeText);
  this.modeText.id = "mode";
  this.setMode("NORMAL");
};

Cursor.prototype.blink = function(rate) {
  setInterval(function() {
    this.el.style.opacity = (this.pauseBlink || this.el.style.opacity === "0") ? "1" : "0";
  }.bind(this), rate);
}

Cursor.prototype.move = function(direction, r) {
  var lines = ed.el.value.split("\n");
  if (lines.length === 1 && lines[0] === "") {
    return false;
  }
  switch (direction) {
    case "right":
      if (this.column + 1 >= lines[this.line].length) break;
      if (this.line === lines.length || lines[this.line].length - 1 === this.column || !lines[this.line].length) {
        break;
      }
      this.x += this.el.offsetWidth;
      this.el.style.left = this.x + "px";
      this.column++;
      if (this.column < lines[this.line].length) {
        if (this.posRes) {
          this.column -= this.posRes + 1;
          this.posRes = 0;
        }
        this.el.innerHTML = lines[this.line][this.column].replace(" ", "&nbsp;");
      }
      break;
    case "left":
      if (this.column === 0 && this.line === 0) {
        break;
      }
      if (this.x - this.el.offsetWidth >= 0) {
      this.x -= this.el.offsetWidth;
      this.el.style.left = this.x + "px";
      this.column--;
        if (this.posRes) {
          this.column -= this.posRes + 1;
          this.posRes = 0;
        }
        if (this.column < lines[this.line].length) {
          this.el.innerHTML = lines[this.line][this.column].replace(" ", "&nbsp;");
        } else {
          this.el.innerHTML = lines[this.line][lines[this.line].length -2].replace(" ", "&nbsp;");
        }
      }
      break;
    case "up":
      if (this.line === 0) {
        break;
      }
      this.line--;
      this.y -= this.el.offsetHeight;
      this.el.style.top = this.y + "px";
      var curline = lines[this.line];
      if (this.column >= curline.length) {
        this.posRes = this.column - curline.length;
        if (curline.length) {
          this.el.innerHTML = curline[curline.length - 1].replace(" ", "&nbsp;");
          this.x = 0 + (curline.length - 1) * this.el.offsetWidth;
        } else {
          this.el.innerHTML = "&nbsp;";
          this.x = 0;
        }
        this.el.style.left = this.x + "px";
      } else {
        this.posRes = 0;
        if (curline.length) {
          this.el.innerHTML = curline[this.column].replace(" ", "&nbsp;");
        } else {
          this.el.innerHTML = "&nbsp;";
        }
        this.x = 0 + this.column * this.el.offsetWidth;
        this.el.style.left = this.x + "px";
      }
      break;
    case "down":
      if (this.line + 1 >= lines.length) {
        break;
      }
      this.line++;
      this.y += this.el.offsetHeight;
      this.el.style.top = this.y + "px";
      var curline = lines[this.line];
      if (this.column >= curline.length) {
        this.posRes = this.column - curline.length;
        if (curline.length) {
          this.el.innerHTML = curline[curline.length - 1].replace(" ", "&nbsp;");
          this.x = 0 + (curline.length - 1) * this.el.offsetWidth;
        } else {
          this.el.innerHTML = "&nbsp;";
          this.x = 0;
        }
        this.el.style.left = this.x + "px";
      } else {
        this.posRes = 0;
        if (curline.length) {
          this.el.innerHTML = curline[this.column].replace(" ", "&nbsp;");
        } else {
          this.el.innerHTML = "&nbsp;";
          this.column = 0;
        }
        this.x = 0 + this.column * this.el.offsetWidth;
        this.el.style.left = this.x + "px";
      }
      break;
    case "first":
      if (!lines[this.line].length) {
        break;
      }
      this.x = 0;
      this.column = 0;
      this.el.style.left = this.x + "px";
      this.posRes = 0;
      this.el.innerHTML = lines[this.line][0].replace(" ", "&nbsp;");
      break;
    case "last":
      if (!lines[this.line].length) {
        break;
      }
      var curline = lines[this.line];
      if (r) i = 0;
      else i = 1;
      this.column = curline.length - i;
      this.x = 0 + this.column * this.el.offsetWidth;
      this.el.style.left = this.x + "px";
      if (r) {
        this.el.innerHTML = "&nbsp;";
      } else {
        this.el.innerHTML = curline[curline.length - 1].replace(" ", "&nbsp;");
      }
      this.posRes = 0;
      break;
    case "start":
      var index = lines[this.line].length - lines[this.line].trimLeft().length;
      if (index === 1 && lines[this.line] === " ") index = 0;
      this.x = index * this.el.offsetWidth;
      this.column = index;
      this.el.style.left = this.x + "px";
      if (lines[this.line][index] === undefined) {
        this.el.innerHTML = "&nbsp;";
      } else {
        this.el.innerHTML = lines[this.line][index].replace(" ", "&nbsp;");
      }
      break;
    case "bottom":
      cu.move("top");
      c = this.line;
      do {
        cu.move("down");
        if (this.line === c) {
          break;
        }
      } while (c = this.line)
      cu.move("start");
      break;
    case "top":
      this.posRes = 0;
      this.x = 0;
      this.y = 0;
      this.line = 0;
      this.column = 0;
      this.el.style.top = this.y + "px";
      this.el.style.left = this.x + "px";
      this.el.innerHTML = lines[0][0].replace(" ", "&nbsp;") || "&nbsp;";
      break;
  }
};

function yank() {
  buffer = undefined;
  var line = ed.el.value.split("\n")[cu.line];
  buffer = line;
}

function paste() {
  if (buffer === undefined) return;
  var lines = ed.el.value.split("\n");
  lines.splice(cu.line + 1, 0, buffer);
  ed.el.value = lines.join("\n");
  cu.move("down");
}

function addChar(ch) {
  var lines = ed.el.value.split("\n");
  var l = lines[cu.line];
  var fst = l.substring(0, cu.column);
  var lst = l.slice(cu.column);
  cu.column++;
  cu.x += cu.el.offsetWidth;
  cu.el.style.left = cu.x + "px";
  lines[cu.line] = fst + ch + lst;
  ed.el.value = lines.join("\n");
  if (ch === "\n") {
    cu.y += cu.el.offsetHeight;
    cu.x = 0;
    cu.column = 0;
    cu.line++;
    cu.el.style.top = cu.y + "px";
    cu.el.style.left = cu.x + "px";
  }
};

function deleteWord(n) {
  n = n | 1;
  var col = cu.column || 1;
  var row = cu.line   || 1;
  var b = (cu.column + 1) * (cu.line + 1);
  var l = ed.el.value.split("\n").join(" ");
  var s = l.substring(b);
  if (!s.length) return false;
  var m = l.match(new RegExp("^(([A-Za-z_]+)?(\s+)?){0," + n + "}"));
}

function deleteChar(normal) {

  if (cu.posRes) {
    cu.column -= cu.posRes + 1;
    cu.posRes = 0;
  }
  var lines = ed.el.value.split("\n");
  if (lines[0] === "" && lines.length === 1) {
    return false;
  }
  var l = lines[cu.line];
  var i;
  if (cu.column + 1 === l.length) {
    i = 1;
  } else i = 1;
  if (!normal) {
    if (cu.line === 0 && cu.column === 0) return false;
    var fst = l.substring(0, cu.column - i);
    var lst = l.slice(cu.column);
    cu.column--;
    if (cu.x - cu.el.offsetWidth < 0) {
      lines.splice(cu.line, 1);
      cu.line--;
      cu.y -= cu.el.offsetHeight;
      cu.column = lines[cu.line].length;
      cu.x = 0 + lines[cu.line].length * cu.el.offsetWidth;
      cu.el.style.left = cu.x + "px";
      cu.el.style.top = cu.y + "px";
      lines[cu.line] += fst + lst;
    } else {
      if (ed.mode === "INSERT" && lines[cu.line].length - 2 === cu.column) {
        lines[cu.line] = lines[cu.line].slice(0, -1);
        ed.el.value = lines.join("\n");
        cu.move("last", true);
        cu.el.innerHTML = "&nbsp;";
        return;
      } else {
        cu.x -= cu.el.offsetWidth;
        cu.el.style.left = cu.x + "px";
        lines[cu.line] = fst + lst;
      }
    }
  } else {
    var fst = l.substring(0, cu.column);
    var lst = l.slice(cu.column + 1);
    lines[cu.line] = fst + lst;
    var ch = lines[cu.line][cu.column];
    while (!ch && cu.column > 0) {
      cu.column--;
      ch = lines[cu.line][cu.column];
      cu.x -= cu.el.offsetWidth;
      cu.el.style.left = cu.x + "px";
    }
    if (ch === undefined) {
      cu.el.innerHTML = "&nbsp;";
    } else {
      cu.el.innerHTML = ch.replace(" ", "&nbsp;");
    }
  }
  if (cu.column < 0) cu.column = 0;
  ed.el.value = lines.join("\n");
}

function newLine() {
  var lines = ed.el.value.split("\n");
  var lst = lines.splice(cu.line);
  lines = lines.join("\n") + "\n\n" + lst.join("\n");
  ed.el.value = lines;
  cu.y += cu.el.offsetHeight;
  cu.x = 0;
  cu.column = 0;
  cu.line++;
  cu.el.style.top = cu.y + "px";
  cu.el.style.left = cu.x + "px";
}

function triggerKey(ch) {
  var ev = document.createEvent("Events");
  if (typeof ch === "string") {
    var key = ch.charCodeAt(0);
    ev.initEvent("keypress", true, true);
  } else {
    key = ch;
    ev.initEvent("keydown", true, true);
  }
  ev.which = key;
  document.dispatchEvent(ev);
}

function deleteLine() {
  var lines = ed.el.value.split("\n");
  if (!lines.length) {
    return false;
  }
  lines.splice(cu.line, 1);
  ed.el.value = lines.join("\n");
  cu.x = 0;
  cu.el.style.left = cu.x + "px";
  cu.column = 0;
  if (cu.line === lines.length) {
    cu.move("up");
    if (lines.length === 1) {
      cu.line = 0;
      cu.y = 0;
      cu.el.style.top = cu.y + "px";
    }
  }
  if (cu.line === 0) {
    cu.move("first");
  }
  if (lines[cu.line] && lines[cu.line].length) {
    cu.el.innerHTML = lines[cu.line][0].replace(" ", "&nbsp;");
  } else {
    cu.el.innerHTML = "&nbsp;";
  }
}

function insertText(te) {
  var lines = ed.el.value.split("\n");
  var cur = lines[cu.line];
  if (!cur.length) return;
  var left = cur.substring(0, cu.column);
  var right = cur.slice(cu.column);
  if (cu.column + 1 !== cur.length) {
    lines[cu.line] = left + te + right;
  } else {
    lines[cu.line] = left + te;
  }
  ed.el.value = lines.join("\n");
  if (te === "\n") {
    cu.y += cu.el.offsetHeight;
    cu.x = 0;
    cu.column = 0;
    cu.line++;
    cu.el.style.top = cu.y + "px";
    cu.el.style.left = cu.x + "px";
    cu.move("up");
    cu.move("down");
    return;
  }
  cu.el.innerHTML = lines[cu.line][cu.column].replace(" ", "&nbsp;");

}

function replaceChar(ch) {
  if (ed.el.value.split("\n")[cu.line].length === 0) return false;
  if (cu.column + 1 === ed.el.value.split("\n")[cu.line].length) {
    triggerKey("A");
    triggerKey(8);
  } else {
    deleteChar(true);
    triggerKey("i");
  }
  if (ch === "\n") {
    triggerKey("\n");
  } else {
    triggerKey(ch);
  }
  triggerKey(27);
}

function openLine(above) {
  if (above) {
    triggerKey("0");
    triggerKey("i");
    triggerKey("\n");
    triggerKey(27);
    cu.move("up");
    triggerKey("i");
  } else {
    triggerKey("A");
    triggerKey("\n");
  }
}

function previousWord(nl) {
  var lines = ed.el.value.split("\n");
  var l = lines[cu.line];
  l = l.substring(0, cu.column);
  // if (nl) l += " ";
  var m = l.match(/(([a-zA-Z_]+)|\S)?(\s+)?$/);
  if (!m || (nl && m[0].length === 1)) {
    return false;
  }
  if (cu.column === 0) {
    if (cu.line === 0) {
      return triggerKey("0");
    }
    triggerKey("k");
    triggerKey("$");
    previousWord(true);
  } else {
    cu.moveTo(cu.column - m[0].length, cu.line);
  }
}

function nextWord() {
  var lines = ed.el.value.split("\n");
  var l = lines[cu.line];
  l = l.substring(cu.column);
  var m = l.match(/^(([a-zA-Z_]+)|\S)?(\s+)?/);
  if (!m || !m[0].length) {
    return false;
  }
  if (m[0].length === l.length) {
    if (cu.line + 1 === lines.length) {
      return false;
    }
    triggerKey("j");
    triggerKey("0");
  } else {
    cu.moveTo(cu.column + m[0].length, cu.line);
  }
}

function indent(left) {
  var lines = ed.el.value.split("\n");
  if (lines[cu.line].length === 0) return false;
  if (left) {
    var cur = lines[cu.line];
    cur = cur.replace(/^( ){0,2}/, "");
    var index = cur.length - cur.trimLeft().length;
    lines[cu.line] = cur;
    ed.el.value = lines.join("\n");
    cu.column = index;
    cu.el.innerHTML = lines[cu.line][cu.column] || "&nbsp;";
    cu.x = index * cu.el.offsetWidth;
    cu.el.style.left = cu.x + "px";
  } else {
    var cur = lines[cu.line];
    cur = "  " + cur;
    var index = cur.length - cur.trimLeft().length;
    lines[cu.line] = cur;
    ed.el.value = lines.join("\n");
    cu.column = index;
    cu.el.innerHTML = lines[cu.line][cu.column] || "&nbsp;";
    cu.x = index * cu.el.offsetWidth;
    cu.el.style.left = cu.x + "px";
  }
}
var numbers = "1";
var keyBuffer = "";
document.addEventListener("DOMContentLoaded", function() {
  ed = new Editor(document.getElementById("vi"));
  ed.mode = "NORMAL";
  cu = new Cursor(ed.el, "#000", "#fff");
  var blinkSpeed = 500;
  ed.el.addEventListener("focus", function() {
    document.activeElement.blur();
    ed.focused = true;
  });
  ed.el.addEventListener("blur", function() {
    ed.focused = false;
  });
  ed.el.focus();
  var blink;
  var dpress, gpress, replace;
  var ignoreCuHis;
  document.addEventListener("keypress", function(e) {
    var lines = ed.el.value.split("\n");
    if (!ed.focused) return false;
    if (replace) {
      replace = false;
      if (e.which === 13) {
        return replaceChar("\n");
      }
      return replaceChar(String.fromCharCode(e.which));
    }
    if (ed.mode === "INSERT" || !/[1-9]/.test(String.fromCharCode(e.which))) {
      var c = cu.column;
      var d = cu.line;
      var v = ed.el.value;
      var bufferLen = keyBuffer.length;
      switch (ed.mode) {
        case "NORMAL":
          cu.history.push([cu.column, cu.line]);
          var def = ed.el.value;
          switch (String.fromCharCode(e.which)) {
            case "l":
              if (keyBuffer === "d") {
                cu.move("right", 1);
                keyBuffer = "";
                if (cu.column + 1 === lines[cu.line].length) {
                  deleteChar(true);
                } else {
                  deleteChar();
                }
              } else if (keyBuffer === "c") {
                if (cu.column + 1 === lines[cu.line].length) {
                  triggerKey("x");
                  triggerKey("A");
                } else {
                  triggerKey("x");
                  triggerKey("i");
                }
              } else {
                cu.move("right", 1);
              }
              break;
            case "h":
              if (keyBuffer === "d") {
                keyBuffer = "";
                if (cu.column > 0) {
                  deleteChar();
                }
              } else {
                cu.move("left", 1);
                if (keyBuffer === "c") {
                  triggerKey("x");
                  triggerKey("i");
                }
              }
              break;
            case "k":
              if (keyBuffer.length && keyBuffer === "d") {
                keyBuffer = "";
                if (cu.line + 1 === lines.length) {
                  deleteLine();
                  deleteLine();
                  break;
                }
                deleteLine();
                if (cu.line !== 0) {
                  cu.move("up");
                  deleteLine();
                }
              } else if (keyBuffer === "c") {
                var oline = cu.line;
                deleteLine();
                if (oline === 0) {
                  triggerKey("O");
                } else {
                  if (oline + 1 < ed.el.value.split("\n").length) {
                    cu.move("up");
                  } else {
                    deleteLine();
                    triggerKey("o");
                    break;
                  }
                  deleteLine();
                  cu.move("up");
                  if (oline === 1) {
                    triggerKey("O");
                  } else {
                    triggerKey("A");
                    triggerKey("\n");
                  }
                }
              } else {
                cu.move("up", 1);
              }
              break;
            case "j":
              if (keyBuffer === "d") {
                if (cu.line + 1 !== lines.length) {
                  deleteLine();
                }
                deleteLine();
                keyBuffer = "";
              } else if (keyBuffer === "c") {
                var oline = cu.line;
                deleteLine();
                if (oline + 1 !== lines.length) {
                  keyBuffer = "c";
                  triggerKey("c");
                } else {
                  triggerKey("o");
                }
              } else {
                cu.move("down", 1);
              }
              break;
            case "w":
              if (keyBuffer === "d") {
                deleteWord();
              } else {
                nextWord();
              }
              break;
            case "d":
              if (keyBuffer.length && keyBuffer === "d") {
                keyBuffer = "";
                deleteLine();
              } else {
                keyBuffer += "d";
              }
              break;
            case "0":
              cu.move("first");
              break;
            case "c":
              if (keyBuffer === "c") {
                keyBuffer = "";
                deleteLine();
                if (cu.line + 1 === ed.el.value.split("\n").length) {
                  deleteLine()
                    triggerKey("o");
                } else if (cu.line > 0) {
                  cu.move("up");
                  triggerKey("A");
                  triggerKey("\n");
                } else {
                  triggerKey("O");
                }
              } else keyBuffer += "c";
              break;
            case "$":
              cu.move("last");
              break;
            case "G":
              cu.move("bottom");
              break;
            case "g":
              if (keyBuffer.length && keyBuffer === "g") {
                cu.move("top");
              } else keyBuffer += "g";
              break;
            case "x":
              deleteChar(true);
              break;
            case "y":
              yank();
              break;
            case "p":
              paste();
              break;
            case "b":
              previousWord(false);
              break;
            case "A":
              ed.mode = "INSERT";
              cu.move("last", true);
              break;
            case "w":
              nextWord();
              break;
            case "i":
              ed.mode = "INSERT";
              break;
            case "r":
              replace = true;
              break;
            case "a":
              var c = cu.column;
              cu.move("right");
              if (c === cu.column) {
                triggerKey("A");
              }
              ed.mode = "INSERT";
              break;
            case "s":
              ed.mode = "INSERT";
              if (ed.el.value.split("\n")[cu.line].length > 0) {
                cu.move("right");
                deleteChar();
              }
              break;
            case "o":
              openLine();
              break;
            case "O":
              openLine(true);
              break;
            case "^":
              cu.move("start");
              break;
            case "u":
              if (histIndex > 0) {
                histIndex--;
                ed.el.value = history[histIndex];
                cu.refresh();
                cu.moveTo(cu.history[histIndex][0], cu.history[histIndex][1]);
              }
              break;
            case "R":
              if (histIndex + 1 < history.length) {
                histIndex++;
                ed.el.value = history[histIndex];
                cu.moveTo(cu.history[histIndex - 1][0], cu.history[histIndex - 1][1]);
              }
              break;
            case "<":
              if (keyBuffer === "<") {
                indent(true);
              } else {
                keyBuffer += "<";
              }
              break;
            case ">":
              if (keyBuffer === ">") {
                indent();
              } else {
                keyBuffer += ">";
              }
              break;
            case "I":
              ed.mode = "INSERT";
              cu.move("first");
              break;
            default:
              keyBuffer = "";
              break;
          }
          if (bufferLen === 1 && keyBuffer.length) {
            keyBuffer = "";
          }
          var hs = /R|u/.test(String.fromCharCode(e.which));
          if (!hs) {
            if (def === ed.el.value) {
              cu.history.pop();
            } else {
              if (histIndex + 1 !== history.length) {
                history = history.slice(0, histIndex + 1);
                cu.history = cu.history.slice(0, histIndex + 1);
                histIndex = history.length - 1;
              }
              history.push(ed.el.value);
              histIndex++;
            }
          } else cu.history.pop();
          break;
        case "INSERT":
          if (e.which === 48) {
            break;
          }
          if (e.which !== 13) {
            addChar(String.fromCharCode(e.which));
          } else {
            addChar("\n");
            triggerKey("i");
            deleteChar();
          }
          break;
      }
    }
    var relTop = cu.el.offsetTop - window.pageYOffset;
    if (relTop + 2 * cu.el.offsetHeight >= window.innerHeight) {
      document.body.scrollTop = cu.el.offsetTop + 2 * cu.el.offsetHeight - window.innerHeight;
      lCol.scrollTop = cu.el.offsetTop + 2 * cu.el.offsetHeight - window.innerHeight;
    } else if (relTop < 0) {
      document.body.scrollTop = cu.el.offsetTop;
      lCol.scrollTop = cu.el.offsetTop;
    }
    // Da fuq, fix dis shit
    if (cu.column === 0) {
      document.body.scrollLeft = 0;
    } else if (cu.el.offsetLeft - cu.el.offsetWidth + LCW < document.body.scrollLeft) {
      document.body.scrollLeft = cu.el.offsetLeft + LCW;
    } else if (cu.el.offsetLeft + LCW + cu.el.offsetWidth > document.body.scrollLeft + window.innerWidth) {
      document.body.scrollLeft = cu.el.offsetLeft + LCW + cu.el.offsetWidth - window.innerWidth;
    }
    ed.el.value += "\n";
    ed.el.style.height = ed.el.scrollHeight + "px";
    ed.el.value = ed.el.value.replace(/\n$/, "");
    if (ed.setMode(ed.mode));
  });
  document.addEventListener("keydown", function(e) {
    if (e.which === 82 && e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey && ed.mode !== "INSERT") {
      triggerKey("R");
      e.preventDefault();
    } else if (e.which === 82 && e.shiftKey) {
      window.location = document.URL;
    }
    if (ed.focused) {
      clearInterval(blink);
      cu.pauseBlink = true;
      cu.el.style.opacity = "1";
      blink = setTimeout(function() {
        cu.pauseBlink = false;
      }, blinkSpeed);
      if (e.which === 27 || (e.which === 219 && e.ctrlKey)) {
        if (ed.mode === "INSERT") {
          cu.move("left");
          if (ed.el.value !== history[history.length - 1]) {
            history.push(ed.el.value);
            cu.history.push([cu.column, cu.line]);
            histIndex++;
          }
        }
        ed.mode = "NORMAL";
        ed.setMode("NORMAL");
      } else if (e.which === 8 && ed.mode === "INSERT") {
        deleteChar();
      } else if (e.which === 9 && ed.mode === "INSERT") {
        triggerKey(" ");
        triggerKey(" ");
      } else if (e.which === 8 && ed.mode === "NORMAL") {
        var c = cu.column;
        cu.move("left");
        if (cu.column === c && cu.line !== 0) {
          cu.move("up");
          cu.move("last");
        }
      } else if (e.which === 32 && ed.mode === "NORMAL") {
        var c = cu.column;
        cu.move("right");
        if (cu.column === c && cu.line + 1 !== ed.el.value.split("\n").length) {
          cu.move("down");
          cu.move("first");
        }
      }
    }
    setTimeout(function() {
      fillLines();
    }, 5);
  });
  ed.el.style.height = ed.el.scrollHeight + 50 + "px";
  cu.blink(blinkSpeed);
  history.push(ed.el.value);
  cu.y -= 1;
  cu.el.style.top = cu.y + 'px';
  lCol = document.getElementById("line_column").firstElementChild;
  fillLines();
});
