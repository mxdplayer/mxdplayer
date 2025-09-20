import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 抽奖类型
const lotteryTypes = [
  { id: 'gacha', name: '转蛋', icon: 'fa-drum', description: '抽取宠物、坐骑等道具的转蛋系统' },
  { id: 'hammer', name: '敲敲乐', icon: 'fa-hammer', description: '使用锤子敲击方块获取奖励的系统' },
  { id: 'starforce', name: '装备上星', icon: 'fa-star', description: '提升装备星级的强化系统' },
];

// 预设概率配置
const defaultProbabilityConfigs = {
  gacha: [
    { id: 'rare', name: '稀有道具', probability: 5, color: '#f59e0b' },
    { id: 'epic', name: '史诗道具', probability: 2, color: '#8b5cf6' },
    { id: 'unique', name: '传说道具', probability: 0.5, color: '#ec4899' },
    { id: 'normal', name: '普通道具', probability: 92.5, color: '#6b7280' },
  ],
  hammer: [
    { id: 'meso', name: '金币', probability: 40, color: '#10b981' },
    { id: 'scroll', name: '卷轴', probability: 30, color: '#3b82f6' },
    { id: 'item', name: '道具', probability: 25, color: '#f59e0b' },
    { id: 'special', name: '特殊奖励', probability: 5, color: '#ec4899' },
  ],
  starforce: [
    { id: 'success', name: '成功', probability: 70, color: '#10b981' },
    { id: 'fail', name: '失败', probability: 20, color: '#ef4444' },
    { id: 'destroy', name: '破坏', probability: 10, color: '#1f2937' },
  ]
};

// 生成随机结果
const generateRandomResult = (probabilities: any[]) => {
  const random = Math.random() * 100;
  let cumulativeProbability = 0;
  
  for (const item of probabilities) {
    cumulativeProbability += item.probability;
    if (random < cumulativeProbability) {
      return { ...item };
    }
  }
  
  return probabilities[probabilities.length - 1]; // 保底返回最后一项
};

// 格式化历史记录
const formatHistoryRecord = (result: any, lotteryType: string) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  
  let resultStr = '';
  if (lotteryType === 'gacha') {
    resultStr = `获得了${result.name}`;
  } else if (lotteryType === 'hammer') {
    resultStr = `敲出了${result.name}`;
  } else if (lotteryType === 'starforce') {
    resultStr = result.name === 'success' ? '强化成功' : result.name === 'fail' ? '强化失败' : '装备破坏';
  }
  
  return {
    id: Date.now().toString(),
    time: timeStr,
    result: resultStr,
    resultType: result.id,
    color: result.color,
  };
};

// 分析历史记录数据
const analyzeHistoryData = (history: any[]) => {
  const stats = {};
  
  // 统计各结果出现次数
  history.forEach(record => {
    if (!stats[record.resultType]) {
      stats[record.resultType] = 0;
    }
    stats[record.resultType]++;
  });
  
  // 转换为图表数据格式
  const chartData = [];
  for (const [type, count] of Object.entries(stats)) {
    // 查找对应的颜色和名称
    const configItem = Object.values(defaultProbabilityConfigs).flat().find(item => item.id === type);
    if (configItem) {
      chartData.push({
        name: configItem.name,
        count: count,
        color: configItem.color,
        probability: configItem.probability,
      });
    }
  }
  
  return {
    total: history.length,
    chartData,
  };
};

export default function LotterySimulation() {
  const [selectedLotteryType, setSelectedLotteryType] = useState('gacha');
  const [probabilityConfig, setProbabilityConfig] = useState<any[]>(defaultProbabilityConfigs.gacha);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [analysisData, setAnalysisData] = useState<any>({ total: 0, chartData: [] });
  const [simulateCount, setSimulateCount] = useState(1);
  
  // 加载本地存储的历史记录
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('lotteryHistory') || '[]');
    setHistory(savedHistory);
    
    // 分析历史数据
    const data = analyzeHistoryData(savedHistory);
    setAnalysisData(data);
  }, []);
  
  // 当抽奖类型变化时更新概率配置
  useEffect(() => {
    setProbabilityConfig(defaultProbabilityConfigs[selectedLotteryType]);
    setCurrentResult(null);
  }, [selectedLotteryType]);
  
  // 当历史记录变化时更新分析数据
  useEffect(() => {
    const data = analyzeHistoryData(history);
    setAnalysisData(data);
    
    // 保存历史记录到本地存储
    localStorage.setItem('lotteryHistory', JSON.stringify(history));
  }, [history]);
  
  // 更新概率值
  const updateProbability = (id: string, value: number) => {
    const newConfig = probabilityConfig.map(item => 
      item.id === id ? { ...item, probability: value } : item
    );
    
    // 确保概率总和为100%
    const total = newConfig.reduce((sum, item) => sum + item.probability, 0);
    if (Math.abs(total - 100) > 0.1) {
      toast.warning(`概率总和不为100%，当前总和: ${total.toFixed(1)}%`);
    }
    
    setProbabilityConfig(newConfig);
  };
  
  // 模拟抽奖
  const simulateLottery = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setCurrentResult(null);
    
    // 模拟多次抽奖
    const newResults = [];
    
    // 模拟延迟效果
    setTimeout(() => {
      for (let i = 0; i < simulateCount; i++) {
        // 为每次抽奖添加微小延迟，创造动画效果
        setTimeout(() => {
          const result = generateRandomResult(probabilityConfig);
          const record = formatHistoryRecord(result, selectedLotteryType);
          
          newResults.push(record);
          setCurrentResult(result);
          setHistory(prev => [record, ...prev]);
          
          // 最后一次抽奖完成
          if (i === simulateCount - 1) {
            setIsSimulating(false);
            
            // 如果抽中稀有物品，显示特殊提示
            if (['epic', 'unique', 'special'].includes(result.id)) {
              toast.success(`恭喜获得${result.name}！`, { duration: 5000 });
            }
          }
        }, i * 800); // 每次抽奖间隔800ms
      }
    }, 500);
  };
  
  // 重置历史记录
  const resetHistory = () => {
    if (window.confirm('确定要清空所有抽奖历史记录吗？')) {
      setHistory([]);
      localStorage.removeItem('lotteryHistory');
      toast.success('抽奖历史记录已清空');
    }
  };
  
  // 计算总概率
  const totalProbability = probabilityConfig.reduce((sum, item) => sum + item.probability, 0);
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">抽奖模拟系统</h1>
        <p className="text-gray-600 dark:text-gray-300">
          模拟转蛋、敲敲乐、装备上星等概率类活动
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧控制面板 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 抽奖类型选择 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">选择活动类型</h2>
            
            <div className="space-y-3">
              {lotteryTypes.map(type => (
                <div 
                  key={type.id}
                  onClick={() => setSelectedLotteryType(type.id)}
                  className={cn(
                    "flex items-center p-3 rounded-lg cursor-pointer transition-all",
                    selectedLotteryType === type.id 
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" 
                      : "bg-gray-50 dark:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  )}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    selectedLotteryType === type.id 
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400" 
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  }`}>
                    <i className={`fa-solid ${type.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{type.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 概率配置 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">概率配置</h2>
              <button
                onClick={() => setProbabilityConfig(defaultProbabilityConfigs[selectedLotteryType])}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                重置默认
              </button>
            </div>
            
            <div className="space-y-4">
              {probabilityConfig.map((item, index) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.name}
                    </label>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.probability}%
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={item.probability}
                    onChange={(e) => updateProbability(item.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              ))}
              
              <div className="pt-2 flex items-center justify-between border-t">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  总概率
                </span>
                <span className={cn(
                  "text-sm font-medium",
                  Math.abs(totalProbability - 100) < 0.1 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                )}>
                  {totalProbability.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* 抽奖控制 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">抽奖控制</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  抽奖次数
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setSimulateCount(prev => Math.max(1, prev - 1))}
                    disabled={simulateCount <= 1 || isSimulating}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    value={simulateCount}
                    onChange={(e) => setSimulateCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    min="1"
                    max="10"
                    disabled={isSimulating}
                    className="w-full px-3 py-2 border-t border-b border-gray-300 dark:border-gray-600 text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                  <button
                    onClick={() => setSimulateCount(prev => Math.min(10, prev + 1))}
                    disabled={simulateCount >= 10 || isSimulating}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  一次最多模拟10次抽奖
                </p>
              </div>
              
              <button
                onClick={simulateLottery}
                disabled={isSimulating || Math.abs(totalProbability - 100) > 0.1}
                className={cn(
                  "w-full px-4 py-3 rounded-lg font-medium text-white transition-all",
                  isSimulating 
                    ? "bg-blue-400 cursor-not-allowed" 
                    : Math.abs(totalProbability - 100) > 0.1
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isSimulating ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>抽奖中...
                  </>
                ) : Math.abs(totalProbability - 100) > 0.1 ? (
                  <>概率总和不为100%</>
                ) : (
                  <>
                    <i className={`fa-solid ${lotteryTypes.find(t => t.id === selectedLotteryType)?.icon} mr-2`}></i>
                    {simulateCount > 1 ? `连续${simulateCount}次抽奖` : '开始抽奖'}
                  </>
                )}
              </button>
              
              {history.length > 0 && (
                <button
                  onClick={resetHistory}
                  disabled={isSimulating}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <i className="fa-solid fa-trash mr-2"></i>清空历史记录
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* 右侧结果展示 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 抽奖结果 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">抽奖结果</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {lotteryTypes.find(t => t.id === selectedLotteryType)?.name} 模拟结果
              </p>
            </div>
            
            <div className="p-6">
              {isSimulating ? (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <div className={`w-24 h-24 border-4 border-t-transparent rounded-full animate-spin mb-4 ${
                    selectedLotteryType === 'gacha' ? 'border-blue-200 border-t-blue-600' :
                    selectedLotteryType === 'hammer' ? 'border-yellow-200 border-t-yellow-600' :
                    'border-purple-200 border-t-purple-600'
                  }`}></div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {selectedLotteryType === 'gacha' ? '转蛋中...' :
                     selectedLotteryType === 'hammer' ? '敲击中...' : '强化中...'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {simulateCount > 1 ? `正在进行第${history.length + 1}/${simulateCount}次抽奖` : '正在抽取奖励，请稍候'}
                  </p>
                </div>
              ) : currentResult ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
                    currentResult.id === 'rare' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                    currentResult.id === 'epic' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                    currentResult.id === 'unique' || currentResult.id === 'special' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    <i className="fa-solid fa-gift text-5xl"></i>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentResult.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {selectedLotteryType === 'gacha' ? '恭喜获得以上道具！' :
                     selectedLotteryType === 'hammer' ? '恭喜敲出以上奖励！' :
                     currentResult.id === 'success' ? '恭喜强化成功！' :
                     currentResult.id === 'fail' ? '强化失败，但装备保留。' : '很遗憾，装备强化失败并破坏。'}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <i className="fa-solid fa-info-circle mr-2"></i>
                    <span>概率: {currentResult.probability}%</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-6">
                  <i className={`fa-solid ${lotteryTypes.find(t => t.id === selectedLotteryType)?.icon} text-5xl text-gray-300 dark:text-gray-600 mb-4`}></i>
                  <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">等待抽奖</h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md">
                    点击左侧"开始抽奖"按钮进行{lotteryTypes.find(t => t.id === selectedLotteryType)?.name}模拟
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* 历史记录 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">抽奖历史</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  共{analysisData.total}次抽奖记录
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setHistory(history.slice(0, Math.min(history.length, 10)))}
                  disabled={history.length <= 10 || isSimulating}
                  className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  只看最近10条
                </button>
                <button
                  onClick={() => {
                    const savedHistory = JSON.parse(localStorage.getItem('lotteryHistory') || '[]');
                    setHistory(savedHistory);
                  }}
                  disabled={history.length === analysisData.total || isSimulating}
                  className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  显示全部
                </button>
              </div>
            </div>
            
            {history.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[300px] overflow-y-auto">
                {history.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${record.color} bg-opacity-20 dark:bg-opacity-30`}>
                        <i className="fa-solid fa-gift text-sm" style={{ color: record.color }}></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{record.result}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{record.time}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {record.resultType === 'rare' && '稀有'}
                      {record.resultType === 'epic' && '史诗'}
                      {record.resultType === 'unique' || record.resultType === 'special' ? '传说' : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-center p-6">
                <p className="text-gray-500 dark:text-gray-400">
                  暂无抽奖历史记录
                </p>
              </div>
            )}
          </div>
          
          {/* 统计分析 */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">抽奖统计</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  基于{analysisData.total}次抽奖的统计分析
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analysisData.chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        {analysisData.chartData.map((entry, index) => (
                          <Bar 
                            key={`bar-${index}`} 
                            dataKey="count" 
                            name={entry.name} 
                            fill={entry.color} 
                            radius={[4, 4, 0, 0]} 
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analysisData.chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {analysisData.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: number) => [`${value}次`, '次数']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">概率对比</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">道具类型</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">配置概率</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">实际概率</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">抽取次数</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {analysisData.chartData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${item.color}`}></div>
                                <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {item.probability}%
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {(item.count / analysisData.total * 100).toFixed(2)}%
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {item.count}次
                            </td>
                          </tr>
                        ))}
                        <tr className="font-medium">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">总计</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">100%</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">100%</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {analysisData.total}次
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}