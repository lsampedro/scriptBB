var config = {
    baseBet: { value: '100', type: 'balance', label: 'Apuesta Base'},
    //minBet: { value: '100', type: 'balance', label: 'Apuesta Mínima'},
    maxBet: { value: '1e8', type: 'balance', label: 'Apuesta Máxima'},
    protectBal: { value: '100000', type: 'balance', label: 'Balance Protegido'},
};

var baseBet = config.baseBet.value; 
var baseMultiplier = 2; 

//var minBet = config.minBet.value; 
var maxBet = config.maxBet.value; 
var protectBal = config.protectBal.value; 


// DO NOT CHANGE
var currentBet = baseBet;
var currentMultiplier = baseMultiplier;
//var currentMinBet = minBet;
var currentMaxBet = maxBet;

// LOCKERS
var betUnlock = true;
var recoveryOn = false;
var OktoGo = true;

var putBet = currentBet;
var putMultiplier = currentMultiplier;
var contadorPerdidasSeguidas = 0;
var contadorGanadas = 0;
var apuesta = 0;
var juegosNoJugados = 0;
var paradasDescanso = 0;
var ciclosParados = 0;

// FUNCIÓN PAYOUT ARBITRARIO //
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}


//FUNCIÓN PONER APUESTAS
function ponerApuesta(apuesta, payout){
    log ('contador perdidas5: -> ' + contadorPerdidasSeguidas);
    var contador = contadorPerdidasSeguidas + 1;
    engine.bet(parseFloat(apuesta), parseFloat(payout));
        log('¡Estás listo para empezar! ');
        log('Apuesta nº ' + contador + ': Tamaño Apuesta: '+ apuesta/100 +' payout: '+ payout + 'x');
}

//Función He Ganado
function heGanado(){
    putBet = currentBet;
    recoveryOn = false;
    betUnlock = true;
    log('¡Has ganado!');
    contadorPerdidasSeguidas = 0;
    contadorGanadas += 1;
}

//Función He Perdido
function hePerdido(){
    recoveryOn = true;
    log('Has perdido.');
    contadorPerdidasSeguidas += 1;
}

//Función contador de paradas de descanso
function descanso(paradas) {
    switch (paradas) {
        case 0:
            paradasDescanso = 4;
            break;
        case 1:
            paradasDescanso = 3;
            break;
        case 2:
            paradasDescanso = 2;
            break;
        case 3:
            paradasDescanso = 1;
            break;
        default:
            paradasDescanso = 0;
    }
}

// OPERTATIVA

engine.on('GAME_STARTING', function() {

    if (userInfo.balance < protectBal) {
        stop('Script parado por protección de balance. Balance es '+ userInfo.balance);
    }
    /*
    if (putBet >= currentMaxBet) {
        stop('Script parado porque la apuesta excede máximo permitido');
    }
    if (putBet < currentMinBet) {
        stop('Script parado porque la apuesta es menor que el mínimo');
    } 
    */

    // Si llevamos perdidas 7 o menos, o llevamos perdidas más de 7 pero más de 4 juegos parados.
   
    if (OktoGo && betUnlock) {
        
        log('Llevamos ' + contadorPerdidasSeguidas + ' partidas seguidas perdiendo.');

        descanso(ciclosParados);
        log ('contador perdidas1: -> ' + contadorPerdidasSeguidas);

        if ((contadorPerdidasSeguidas = 8 && juegosNoJugados >= paradasDescanso) || (contadorPerdidasSeguidas = 16 && juegosNoJugados >= paradasDescanso) || (contadorPerdidasSeguidas = 24 && juegosNoJugados >= paradasDescanso) || (contadorPerdidasSeguidas = 32 && juegosNoJugados >= paradasDescanso) || (contadorPerdidasSeguidas > 32 && juegosNoJugados >= paradasDescanso)|| contadorPerdidasSeguidas <= 7) {
            if (contadorGanadas % 2 == 0) {
                putMultiplier = getRandomArbitrary(4.0, 8.0).toFixed(2);
               
            } else {
                putMultiplier = getRandomArbitrary(2.0, 6.0).toFixed(2);
                log ('contador perdidas2: -> ' + contadorPerdidasSeguidas);
                
            }
            var apuestaDeseada = Math.ceil(putBet / 100) * 100;
            log ('contador perdidas3: -> ' + contadorPerdidasSeguidas);
            apuesta = Math.min(apuestaDeseada, currentMaxBet);
            log ('contador perdidas4: -> ' + contadorPerdidasSeguidas);
            ponerApuesta (apuesta, putMultiplier);
        } else {
            log('Vamos a parar un poco. No entramos en este juego...');
            betUnlock = true;
        }
    } else {
        betUnlock = true;
    }

});


engine.on ('GAME_STARTED', function() {

    if (engine.getCurrentBet()) {
        var cbet = engine.getCurrentBet();
        log ('Juego comenzado con ' + (cbet.wager/100) + ' @ ' + cbet.payout + 'x');
    } else {
        log('la apuesta no se ha realizado');
        juegosNoJugados += 1
    }

});


engine.on ('GAME_ENDED', function() {

    var lastGame = engine.history.first();
    log ('El juego llegó a ' + lastGame.bust + 'x');
    log ('Última apuesta: ' + (lastGame.wager) / 100) + 'bit(s)';

    if (lastGame.wager > 0) {
        if (lastGame.cashedAt){
            heGanado();
            juegosNoJugados = 0;
            paradasDescanso = 0;
            ciclosParados = 0;
        } else {
            hePerdido();
        }
    }

    if (recoveryOn && (lastGame.wager > 0) && lastGame.cashedAt == false) {
        if (contadorGanadas % 2 == 0) {
            putBet *= 1.45;
        } else {
            putBet *= 1.65;
        }
        betUnlock = true;
    } else if (lastGame.wager > 0) {
        betUnlock = false
        log('Vamos a saltarnos un juego por ganar.');
    }

});


