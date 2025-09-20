import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 属性类型定义
type StatType = 'mainStat' | 'attack' | 'bossDamage' | 'critDamage' | 'allStat';

// 属性配置
const statConfig: Record<StatType, { name: string; icon: string; unit: string; color: string }> = {
  mainStat: { name: '主属性', icon: 'fa-star', unit: '', color: '#f59e0b' },
  attack: { name: '攻击', icon: 'fa-bolt', unit: '', color: '#ef4444' },
  bossDamage: { name: 'BOSS伤', icon: 'fa-shield-alt', unit: '%', color: '#10b981' },
  critDamage: { name: '暴击伤害', icon: 'fa-sword', unit: '%', color: '#8b5cf6' },
  allStat: { name: '全属性', icon: 'fa-gem', unit: '%', color: '#3b82f6' },
};

// 生成属性增长模拟数据
const generateStatGrowthData = (baseValue: number, statType: StatType, baseCombatPower: number) => {
  const data = [];
  let currentValue = baseValue;
  let previousCP = baseCombatPower;
  
  // 模拟20次提升
  for (let i = 0; i <= 20; i++) {
    let cpMultiplier = 1;
    
    // 根据不同属性类型应用不同的战斗力增长公式
    switch (statType) {
      case 'mainStat':
        // 主属性收益边际递减
        cpMultiplier = 1 + (currentValue / (baseValue * 5));
        break;
      case 'attack':
        // 攻击收益相对稳定
        cpMultiplier = 1 + (currentValue / (baseValue * 4));
        break;
      case 'bossDamage':
      case 'critDamage':
      case 'allStat':
        // 百分比属性收益
        cpMultiplier = 1 + (currentValue / 100);
        break;
    }
    
    const currentCP = Math.floor(baseCombatPower * cpMultiplier);
    const marginalGain = i > 0 ? currentCP - previousCP : 0;
    const marginalEfficiency = i > 0 ? marginalGain / (statType.includes('Percent') ? 1 : 5) : 0;
    
    data.push({
      level: i,
      value: currentValue,
      combatPower: currentCP,
      marginalGain,
      marginalEfficiency,
    });
    
    // 准备下一次迭代的值
    previousCP = currentCP;
    
    // 根据属性类型决定增长幅度
    if (statType === 'mainStat') {
      currentValue += Math.floor(baseValue * 0.05); // 主属性每次增加5%
    } else if (statType === 'attack') {
      currentValue += Math.floor(baseValue * 0.03); // 攻击每次增加3%
    } else {
      currentValue += 2; // 百分比属性每次增加2%
    }
  }
  
  return data;
};

// 分析边际效益并生成建议
const analyzeMarginalBenefit = (data: any[], statType: StatType) => {
  // 找到边际效益最高的点
  let maxEfficiencyPoint = data[0];
  let efficiencyDropPoint = null;
  
  // 分析效益下降趋势
  for (let i = 1; i < data.length; i++) {
    if (data[i].marginalEfficiency > maxEfficiencyPoint.marginalEfficiency) {
      maxEfficiencyPoint = data[i];
    }
    
    // 检测效益显著下降的点（下降超过30%）
    if (i > 1 && data[i].marginalEfficiency < data[i-2].marginalEfficiency * 0.7 && !efficiencyDropPoint) {
      efficiencyDropPoint = data[i];
    }
  }
  
  return { maxEfficiencyPoint, efficiencyDropPoint };
};

// 生成优化建议
const generateRecommendation = (analysis: any, statType: StatType, baseValue: number) => {
  const { maxEfficiencyPoint, efficiencyDropPoint } = analysis;
  const statInfo = statConfig[statType];
  
  let recommendation = '';
  let priorityClass = '';
  
  if (!efficiencyDropPoint) {
    // 未发现明显效益下降，建议继续提升
    recommendation = `继续提升${statInfo.name}，当前尚未达到明显效益下降点。在${statInfo.name}达到${maxEfficiencyPoint.value}${statInfo.unit}时效益最佳。`;
    priorityClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
  } else if (maxEfficiencyPoint.level < efficiencyDropPoint.level) {
    // 已过最佳效益点，但尚未严重下降
    recommendation = `${statInfo.name}在达到${maxEfficiencyPoint.value}${statInfo.unit}时效益最佳。建议在${efficiencyDropPoint.value}${statInfo.unit}前考虑转向提升其他属性。`;
    priorityClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
  } else {
    // 已过效益下降点，建议转换属性
    recommendation = `${statInfo.name}效益已显著下降，当前提升效率较低。建议优先提升其他属性，待其他属性达到瓶颈后再考虑继续提升。`;
    priorityClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
  }
  
  return { recommendation, priorityClass };
};

export default function MarginalBenefitAnalysis() {
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [selectedStat, setSelectedStat] = useState<StatType>('mainStat');
  const [statData, setStatData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [recommendation, setRecommendation] = useState({ text: '', priorityClass: '' });
  
  // 加载角色列表
  useEffect(() => {
    const savedCharacters = JSON.parse(localStorage.getItem('mapleStoryCharacters') || '[]');
    setCharacters(savedCharacters);
    
    if (savedCharacters.length > 0) {
      setSelectedCharacterId(savedCharacters[0].id);
      setSelectedCharacter(savedCharacters[0]);
    } else {
      toast.warning('请先创建角色才能进行边际收益分析');
    }
  }, []);
  
  // 当选择角色或属性变化时生成分析数据
  useEffect(() => {
    if (!selectedCharacter) return;
    
    generateAnalysisData();
  }, [selectedCharacter, selectedStat]);
  
  // 生成分析数据
  const generateAnalysisData = () => {
    setLoading(true);
    
    // 模拟加载延迟
    setTimeout(() => {
      try {
        // 获取角色当前属性和战斗力数据
        const equipmentData = JSON.parse(localStorage.getItem('mapleStoryEquipment') || '{}')[selectedCharacter.id] || {};
        
        // 计算基础属性值（简化版，实际应与战斗力计算器保持一致）
        let baseStats = {
          mainStat: 0,
          attack: 0,
          bossDamage: 0,
          critDamage: 0,
          allStat: 0,
          combatPower: 0
        };
        
        // 确定主属性
        if (selectedCharacter.className === 'warrior') {
          baseStats.mainStat = selectedCharacter.strength || 0;
        } else if (selectedCharacter.className === 'magician') {
          baseStats.mainStat = selectedCharacter.intelligence || 0;
        } else if (selectedCharacter.className === 'bowman') {
          baseStats.mainStat = selectedCharacter.dexterity || 0;
        } else if (selectedCharacter.className === 'thief') {
          baseStats.mainStat = selectedCharacter.luck || 0;
        } else if (selectedCharacter.className === 'pirate') {
          baseStats.mainStat = Math.floor((selectedCharacter.strength + selectedCharacter.dexterity) / 2);
        }
        
        // 累加装备属性（简化版）
        Object.values(equipmentData).forEach((equip: any) => {
          baseStats.mainStat += equip.strength || 0;
          baseStats.mainStat += equip.dexterity || 0;
          baseStats.mainStat += equip.intelligence || 0;
          baseStats.mainStat += equip.luck || 0;
          baseStats.attack += equip.attack || 0;
          baseStats.bossDamage += equip.bossDamagePercent || 0;
          baseStats.critDamage += equip.critDamagePercent || 0;
          baseStats.allStat += equip.allStatPercent || 0;
        });
        
        // 简单计算战斗力（实际应与战斗力计算器保持一致）
        baseStats.combatPower = Math.floor((baseStats.mainStat * 4 + baseStats.attack) * 
                                          (1 + baseStats.bossDamage / 100) * 
                                          (1 + baseStats.critDamage / 100));
        
        // 生成属性增长数据
        const data = generateStatGrowthData(baseStats[selectedStat], selectedStat, baseStats.combatPower);
        setStatData(data);
        
        // 分析边际效益
        const analysis = analyzeMarginalBenefit(data, selectedStat);
        
        // 生成建议
        const recommendation = generateRecommendation(analysis, selectedStat, baseStats[selectedStat]);
        setRecommendation({
          text: recommendation.recommendation,
          priorityClass: recommendation.priorityClass
        });
        
        setAnalysisResult(analysis);
      } catch (error) {
        toast.error('生成边际收益分析失败，请重试');
        console.error('分析错误:', error);
      } finally {
        setLoading(false);
      }
    }, 800);
  };
  
  // 处理角色选择变化
  const handleCharacterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const characterId = e.target.value;
    setSelectedCharacterId(characterId);
    
    // 查找选中的角色
    const char = characters.find(c => c.id === characterId);
    setSelectedCharacter(char);
  };
  
  // 处理属性选择变化
  const handleStatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStat(e.target.value as StatType);
  };
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">属性边际收益分析</h1>
        <p className="text-gray-600 dark:text-gray-300">
          分析不同属性提升对战力的影响，找出最优提升策略
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧控制面板 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 角色选择 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">选择角色</h2>
            
            <div className="space-y-4">
              <select
                value={selectedCharacterId}
                onChange={handleCharacterChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">选择角色</option>
                {characters.map(character => (
                  <option key={character.id} value={character.id}>
                    {character.name} ({character.level}级)
                  </option>
                ))}
              </select>
              
              {selectedCharacter && (
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                    <i className="fa-solid fa-user text-blue-600 dark:text-blue-400 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{selectedCharacter.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {characterClasses.find(cls => cls.id === selectedCharacter.className)?.name} / {selectedCharacter.level}级
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 属性选择 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">选择分析属性</h2>
            
            <div className="space-y-4">
              <select
                value={selectedStat}
                onChange={handleStatChange}
                disabled={!selectedCharacter || loading}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                {Object.entries(statConfig).map(([key, config]) => (
                  <option key={key} value={key as StatType}>
                    <i className={`fa-solid ${config.icon} mr-2`}></i>{config.name}
                  </option>
                ))}
              </select>
              
              {selectedCharacter && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">当前属性值</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <i className={`fa-solid ${statConfig[selectedStat].icon} mr-2 text-gray-500 dark:text-gray-400`}></i>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{statConfig[selectedStat].name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {statData.length > 0 ? statData[0].value : '加载中...'}{statConfig[selectedStat].unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 分析建议 */}
          {!loading && statData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">优化建议</h2>
              
              <div className={`p-4 rounded-lg ${recommendation.priorityClass}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fa-solid fa-lightbulb text-lg"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{recommendation.text}</p>
                    
                    {analysisResult && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                          <p className="text-gray-500 dark:text-gray-400">最佳效益点</p>
                          <p className="font-semibold">{analysisResult.maxEfficiencyPoint.value}{statConfig[selectedStat].unit}</p>
                        </div>
                        {analysisResult.efficiencyDropPoint && (
                          <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                            <p className="text-gray-500 dark:text-gray-400">效益下降点</p>
                            <p className="font-semibold">{analysisResult.efficiencyDropPoint.value}{statConfig[selectedStat].unit}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 右侧图表展示 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 战斗力增长曲线 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">属性增长对战力影响</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {statConfig[selectedStat].name}提升与战斗力增长关系曲线
              </p>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px]">
                  <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">正在生成分析数据...</p>
                </div>
              ) : statData.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={statData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="level" 
                        stroke="#6b7280" 
                        name="提升次数"
                        tickFormatter={(value) => `+${value}`}
                      />
                      <YAxis yAxisId="left" stroke="#6b7280" name="战斗力" />
                      <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" name={statConfig[selectedStat].name} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => {
                          if (name === statConfig[selectedStat].name) {
                            return [`${value}${statConfig[selectedStat].unit}`, name];
                          }
                          return [value.toLocaleString(), name];
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="combatPower" 
                        name="战斗力" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="value" 
                        name={statConfig[selectedStat].name} 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
                  <i className="fa-solid fa-chart-line text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
                  <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">等待分析数据</h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md">
                    请选择角色和要分析的属性，系统将生成属性提升对战力影响的分析图表
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* 边际效益曲线 */}
          {!loading && statData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">边际效益分析</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  每次提升的战斗力增益及效益变化趋势
                </p>
              </div>
              
              <div className="p-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={statData.slice(1)} // 从第二次提升开始显示
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="level" stroke="#6b7280" name="提升次数" />
                      <YAxis stroke="#6b7280" name="战斗力增益" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="marginalGain" 
                        name="每次提升增益" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="marginalEfficiency" 
                        name="边际效益" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      
                      {/* 标记最佳效益点 */}
                      {analysisResult?.maxEfficiencyPoint && (
                        <Line 
                          type="monotone" 
                          data={[
                            { level: analysisResult.maxEfficiencyPoint.level, marginalEfficiency: 0 },
                            analysisResult.maxEfficiencyPoint
                          ]}
                          dataKey="marginalEfficiency" 
                          name="最佳效益点" 
                          stroke="#8b5cf6" 
                          strokeWidth={1}
                          strokeDasharray="3 3"
                        />
                      )}
                      
                      {/* 标记效益下降点 */}
                      {analysisResult?.efficiencyDropPoint && (
                        <Line 
                          type="monotone" 
                          data={[
                            { level: analysisResult.efficiencyDropPoint.level, marginalEfficiency: 0 },
                            analysisResult.efficiencyDropPoint
                          ]}
                          dataKey="marginalEfficiency" 
                          name="效益下降点" 
                          stroke="#f97316" 
                          strokeWidth={1}
                          strokeDasharray="3 3"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">边际效益说明</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      边际效益表示每单位属性提升所带来的战斗力增长。随着属性值增加，边际效益通常会逐渐下降。
                      图表中的"最佳效益点"表示投入产出比最高的位置，"效益下降点"表示效益开始显著降低的位置。
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">当前分析摘要</h3>
                    {statData.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">初始{statConfig[selectedStat].name}:</span> {statData[0].value}{statConfig[selectedStat].unit}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">初始战斗力:</span> {statData[0].combatPower.toLocaleString()}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">最终{statConfig[selectedStat].name}:</span> {statData[statData.length-1].value}{statConfig[selectedStat].unit}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">最终战斗力:</span> {statData[statData.length-1].combatPower.toLocaleString()}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">总提升:</span> {statData[statData.length-1].combatPower - statData[0].combatPower.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300">请选择角色和属性以查看分析摘要</p>
                    )}
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

// 角色职业数据
const characterClasses = [
  { id: 'warrior', name: '战士' },
  { id: 'magician', name: '魔法师' },
  { id: 'bowman', name: '弓箭手' },
  { id: 'thief', name: '飞侠' },
  { id: 'pirate', name: '海盗' },
];