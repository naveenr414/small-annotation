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

export function setCookie(cname: string, cvalue: any, exdays: number) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const categories = ['Any','Literature', 'Social Science', 'History', 'Science', 'Fine Arts', 'Trash', 'Religion', 'Philosophy', 'Geography', 'Mythology', 'Current Events'];
const difficulties = ['Middle School','High School','College','Open'];
let tournaments ={'High School': {2016: ['A Bit of Lit', 'BHSAT', 'HFT XI', 'PACE NSC', 'SCOP', 'WHAQ'], 2017: ['BHSAT', 'Ladue Invitational Sprint Tournament (LIST)', 'PACE NSC', 'Prison Bowl'], 1998: ['PACE NSC'], 2000: ['PACE NSC'], 2001: ['PACE NSC'], 2002: ['PACE NSC'], 2003: ['Delta Burke', 'PACE NSC'], 2004: ['Illinois Earlybird', 'PACE NSC'], 2005: ['Crusader Cup', 'Illinois Earlybird', 'Maryland Spring Classic', 'PACE NSC'], 2006: ['Illinois Earlybird', 'Maryland Spring Classic', 'PACE NSC', 'WUHSAC VIII'], 2007: ['Maggie Walker GSAC XV', 'Maryland Spring Classic', 'WUHSAC IX'], 2008: ['Bulldog High School Academic Tournament (BHSAT)', 'Chitin', 'HAVOC', 'HFT', 'HSAPQ 4Q 1', 'HSAPQ ACF 1', 'HSAPQ ACF 2', 'HSAPQ ACF 3', 'HSAPQ NSC 1', 'HSAPQ NSC 2', 'Maggie Walker GSAC XVI', 'NNT', 'NTV', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'QuAC I', 'UIUC High School Solo'], 2009: ['BATE', 'BHSAT', 'DAFT', 'Fall Kickoff Tournament', 'Fall Kickoff Tournament (FKT)', 'Fall Novice', 'From Here To Eternity', 'HAVOC II', 'HFT', 'HSAPQ 4Q1', 'HSAPQ 4Q2', 'HSAPQ NASAT Tryout Set', 'HSAPQ Tournament 10', 'HSAPQ Tournament 11', 'HSAPQ Tournament 8', 'HSAPQ Tournament 9', 'MOHIT (Thomas Jefferson)', 'MW GSAC XVII', 'NTV', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'U. of Georgia CCC', 'WUHSAC XI', 'Weekend of Quizbowl Saturday Event'], 2010: ['BATE', 'BHSAT', 'Fall Kickoff Tournament', 'Fall Kickoff Tournament (FKT)', 'Fall Novice', 'GDS Ben Cooper Memorial', 'Harvard Fall Tournament', 'Maggie Walker GSAC', 'Maggie Walker GSAC XVIII', 'Maryland Spring Classic', 'NTSS', 'PACE NSC', 'Prison Bowl', 'SCOP Novice', 'TJ NAREN', 'Vanderbilt ABC/2011 VCU Winter'], 2011: ['BDAT I', 'BHSAT', 'Centennial (MD) Housewrite', 'Fall Kickoff Tournament (FKT)', 'HSAPQ Colonia 2', 'HSAPQ National History Bowl', 'HSAPQ Tournament 15', 'HSAPQ Tournament 16', 'HSAPQ Tournament 17', 'HSAPQ VHSL Districts', 'HSAPQ VHSL Regionals', 'HSAPQ VHSL Regular Season', 'HSAPQ VHSL States', 'Ladue Invitational Spring Tournament', 'Maggie Walker GSAC', 'Maggie Walker GSAC XIX', 'Minnesota Novice Set', 'New Trier Scobol Solo', 'OLEFIN', 'PACE NSC', 'Prison Bowl', 'SCOP Novice', 'St. Anselms and Torrey Pines'], 2012: ['BHSAT', 'Fall Kickoff Tournament (FKT)', 'Harvard Fall Tournament', 'Harvard Fall Tournament VII', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Spring Tournament', 'Ladue Invitational Sprint Tournament (LIST)', 'MSU/UD Housewrite', 'Maggie Walker GSAC', 'Maryland Spring', 'New Trier Scobol Solo', 'Ohio State/VCU housewrite', 'PACE NSC', 'Prison Bowl', 'RAVE', 'SCOP 3', 'SCOP Novice'], 2013: ['BHSAT', 'BISB', 'Brookwood Invitational Scholars Bowl', 'FKT', 'JAMES', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Sprint Tournament (LIST)', 'Maggie Walker GSAC', 'NTSS', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'SASS', 'SCOP Novice', 'Scobol Solo'], 2014: ['BELLOCO', 'BHSAT', 'LIST', 'LIST (Ladue Invitational Spring Tournament)', 'Ladue Invitational Sprint Tournament (LIST)', 'Masonic', 'New Trier Scobol Solo', 'PACE NSC', 'Prison Bowl', 'SCOP Novice'], 2015: ["BISB (Brookwood Invitational Scholars' Bowl)", 'GSAC XXIII', 'HFT X', 'JAMES', 'Maryland Fall', 'PACE NSC', 'Prison Bowl']}, 'Middle School': {2010: ['Collaborative MS Tournament'], 2011: ['Collaborative MS Tournament'], 2012: ['Collaborative MS Tournament'], 2013: ['Collaborative MS Tournament'], 2015: ['SCOP 6 MS']}, 'Open': {2016: ['A Culture of Improvement', 'CLEAR II', 'Chicago Open', 'Christmas Present', 'GRAPHIC', 'Geography Monstrosity'], 2017: ['(This) Tournament is a Crime', 'Chicago Open', 'FRENCH', 'Fine Arts Common Links', 'GRAB BAG', 'Geography Monstrosity', "It's Lit", 'Jordaens Visual Arts', 'Letras', 'Math Monstrosity', 'Naveed Bork Memorial Tournament', 'Scattergories'], 1998: ['Virginia Open'], 1999: ['ACF Nationals'], 2000: ['ACF Nationals', 'Chicago Open', 'St. Louis Open'], 2001: ['ACF Nationals', 'Michigan Artaud', 'St. Louis Open'], 2002: ['ACF Nationals', 'Chicago Open'], 2003: ['ACF Nationals', 'Chicago Open', 'Illinois Open'], 2004: ['ACF Nationals', 'Chicago Open', 'Chicago Open Lit', 'Science Monstrosity'], 2005: ['ACF Nationals', 'Illinois Open', 'Jacopo Pontormo (history tournament)', 'Michigan Manu Ginobili Open', 'Science Monstrosity', 'Teitler Myth Singles', 'Toby Keith Hybrid'], 2006: ['ACF Nationals', 'Chicago Open', 'Chicago Open History Doubles', 'Illinois Open Literature Tournament', 'Toby Keith Hybrid'], 2007: ['ACF Nationals', 'Chicago Open', 'Chicago Open Lit', 'The Experiment'], 2008: ['ACF Nationals', 'Cardinal Classic XVII', 'Chicago Open', 'Chicago Open Literature', 'Gaddis I', 'Gunpei Yokoi Memorial Open (side event)', 'Illinois Open', 'Minnesota Open', "Sun 'n' Fun", 'The Experiment II', 'VCU Open'], 2009: ['ACF Nationals', 'Cardinal Classic XVIII', 'Chicago Open', 'Chicago Open Literature', 'Gaddis II', 'Geography Monstrosity', 'Illinois Open/(Fall) Terrapin Invitational', 'Minnesota Open KLEE Fine Arts', 'Minnesota Open Lederberg Memorial Science Tournament', 'Minnesota Open Lit', 'Science Non-Strosity', 'The Experiment II', 'Tyrone Slothrop Lit', 'Tyrone Slothrop Literature Singles', 'VCU Open'], 2010: ['ACF Nationals', 'ANGST', 'BELFAST Arts', 'Chicago Open', 'Chicago Open Arts', 'Chicago Open Literature', 'Geography Monstrosity', 'Julius Civilis Classics Tournament', 'MELD', 'Minnesota Open', 'Spring Offensive (history tournament)', 'VCU Open (Saturday)'], 2011: ['ACF Nationals', 'Chicago Open', 'Chicago Open History', 'Geography Monstrosity', 'Guerrilla at ICT', 'Illinois Open', 'Illinois Wissenschaftslehre', 'Law Bowl', 'Minnesota Open', 'The Bob Loblaw Law Bowl'], 2012: ['ANFORTAS', 'Chicago Open', 'College History Bowl', 'Geography Monstrosity', 'Geography Monstrosity 4', 'History Doubles at Chicago Open', 'Minnesota Open', 'The Questions Concerning Technology', 'VETO'], 2013: ['Arrabal', 'Chicago Open', 'Fernando Arrabal Tournament of the Absurd', 'Geography Monstrosity', "Schindler's Lit", 'VCU Open', 'VETO'], 2014: ['3M: Chicago Open History', 'Cane Ridge Revival', 'Chicago Open', 'Geography Monstrosity', 'Gorilla Lit', 'Lederberg Memorial Science Tournament 2: Daughter Cell', 'Oxford Open', 'VCU Open'], 2015: ['ACF Nationals', 'BHSAT', 'Chicago Open', 'Chicago Open History', 'Chicago Open Visual Arts', 'Claude Shannon Memorial Tournament', 'Geography Monstrosity', 'George Oppen', 'RILKE', 'VCU Open', 'VICO', 'We Have Never Been Modern']}, 'College': {1997: ['ACF Nationals', 'ACF Regionals', 'Virginia Wahoo War'], 1998: ['ACF Nationals', 'ACF Regionals', 'Terrapin Invitational Tournament', 'Virginia Wahoo War'], 1999: ['ACF Regionals'], 2000: ['ACF Regionals', 'Illinois Novice'], 2001: ['ACF Fall', 'ACF Regionals', 'Illinois Novice', 'Kentucky Wildcat'], 2002: ['ACF Fall', 'ACF Regionals', 'Illinois Novice', 'Kentucky Wildcat', 'Penn Bowl'], 2003: ['ACF Fall', 'ACF Regionals', 'Kentucky Wildcat', 'Michigan Auspicious Incident', 'The New Tournament at Cornell'], 2004: ['ACF Fall', 'ACF Regionals', 'Aztlan Cup', 'Berkeley WIT XII'], 2005: ['ACF Fall', 'ACF Regionals', 'Terrapin Invitational Tournament', "Virginia J'ACCUSE!"], 2006: ['ACF Fall', 'ACF Regionals', 'Aztlan Cup II/Brown UTT/UNC AWET', 'Chicago John Stuart Mill', 'Early Fall Tournament (EFT)', 'MLK', 'Terrapin Invitational Tournament'], 2007: ['ACF Fall', 'ACF Regionals', 'Early Fall Tournament (EFT)', 'MLK', 'Matt Cvijanovich Memorial Novice Tournament', 'Penn Bowl', 'Titanomachy'], 2008: ['ACF Fall', 'ACF Regionals', 'Early Fall Tournament (EFT)', 'FEUERBACH', 'FICHTE', 'MUT', 'Matt Cvijanovich Memorial Novice Tournament', 'Minnesota Undergraduate Tournament (MUT)', 'Penn Bowl', 'RMP Fest', 'Terrapin Invitational Tournament', 'Zot Bowl'], 2009: ['ACF Fall', 'ACF Regionals', 'ACF Winter', 'Chipola Lit + Fine Arts', 'Delta Burke', 'FICHTE', 'FIST', 'MUT', 'Mahfouz Memorial Lit', 'Penn Bowl', 'RMP Fest', 'THUNDER'], 2010: ['ACF Fall', 'ACF Novice', 'ACF Regionals', 'ACF Winter', 'Delta Burke', 'EFT', 'Early Fall Tournament (EFT)', 'Geography Monstrosity 2', 'Guerrilla at ICT', 'Harvard International', 'MUT', 'NASAT', 'Penn Bowl', 'Princeton Buzzerfest', 'Sun n Fun', 'T-Party', 'THUNDER II', 'VCU Open (Sunday)', 'Wild Kingdom'], 2011: ['ACF Fall', 'ACF Regionals', 'Cheyne 1980s American History', 'Cheyne American History', 'Collegiate Novice', 'Delta Burke', 'MAGNI', 'MUT', 'Missiles of October', 'NASAT', 'Penn Bowl', 'SACK', 'Terrapin Invitational', 'Terrapin Invitational Tournament', 'VCU Open'], 2012: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'BARGE', 'Cheyne American History', 'Collegiate Novice', 'Delta Burke', 'Illinois Fall', 'Illinois Fall Tournament', 'KABO', 'MUT', 'NASAT', 'NHBB College Nationals', 'Peaceful Resolution', 'Penn Bowl', 'Penn-ance', 'QUARK', 'WELD', 'YMIR'], 2013: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Angels in the Architecture', 'Cheyne American History', 'Collegiate Novice', 'DRAGOON', 'Delta Burke', 'Delta Burke 2013', 'MUT', 'Michigan Fall Tournament', 'NASAT', 'Penn Bowl', 'Terrapin', 'Terrapin Invitational Tournament', 'VCU Closed', 'WIT', 'Western Invitational Tournament'], 2014: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Cheyne American History People', 'Cheyne American Thought', 'College History Bowl', 'DEES', 'Delta Burke', 'ICCS', 'MUT', 'Mavis Gallant Memorial Tournament (Literature)', 'NASAT', 'PADAWAN', 'Penn Bowl', 'SUBMIT'], 2015: ['ACF Fall', 'ACF Regionals', 'Delta Burke', 'MUT', 'Missouri Open', 'NASAT', 'Penn Bowl', 'SHEIKH', 'STIMPY'], 2016: ['"stanford housewrite"', 'ACF Fall', 'ACF Nationals', 'ACF Regionals', 'Delta Burke', 'Early Fall Tournament (EFT)', 'Listory', 'MLK', 'MUT', 'MYSTERIUM', 'NASAT', 'Penn Bowl', 'Terrapin Invitational Tournament'], 2017: ['ACF Fall', 'ACF Nationals', 'ACF Regionals', 'EMT', 'Early Fall Tournament (EFT)', 'JAKOB', 'MASSOLIT', 'NASAT', 'Penn Bowl', 'Sivakumar Day Inter-Nationals', 'WAO', 'XENOPHON'], 2018: ['ACF Regionals']}}
const random_topics = ["Frasch Process", "Charlie Parker", "Harold Pinter", "Lolita","Hull House","Claude Debussy","Jacques Derrida"];


export {categories}
export {difficulties}
export {tournaments}
export {random_topics}