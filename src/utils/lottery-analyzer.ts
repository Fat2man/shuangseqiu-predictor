import type { LotteryRecord, NumberFrequency, PredictionResult } from '@/types/lottery'

export class LotteryAnalyzer {
  private records: LotteryRecord[] = []

  constructor(records: LotteryRecord[]) {
    this.records = records
  }

  // 解析红球号码字符串为数字数组
  private parseFrontNumbers(frontNumbers: string): number[] {
    return frontNumbers.split(' ').map(num => parseInt(num, 10))
  }

  // 解析蓝球号码
  private parseBackNumber(backNumber: string): number {
    return parseInt(backNumber, 10)
  }

  // 计算红球号码频率分析
  public getFrontNumberFrequency(): NumberFrequency[] {
    const frequency: { [key: number]: number } = {}
    
    // 初始化1-33的频率为0
    for (let i = 1; i <= 33; i++) {
      frequency[i] = 0
    }

    // 统计每个号码出现的次数
    this.records.forEach(record => {
      const numbers = this.parseFrontNumbers(record.frontWinningNum)
      numbers.forEach(num => {
        frequency[num]++
      })
    })

    const totalRecords = this.records.length
    
    return Object.entries(frequency).map(([num, freq]) => ({
      number: parseInt(num, 10),
      frequency: freq,
      percentage: (freq / totalRecords) * 100
    })).sort((a, b) => b.frequency - a.frequency)
  }

  // 计算蓝球号码频率分析
  public getBackNumberFrequency(): NumberFrequency[] {
    const frequency: { [key: number]: number } = {}
    
    // 初始化1-16的频率为0
    for (let i = 1; i <= 16; i++) {
      frequency[i] = 0
    }

    // 统计每个号码出现的次数
    this.records.forEach(record => {
      const num = this.parseBackNumber(record.backWinningNum)
      frequency[num]++
    })

    const totalRecords = this.records.length
    
    return Object.entries(frequency).map(([num, freq]) => ({
      number: parseInt(num, 10),
      frequency: freq,
      percentage: (freq / totalRecords) * 100
    })).sort((a, b) => b.frequency - a.frequency)
  }

  // 获取最近N期的热门号码
  public getHotNumbers(recentPeriods: number = 20): { front: number[], back: number[] } {
    const recentRecords = this.records.slice(0, recentPeriods)
    const frontFreq: { [key: number]: number } = {}
    const backFreq: { [key: number]: number } = {}

    recentRecords.forEach(record => {
      const frontNumbers = this.parseFrontNumbers(record.frontWinningNum)
      frontNumbers.forEach(num => {
        frontFreq[num] = (frontFreq[num] || 0) + 1
      })

      const backNumber = this.parseBackNumber(record.backWinningNum)
      backFreq[backNumber] = (backFreq[backNumber] || 0) + 1
    })

    const hotFront = Object.entries(frontFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([num]) => parseInt(num, 10))

    const hotBack = Object.entries(backFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([num]) => parseInt(num, 10))

    return { front: hotFront, back: hotBack }
  }

  // 获取冷门号码（长期未出现）
  public getColdNumbers(): { front: number[], back: number[] } {
    const frontFreq = this.getFrontNumberFrequency()
    const backFreq = this.getBackNumberFrequency()

    const coldFront = frontFreq
      .sort((a, b) => a.frequency - b.frequency)
      .slice(0, 10)
      .map(item => item.number)

    const coldBack = backFreq
      .sort((a, b) => a.frequency - b.frequency)
      .slice(0, 5)
      .map(item => item.number)

    return { front: coldFront, back: coldBack }
  }

  // 分析号码间隔模式
  public analyzeNumberGaps(): { avgGap: number, commonGaps: number[] } {
    const gaps: number[] = []
    
    this.records.forEach(record => {
      const numbers = this.parseFrontNumbers(record.frontWinningNum).sort((a, b) => a - b)
      for (let i = 1; i < numbers.length; i++) {
        gaps.push(numbers[i] - numbers[i - 1])
      }
    })

    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
    
    const gapFreq: { [key: number]: number } = {}
    gaps.forEach(gap => {
      gapFreq[gap] = (gapFreq[gap] || 0) + 1
    })

    const commonGaps = Object.entries(gapFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([gap]) => parseInt(gap, 10))

    return { avgGap, commonGaps }
  }

  // 综合预测算法
  public predictNextNumbers(): PredictionResult {
    const hotNumbers = this.getHotNumbers(30)
    const coldNumbers = this.getColdNumbers()
    const gapAnalysis = this.analyzeNumberGaps()
    
    // 组合策略：70%热门号码 + 30%冷门号码
    const frontCandidates = [
      ...hotNumbers.front.slice(0, 4),
      ...coldNumbers.front.slice(0, 2)
    ]

    // 从候选号码中随机选择6个，保证间隔合理
    const predictedFront = this.selectOptimalNumbers(frontCandidates, 6, gapAnalysis.avgGap)
    
    // 蓝球预测：优先选择热门号码
    const predictedBack = hotNumbers.back[0] || 1

    const confidence = this.calculateConfidence(predictedFront, predictedBack)

    return {
      frontNumbers: predictedFront.sort((a, b) => a - b),
      backNumber: predictedBack,
      confidence,
      method: '热冷号码结合 + 间隔分析',
      analysis: `基于最近30期热门号码分析，结合历史冷门号码，平均间隔${gapAnalysis.avgGap.toFixed(1)}`
    }
  }

  // 选择最优号码组合
  private selectOptimalNumbers(candidates: number[], count: number, avgGap: number): number[] {
    const selected: number[] = []
    const shuffled = [...candidates].sort(() => Math.random() - 0.5)

    for (const num of shuffled) {
      if (selected.length === 0) {
        selected.push(num)
        continue
      }

      // 检查与已选号码的间隔是否合理
      const hasReasonableGap = selected.every(selectedNum => {
        const gap = Math.abs(num - selectedNum)
        return gap >= Math.floor(avgGap / 2) && gap <= avgGap * 2
      })

      if (hasReasonableGap || selected.length >= count - 1) {
        selected.push(num)
      }

      if (selected.length >= count) break
    }

    // 如果选择的号码不够，从剩余候选中补充
    while (selected.length < count) {
      for (let i = 1; i <= 33; i++) {
        if (!selected.includes(i) && selected.length < count) {
          selected.push(i)
        }
      }
    }

    return selected.slice(0, count)
  }

  // 计算预测信心度
  private calculateConfidence(frontNumbers: number[], backNumber: number): number {
    const hotNumbers = this.getHotNumbers(20)
    
    let confidence = 0.3 // 基础信心度

    // 根据热门号码占比增加信心度
    const hotFrontCount = frontNumbers.filter(num => hotNumbers.front.includes(num)).length
    confidence += (hotFrontCount / 6) * 0.4

    // 根据蓝球是否为热门增加信心度
    if (hotNumbers.back.includes(backNumber)) {
      confidence += 0.3
    }

    return Math.min(confidence, 0.85) // 最高85%信心度
  }

  // 获取最新期号，用于生成下期预测
  public getNextIssue(): string {
    if (this.records.length === 0) return '2025060'
    
    const latestIssue = this.records[0].issue
    const year = latestIssue.substring(0, 4)
    const period = parseInt(latestIssue.substring(4), 10)
    
    return `${year}${String(period + 1).padStart(3, '0')}`
  }
} 