var config = {
	baseBet: { value: '100', type: 'balance', label: 'Apuesta Base'},
	minBet: { value: '100', type: 'balance', label: 'Apuesta Mínima'},
	maxBet: { value: '1e8', type: 'balance', label: 'Apuesta Máxima'},
	protectBal: { value: '100000', type: 'balance', label: 'Balance Protegido'},
};

var baseBet = config.baseBet.value; 
var baseMultiplier = 2; 

var minBet = config.minBet.value; 
var maxBet = config.maxBet.value; 
var protectBal = config.protectBal.value; 


// DO NOT CHANGE
var currentBet = baseBet;
var currentMultiplier = baseMultiplier;
var currentMinBet = minBet;
var currentMaxBet = maxBet;

// LOCKERS
var betUnlock = true;
var recoveryOn = false;
var OktoGo = true;

var putBet = currentBet;
var putMultiplier = currentMultiplier;
var contador = 1;

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

engine.on('GAME_STARTING', function() {
    
    if (userInfo.balance < protectBal) {
        stop('Script parado por protección de balance. Balance es '+ userInfo.balance);
    }
    if (putBet >= currentMaxBet) {
        stop('Script parado porque la apuesta excede máximo permitido');
    }
    if (putBet < currentMinBet) {
        stop('Script parado porque la apuesta es menor que el mínimo');
    } 
    
    if (OktoGo && betUnlock){
        if (contador > 4) {
            putMultiplier = getRandomArbitrary(2.0, 2.02).toFixed(2);
        } else {
            putMultiplier = getRandomArbitrary(4.9, 2.5).toFixed(2);
        }
        engine.bet(parseInt(putBet), parseFloat(putMultiplier));
		log('¡Estás listo para empezar! ');
        log('Apuesta ' + contador + ':- Tamaño Apuesta: '+ putBet/100 +' payout: '+ putMultiplier + 'x');
    }   else {
        betUnlock = true;
    }
    
});

engine.on('GAME_STARTED', function() {
	if (engine.getCurrentBet()){ //Este IF confirma que hemos apostado
		var cbet = engine.getCurrentBet();
		log('Juego comenzado con '+ (cbet.wager/100) + ' * ' + cbet.payout+ 'x');
	} else {
		log('La apuesta no se ha realizado');
	}
});


engine.on('GAME_ENDED', function() {
    
	var lastGame = engine.history.first();
	
    log('El juego llegó a '+ lastGame.bust);
	
	log('Última apuesta '+ (lastGame.wager)/100);
    
    if (lastGame.wager > 0){
        if (lastGame.cashedAt){ //Este IF confirma que hemos jugado a la última jugada y hemos ganado
            putBet = currentBet;
            recoveryOn = false;
            betUnlock = true;
            log('¡Has ganado!');
            contador = 1;
        } else {
			recoveryOn = true;
            log('Has perdido.');
            contador += 1;
		}
    }
    if (recoveryOn && (lastGame.wager > 0) && lastGame.cashedAt == false){
        putBet *= 2;
        betUnlock = true; 
    } else if (lastGame.wager > 0){
        betUnlock = false;
		log('Vamos a saltarnos el próximo juego.');
    }
});
