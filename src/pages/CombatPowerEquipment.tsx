import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CombatPowerEquipment() {
    const navigate = useNavigate();
    const [characters, setCharacters] = useState<any[]>([]);
    const [selectedCharacterId, setSelectedCharacterId] = useState("");
    const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
    const [equipmentData, setEquipmentData] = useState<any>({});
    const [combatPower, setCombatPower] = useState<number | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [statData, setStatData] = useState<any[]>([]);
    const [analysisType, setAnalysisType] = useState<"attributeComparison" | "equipmentChange">("attributeComparison");
    const [selectedAttribute1, setSelectedAttribute1] = useState("");
    const [selectedAttribute2, setSelectedAttribute2] = useState("");
    const [equipmentChanges, setEquipmentChanges] = useState<Record<string, number>>({});
    const [activeBuffs, setActiveBuffs] = useState<string[]>([]);
    const [isBuffSectionOpen, setIsBuffSectionOpen] = useState<boolean>(true);

    const buffs = [{
        id: "familySkill-1",
        name: "家族三技",
        category: "skill",
        effects: [{
            attribute: "bossDamage",
            value: 30
        }, {
            attribute: "damagePercentage",
            value: 30
        }, {
            attribute: "criticalDamage",
            value: 30
        }]
    }, {
        id: "V5Skill",
        name: "V技能",
        category: "skill",
        effects: [{
            attribute: "baseAttack",
            value: 33
        }, {
            attribute: "criticalDamage",
            value: 8
        }, {
            attribute: "criticalRate",
            value: 10
        }, {
            attribute: "ignoreDefenseRate",
            value: 20
        }]
    }, {
        id: "SYL",
        name: "世易兰灵药[+]",
        category: "potion",
        effects: [{
            attribute: "baseAttack",
            value: 30
        }, {
            attribute: "attackPercentage",
            value: 10
        }, {
            attribute: "criticalRate",
            value: 10
        }, {
            attribute: "criticalDamage",
            value: 8
        }, {
            attribute: "bossDamage",
            value: 10
        }]
    }, {
        id: "active",
        name: "活动Buff",
        category: "skill",
        effects: [{
            attribute: "bossDamage",
            value: 15
        }, {
            attribute: "baseAttack",
            value: 15
        }, {
            attribute: "mainAttributeBase",
            value: 15
        }, {
            attribute: "secondaryAttributeBase",
            value: 15
        }, {
            attribute: "ignoreDefenseRate",
            value: 15
        }]
    }, {
        id: "powerBoost",
        name: "英雄的回声",
        category: "skill",
        effects: [{
            attribute: "attackPercentage",
            value: 4
        }]
    }, {
        id: "gongjiang",
        name: "高级武器精炼[A]",
        category: "skill",
        effects: [{
            attribute: "criticalDamage",
            value: 5
        }]
    }, {
        id: "bossB",
        name: "首领秘药[A]",
        category: "potion",
        effects: [{
            attribute: "bossDamage",
            value: 20
        }]
    }, {
        id: "ignoreB",
        name: "无视秘药[A]",
        category: "potion",
        effects: [{
            attribute: "ignoreDefenseRate",
            value: 20
        }]
    }, {
        id: "damageB",
        name: "伤害秘药[A]",
        category: "potion",
        effects: [{
            attribute: "damagePercentage",
            value: 10
        }]
    }, {
        id: "roomBoss",
        name: "小屋增益",
        category: "skill",
        effects: [{
            attribute: "bossDamage",
            value: 15
        }]
    }, {
        id: "park",
        name: "怪物公园攻击药",
        category: "potion",
        effects: [{
            attribute: "baseAttack",
            value: 30
        }]
    }, {
        id: "union",
        name: "联盟增益",
        category: "skill",
        effects: [{
            attribute: "baseAttack",
            value: 30
        }]
    }, {
        id: "monv",
        name: "魔女气象",
        category: "skill",
        effects: [{
            attribute: "baseAttack",
            value: 85
        }]
    }, {
        id: "blue",
        name: "闪耀蓝药",
        category: "potion",
        effects: [{
            attribute: "baseAttack",
            value: 30
        }]
    }, {
        id: "purple",
        name: "闪耀紫药",
        category: "potion",
        effects: [{
            attribute: "baseAttack",
            value: 50
        }]
    }, {
        id: "int10",
        name: "10级属性药水",
        category: "potion",
        effects: [{
            attribute: "mainAttributeBase",
            value: 30
        }]
    }, {
        id: "white",
        name: "小熊飘洒",
        category: "potion",
        effects: [{
            attribute: "baseAttack",
            value: 80
        }]
    }, {
        id: "vip",
        name: "vip气象",
        category: "skill",
        effects: [{
            attribute: "baseAttack",
            value: 30
        }]
    }, {
        id: "family",
        name: "家族气象",
        category: "skill",
        effects: [{
            attribute: "baseAttack",
            value: 30
        }]
    }, {
        id: "564",
        name: "564气象",
        category: "skill",
        effects: [{
            attribute: "baseAttack",
            value: 30
        }]
    }];

    const [attributeComparisonResult, setAttributeComparisonResult] = useState<any>(null);
    const [equipmentChangeResult, setEquipmentChangeResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const attributeOptions = [{
        value: "mainAttributeBase",
        label: "主属性",
        icon: "fa-star",
        unit: ""
    }, {
        value: "mainAttributePercent",
        label: "主属百分比",
        icon: "fa-star",
        unit: ""
    }, {
        value: "mainAttributeExtra",
        label: "额外主属",
        icon: "fa-star",
        unit: ""
    }, {
        value: "baseAttack",
        label: "攻击",
        icon: "fa-bolt",
        unit: ""
    }, {
        value: "attackPercentage",
        label: "攻击百分比",
        icon: "fa-bolt",
        unit: ""
    }, {
        value: "bossDamage",
        label: "BOSS伤",
        icon: "fa-shield-alt",
        unit: "%"
    }, {
        value: "ignoreDefenseRate",
        label: "无视",
        icon: "fa-shield-alt",
        unit: "%"
    }, {
        value: "damagePercentage",
        label: "伤害%",
        icon: "fa-percent",
        unit: "%"
    }, {
        value: "finalDamagePercentage",
        label: "终伤%",
        icon: "fa-bullseye",
        unit: "%"
    }, {
        value: "criticalDamage",
        label: "爆伤%",
        icon: "fa-sword",
        unit: "%"
    }];

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const savedCharacters = JSON.parse(localStorage.getItem("mapleStoryCharacters") || "[]");
            setCharacters(savedCharacters);

            if (savedCharacters.length > 0) {
                setSelectedCharacter(savedCharacters[0]);
                loadCharacterEquipment(savedCharacters[0].id);
            }

            setIsLoading(false);
        } catch (error) {
            toast.error("加载角色数据失败");
            setIsLoading(false);
        }
    }, []);

    const getMainAndSecondaryStats = (tempChanges: Record<string, number> = {}) => {
        if (!selectedCharacter) return {
            mainStat: 0,
            secondaryStat: 0,
            attackPower: 0,
            damagePercentage: 0,
            criticalDamage: 0,
            bossDamage: 0,
            finalDamagePercentage: 0,
            criticalRate: 0,
            ignoreDefenseRate: 0,
            buffEffects: {}
        };

        const buffEffects = activeBuffs.reduce((effects, buffId) => {
            const buff = buffs.find(b => b.id === buffId);

            if (buff) {
                buff.effects.forEach(effect => {
                    if (effect.attribute === "ignoreDefenseRate") {
                        if (effect.value > 0) {
                            effects[effect.attribute] = 1 - (1 - (effects[effect.attribute] || 0) / 100) * (1 - effect.value / 100);
                        } else {
                            effects[effect.attribute] = 1 - (1 - (effects[effect.attribute] || 0) / 100) / (1 + effect.value / 100);
                        }

                        effects[effect.attribute] *= 100;
                    } else {
                        effects[effect.attribute] = (effects[effect.attribute] || 0) + effect.value;
                    }
                });
            }

            return effects;
        }, {} as Record<string, number>);

        let mainAttributeBase = (selectedCharacter.mainAttributeBase || 0) + (tempChanges.mainAttributeBase || 0);
        let mainAttributePercent = (selectedCharacter.mainAttributePercent || 0) + (tempChanges.mainAttributePercent || 0);
        let mainAttributeExtra = (selectedCharacter.mainAttributeExtra || 0) + (tempChanges.mainAttributeExtra || 0);
        mainAttributeBase += buffEffects.mainAttributeBase || 0;
        let mainStat = mainAttributeBase * (1 + mainAttributePercent / 100) + mainAttributeExtra;
        let secondaryAttributeBase = (selectedCharacter.secondaryAttributeBase || 0) + (tempChanges.secondaryAttributeBase || 0);
        let secondaryAttributePercent = (selectedCharacter.secondaryAttributePercent || 0) + (tempChanges.secondaryAttributePercent || 0);
        let secondaryAttributeExtra = (selectedCharacter.secondaryAttributeExtra || 0) + (tempChanges.secondaryAttributeExtra || 0);
        secondaryAttributeBase += buffEffects.secondaryAttributeBase || 0;
        let secondaryStat = secondaryAttributeBase * (1 + secondaryAttributePercent / 100) + secondaryAttributeExtra;
        let attackPower = (selectedCharacter.baseAttack + (buffEffects.baseAttack || 0) + (tempChanges.baseAttack || 0)) * (1 + (selectedCharacter.attackPercentage + (buffEffects.attackPercentage || 0) + (tempChanges.attackPercentage || 0)) / 100) + selectedCharacter.additionalAttack;
        let damagePercentage = selectedCharacter.damagePercentage + (buffEffects.damagePercentage || 0) + (tempChanges.damagePercentage || 0);
        let criticalDamage = selectedCharacter.criticalDamage + (buffEffects.criticalDamage || 0) + (tempChanges.criticalDamage || 0);
        let bossDamage = selectedCharacter.bossDamage + (buffEffects.bossDamage || 0) + (tempChanges.bossDamage || 0);
        let finalDamagePercentage = selectedCharacter.finalDamagePercentage + (buffEffects.finalDamagePercentage || 0) + (tempChanges.finalDamagePercentage || 0);
        let criticalRate = selectedCharacter.criticalRate + (buffEffects.criticalRate || 0) + (tempChanges.criticalRate || 0);
        let tempIG = tempChanges.ignoreDefenseRate || 0;

        if (tempIG > 0) {
            tempIG = 1 - tempIG / 100;
        } else {
            tempIG = 1 / (1 + tempIG / 100);
        }

        let ignoreDefenseRate = 1 - (1 - selectedCharacter.ignoreDefenseRate / 100) * (1 - (buffEffects.ignoreDefenseRate || 0) / 100) * tempIG;
        ignoreDefenseRate *= 100;

        return {
            mainStat,
            secondaryStat,
            attackPower,
            damagePercentage,
            criticalDamage,
            bossDamage,
            finalDamagePercentage,
            criticalRate,
            ignoreDefenseRate,
            buffEffects
        };
    };

    const calculateCombatPower = () => {
        if (!selectedCharacter) {
            toast.error("请先选择角色");
            return;
        }

        setIsCalculating(true);

        try {
            setTimeout(() => {
                const {
                    mainStat,
                    secondaryStat,
                    attackPower,
                    damagePercentage,
                    criticalDamage,
                    bossDamage,
                    finalDamagePercentage,
                    buffEffects
                } = getMainAndSecondaryStats();

                const result = Math.floor(
                    (selectedCharacter.weaponCoefficient || 1) * Math.floor(attackPower) * (4 * Math.floor(mainStat) + Math.floor(secondaryStat)) * 0.01 * (1 + damagePercentage / 100) * (1 + finalDamagePercentage / 100)
                );

                setCombatPower(result);
                toast.success("战斗力计算完成");
                setIsCalculating(false);
            }, 1000);
        } catch (error) {
            toast.error("计算战斗力失败，请重试");
            setIsCalculating(false);
        }
    };

    const analyzeAttributeComparison = () => {
        if (!selectedCharacter || !selectedAttribute1 || !selectedAttribute2 || selectedAttribute1 === selectedAttribute2) {
            return;
        }

        setIsAnalyzing(true);
        setAttributeComparisonResult(null);

        setTimeout(() => {
            try {
                const {
                    mainStat,
                    secondaryStat,
                    attackPower,
                    damagePercentage,
                    criticalDamage,
                    bossDamage,
                    finalDamagePercentage,
                    criticalRate,
                    ignoreDefenseRate,
                    buffEffects
                } = getMainAndSecondaryStats();

                const baseCP = calculateCombatPowerEnhanced();
                let marginalBenefit1 = 0;

                if (selectedAttribute1 === "ignoreDefenseRate") {
                    const tempChanges1 = {
                        [selectedAttribute1]: 30,
                        ["bossDefense"]: 380
                    };

                    const cpWithChange1 = calculateCombatPowerEnhanced(tempChanges1);
                    marginalBenefit1 = cpWithChange1 - baseCP;
                } else {
                    const tempChanges1 = {
                        [selectedAttribute1]: 1,
                        ["bossDefense"]: 380
                    };

                    const cpWithChange1 = calculateCombatPowerEnhanced(tempChanges1);
                    marginalBenefit1 = cpWithChange1 - baseCP;
                }

                const tempChanges2 = {
                    [selectedAttribute2]: 1,
                    ["bossDefense"]: 380
                };

                const cpWithChange2 = calculateCombatPowerEnhanced(tempChanges2);
                const marginalBenefit2 = cpWithChange2 - baseCP;
                const conversionRate = marginalBenefit1 / marginalBenefit2;
                let conclusion = "";

                if (selectedAttribute1 === "ignoreDefenseRate") {
                    conclusion = `380防，30点${attributeOptions.find(a => a.value === selectedAttribute1)?.label}的收益约等于${conversionRate.toFixed(2)}点${attributeOptions.find(a => a.value === selectedAttribute2)?.label}。`;
                } else {
                    conclusion = `当前情况下，1点${attributeOptions.find(a => a.value === selectedAttribute1)?.label}的收益约等于${conversionRate.toFixed(2)}点${attributeOptions.find(a => a.value === selectedAttribute2)?.label}。`;
                }

                setAttributeComparisonResult({
                    conversionRate,
                    conclusion
                });
            } catch (error) {
                toast.error("属性对比分析失败，请重试");
                console.error("分析错误:", error);
            } finally {
                setIsAnalyzing(false);
            }
        }, 1000);
    };

    const analyzeEquipmentChange = () => {
        if (!selectedCharacter)
            return;

        setIsAnalyzing(true);
        setEquipmentChangeResult(null);

        setTimeout(() => {
            try {
                const baseCP = 0.001 * calculateCombatPowerEnhanced();
                const newCP = 0.001 * calculateCombatPowerEnhanced(equipmentChanges);
                const combatPowerChange = baseCP > 0 ? 1000 * (newCP - baseCP) / baseCP : 0;
                const attributeImpacts: Record<string, number> = {};

                Object.entries(equipmentChanges).forEach(([key, value]) => {
                    if (value !== 0) {
                        const tempChanges = {
                            [key]: value
                        };

                        const tempCP = 0.001 * calculateCombatPowerEnhanced(tempChanges);
                        attributeImpacts[key] = tempCP - baseCP;
                    }
                });

                let evaluation = "";

                if (combatPowerChange > 0.0) {
                    evaluation = "装备更换后战斗力有所提升，可以考虑更换。";
                } else if (combatPowerChange === 0.0) {
                    evaluation = "装备更换后战斗力没有变化，建议根据其他因素（如套装效果）决定是否更换。";
                } else {
                    evaluation = "装备更换后战斗力下降，不建议更换此装备。";
                }

                setEquipmentChangeResult({
                    combatPowerChange,
                    attributeImpacts,
                    evaluation
                });
            } catch (error) {
                toast.error("装备更换分析失败，请重试");
                console.error("分析错误:", error);
            } finally {
                setIsAnalyzing(false);
            }
        }, 1000);
    };

    const calculateCombatPowerEnhanced = (tempChanges: Record<string, number> = {}) => {
        if (!selectedCharacter)
            return 0;

        const {
            mainStat,
            secondaryStat,
            attackPower,
            damagePercentage,
            criticalDamage,
            bossDamage,
            finalDamagePercentage,
            criticalRate,
            ignoreDefenseRate,
            buffEffects
        } = getMainAndSecondaryStats(tempChanges);

        let showDamage = attackPower * (4 * mainStat + secondaryStat) * 0.01 * (1 + finalDamagePercentage / 100);
        showDamage *= 1 + bossDamage / 100 + damagePercentage / 100;

        if (criticalRate > 100) {
            showDamage *= 1.35 + criticalDamage / 100;
        } else {
            showDamage *= 1 - criticalRate / 100 + criticalRate / 100 * (1.35 + criticalDamage / 100);
        }

        let cans = 1000 * showDamage * (1 - 0.01 * (tempChanges.bossDefense || 380) * (1 - ignoreDefenseRate / 100));
        return cans > 0 ? cans : 0;
    };

    const renderStatCard = (
        label: string,
        value: number | string,
        icon: string,
        color: string = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    ) => {
        return (
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${color}`}>
                            <i className={`fa-solid ${icon}`}></i>
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{value}</span>
                </div>
            </div>
        );
    };

    const loadCharacterEquipment = (characterId: string) => {
        try {
            const savedEquipment = JSON.parse(localStorage.getItem("mapleStoryEquipment") || "{}");
            setEquipmentData(savedEquipment[characterId] || {});
        } catch (error) {
            toast.error("加载装备数据失败");
        }
    };

    const handleCharacterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const characterId = e.target.value;
        setSelectedCharacterId(characterId);
        const char = characters.find(c => c.id === characterId);
        setSelectedCharacter(char);
        loadCharacterEquipment(characterId);
    };

    const handleCharacterSelect = (character: any) => {
        setSelectedCharacterId(character.id);
        setSelectedCharacter(character);
        loadCharacterEquipment(character.id);
    };

    return (
        <div className="space-y-8">
            {}
            <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">战力装备系统</h1>
                    <p className="text-gray-600 dark:text-gray-300">不支持白毛、尖兵等特殊职业</p>
                </div>
                <Link
                    to="/character-creation"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <i className="fa-solid fa-plus mr-2"></i>创建新角色
                                                                                                                                                                                                                </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {}
                <div className="lg:col-span-1">
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">原初生灵面板</h2>
                        </div>
                        {isLoading ? <div className="flex items-center justify-center h-40">
                            <i className="fa-solid fa-spinner fa-spin text-gray-400 text-xl"></i>
                        </div> : characters.length === 0 ? <div
                            className="flex flex-col items-center justify-center h-40 p-4 text-center">
                            <i
                                className="fa-solid fa-user-plus text-gray-300 dark:text-gray-600 text-3xl mb-2"></i>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">您还没有创建角色</p>
                            <Link
                                to="/character-creation"
                                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">创建第一个角色
                                                                                                                                                                                                                                                                                                                                                </Link>
                        </div> : <div className="max-h-[500px] overflow-y-auto">
                            {characters.map(character => <div className="relative">
                                <div
                                    className="w-full p-4 cursor-pointer transition-colors"
                                    onClick={() => handleCharacterSelect(character)}
                                    className={`w-full p-4 cursor-pointer transition-colors ${selectedCharacter?.id === character.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                                    <div className="flex items-center">
                                        <div
                                            className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                                            <i className="fa-solid fa-user text-blue-600 dark:text-blue-400 text-xl"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {character.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {characterClasses.find(cls => cls.id === character.className)?.name}Lv.{character.level}
                                            </p>
                                        </div>
                                        {selectedCharacter?.id === character.id && <i className="fa-solid fa-check text-blue-500"></i>}
                                    </div>
                                    <button
                                        onClick={() => navigate("/character-creation", {
                                            state: {
                                                editCharacterId: character.id
                                            }
                                        })}
                                        className="absolute top-2 right-8 text-gray-400 hover:text-blue-500"
                                        aria-label="编辑角色">
                                        <i className="fa-solid fa-edit"></i>
                                    </button>
                                </div>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();

                                        if (window.confirm(`确定要删除角色"${character.name}"吗？`)) {
                                            const updatedCharacters = characters.filter(c => c.id !== character.id);
                                            setCharacters(updatedCharacters);
                                            localStorage.setItem("mapleStoryCharacters", JSON.stringify(updatedCharacters));

                                            if (selectedCharacter?.id === character.id) {
                                                setSelectedCharacter(null);
                                                setEquipmentData({});
                                            }

                                            const savedEquipment = JSON.parse(localStorage.getItem("mapleStoryEquipment") || "{}");
                                            delete savedEquipment[character.id];
                                            localStorage.setItem("mapleStoryEquipment", JSON.stringify(savedEquipment));
                                            toast.success(`角色"${character.name}"已删除`);
                                        }
                                    }}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    aria-label="删除角色">
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>)}
                        </div>}
                    </div>
                </div>
                {}
                <div className="lg:col-span-1 space-y-6">
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                        <div className="space-y-6">
                            {}
                            {selectedCharacter && <div className="border-t border-gray-100 dark:border-gray-700">
                                <h3
                                 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-start cursor-pointer"
                                onClick={() => setIsBuffSectionOpen(!isBuffSectionOpen)}>
                                <div className="flex items-center">
                                    <i className="fa-solid text-yellow-500"></i>临时Buff面板</div>
                                <i
                                    className={`fa-solid ${isBuffSectionOpen ? "fa-chevron-up" : "fa-chevron-down"} text-gray-400 transition-transform duration-200 ml-auto`}></i>
                                </h3>
                                 <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isBuffSectionOpen ? "h-96 overflow-y-auto opacity-100" : "max-h-0 opacity-0"}`}>
                                    {/* 药水组 */}
                                    <div className="mb-4">
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center">
                                            <i className="fa-solid fa-flask mr-2"></i>药水
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {buffs.filter(buff => buff.category === "potion").map(buff => {
                                                let icon = "fa-flask";

                                                if (buff.effects.some(e => e.attribute.includes("attack")))
                                                    icon = "fa-bolt";

                                                if (buff.effects.some(e => e.attribute.includes("bossDamage")))
                                                    icon = "fa-shield-alt";

                                                if (buff.effects.some(e => e.attribute.includes("critical")))
                                                    icon = "fa-star";

                                                const effectDescription = buff.effects.map(effect => {
                                                    let attrName = effect.attribute;

                                                    if (effect.attribute === "mainAttributeBase")
                                                        attrName = "主属性";

                                                    if (effect.attribute === "secondaryAttributeBase")
                                                        attrName = "副属性";

                                                    if (effect.attribute === "attackPercentage")
                                                        attrName = "攻击百分比";

                                                    if (effect.attribute === "criticalRate")
                                                        attrName = "暴击率";

                                                    if (effect.attribute === "baseAttack")
                                                        attrName = "攻击";

                                                    if (effect.attribute === "ignoreDefenseRate")
                                                        attrName = "无视防御";

                                                    if (effect.attribute === "bossDamage")
                                                        attrName = "BOSS伤害";

                                                    if (effect.attribute === "damagePercentage")
                                                        attrName = "伤害";

                                                    if (effect.attribute === "criticalDamage")
                                                        attrName = "暴击伤害";

                                                    return `${attrName}+${effect.value}${effect.attribute.includes("Percentage") || effect.attribute === "ignoreDefenseRate" ? "%" : ""}`;
                                                }).join("\n");

                                                return (
                                                     <div
                                                        key={buff.id}
                                                        className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                                                            activeBuffs.includes(buff.id) 
                                                                ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                                : 'border border-transparent'
                                                        }`}
                                                        title={`${buff.name}\n${effectDescription}`}
                                                        onClick={() => {
                                                            if (activeBuffs.includes(buff.id)) {
                                                                setActiveBuffs(activeBuffs.filter(id => id !== buff.id));
                                                            } else {
                                                                setActiveBuffs([...activeBuffs, buff.id]);
                                                            }
                                                        }}>
                                                        <div className="flex items-center">
                                                            {buff.id === "int10" ? (
                                                                 <img 
  																	 src="../assets/images/001.png"
                                                                     alt={buff.name} 
                                                                     className={`ml-2 mr-2 w-5 h-5 object-contain ${
                                                                         ''
                                                                     }`}
                                                                 />
                                                             ) : (
                                                                 <i className={`fa-solid ${icon} ml-2 mr-2 ${
                                                                     activeBuffs.includes(buff.id) ? 'text-blue-500' : 'text-gray-500'
                                                                 }`}></i>
                                                             )}
                                                            <span className="text-sm text-gray-900 dark:text-white">{buff.name}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 技能组 */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center">
                                            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>技能
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {buffs.filter(buff => buff.category === "skill").map(buff => {
                                                let icon = "fa-wand-magic-sparkles";

                                                if (buff.effects.some(e => e.attribute.includes("attack")))
                                                    icon = "fa-bolt";

                                                if (buff.effects.some(e => e.attribute.includes("bossDamage")))
                                                    icon = "fa-shield-alt";

                                                if (buff.effects.some(e => e.attribute.includes("critical")))
                                                    icon = "fa-star";

                                                const effectDescription = buff.effects.map(effect => {
                                                    let attrName = effect.attribute;

                                                    if (effect.attribute === "mainAttributeBase")
                                                        attrName = "主属性";

                                                    if (effect.attribute === "secondaryAttributeBase")
                                                        attrName = "副属性";

                                                    if (effect.attribute === "attackPercentage")
                                                        attrName = "攻击百分比";

                                                    if (effect.attribute === "criticalRate")
                                                        attrName = "暴击率";

                                                    if (effect.attribute === "baseAttack")
                                                        attrName = "攻击";

                                                    if (effect.attribute === "ignoreDefenseRate")
                                                        attrName = "无视防御";

                                                    if (effect.attribute === "bossDamage")
                                                        attrName = "BOSS伤害";

                                                    if (effect.attribute === "damagePercentage")
                                                        attrName = "伤害";

                                                    if (effect.attribute === "criticalDamage")
                                                        attrName = "暴击伤害";

                                                    return `${attrName}+${effect.value}${effect.attribute.includes("Percentage") || effect.attribute === "ignoreDefenseRate" ? "%" : ""}`;
                                                }).join("\n");

                                                return (
                                                     <div
                                                        key={buff.id}
                                                        className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                                                            activeBuffs.includes(buff.id) 
                                                                ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                                : 'border border-transparent'
                                                        }`}
                                                        title={`${buff.name}\n${effectDescription}`}
                                                        onClick={() => {
                                                            if (activeBuffs.includes(buff.id)) {
                                                                setActiveBuffs(activeBuffs.filter(id => id !== buff.id));
                                                            } else {
                                                                setActiveBuffs([...activeBuffs, buff.id]);
                                                            }
                                                        }}>
                                                        <div className="flex items-center">
                                                            <i className={`fa-solid ${icon} ml-2 mr-2 ${
                                                                activeBuffs.includes(buff.id) ? 'text-blue-500' : 'text-gray-500'
                                                            }`}></i>
                                                            <span className="text-sm text-gray-900 dark:text-white">{buff.name}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>}
                            {}
                            <div className="space-y-4">
                                {selectedCharacter ? <></> : <div
                                    className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                                    <i
                                        className="fa-solid fa-user-circle text-gray-300 dark:text-gray-600 text-3xl mb-2"></i>
                                    <p className="text-gray-500 dark:text-gray-400">请从左侧"我的角色"中选择一个角色</p>
                                </div>}
                                <button
                                    onClick={calculateCombatPower}
                                    disabled={isCalculating || !selectedCharacter}
                                    className="w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isCalculating ? <>
                                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>计算中...
                                                                                                                                                                                                                                                                                                          </> : <>
                                        <i className="fa-solid fa-calculator mr-2"></i>计算战斗力
                                                                                                                                                                                                                                                                                                          </>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-3 overflow-hidden">
                    {!selectedCharacter ? <div
                        className="flex flex-col items-center justify-center h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                        <i
                            className="fa-solid fa-user-circle text-gray-300 dark:text-gray-600 text-5xl mb-4"></i>
                        <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">请选择一个角色</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">从左侧列表选择一个角色查看其装备情况，或创建新角色
                                                                                                                                                                                                                                                                                                      </p>
                    </div> : <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">战斗力计算
                                                                                                                                                                                                                                                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 space-y-6">
                                    <div
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                                        <div className="p-6 border-b">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">战斗力评估</h2>
                                        </div>
                                        <div className="w-full">
                                            {combatPower !== null ? <div className="space-y-8 w-full">
                                                <div
                                                    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800 shadow-sm">
                                                    <div className="flex flex-col items-center justify-center text-center">
                                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">属性战斗力</h3>
                                                        <div
                                                            className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 mb-2">
                                                            <span
                                                                className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">
                                                                {combatPower.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">基于角色属性和装备计算</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">角色属性</h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {selectedCharacter && <>
                                                            {renderStatCard(
                                                                "主属性",
                                                                getMainAndSecondaryStats().mainStat,
                                                                "fa-star",
                                                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                                            )}
                                                            {renderStatCard(
                                                                "副属性",
                                                                getMainAndSecondaryStats().secondaryStat,
                                                                "fa-star-half-stroke",
                                                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                                            )}
                                                            {renderStatCard(
                                                                "攻击力",
                                                                getMainAndSecondaryStats().attackPower,
                                                                "fa-bolt",
                                                                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                                            )}
                                                            {renderStatCard(
                                                                "伤害%",
                                                                `${getMainAndSecondaryStats().damagePercentage}%`,
                                                                "fa-percent",
                                                                "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                            )}
                                                            {renderStatCard(
                                                                "终伤%",
                                                                `${getMainAndSecondaryStats().finalDamagePercentage}%`,
                                                                "fa-percent",
                                                                "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                            )}
                                                            {renderStatCard(
                                                                "BOSS伤%",
                                                                `${getMainAndSecondaryStats().bossDamage}%`,
                                                                "fa-shield-alt",
                                                                "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                            )}
                                                            {renderStatCard(
                                                                "暴击率%",
                                                                `${getMainAndSecondaryStats().criticalRate}%`,
                                                                "fa-bullseye",
                                                                "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                                            )}
                                                            {renderStatCard(
                                                                "爆伤%",
                                                                `${getMainAndSecondaryStats().criticalDamage}%`,
                                                                "fa-sword",
                                                                "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
                                                            )}
                                                            {renderStatCard(
                                                                "无视%",
                                                                `${getMainAndSecondaryStats().ignoreDefenseRate.toFixed(2)}%`,
                                                                "fa-heart",
                                                                "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
                                                            )}
                                                        </>}
                                                    </div>
                                                </div>
                                            </div> : <div
                                                className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <i
                                                    className="fa-solid fa-calculator text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
                                                <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">尚未计算战斗力</h3>
                                                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                                                    {!selectedCharacterId ? "请先选择一个角色" : "点击\"计算战斗力\"按钮开始计算"}
                                                </p>
                                            </div>}
                                        </div>
                                    </div>
                                    <div
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">属性收益分析</h2>
                                        <div className="mb-8">
                                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() => setAnalysisType("attributeComparison")}
                                                    className={`py-2 px-4 border-b-2 font-medium text-sm ${analysisType === "attributeComparison" ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}>属性对比分析
                                                                                                                                                                                                                                                                                                                                                                                                                        </button>
                                                <button
                                                    onClick={() => setAnalysisType("equipmentChange")}
                                                    className={`py-2 px-4 border-b-2 font-medium text-sm ${analysisType === "equipmentChange" ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}>装备更换分析
                                                                                                                                                                                                                                                                                                                                                                                                                        </button>
                                            </div>
                                        </div>
                                        {analysisType === "attributeComparison" && <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label
                                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择属性1
                                                                                                                                                                                                                                                                                                                                                                                                                                                        </label>
                                                    <select
                                                        value={selectedAttribute1}
                                                        onChange={e => setSelectedAttribute1(e.target.value)}
                                                        disabled={!selectedCharacter || isAnalyzing}
                                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50">
                                                        <option value="">选择属性</option>
                                                        {attributeOptions.map(attr => <option key={attr.value} value={attr.value}>
                                                            <i className={`fa-solid ${attr.icon} mr-2`}></i>{attr.label}
                                                        </option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label
                                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择属性2
                                                                                                                                                                                                                                                                                                                                                                                                                                                        </label>
                                                    <select
                                                        value={selectedAttribute2}
                                                        onChange={e => setSelectedAttribute2(e.target.value)}
                                                        disabled={!selectedCharacter || isAnalyzing}
                                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50">
                                                        <option value="">选择属性</option>
                                                        {attributeOptions.map(attr => <option key={attr.value} value={attr.value}>
                                                            <i className={`fa-solid ${attr.icon} mr-2`}></i>{attr.label}
                                                        </option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={analyzeAttributeComparison}
                                                    disabled={!selectedCharacter || !selectedAttribute1 || !selectedAttribute2 || selectedAttribute1 === selectedAttribute2 || isAnalyzing}
                                                    className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {isAnalyzing ? <>
                                                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>分析中...
                                                                                                                                                                                                                                                                                                                                                                                                                                                          </> : <>
                                                        <i className="fa-solid fa-calculator mr-2"></i>分析属性收益
                                                                                                                                                                                                                                                                                                                                                                                                                                                          </>}
                                                </button>
                                            </div>
                                            {attributeComparisonResult && <div
                                                className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                                <h3
                                                    className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">属性收益对比结果</h3>
                                                <div
                                                    className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                                                            <i
                                                                className={`fa-solid ${attributeOptions.find(a => a.value === selectedAttribute1)?.icon} text-blue-600 dark:text-blue-400 text-2xl`}></i>
                                                        </div>
                                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{attributeOptions.find(a => a.value === selectedAttribute1)?.label}</h4>
                                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2"> {selectedAttribute1 === "ignoreDefenseRate" ? 30 : 1}{attributeOptions.find(a => a.value === selectedAttribute1)?.unit || ""}</p>
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-500">=</div>
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-3">
                                                            <i
                                                                className={`fa-solid ${attributeOptions.find(a => a.value === selectedAttribute2)?.icon} text-purple-600 dark:text-purple-400 text-2xl`}></i>
                                                        </div>
                                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{attributeOptions.find(a => a.value === selectedAttribute2)?.label}</h4>
                                                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{attributeComparisonResult.conversionRate.toFixed(2)}{attributeOptions.find(a => a.value === selectedAttribute2)?.unit || ""}</p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">分析结论</h4>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        {attributeComparisonResult.conclusion}
                                                    </p>
                                                </div>
                                            </div>}
                                        </div>}
                                        {analysisType === "equipmentChange" && <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {attributeOptions.map(attr => <div key={attr.value}>
                                                    <label
                                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        {attr.label} <span className="text-gray-500 dark:text-gray-400 text-xs">({attr.unit})</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={equipmentChanges[attr.value]}
                                                        onChange={e => setEquipmentChanges({
                                                            ...equipmentChanges,
                                                            [attr.value]: parseInt(e.target.value)
                                                        })}
                                                        disabled={!selectedCharacter || isAnalyzing}
                                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                                                        placeholder="0" />
                                                </div>)}
                                            </div>
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={analyzeEquipmentChange}
                                                    disabled={!selectedCharacter || isAnalyzing}
                                                    className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {isAnalyzing ? <>
                                                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>计算中...
                                                                                                                                                                                                                                                                                                                                                                                                                                                          </> : <>
                                                        <i className="fa-solid fa-calculator mr-2"></i>计算战力收益
                                                                                                                                                                                                                                                                                                                                                                                                                                                          </>}
                                                </button>
                                            </div>
                                            {equipmentChangeResult && <div
                                                className="mt-8 p-6 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                                <h3
                                                    className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">装备更换收益结果</h3>
                                                <div className="flex flex-col items-center mb-6">
                                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                                                        {equipmentChangeResult.combatPowerChange >= 0 ? "+" : ""}{equipmentChangeResult.combatPowerChange.toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">实战伤害变化(‰)</p>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                    {Object.entries(equipmentChangeResult.attributeImpacts).filter(([_, value]) => value !== 0).map(([key, value]) => <div
                                                        key={key}
                                                        className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{attributeOptions.find(a => a.value === key)?.label}</p>
                                                        <p
                                                            className={`text-lg font-semibold ${value > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                            {value > 0 ? "+" : ""}{value}
                                                        </p>
                                                    </div>)}
                                                </div>
                                                <div
                                                    className={`p-4 rounded-lg ${equipmentChangeResult.combatPowerChange > 0 ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : equipmentChangeResult.combatPowerChange < 0 ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700"}`}>
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">装备评价</h4>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        {equipmentChangeResult.evaluation}
                                                    </p>
                                                </div>
                                            </div>}
                                        </div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <></>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-6">
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    );
}

const characterClasses = [{
    id: "warrior",
    name: "战士",
    mainStat: "力量"
}, {
    id: "magician",
    name: "魔法师",
    mainStat: "智力"
}, {
    id: "bowman",
    name: "弓箭手",
    mainStat: "敏捷"
}, {
    id: "thief",
    name: "飞侠",
    mainStat: "运气"
}, {
    id: "pirate",
    name: "海盗",
    mainStat: "力量/敏捷"
}];
