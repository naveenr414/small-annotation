export function arrayRotate(arr, n) {
    let dup = arr.slice();
    for(var i = 0;i<n;i++) {
      dup.push(dup.shift());
    }
    return dup;
}


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
        sentence[i][0] === "(" && sentence[i].length>1
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

export function intersects(span_1,span_2) {
    return Math.max(span_1[0],span_2[0])<=Math.min(span_1[1],span_2[1]);
}

export function span_length(span) {
    return span[1]-span[0];
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

export function getCookie(cname: string) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function undefinedOrEmpty(l) {
  return l==undefined?[]:l;
}

export function emptyOrValue(a,b) {
  return a==""?b:a;
}

export function setCookie(cname: string, cvalue: any, exdays: number) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const categories = ['Any','Literature', 'Social Science', 'History', 'Science', 'Fine Arts', 'Trash', 'Religion', 'Philosophy', 'Geography', 'Mythology', 'Current Events'];
const difficulties = ['Middle School','High School','College','Open'];
let tournaments ={'Middle School': {2016: ['SCOP MS 6'], 2010: ['Collaborative MS Tournament'], 2011: ['Collaborative MS Tournament'], 2012: ['Collaborative MS Tournament'], 2013: ['Collaborative MS Tournament'], 2015: ['SCOP MS 5']}, 'High School': {1998: ['PACE NSC'], 2000: ['PACE NSC'], 2001: ['PACE NSC'], 2002: ['PACE NSC'], 2003: ['PACE NSC', 'Delta Burke'], 2004: ['Illinois Earlybird', 'PACE NSC'], 2005: ['Maryland Spring Classic', 'Illinois Earlybird', 'Crusader Cup', 'PACE NSC'], 2006: ['Illinois Earlybird', 'WUHSAC VIII', 'Maryland Spring Classic', 'PACE NSC'], 2007: ['Maryland Spring Classic', 'Maggie Walker GSAC XV', 'WUHSAC IX'], 2008: ['NTV', 'HSAPQ NSC 1', 'HFT', 'HSAPQ NSC 2', 'PACE NSC', 'HSAPQ 4Q 1', 'Chitin', 'NNT', 'Prison Bowl', 'QuAC I', 'Maggie Walker GSAC XVI', 'Bulldog High School Academic Tournament (BHSAT)', 'UIUC High School Solo', 'New Trier Scobol Solo', 'HAVOC', 'HSAPQ ACF 1', 'HSAPQ ACF 2', 'HSAPQ ACF 3'], 2009: ['HSAPQ 4Q1', 'HFT', 'HSAPQ 4Q2', 'HSAPQ Tournament 8', 'DAFT', 'HSAPQ Tournament 9', 'MW GSAC XVII', 'BATE', 'HSAPQ NASAT Tryout Set', 'HSAPQ Tournament 11', 'NTV', 'From Here To Eternity', 'HSAPQ Tournament 10', 'Fall Novice', 'Fall Kickoff Tournament', 'PACE NSC', 'Prison Bowl', 'U. of Georgia CCC', 'New Trier Scobol Solo', 'MOHIT (Thomas Jefferson)', 'WUHSAC XI', 'HAVOC II', 'BHSAT', 'Weekend of Quizbowl Saturday Event', 'Fall Kickoff Tournament (FKT)'], 2010: ['Fall Kickoff Tournament', 'Fall Novice', 'GDS Ben Cooper Memorial', 'Prison Bowl', 'NTSS', 'TJ NAREN', 'PACE NSC', 'BATE', 'BHSAT', 'Harvard Fall Tournament', 'Vanderbilt ABC/2011 VCU Winter', 'SCOP Novice', 'Maggie Walker GSAC XVIII', 'Maryland Spring Classic', 'Maggie Walker GSAC', 'Fall Kickoff Tournament (FKT)'], 2011: ['BHSAT', 'HSAPQ Colonia 2', 'HSAPQ Tournament 17', 'HSAPQ Tournament 16', 'HSAPQ VHSL Regular Season', 'PACE NSC', 'Prison Bowl', 'HSAPQ VHSL Regionals', 'HSAPQ National History Bowl', 'HSAPQ VHSL States', 'HSAPQ Tournament 15', 'HSAPQ VHSL Districts', 'St. Anselms and Torrey Pines', 'OLEFIN', 'Maggie Walker GSAC XIX', 'Centennial (MD) Housewrite', 'Fall Kickoff Tournament (FKT)', 'Ladue Invitational Spring Tournament', 'Minnesota Novice Set', 'New Trier Scobol Solo', 'BDAT I', 'Maggie Walker GSAC', 'SCOP Novice'], 2012: ['Ladue Invitational Sprint Tournament (LIST)', 'BHSAT', 'Prison Bowl', 'LIST (Ladue Invitational Spring Tournament)', 'SCOP 3', 'Ohio State/VCU housewrite', 'Ladue Invitational Spring Tournament', 'RAVE', 'New Trier Scobol Solo', 'Fall Kickoff Tournament (FKT)', 'Harvard Fall Tournament VII', 'Maryland Spring', 'MSU/UD Housewrite', 'Harvard Fall Tournament', 'LIST', 'Maggie Walker GSAC', 'SCOP Novice', 'PACE NSC'], 2013: ['JAMES', 'Ladue Invitational Sprint Tournament (LIST)', 'Brookwood Invitational Scholars Bowl', 'NTSS', 'Scobol Solo', 'LIST (Ladue Invitational Spring Tournament)', 'SASS', 'Prison Bowl', 'FKT', 'LIST', 'New Trier Scobol Solo', 'BHSAT', 'BISB', 'Maggie Walker GSAC', 'SCOP Novice', 'PACE NSC'], 2014: ['Ladue Invitational Sprint Tournament (LIST)', 'New Trier Scobol Solo', 'BHSAT', 'Prison Bowl', 'LIST (Ladue Invitational Spring Tournament)', 'PACE NSC', 'BELLOCO', 'LIST', 'Masonic', 'SCOP Novice'], 2015: ['BASK', "BISB (Brookwood Invitational Scholars' Bowl)", 'GSAC XXIII', 'HFT X', 'Maryland Fall', 'JAMES', 'PACE NSC'], 2016: ['A Bit of Lit', 'HFT XI', 'BHSAT', 'PACE NSC', 'WHAQ I'], 2017: ['Philly Cheesteak', 'RMBCT', 'WHAQ II', 'BHSAT', 'Ladue Invitational Sprint Tournament (LIST)', 'GSAC XXV', 'HFT XII', 'Prison Bowl', 'PACE NSC', 'History Bee Nationals'], 2018: ['Montgomery Blair Academic Tournament (MBAT)', 'FACTS', 'HFT XIII', 'Prison Bowl XI', 'BHSAT', 'Great Lakes Regional Academic Championship (GLRAC)', 'PACE NSC', 'IMSAnity 5'], 2019: ['LOGIC', 'Richard Montgomery Blair Academic Tournament', 'HFT XIV', 'BHSAT', 'Prison Bowl', 'PACE NSC'], 2020: ['CALISTO', 'Tree of Clues']}, 'Open': {1998: ['Virginia Open'], 1999: ['ACF Nationals'], 2000: ['ACF Nationals', 'Chicago Open', 'St. Louis Open'], 2001: ['ACF Nationals', 'St. Louis Open', 'Michigan Artaud'], 2002: ['ACF Nationals', 'Chicago Open'], 2003: ['ACF Nationals', 'Chicago Open', 'Illinois Open'], 2004: ['ACF Nationals', 'Science Monstrosity', 'Chicago Open', 'Chicago Open Lit'], 2005: ['ACF Nationals', 'Toby Keith Hybrid', 'Michigan Manu Ginobili Open', 'Jacopo Pontormo (history tournament)', 'Science Monstrosity', 'Illinois Open', 'Teitler Myth Singles'], 2006: ['ACF Nationals', 'Chicago Open', 'Toby Keith Hybrid', 'Chicago Open History Doubles', 'Illinois Open Literature Tournament'], 2007: ['ACF Nationals', 'Chicago Open', 'Chicago Open Lit', 'The Experiment'], 2008: ['ACF Nationals', 'Chicago Open Literature', 'Gaddis I', 'Chicago Open', "Sun 'n' Fun", 'Gunpei Yokoi Memorial Open (side event)', 'Minnesota Open', 'Cardinal Classic XVII', 'The Experiment II', 'Illinois Open', 'VCU Open'], 2009: ['ACF Nationals', 'Chicago Open Literature', 'Chicago Open', 'Minnesota Open KLEE Fine Arts', 'Gaddis II', 'Tyrone Slothrop Lit', 'Minnesota Open Lederberg Memorial Science Tournament', 'VCU Open', 'Illinois Open/(Fall) Terrapin Invitational', 'Science Non-Strosity', 'Cardinal Classic XVIII', 'Minnesota Open Lit', 'Tyrone Slothrop Literature Singles', 'The Experiment II', 'Geography Monstrosity'], 2010: ['ACF Nationals', 'Chicago Open', 'Chicago Open Arts', 'VCU Open (Saturday)', 'Minnesota Open', 'Chicago Open Literature', 'MELD', 'Spring Offensive (history tournament)', 'ANGST', 'Julius Civilis Classics Tournament', 'BELFAST Arts', 'Geography Monstrosity'], 2011: ['Chicago Open', 'Chicago Open History', 'ACF Nationals', 'Law Bowl', 'Minnesota Open', 'The Bob Loblaw Law Bowl', 'Guerrilla at ICT', 'Illinois Open', 'Geography Monstrosity', 'Illinois Wissenschaftslehre'], 2012: ['The Questions Concerning Technology', 'History Doubles at Chicago Open', 'VETO', 'Geography Monstrosity 4', 'ANFORTAS', 'Minnesota Open', 'College History Bowl', 'Geography Monstrosity', 'Chicago Open'], 2013: ['Chicago Open', "Schindler's Lit", 'Fernando Arrabal Tournament of the Absurd', 'VETO', 'Arrabal', 'Geography Monstrosity', 'VCU Open'], 2014: ['Cane Ridge Revival', 'Chicago Open', 'VCU Open', 'Gorilla Lit', '3M: Chicago Open History', 'Oxford Open', 'Lederberg Memorial Science Tournament 2: Daughter Cell', 'Geography Monstrosity'], 2015: ['George Oppen', 'ACF Nationals', 'BHSAT', 'VCU Open', 'We Have Never Been Modern', 'Chicago Open History', 'Chicago Open Visual Arts', 'Claude Shannon Memorial Tournament', 'VICO', 'RILKE', 'Chicago Open', 'Geography Monstrosity'], 2016: ['GRAPHIC', 'A Culture of Improvement', 'CLEAR II', 'Christmas Present', 'Chicago Open', 'Geography Monstrosity'], 2017: ['GRAB BAG', 'Chicago Open', "It's Lit", 'FRENCH', 'Math Monstrosity', 'Scattergories', 'Naveed Bork Memorial Tournament', 'Fine Arts Common Links', 'Letras', 'Jordaens Visual Arts', '(This) Tournament is a Crime', 'Geography Monstrosity'], 2018: ['Scattergories 2', 'RAPTURE', 'Chicago Open', 'Chicago Open Trash', 'WORLDSTAR', 'HORROR 1'], 2019: ['Chicago Open', 'The Unanswered Question'], 2020: ['Terrapin Invitational Tournament']}, 'College': {1997: ['ACF Nationals', 'Virginia Wahoo War', 'ACF Regionals'], 1998: ['ACF Regionals', 'Terrapin Invitational Tournament', 'ACF Nationals', 'Virginia Wahoo War'], 1999: ['ACF Regionals'], 2000: ['ACF Regionals', 'Illinois Novice'], 2001: ['ACF Fall', 'ACF Regionals', 'Illinois Novice', 'Kentucky Wildcat'], 2002: ['ACF Fall', 'ACF Regionals', 'Penn Bowl', 'Kentucky Wildcat', 'Illinois Novice'], 2003: ['ACF Fall', 'ACF Regionals', 'The New Tournament at Cornell', 'Kentucky Wildcat', 'Michigan Auspicious Incident'], 2004: ['ACF Fall', 'ACF Regionals', 'Aztlan Cup', 'Berkeley WIT XII'], 2005: ['ACF Fall', 'ACF Regionals', 'Terrapin Invitational Tournament', "Virginia J'ACCUSE!"], 2006: ['ACF Regionals', 'ACF Fall', 'MLK', 'Aztlan Cup II/Brown UTT/UNC AWET', 'Terrapin Invitational Tournament', 'Chicago John Stuart Mill', 'Early Fall Tournament (EFT)'], 2007: ['ACF Regionals', 'ACF Fall', 'MLK', 'Early Fall Tournament (EFT)', 'Titanomachy', 'Penn Bowl', 'Matt Cvijanovich Memorial Novice Tournament'], 2008: ['ACF Regionals', 'ACF Fall', 'RMP Fest', 'FICHTE', 'Penn Bowl', 'Early Fall Tournament (EFT)', 'Matt Cvijanovich Memorial Novice Tournament', 'Minnesota Undergraduate Tournament (MUT)', 'Zot Bowl', 'FEUERBACH', 'Terrapin Invitational Tournament', 'MUT'], 2009: ['ACF Winter', 'ACF Regionals', 'ACF Fall', 'Chipola Lit + Fine Arts', 'FICHTE', 'MUT', 'RMP Fest', 'Mahfouz Memorial Lit', 'THUNDER', 'Delta Burke', 'FIST', 'Penn Bowl'], 2010: ['ACF Winter', 'ACF Regionals', 'ACF Fall', 'ACF Novice', 'Delta Burke', 'EFT', 'Penn Bowl', 'MUT', 'NASAT', 'THUNDER II', 'T-Party', 'Princeton Buzzerfest', 'Harvard International', 'VCU Open (Sunday)', 'Sun n Fun', 'Geography Monstrosity 2', 'Wild Kingdom', 'Early Fall Tournament (EFT)', 'Guerrilla at ICT'], 2011: ['MUT', 'NASAT', 'SACK', 'Terrapin Invitational', 'ACF Fall', 'ACF Regionals', 'Collegiate Novice', 'Missiles of October', 'Penn Bowl', 'Cheyne 1980s American History', 'Cheyne American History', 'MAGNI', 'Terrapin Invitational Tournament', 'Delta Burke', 'VCU Open'], 2012: ['ACF Fall', 'ACF Regionals', 'Collegiate Novice', 'MUT', 'YMIR', 'NHBB College Nationals', 'Illinois Fall', 'Penn-ance', 'WELD', 'Peaceful Resolution', 'KABO', 'Cheyne American History', 'NASAT', 'Penn Bowl', 'Illinois Fall Tournament', 'QUARK', 'BARGE', 'Delta Burke', 'ACF Nationals'], 2013: ['ACF Fall', 'ACF Regionals', 'Collegiate Novice', 'DRAGOON', 'MUT', 'Michigan Fall Tournament', 'Terrapin', 'WIT', 'Delta Burke 2013', 'Cheyne American History', 'NASAT', 'Western Invitational Tournament', 'Penn Bowl', 'Terrapin Invitational Tournament', 'Delta Burke', 'Angels in the Architecture', 'VCU Closed', 'ACF Nationals'], 2014: ['ACF Regionals', 'MUT', 'SUBMIT', 'Mavis Gallant Memorial Tournament (Literature)', 'ACF Fall', 'DEES', 'Delta Burke', 'NASAT', 'PADAWAN', 'Penn Bowl', 'Cheyne American Thought', 'Cheyne American History People', 'ICCS', 'ACF Nationals', 'College History Bowl'], 2015: ['ACF Regionals', 'MUT', 'Missouri Open', 'Penn Bowl', 'Prison Bowl', 'STIMPY', 'NASAT', 'Delta Burke', 'ACF Fall', 'SHEIKH'], 2016: ['ACF Regionals', 'Penn Bowl', 'Terrapin Invitational Tournament', 'MYSTERIUM', 'NASAT', 'MLK', 'MUT', 'Delta Burke', 'Early Fall Tournament (EFT)', 'ACF Fall', 'WAO', 'Listory', '"stanford housewrite"', 'ACF Nationals'], 2017: ['Penn Bowl', 'NASAT', 'XENOPHON', 'Sivakumar Day Inter-Nationals', 'MASSOLIT', 'EMT', 'ACF Regionals', 'Early Fall Tournament (EFT)', 'ACF Fall', 'WAO II', 'JAKOB', 'ACF Nationals'], 2018: ['Sun God Invitational', 'Penn Bowl', 'Cambridge Open', 'NASAT', 'ACF Regionals', 'ACF Fall', 'Early Fall Tournament (EFT)', 'SMT', 'FILM', 'Words and Objects', 'Historature', 'ACF Nationals', 'CMST'], 2019: ['Spartan Housewrite', 'NASAT', 'ACF Regionals', 'Terrapin Invitational Tournament', 'Early Fall Tournament (EFT)', 'ACF Fall', 'ILLIAC', 'PIANO'], 2020: ['Oxford Online']}}
const random_topics = ["Frasch Process", "Charlie Parker", "Harold Pinter", "Lolita","Hull House","Claude Debussy","Jacques Derrida"];


export {categories}
export {difficulties}
export {tournaments}
export {random_topics}