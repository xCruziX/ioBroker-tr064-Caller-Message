/**
 * Datenpunkte die gesetzt werden müssen
 */
let idCallerJs = 'tr-064.0.callmonitor.inbound.json'; // Datenpunkt der Anruferinfos beinhaltet
let idRinging = 'tr-064.0.callmonitor.ringing' // Datenpunkt der angibt ob ein Anruf eingeht

// Die Ankündigungsdatenpunkt für eine Alexabenachrichtigung
let lisAlexas = null;
/**
 * Wenn keine Alexaankündigung gewünscht ist, einfach die nächste Zeile auskommentieren,
 * oder löschen
 */
lisAlexas = ['alias.0.Kueche.Alexa.Ankuendigung','alias.0.Wohnzimmer.Alexa.Ankuendigung']

let lisFiredEvents = [];
let timeEvent = null;
let bNotifyLog = true;


/*
 * Hier können weitere Benachritigungen eingebaut werden 
 */
function moreNotify(txt){

}

/*********************************************************** */
// Ab hier nicht mehr veränder, außer du weißt was du tust
/*********************************************************** */

function sendNotify(txt){
    if(bNotifyLog)
        log(txt);

    // Alexas
    if(lisAlexas != undefined && lisAlexas != null){
            lisAlexas.forEach(a => {
                if(existsObject(a))
                    setState(a,txt);
                else
                    log('Alexa Datenpunkt ist ungültig: ' + a);
            });
    }

    moreNotify();
}

function prepareNotify(v){
    let msg = '';
    if(v){
        // Hole das Json Objekt vom Anrufer
        let callerObj = JSON.parse(Get(idCallerJs));
        if(callerObj != undefined && callerObj.callerName != undefined && callerObj.callerName.length > 0)
            msg = 'Anruf von ' + callerObj.callerName;   
        else
            msg = 'Eingehender Anruf';

    }
    else
        msg = 'Anruf beendet';
    
    if(msg.length > 0)
        sendNotify(msg);
}


/**
 * Wird genutzt um sicherzustellen, dass die Änderung wirklich vom Klingeln kam
 * und dass sich die Anrufer Info aktualisiert hat.
 * Hierdurch ist auch egal, welcher Datenpunkt sich zuerst aktualisiert
 */
function addEvent(stateid){
    if(stateid == undefined || stateid == null || lisFiredEvents.includes(stateid))
        return;
    lisFiredEvents.push(stateid);
    clearTimeout(timeEvent);
    timeEvent = null;
    timeEvent = setTimeout(() =>{lisFiredEvents = [];},SekInMs(3));
}

on({id: idCallerJs , change: "any"}, (obj) => {
    addEvent(obj.id);
    if(lisFiredEvents.length == 2)
        prepareNotify(obj.state.val);
});

on({id: idRinging , change: "ne"}, (obj) => {
    if(obj.state.val){
        addEvent(obj.id);
        if(lisFiredEvents.length == 2)
            prepareNotify(true);
    }
    else
        prepareNotify(false);
});
