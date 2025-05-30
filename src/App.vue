<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- 头部标题 -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">双色球智能预测分析</h1>
        <p class="text-gray-600">基于历史数据的科学分析与预测</p>
      </header>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p class="mt-4 text-gray-600">正在加载历史数据...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>
        <button 
          @click="loadData" 
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          重新加载
        </button>
      </div>

      <!-- 主要内容 -->
      <div v-else-if="hasData" class="space-y-8">
        <!-- 预测结果卡片 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">🔮 {{ nextIssue }}期预测号码</h2>
          
          <div v-if="prediction" class="space-y-6">
            <!-- 预测号码展示 -->
            <div class="text-center">
              <div class="flex justify-center items-center gap-2 mb-4">
                <!-- 红球 -->
                <NumberBall 
                  v-for="num in prediction.frontNumbers" 
                  :key="num" 
                  :number="num" 
                  type="front"
                />
                <div class="mx-2 text-2xl font-bold text-gray-400">+</div>
                <!-- 蓝球 -->
                <NumberBall :number="prediction.backNumber" type="back" />
              </div>
              
              <!-- 预测信息 -->
              <div class="bg-gray-50 rounded-lg p-4 text-sm">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span class="font-semibold text-gray-700">预测方法：</span>
                    <span class="text-gray-600">{{ prediction.method }}</span>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-700">信心度：</span>
                    <span class="text-blue-600 font-bold">{{ Math.round(prediction.confidence * 100) }}%</span>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-700">分析：</span>
                    <span class="text-gray-600">{{ prediction.analysis }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 重新预测按钮 -->
            <div class="text-center">
              <button 
                @click="refreshPrediction"
                class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105"
              >
                🎲 重新预测
              </button>
            </div>
          </div>
        </div>

        <!-- 最新开奖结果 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">📊 最新开奖</h3>
          <div v-if="latestRecord" class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">第{{ latestRecord.issue }}期</span>
              <span class="text-gray-600">{{ latestRecord.openTime }} {{ latestRecord.week }}</span>
            </div>
            <div class="flex justify-center items-center gap-2">
              <NumberBall 
                v-for="num in latestRecord.frontWinningNum.split(' ').map(n => parseInt(n))" 
                :key="num" 
                :number="num" 
                type="front"
              />
              <div class="mx-2 text-2xl font-bold text-gray-400">+</div>
              <NumberBall :number="parseInt(latestRecord.backWinningNum)" type="back" />
            </div>
          </div>
        </div>

        <!-- 统计分析 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 红球频率统计 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">🔴 红球出现频率 (前10)</h3>
            <div class="space-y-2">
              <div 
                v-for="item in frontFreq.slice(0, 10)" 
                :key="item.number"
                class="flex items-center justify-between p-2 rounded hover:bg-gray-50"
              >
                <div class="flex items-center gap-2">
                  <NumberBall :number="item.number" type="front" className="w-8 h-8 text-xs" />
                  <span class="font-medium">{{ item.number.toString().padStart(2, '0') }}号</span>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold text-gray-800">{{ item.frequency }}次</div>
                  <div class="text-xs text-gray-500">{{ item.percentage.toFixed(1) }}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 蓝球频率统计 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">🔵 蓝球出现频率 (前10)</h3>
            <div class="space-y-2">
              <div 
                v-for="item in backFreq.slice(0, 10)" 
                :key="item.number"
                class="flex items-center justify-between p-2 rounded hover:bg-gray-50"
              >
                <div class="flex items-center gap-2">
                  <NumberBall :number="item.number" type="back" className="w-8 h-8 text-xs" />
                  <span class="font-medium">{{ item.number.toString().padStart(2, '0') }}号</span>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold text-gray-800">{{ item.frequency }}次</div>
                  <div class="text-xs text-gray-500">{{ item.percentage.toFixed(1) }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 热冷号码分析 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 热门号码 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">🔥 近30期热门号码</h3>
            <div class="space-y-4">
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">红球热门</h4>
                <div class="flex flex-wrap gap-2">
                  <NumberBall 
                    v-for="num in hotNumbers.front" 
                    :key="num" 
                    :number="num" 
                    type="front"
                    className="w-8 h-8 text-xs"
                  />
                </div>
              </div>
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">蓝球热门</h4>
                <div class="flex flex-wrap gap-2">
                  <NumberBall 
                    v-for="num in hotNumbers.back" 
                    :key="num" 
                    :number="num" 
                    type="back"
                    className="w-8 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 冷门号码 -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">❄️ 历史冷门号码</h3>
            <div class="space-y-4">
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">红球冷门</h4>
                <div class="flex flex-wrap gap-2">
                  <NumberBall 
                    v-for="num in coldNumbers.front" 
                    :key="num" 
                    :number="num" 
                    type="disabled"
                    className="w-8 h-8 text-xs"
                  />
                </div>
              </div>
              <div>
                <h4 class="text-sm font-semibold text-gray-600 mb-2">蓝球冷门</h4>
                <div class="flex flex-wrap gap-2">
                  <NumberBall 
                    v-for="num in coldNumbers.back" 
                    :key="num" 
                    :number="num" 
                    type="disabled"
                    className="w-8 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据统计信息 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">📈 数据统计</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div class="p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ totalRecords }}</div>
              <div class="text-sm text-gray-600">历史记录</div>
            </div>
            <div class="p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ Math.round(gapAnalysis.avgGap * 10) / 10 }}</div>
              <div class="text-sm text-gray-600">平均间隔</div>
            </div>
            <div class="p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ hotNumbers.front.length }}</div>
              <div class="text-sm text-gray-600">热门红球</div>
            </div>
            <div class="p-4 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ hotNumbers.back.length }}</div>
              <div class="text-sm text-gray-600">热门蓝球</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 免责声明 -->
      <footer class="mt-12 text-center text-sm text-gray-500">
        <p class="mb-2">⚠️ 免责声明</p>
        <p>本预测仅基于历史数据统计分析，不构成投注建议。彩票具有随机性，请理性购彩，量力而行。</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useLotteryStore } from '@/stores/lottery'
import NumberBall from '@/components/NumberBall.vue'

const lotteryStore = useLotteryStore()
const prediction = ref<any>(null)

// 计算属性
const isLoading = computed(() => lotteryStore.isLoading)
const error = computed(() => lotteryStore.error)
const hasData = computed(() => lotteryStore.hasData)
const latestRecord = computed(() => lotteryStore.latestRecord)
const totalRecords = computed(() => lotteryStore.totalRecords)
const nextIssue = computed(() => lotteryStore.getNextIssue())

const frontFreq = computed(() => lotteryStore.getFrontNumberFrequency())
const backFreq = computed(() => lotteryStore.getBackNumberFrequency())
const hotNumbers = computed(() => lotteryStore.getHotNumbers(30))
const coldNumbers = computed(() => lotteryStore.getColdNumbers())
const gapAnalysis = computed(() => lotteryStore.analyzeGaps())

// 监听数据加载完成，然后生成预测
watch(hasData, (newVal) => {
  if (newVal) {
    refreshPrediction()
  }
}, { immediate: true })

// 方法
async function loadData() {
  await lotteryStore.loadData()
}

function refreshPrediction() {
  if (lotteryStore.hasData) {
    prediction.value = lotteryStore.generatePrediction()
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script> 