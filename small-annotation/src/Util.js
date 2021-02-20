export function titleCase(string: string) {
  if(string.length == 0) {
    return string;
  }
  var sentence = string.toLowerCase().split(" ");
  for (var i = 0; i < sentence.length; i++) {
    if(sentence[i].length == 0) {
      sentence[i] ="";
    }
    else {
      sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
      sentence[i] =
        sentence[i][0] === "("
          ? "(" + sentence[i][1].toUpperCase() + sentence[i].slice(2)
          : sentence[i];
    }
  }
  return sentence.join(" ");
}

export function toNormalString(s: string): string {
  s = s.replace(/ /g,"_");
  s = s.toLowerCase();
  let new_string = "";
  for(var i = 0;i<s.length;i++) {
    if(s.charCodeAt(i)<255) {
      new_string+=s.charAt(i);
    }
    else {
      let hex = s.charCodeAt(i);
      new_string+="\\u"+("0000" + (hex).toString(16)).substr(-4);;
    }
  }
  
  return s;
}

export function toNiceString(s: string): string {
    if(s === null || s === undefined ) {
      return s;
    }
  
    s = s.replace(/_/g, " ");
    let nice_string = "";
    let i =0;
    while(i<s.length) {
        if(i+6<s.length && s.charAt(i) == '\\' && s.charAt(i+1) == 'u') {
            const num = parseInt(s.substring(i+2,i+6));
            nice_string+=String.fromCharCode(num);
            i+=6;
        }
        else {
            nice_string+=s.charAt(i);
            i+=1;
        }
    }
    return titleCase(nice_string);
}

export function all_but_first(l) {
  let a = l.slice();
  a.shift();
  return a;
}

export function getSelectionCharacterOffsetsWithin (element){
    var startOffset = 0, endOffset = 0;
    if (typeof window.getSelection != "undefined") {
      
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        startOffset = preCaretRange.toString().length;
        endOffset = startOffset + range.toString().length;
    } else if (typeof document.selection != "undefined" &&
               document.selection.type != "Control") {
        var textRange = document.selection.createRange();
        var preCaretTextRange = document.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToStart", textRange);
        startOffset = preCaretTextRange.text.length;
        endOffset = startOffset + textRange.text.length;
    }
    return { start: startOffset, end: endOffset };
  }
