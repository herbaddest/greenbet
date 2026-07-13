
    const betId = `veta_${user.id}_${Date.now()}`
    try {
      const result = await ({
        betId,
        stake,
        totalOdds: 1,
        potentialReturn: 0,
        selections: picksForBet.map((s) => ({ id: s.id, matchLabel: s.matchLabel, selectionLabel: s.selectionLabel, odds: s.odds })),
      })
      if (result.success) {
        setMessage("Your Veta ticket has been submitted. Good luck!")
      } else {
        setMessage(result.error ?? "Your ticket could not be saved. Please try again.")
      }
    } catch {
      setMessage("Your ticket could not be saved. Please try again.")
    }