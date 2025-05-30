import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LotteryRecord, NumberFrequency, PredictionResult } from '@/types/lottery'
import { LotteryAnalyzer } from '@/utils/lottery-analyzer'

// 示例数据，用于测试和备用
const sampleData: LotteryRecord[] = [
  {
    "issue": "2025059",
    "openTime": "2025-05-27",
    "frontWinningNum": "04 10 11 12 13 24",
    "backWinningNum": "01",
    "seqFrontWinningNum": "11 24 12 13 10 04",
    "seqBackWinningNum": "01",
    "saleMoney": "357078086",
    "r9SaleMoney": "",
    "prizePoolMoney": "2266201070",
    "week": "星期二",
    "winnerDetails": []
  },
  {
    "issue": "2025058",
    "openTime": "2025-05-25",
    "frontWinningNum": "02 06 07 09 10 20",
    "backWinningNum": "06",
    "seqFrontWinningNum": "07 09 02 06 20 10",
    "seqBackWinningNum": "06",
    "saleMoney": "393500536",
    "r9SaleMoney": "",
    "prizePoolMoney": "2233844001",
    "week": "星期日",
    "winnerDetails": []
  },
  {
    "issue": "2025057",
    "openTime": "2025-05-22",
    "frontWinningNum": "04 09 15 16 25 30",
    "backWinningNum": "14",
    "seqFrontWinningNum": "30 25 16 09 15 04",
    "seqBackWinningNum": "14",
    "saleMoney": "362960216",
    "r9SaleMoney": "",
    "prizePoolMoney": "2235456730",
    "week": "星期四",
    "winnerDetails": []
  }
]

export const useLotteryStore = defineStore('lottery', () => {
  // 状态
  const records = ref<LotteryRecord[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const analyzer = ref<LotteryAnalyzer | null>(null)

  // 计算属性
  const hasData = computed(() => records.value.length > 0)
  const latestRecord = computed(() => records.value[0])
  const totalRecords = computed(() => records.value.length)

  // 异步加载数据
  async function loadData() {
    try {
      isLoading.value = true
      error.value = null

      // // 先尝试使用示例数据
      // console.log('使用示例数据进行演示')
      // records.value = sampleData
      // analyzer.value = new LotteryAnalyzer(sampleData)
      // console.log(`成功加载 ${sampleData.length} 条示例记录`)
      // return

      // 从public目录加载数据文件（注释掉，先用示例数据）
      
      const response = await fetch('/双色球开奖历史记录.md')
      console.log("🚀 ~ loadData ~ response:", response)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const text = await response.text()
      
      // 解析JSON数据 - 整个文件内容就是JSON数组
      let parsedData: LotteryRecord[]
      try {
        parsedData = JSON.parse(text) as LotteryRecord[]
      } catch (parseError) {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = text.match(/\[([\s\S]*)\]/)
        if (!jsonMatch) {
          throw new Error('无法找到有效的JSON数据')
        }
        parsedData = JSON.parse(jsonMatch[0]) as LotteryRecord[]
      }

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error('数据格式不正确或为空')
      }

      records.value = parsedData
      analyzer.value = new LotteryAnalyzer(parsedData)

      console.log(`成功加载 ${parsedData.length} 条历史记录`)
      

    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载数据失败'
      console.error('加载双色球数据失败:', err)
      
      // 如果加载失败，使用示例数据作为备用
      console.log('使用示例数据作为备用')
      records.value = sampleData
      analyzer.value = new LotteryAnalyzer(sampleData)
      error.value = null // 清除错误，因为我们有备用数据
    } finally {
      isLoading.value = false
    }
  }

  // 获取红球频率分析
  function getFrontNumberFrequency(): NumberFrequency[] {
    if (!analyzer.value) return []
    return analyzer.value.getFrontNumberFrequency()
  }

  // 获取蓝球频率分析
  function getBackNumberFrequency(): NumberFrequency[] {
    if (!analyzer.value) return []
    return analyzer.value.getBackNumberFrequency()
  }

  // 获取热门号码
  function getHotNumbers(periods: number = 20) {
    if (!analyzer.value) return { front: [], back: [] }
    return analyzer.value.getHotNumbers(periods)
  }

  // 获取冷门号码
  function getColdNumbers() {
    if (!analyzer.value) return { front: [], back: [] }
    return analyzer.value.getColdNumbers()
  }

  // 生成预测结果
  function generatePrediction(): PredictionResult | null {
    if (!analyzer.value) return null
    return analyzer.value.predictNextNumbers()
  }

  // 获取下期期号
  function getNextIssue(): string {
    if (!analyzer.value) return '2025060'
    return analyzer.value.getNextIssue()
  }

  // 分析号码间隔
  function analyzeGaps() {
    if (!analyzer.value) return { avgGap: 0, commonGaps: [] }
    return analyzer.value.analyzeNumberGaps()
  }

  return {
    // 状态
    records,
    isLoading,
    error,
    
    // 计算属性
    hasData,
    latestRecord,
    totalRecords,
    
    // 方法
    loadData,
    getFrontNumberFrequency,
    getBackNumberFrequency,
    getHotNumbers,
    getColdNumbers,
    generatePrediction,
    getNextIssue,
    analyzeGaps
  }
}) 