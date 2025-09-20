import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 装备部位
const equipmentSlots = [{ id: 'weapon', name: '武器', icon: 'fa-sword' },
  { id: 'secondary', name: '副手', icon: 'fa-shield-alt' },
  { id: 'hat', name: '帽子', icon: 'fa-hat-wizard' },
  { id: 'face', name: '脸部装饰', icon: 'fa-face-smile' },
  { id: 'eye', name: '眼部装饰', icon: 'fa-eye' },
  { id: 'earrings', name: '耳环', icon: 'fa-circle' },
  { id: 'cape', name: '披风', icon: 'fa-cape' },
  { id: 'coat', name: '上衣', icon: 'fa-shirt' },
  { id: 'pants', name: '裤子', icon: 'fa-walking' },
  { id: 'shoes', name: '鞋子', icon: 'fa-shoe-prints' },
  { id: 'gloves', name: '手套', icon: 'fa-hand-fist' },
  { id: 'shoulder', name: '肩膀', icon: 'fa-person' },
  { id: 'ring1', name: '戒指1', icon: 'fa-ring' },
  { id: 'ring2', name: '戒指2', icon: 'fa-ring' },
  { id: 'ring3', name: '戒指3', icon: 'fa-ring' },
  { id: 'ring4', name: '戒指4', icon: 'fa-ring' },
  { id: 'pendant1', name: '项链1', icon: 'fa-gem' },
  { id: 'pendant2', name: '项链2', icon: 'fa-gem' },
  { id: 'belt', name: '腰带', icon: 'fa-waistcoat' },
  { id: 'medal', name: '勋章', icon: 'fa-medal' },
  { id: 'badge', name: '徽章', icon: 'fa-id-card' },
  { id: 'emblem', name: '纹章', icon: 'fa-shield' },
];

// 计算战斗力
const calculateCombatPower = (stats: any) => {
  return Math.floor((stats.mainStat * 4 + stats.attack) * 
                   (1 + stats.bossDamage / 100) * 
                   (1 + stats.critDamage / 100));
};

// 计算装备属性对角色总属性的影响
const calculateEquipmentImpact = (baseStats: any, equipment: any, isCurrent: boolean = true) => {
  if (!baseStats || !equipment) return { ...baseStats };
  
  // 创建基础属性的副本
  const newStats = { ...baseStats };
  
  // 如果是当前装备，先减去其属性值
  if (isCurrent) {
    newStats.strength -= equipment.strength || 0;
    newStats.dexterity -= equipment.dexterity || 0;
    newStats.intelligence -= equipment.intelligence || 0;
    newStats.luck -= equipment.luck || 0;
    newStats.attack -= equipment.attack || 0;
    
    // 百分比属性需要重新计算，这里简化处理
    newStats.bossDamage -= equipment.bossDamagePercent || 0;
    newStats.critDamage -= equipment.critDamagePercent || 0;
    newStats.allStat -= equipment.allStatPercent || 0;
  }
  
  // 添加装备属性
  if (equipment) {
    newStats.strength += equipment.strength || 0;
    newStats.dexterity += equipment.dexterity || 0;
    newStats.intelligence += equipment.intelligence || 0;
    newStats.luck += equipment.luck || 0;
    newStats.attack += equipment.attack || 0;
    
    newStats.bossDamage += equipment.bossDamagePercent || 0;
    newStats.critDamage += equipment.critDamagePercent || 0;
    newStats.allStat += equipment.allStatPercent || 0;
  }
  
  // 重新计算主属性
  if (newStats.className === 'warrior') {
    newStats.mainStat = newStats.strength;
  } else if (newStats.className === 'magician') {
    newStats.mainStat = newStats.intelligence;
  } else if (newStats.className === 'bowman') {
    newStats.mainStat = newStats.dexterity;
  } else if (newStats.className === 'thief') {
    newStats.mainStat = newStats.luck;
  } else if (newStats.className === 'pirate') {
    newStats.mainStat = Math.floor((newStats.strength + newStats.dexterity) / 2);
  }
  
  // 计算战斗力
  newStats.combatPower = calculateCombatPower(newStats);
  
  return newStats;
};

export default function EquipmentComparison() {
  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [equipmentData, setEquipmentData] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [currentEquipment, setCurrentEquipment] = useState<any>(null);
  const [newEquipment, setNewEquipment] = useState<any>({
    name: '',
    strength: 0,
    dexterity: 0,
    intelligence: 0,
    luck: 0,
    attack: 0,
    bossDamagePercent: 0,
    critDamagePercent: 0,
    allStatPercent: 0,
  });
  const [baseStats, setBaseStats] = useState<any>(null);
  const [currentStats, setCurrentStats] = useState<any>(null);
  const [newStats, setNewStats] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  
  // 加载角色列表
  useEffect(() => {
    const savedCharacters = JSON.parse(localStorage.getItem('mapleStoryCharacters') || '[]');
    setCharacters(savedCharacters);
    
    if (savedCharacters.length > 0 && !selectedCharacterId) {
      setSelectedCharacterId(savedCharacters[0].id);
      setSelectedCharacter(savedCharacters[0]);
    }
  }, [selectedCharacterId]);
  
  // 当选中角色变化时加载装备数据和基础属性
  useEffect(() => {
    if (!selectedCharacterId) return;
    
    // 加载装备数据
    const savedEquipment = JSON.parse(localStorage.getItem('mapleStoryEquipment') || '{}');
    setEquipmentData(savedEquipment[selectedCharacterId] || {});
    
    // 计算基础属性（不含装备）
    const char = characters.find(c => c.id === selectedCharacterId);
    if (char) {
      // 确定主属性
      let mainStat = 0;
      if (char.className === 'warrior') {
        mainStat = char.strength;
      } else if (char.className === 'magician') {
        mainStat = char.intelligence;
      } else if (char.className === 'bowman') {
        mainStat = char.dexterity;
      } else if (char.className === 'thief') {
        mainStat = char.luck;
      } else if (char.className === 'pirate') {
        mainStat = Math.floor((char.strength + char.dexterity) / 2);
      }
      
      const baseStats = {
        ...char,
        mainStat,
        attack: 0,
        bossDamage: 0,
        critDamage: 0,
        allStat: 0,
        combatPower: calculateCombatPower({ mainStat, attack: 0, bossDamage: 0, critDamage: 0 })
      };
      
      setBaseStats(baseStats);
      setCurrentStats({ ...baseStats });
      setNewStats({ ...baseStats });
    }
  }, [selectedCharacterId, characters]);
  
  // 当选择装备部位变化时加载当前装备
  useEffect(() => {
    if (!selectedSlot || !equipmentData) return;
    
    const equip = equipmentData[selectedSlot] || null;
    setCurrentEquipment(equip);
    
    // 如果有当前装备，初始化新装备表单
    if (equip) {
      setNewEquipment({
        name: '',
        strength: equip.strength || 0,
        dexterity: equip.dexterity || 0,
        intelligence: equip.intelligence || 0,
        luck: equip.luck || 0,
        attack: equip.attack || 0,
        bossDamagePercent: equip.bossDamagePercent || 0,
        critDamagePercent: equip.critDamagePercent || 0,
        allStatPercent: equip.allStatPercent || 0,
      });
    } else {
      // 如果没有当前装备，初始化空装备
      setNewEquipment({
        name: '',
        strength: 0,
        dexterity: 0,
        intelligence: 0,
        luck: 0,
        attack: 0,
        bossDamagePercent: 0,
        critDamagePercent: 0,
        allStatPercent: 0,
      });
    }
    
    // 重新计算属性
    updateStatsComparison();
  }, [selectedSlot, equipmentData, baseStats]);
  
  // 更新属性对比
  const updateStatsComparison = () => {
    if (!baseStats) return;
    
    // 计算当前装备下的属性
    const current = calculateEquipmentImpact(baseStats, currentEquipment);
    setCurrentStats(current);
    
    // 计算新装备下的属性
    const newStat = calculateEquipmentImpact(baseStats, newEquipment, false);
    setNewStats(newStat);
    
    // 生成对比图表数据
    const cpDiff = newStat.combatPower - current.combatPower;
    const cpPercentDiff = current.combatPower > 0 ? (cpDiff / current.combatPower) * 100 : 0;
    
    setComparisonData([
      { name: '战斗力', current: current.combatPower, new: newStat.combatPower, diff: cpDiff, percentDiff: cpPercentDiff },
      { name: '主属性', current: current.mainStat, new: newStat.mainStat, diff: newStat.mainStat - current.mainStat },
      { name: '攻击', current: current.attack, new: newStat.attack, diff: newStat.attack - current.attack },
      { name: 'BOSS伤%', current: current.bossDamage, new: newStat.bossDamage, diff: newStat.bossDamage - current.bossDamage },
      { name: '爆伤%', current: current.critDamage, new: newStat.critDamage, diff: newStat.critDamage - current.critDamage },
    ]);
  };
  
  // 处理新装备属性变化
  const handleNewEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setNewEquipment(prev => ({
      ...prev,
      [name]: value ? Number(value) : 0
    }));
    
    // 延迟更新统计数据，避免输入过程中频繁计算
    clearTimeout(window.equipmentUpdateTimeout);
    window.equipmentUpdateTimeout = setTimeout(updateStatsComparison, 300);
  };
  
  // 角色选择变化处理
  const handleCharacterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const characterId = e.target.value;
    setSelectedCharacterId(characterId);
    
    // 重置其他选择
    setSelectedSlot('');
    setCurrentEquipment(null);
    setNewEquipment({
      name: '',
      strength: 0,
      dexterity: 0,
      intelligence: 0,
      luck: 0,
      attack: 0,
      bossDamagePercent: 0,
      critDamagePercent: 0,
      allStatPercent: 0,
    });
  };
  
  // 装备部位选择变化处理
  const handleSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSlot(e.target.value);
  };
  
  // 生成差异显示样式
  const getDiffStyle = (diff: number, isPercent: boolean = false) => {
    if (diff === 0) {
      return "text-gray-500 dark:text-gray-400";
    }
    
    const absDiff = Math.abs(diff);
    let style = diff > 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400";
    
    // 根据差异大小添加不同强度的样式
    if (absDiff > 10) {
      style += " font-bold";
    } else if (absDiff > 5) {
      style += " font-semibold";
    }
    
    return style;
  };
  
  // 生成差异文本
  const getDiffText = (diff: number, isPercent: boolean = false) => {
    if (diff === 0) {
      return "0";
    }
    
    const prefix = diff > 0 ? "+" : "";
    const suffix = isPercent ? "%" : "";
    
    return `${prefix}${diff.toFixed(isPercent ? 1 : 0)}${suffix}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">装备对比系统</h1>
        <p className="text-gray-600 dark:text-gray-300">
          模拟更换装备，实时计算战斗力变化，优化装备选择
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧控制面板 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 角色和装备选择 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">选择角色和装备部位</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="character" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  选择角色 <span className="text-red-500">*</span>
                </label>
                <select
                  id="character"
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
              </div>
              
              <div>
                <label htmlFor="slot" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  装备部位 <span className="text-red-500">*</span>
                </label>
                <select
                  id="slot"
                  value={selectedSlot}
                  onChange={handleSlotChange}
                  disabled={!selectedCharacterId}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">选择装备部位</option>
                  {equipmentSlots.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      <i className={`fa-solid ${slot.icon} mr-2`}></i>{slot.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedSlot && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">当前装备</h3>
                  {currentEquipment ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentEquipment.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {equipmentSlots.find(slot => slot.id === selectedSlot)?.name}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">未装备</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 新装备属性输入 */}
          {selectedSlot && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">新装备属性</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    装备名称
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="输入装备名称"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="strength" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      力量
                    </label>
                    <input
                      type="number"
                      id="strength"
                      name="strength"
                      value={newEquipment.strength}
                      onChange={handleNewEquipmentChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dexterity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      敏捷
                    </label>
                    <input
                      type="number"
                      id="dexterity"
                      name="dexterity"
                      value={newEquipment.dexterity}
                      onChange={handleNewEquipmentChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="intelligence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      智力
                    </label>
                    <input
                      type="number"
                      id="intelligence"
                      name="intelligence"
                      value={newEquipment.intelligence}
                      onChange={handleNewEquipmentChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="luck" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      运气
                    </label>
                    <input
                      type="number"
                      id="luck"
                      name="luck"
                      value={newEquipment.luck}
                      onChange={handleNewEquipmentChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="attack" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      攻击
                    </label>
                    <input
                      type="number"
                      id="attack"
                      name="attack"
                      value={newEquipment.attack}
                      onChange={handleNewEquipmentChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="allStatPercent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      全属性%
                    </label>
                    <input
                      type="number"
                      id="allStatPercent"
                      name="allStatPercent"
                      value={newEquipment.allStatPercent}
                      onChange={handleNewEquipmentChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bossDamagePercent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      BOSS伤%
                    </label>
                    <input
                      type="number"
                      id="bossDamagePercent"
                      name="bossDamagePercent"
                      value={newEquipment.bossDamagePercent}
                      onChange={handleNewEquipmentChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="critDamagePercent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      暴击伤害%
                    </label>
                    <input
                      type="number"
                      id="critDamagePercent"
                      name="critDamagePercent"
                      value={newEquipment.critDamagePercent}
                      onChange={handleNewEquipmentChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 右侧对比结果 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 战斗力对比 */}
          {comparisonData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">属性对比结果</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  当前装备 vs 新装备（{newEquipment.name || '未命名装备'}）
                </p>
              </div>
              
              <div className="p-6">
                <div className="h-[300px] w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData.slice(1)} // 跳过战斗力，单独显示
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
                        formatter={(value: number, name: string) => [value, name === 'current' ? '当前装备' : '新装备']}
                      />
                      <Legend />
                      <Bar dataKey="current" name="当前装备" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="new" name="新装备" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* 战斗力变化卡片 */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">战斗力变化</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        更换装备后预计的战斗力变化
                      </p>
                    </div>
                    
                    <div className="flex items-end gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">当前战斗力</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{comparisonData[0].current.toLocaleString()}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">新战斗力</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{comparisonData[0].new.toLocaleString()}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">变化</p>
                        <p className={`text-2xl font-bold ${getDiffStyle(comparisonData[0].diff, true)}`}>
                          {getDiffText(comparisonData[0].diff)} 
                          <span className="text-base font-normal ml-1">({getDiffText(comparisonData[0].percentDiff, true)})</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 属性变化详情 */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          属性
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          当前装备
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          新装备
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          变化
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {comparisonData.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.current}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.new}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={cn(getDiffStyle(item.diff, item.name === '战斗力'))}>
                              {getDiffText(item.diff, item.name === '战斗力')}
                              {item.name === '战斗力' && ` (${getDiffText(item.percentDiff, true)})`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">分析建议</h3>
                {comparisonData[0].diff > 0 ? (
                  <p className="text-sm text-green-800 dark:text-green-100 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <i className="fa-solid fa-check-circle mr-2"></i>
                    建议更换装备！新装备预计提升战斗力{getDiffText(comparisonData[0].diff)}（{getDiffText(comparisonData[0].percentDiff, true)}）。
                    {comparisonData[0].diff > 1000 && ' 这是一个显著的提升！'}
                  </p>
                ) : comparisonData[0].diff < 0 ? (
                  <p className="text-sm text-red-800 dark:text-red-100 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <i className="fa-solid fa-exclamation-circle mr-2"></i>
                    不建议更换装备。新装备预计降低战斗力{getDiffText(comparisonData[0].diff)}（{getDiffText(comparisonData[0].percentDiff, true)}）。
                  </p>
                ) : (
                  <p className="text-sm text-yellow-800 dark:text-yellow-100 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <i className="fa-solid fa-info-circle mr-2"></i>
                    更换装备后战斗力没有变化。考虑其他因素如套装效果或实用性再做决定。
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* 未选择装备时的提示 */}
          {(!selectedSlot || comparisonData.length === 0) && !isLoading && (
            <div className="flex flex-col items-center justify-center h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 text-center p-6">
              <i className="fa-solid fa-exchange-alt text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">准备装备对比</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
                {selectedCharacterId ? (
                  "请选择装备部位并输入新装备属性，系统将自动计算战斗力变化"
                ) : (
                  "请先选择一个角色，然后选择装备部位并输入新装备属性进行对比"
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}