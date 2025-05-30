export interface WinnerDetail {
  awardEtc: string
  baseBetWinner: {
    remark: string
    awardNum: string
    awardMoney: string
    totalMoney: string
  }
  addToBetWinner: string
  addToBetWinner2: string
  addToBetWinner3: string
}

export interface LotteryRecord {
  issue: string
  openTime: string
  frontWinningNum: string
  backWinningNum: string
  seqFrontWinningNum: string
  seqBackWinningNum: string
  saleMoney: string
  r9SaleMoney: string
  prizePoolMoney: string
  week: string
  winnerDetails: WinnerDetail[]
}

export interface NumberFrequency {
  number: number
  frequency: number
  percentage: number
}

export interface PredictionResult {
  frontNumbers: number[]
  backNumber: number
  confidence: number
  method: string
  analysis: string
} 