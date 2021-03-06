var config = {
  target: { value: "", type: "text", label: "Usuario a copiar" },
  maxBet: { value: 1e8, type: "balance", label: "Apuesta máxima" },
};

engine.on("BET_PLACED", (bet) => {
  if (bet.uname.toLowerCase() === config.target.value.toLowerCase()) {
    if (userInfo.balance < 100) {
      stop("Tu balance es demasiado bajo para apostar.");
    }

    log(
      "Encontrado",
      bet.uname,
      "apostando",
      bet.wager / 100,
      "bit(s) con un payout de ",
      bet.payout
    );

    const bettableBalance = Math.floor(userInfo.balance / 100) * 100;
    const wagerReal = Math.min(bettableBalance, bet.wager, config.maxBet.value);
    const wager = wagerReal * 10;

    if (engine.gameState != "GAME_STARTING") {
      // do not queue the bet if the current game is no longer accepting bets
      return;
    }

    engine.bet(wager, bet.payout); // aim at target's payout
  }
});

engine.on("CASHED_OUT", (cashOut) => {
  if (cashOut.uname.toLowerCase() === config.target.value.toLowerCase()) {
    log("Encontrado", cashOut.uname, "cobrando a ", cashOut.cashedAt + "x.");

    if (engine.currentlyPlaying()) {
      engine.cashOut();
    }
  }
});