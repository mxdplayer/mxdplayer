import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";

const attributes = [{
    id: "strength",
    name: "力量",
    icon: "fa-dumbbell"
}, {
    id: "dexterity",
    name: "敏捷",
    icon: "fa-feather"
}, {
    id: "intelligence",
    name: "智力",
    icon: "fa-brain"
}, {
    id: "luck",
    name: "运气",
    icon: "fa-clover"
}];

const characterSchema = z.object({
    name: z.string().min(2, "角色名称至少2个字符").max(12, "角色名称最多12个字符"),
    level: z.number().min(1, "等级至少为1").max(300, "最高等级为300"),
    mainAttribute: z.string().min(1, "请选择主属性"),
    mainAttributeBase: z.number().min(0, "主属性不能为负数"),
    mainAttributePercent: z.number().min(0, "主属性百分比不能为负数"),
    mainAttributeExtra: z.number().min(0, "额外主属性不能为负数"),
    secondaryAttribute: z.string().min(1, "请选择副属性"),
    secondaryAttributeBase: z.number().min(0, "副属性不能为负数"),
    secondaryAttributePercent: z.number().min(0, "副属性百分比不能为负数"),
    secondaryAttributeExtra: z.number().min(0, "额外副属性不能为负数"),
    weaponCoefficient: z.number().min(0, "武器系数不能为负数"),
    master: z.number().min(0, "熟练度不能为负数"),
    cdflush: z.number().min(0, "无冷不能为负数"),
    extdamage: z.number().min(0, "异常伤害不能为负数"),
    yuanchu: z.number().min(0, "原初之力不能为负数"),
    shenmi: z.number().min(0, "神秘之力不能为负数"),
    bufftime: z.number().min(0, "buff持续时间不能为负数"),
    ignoreext: z.number().min(0, "无视异常抗性不能为负数"),
    baseAttack: z.number().min(0, "基础攻击不能为负数"),
    attackPercentage: z.number().min(0, "攻击百分比不能为负数"),
    additionalAttack: z.number().min(0, "额外攻击不能为负数"),
    damagePercentage: z.number().min(0, "伤害百分比不能为负数"),
    finalDamagePercentage: z.number().min(0, "终伤百分比不能为负数"),
    bossDamage: z.number().min(0, "BOSS伤害不能为负数"),
    ignoreDefenseRate: z.number().min(0, "无视防御率不能为负数").max(100, "无视防御率不能超过100%")
});

type CharacterFormData = z.infer<typeof characterSchema>;

export default function CharacterCreation() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState<CharacterFormData>({
        name: "",
        level: 200,
        mainAttribute: "",
        mainAttributeBase: 0,
        mainAttributePercent: 0,
        mainAttributeExtra: 0,
        secondaryAttribute: "",
        secondaryAttributeBase: 0,
        secondaryAttributePercent: 0,
        secondaryAttributeExtra: 0,
        weaponCoefficient: 1.0,
        master: 50,
        cdflush: 0,
        extdamage: 0,
        yuanchu: 0,
        shenmi: 0,
        bufftime: 0,
        ignoreext: 0,
        baseAttack: 0,
        attackPercentage: 0,
        additionalAttack: 0,
        damagePercentage: 0,
        finalDamagePercentage: 0,
        bossDamage: 0,
        ignoreDefenseRate: 0,
        criticalRate: 0,
        criticalDamage: 0
    });

    const attributeColors = {
        strength: {
            light: "from-red-50 via-orange-50 to-yellow-50",
            dark: "from-red-900/30 via-orange-900/30 to-yellow-900/30"
        },

        dexterity: {
            light: "from-green-50 via-teal-50 to-blue-50",
            dark: "from-green-900/30 via-teal-900/30 to-blue-900/30"
        },

        intelligence: {
            light: "from-blue-50 via-indigo-50 to-purple-50",
            dark: "from-blue-900/30 via-indigo-900/30 to-purple-900/30"
        },

        luck: {
            light: "from-purple-50 via-pink-50 to-red-50",
            dark: "from-purple-900/30 via-pink-900/30 to-red-900/30"
        }
    };

    const [gradientClass, setGradientClass] = useState(
        "from-blue-50 via-indigo-100 to-purple-50 dark:from-blue-100 dark:via-indigo-200 dark:to-purple-100"
    );

    useEffect(() => {
        if (!formData.mainAttribute || !formData.secondaryAttribute)
            return;

        const mainColor = attributeColors[formData.mainAttribute as keyof typeof attributeColors];
        const secondaryColor = attributeColors[formData.secondaryAttribute as keyof typeof attributeColors];
        
        // 基础渐变
        let lightGradient = `${mainColor.light.split(" ")[0]} ${mainColor.light.split(" ")[1]} ${secondaryColor.light.split(" ")[2]}`;
        let darkGradient = `${mainColor.dark.split(" ")[0]} ${mainColor.dark.split(" ")[1]} ${secondaryColor.dark.split(" ")[2]}`;
        
        // 根据等级调整渐变
        if (formData.level < 200) {
            // 等级小于200，使用暗淡渐变
            lightGradient += " opacity-70";
            darkGradient += " opacity-70";
        } else if (formData.level > 260) {
            // 等级大于260，使用深邃渐变
            // 将浅色方案中的-50替换为-100，使颜色更深
            lightGradient = lightGradient.replace(/-50\b/g, "-100");
            // 深色方案保持不变，但可以增加饱和度
            darkGradient = darkGradient.replace(/900\/30\b/g, "900/60");
        }
        
        setGradientClass(`${lightGradient} dark:${darkGradient}`);
    }, [formData.mainAttribute, formData.secondaryAttribute, formData.level]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAttackDropdownOpen, setIsAttackDropdownOpen] = useState(false);
    const [isSecondaryDropdownOpen, setIsSecondaryDropdownOpen] = useState(false);
    const [isBasicInfoDropdownOpen, setIsBasicInfoDropdownOpen] = useState(false);

    useEffect(() => {
        const editCharacterId = location.state?.editCharacterId;

        if (editCharacterId) {
            setIsEditing(true);
            const savedCharacters = JSON.parse(localStorage.getItem("mapleStoryCharacters") || "[]");
            const characterToEdit = savedCharacters.find((c: any) => c.id === editCharacterId);

            if (characterToEdit) {
                setFormData({
                    name: characterToEdit.name,
                    level: characterToEdit.level,
                    mainAttribute: characterToEdit.mainAttribute,
                    secondaryAttribute: characterToEdit.secondaryAttribute,
                    mainAttributeBase: characterToEdit.mainAttributeBase,
                    mainAttributePercent: characterToEdit.mainAttributePercent,
                    mainAttributeExtra: characterToEdit.mainAttributeExtra,
                    secondaryAttributeBase: characterToEdit.secondaryAttributeBase,
                    secondaryAttributePercent: characterToEdit.secondaryAttributePercent,
                    secondaryAttributeExtra: characterToEdit.secondaryAttributeExtra,
                    weaponCoefficient: characterToEdit.weaponCoefficient,
                    baseAttack: characterToEdit.baseAttack,
                    attackPercentage: characterToEdit.attackPercentage,
                    additionalAttack: characterToEdit.additionalAttack,
                    damagePercentage: characterToEdit.damagePercentage,
                    finalDamagePercentage: characterToEdit.finalDamagePercentage,
                    bossDamage: characterToEdit.bossDamage,
                    ignoreDefenseRate: characterToEdit.ignoreDefenseRate,
                    criticalRate: characterToEdit.criticalRate,
                    criticalDamage: characterToEdit.criticalDamage,
                    master: characterToEdit.master,
                    cdflush: characterToEdit.cdflush,
                    extdamage: characterToEdit.extdamage,
                    ignoreext: characterToEdit.ignoreext,
                    yuanchu: characterToEdit.yuanchu,
                    shenmi: characterToEdit.shenmi,
                    bufftime: characterToEdit.bufftime
                });
            }
        }
    }, [location.state?.editCharacterId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {
            name,
            value
        } = e.target;

        if ([
            "level",
            "baseAttack",
            "attackPercentage",
            "additionalAttack",
            "damagePercentage",
            "finalDamagePercentage",
            "bossDamage",
            "ignoreDefenseRate",
            "criticalRate",
            "criticalDamage",
            "mainAttributeBase",
            "mainAttributePercent",
            "mainAttributeExtra",
            "secondaryAttributeBase",
            "secondaryAttributePercent",
            "secondaryAttributeExtra",
            "weaponCoefficient",
            "cdflush",
            "extdamage",
            "ignoreext",
            "yuanchu",
            "shenmi",
            "bufftime",
            "master"
        ].includes(name)) {
            setFormData(prev => ({
                ...prev,
                [name]: value ? Number(value) : 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = {
                    ...prev
                };

                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result = characterSchema.safeParse(formData);

        if (!result.success) {
            const newErrors: Record<string, string> = {};

            result.error.issues.forEach(issue => {
                newErrors[issue.path[0]] = issue.message;
            });

            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            setTimeout(() => {
                const savedCharacters = JSON.parse(localStorage.getItem("mapleStoryCharacters") || "[]");

                if (isEditing) {
                    const editCharacterId = location.state?.editCharacterId;
                    const characterIndex = savedCharacters.findIndex((c: any) => c.id === editCharacterId);

                    if (characterIndex !== -1) {
                        savedCharacters[characterIndex] = {
                            ...savedCharacters[characterIndex],
                            ...formData,
                            updatedAt: new Date().toISOString()
                        };

                        toast.success(`角色"${formData.name}"已更新！`);
                    }
                } else {
                    const newCharacter = {
                        id: Date.now().toString(),
                        ...formData,
                        createdAt: new Date().toISOString()
                    };

                    savedCharacters.push(newCharacter);
                    toast.success(`角色"${formData.name}"创建成功！`);
                }

                localStorage.setItem("mapleStoryCharacters", JSON.stringify(savedCharacters));
                navigate("/combat-power-equipment");
            }, 800);
        } catch (error) {
            toast.error("创建角色失败，请重试");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isEditing ? "编辑角色" : "创建新角色"}</h1>
                <p className="text-gray-600 dark:text-gray-300">根据您游戏中的角色信息面板输入数据</p>
            </div>
            {}
            <div
                 className={`bg-gradient-to-br ${gradientClass} bg-opacity-95 dark:bg-opacity-95 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out`}>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    {}
                    <div
                        className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h3
                                className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-between cursor-pointer"
                                onClick={() => setIsBasicInfoDropdownOpen(!isBasicInfoDropdownOpen)}>
                                <div className="flex items-center">
                                    <i className="fa-solid fa-user text-blue-500 mr-2"></i><i
                                        data-inspector-line="307"
                                        data-inspector-column="36"
                                        data-inspector-relative-path="src/pages/CharacterCreation.tsx"
                                        class="fa-solid text-blue-500 mr-2"></i>角色名</div>
                                <div className="w-64">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={cn(
                                            "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        )}
                                        placeholder="输入角色名称" />
                                    {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                </div>
                                <div className="flex items-center w-20 text-right">
                                    <i className="fa-solid text-blue-500 mr-2"></i>{formData.level < 200 ? "凡级" : formData.level < 260 ? "神级" : "根源级"}
                                </div>
                                <i
                                    className={`fa-solid ${isBasicInfoDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"} text-gray-400 transition-transform duration-200`}></i>
                            </h3>
                            <div
                                className={`space-y-6 overflow-hidden transition-all duration-300 ease-in-out ${isBasicInfoDropdownOpen ? "max-h-96 overflow-y-auto opacity-100" : "max-h-0 opacity-0"}`}>
                                {}
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="level"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">等级 <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <input
                                            type="number"
                                            id="level"
                                            name="level"
                                            value={formData.level}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.level ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="1"
                                            max="300" />
                                        {errors.level && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.level}</p>}
                                    </div>
                                </div>
                                {}
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="shenmi"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">神秘之力
                                                                                                                                                                                                                                                                                    </label>
                                    <div>
                                        <input
                                            type="number"
                                            id="shenmi"
                                            name="shenmi"
                                            value={formData.shenmi}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.shenmi ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors.shenmi && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.shenmi}</p>}
                                    </div>
                                </div>
                                {}
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="yuanchu"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">原初之力
                                                                                                                                                                                                                                                                                    </label>
                                    <div>
                                        <input
                                            type="number"
                                            id="yuanchu"
                                            name="yuanchu"
                                            value={formData.yuanchu}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.yuanchu ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors.yuanchu && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.yuanchu}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {}
                    <div
                        className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        {}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h3
                                className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-between cursor-pointer"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <div className="flex items-center">
                                    <i className="fa-solid fa-star text-blue-500 mr-2"></i>主属性
                                                                                                                                                                                                                                                                                          </div>
                                <div className="w-64">
                                    <select
                                        id="mainAttribute"
                                        name="mainAttribute"
                                        value={formData.mainAttribute}
                                        onChange={handleChange}
                                        className={cn(
                                            "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            errors.mainAttribute ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        )}>
                                        <option value="">选择主属性</option>
                                        {attributes.map(attr => <option key={attr.id} value={attr.id}>
                                            <i className={`fa-solid ${attr.icon} mr-2`}></i>{attr.name}
                                        </option>)}
                                    </select>
                                    {errors.mainAttribute && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mainAttribute}</p>}
                                </div>
                                <div className="flex items-center w-20 text-right">
                                    <i className="fa-solid text-blue-500 mr-2"></i>{Math.floor(
                                        formData.mainAttributeBase * (1 + formData.mainAttributePercent / 100) + formData.mainAttributeExtra
                                    )}
                                </div>
                                <i
                                    className={`fa-solid ${isDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"} text-gray-400 transition-transform duration-200`}></i>
                            </h3>
                            <div
                                className={`space-y-6 overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? "max-h-96 overflow-y-auto opacity-100" : "max-h-0 opacity-0"}`}>
                                {}
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="mainAttributeBase"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">基本数值 <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <input
                                            type="number"
                                            id="mainAttributeBase"
                                            name="mainAttributeBase"
                                            value={formData.mainAttributeBase}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.mainAttributeBase ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors.mainAttributeBase && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mainAttributeBase}</p>}
                                    </div>
                                </div>
                                {}
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="mainAttributePercent"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">%数值 <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <input
                                            type="number"
                                            id="mainAttributePercent"
                                            name="mainAttributePercent"
                                            value={formData.mainAttributePercent}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.mainAttributePercent ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors.mainAttributePercent && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mainAttributePercent}</p>}
                                    </div>
                                </div>
                                {}
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="mainAttributeExtra"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">%未应用数值 <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <input
                                            type="number"
                                            id="mainAttributeExtra"
                                            name="mainAttributeExtra"
                                            value={formData.mainAttributeExtra}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.mainAttributeExtra ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors.mainAttributeExtra && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mainAttributeExtra}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {}
                    <div
                        className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        {}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h3
                                className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-between cursor-pointer"
                                onClick={() => setIsSecondaryDropdownOpen(!isSecondaryDropdownOpen)}>
                                <div className="flex items-center">
                                    <i className="fa-solid fa-star-half-stroke text-blue-500 mr-2"></i>副属性
                                                                                                                                                                                                                                                                                          </div>
                                <div className="w-64">
                                    <select
                                        id="secondaryAttribute"
                                        name="secondaryAttribute"
                                        value={formData.secondaryAttribute}
                                        onChange={handleChange}
                                        className={cn(
                                            "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            errors.secondaryAttribute ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        )}>
                                        <option value="">选择副属性</option>
                                        {attributes.map(attr => <option key={attr.id} value={attr.id}>
                                            <i className={`fa-solid ${attr.icon} mr-2`}></i>{attr.name}
                                        </option>)}
                                    </select>
                                    {errors.secondaryAttribute && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.secondaryAttribute}</p>}
                                </div>
                                <div className="flex items-center w-20 text-right">
                                    <i className="fa-solid text-blue-500 mr-2"></i>{Math.floor(
                                        formData.secondaryAttributeBase * (1 + formData.secondaryAttributePercent / 100) + formData.secondaryAttributeExtra
                                    )}
                                </div>
                                <i
                                    className={`fa-solid ${isSecondaryDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"} text-gray-400 transition-transform duration-200`}></i>
                            </h3>
                            <div
                                className={`space-y-6 overflow-hidden transition-all duration-300 ease-in-out ${isSecondaryDropdownOpen ? "max-h-96 overflow-y-auto opacity-100" : "max-h-0 opacity-0"}`}>
                                {}
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="secondaryAttributeBase"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">基本数值 <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <input
                                            type="number"
                                            id="secondaryAttributeBase"
                                            name="secondaryAttributeBase"
                                            value={formData.secondaryAttributeBase}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.secondaryAttributeBase ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors.secondaryAttributeBase && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.secondaryAttributeBase}</p>}
                                    </div>
                                </div>
                                {}
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="secondaryAttributePercent"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">%数值 <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <input
                                            type="number"
                                            id="secondaryAttributePercent"
                                            name="secondaryAttributePercent"
                                            value={formData.secondaryAttributePercent}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.secondaryAttributePercent ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors.secondaryAttributePercent && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.secondaryAttributePercent}</p>}
                                    </div>
                                </div>
                                {}
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="secondaryAttributeExtra"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">%未应用数值 <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <input
                                            type="number"
                                            id="secondaryAttributeExtra"
                                            name="secondaryAttributeExtra"
                                            value={formData.secondaryAttributeExtra}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.secondaryAttributeExtra ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors.secondaryAttributeExtra && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.secondaryAttributeExtra}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h3
                                className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-between cursor-pointer"
                                onClick={() => setIsAttackDropdownOpen(!isAttackDropdownOpen)}>
                                <div className="flex items-center">
                                    <i className="fa-solid fa-bolt text-blue-500 mr-2"></i><i
                                        data-inspector-line="619"
                                        data-inspector-column="36"
                                        data-inspector-relative-path="src/pages/CharacterCreation.tsx"
                                        class="fa-solid text-blue-500 mr-2"></i>攻击</div>
                                <div className="flex items-center w-20 text-right">
                                    <i className="fa-solid text-blue-500 mr-2"></i>{Math.floor(
                                        formData.baseAttack * (1 + formData.attackPercentage / 100) + formData.additionalAttack
                                    )}
                                </div>
                                <i
                                    className={`fa-solid ${isAttackDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"} text-gray-400 transition-transform duration-200`}></i>
                            </h3>
                            <div
                                className={`space-y-6 overflow-hidden transition-all duration-300 ease-in-out ${isAttackDropdownOpen ? "max-h-96 overflow-y-auto opacity-100" : "max-h-0 opacity-0"}`}>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="baseAttack"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">基础攻击 <span className="text-red-500">*</span></label>
                                    <div>
                                        <input
                                            type="number"
                                            id="baseAttack"
                                            name="baseAttack"
                                            value={formData.baseAttack}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.baseAttack ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors.baseAttack && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.baseAttack}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="attackPercentage"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">攻击百分比(%) <span className="text-red-500">*</span></label>
                                    <div>
                                        <input
                                            type="number"
                                            id="attackPercentage"
                                            name="attackPercentage"
                                            value={formData.attackPercentage}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.attackPercentage ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0"
                                            step="0.01" />
                                        {errors.attackPercentage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.attackPercentage}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="additionalAttack"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">额外攻击 <span className="text-red-500">*</span></label>
                                    <div>
                                        <input
                                            type="number"
                                            id="additionalAttack"
                                            name="additionalAttack"
                                            value={formData.additionalAttack}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.additionalAttack ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors.additionalAttack && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.additionalAttack}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="weaponCoefficient"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">武器系数 <span className="text-red-500">*</span></label>
                                    <div>
                                        <input
                                            type="number"
                                            id="weaponCoefficient"
                                            name="weaponCoefficient"
                                            value={formData.weaponCoefficient}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.weaponCoefficient ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0.1"
                                            max="5"
                                            step="0.01" />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            <i className="fa-solid mr-1"></i><i
                                                data-inspector-line="707"
                                                data-inspector-column="44"
                                                data-inspector-relative-path="src/pages/CharacterCreation.tsx"
                                                class="fa-solid mr-1"></i><i
                                                data-inspector-line="711"
                                                data-inspector-column="44"
                                                data-inspector-relative-path="src/pages/CharacterCreation.tsx"
                                                class="fa-solid fa-info-circle mr-1"></i><i
                                                data-inspector-line="707"
                                                data-inspector-column="44"
                                                data-inspector-relative-path="src/pages/CharacterCreation.tsx"
                                                class="fa-solid mr-1"></i>点击游戏的属性攻击力栏，可看到武器系数/熟练度</p>
                                        {errors.weaponCoefficient && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.weaponCoefficient}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label
                                        htmlFor="master"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300">熟练度(%)</label>
                                    <div>
                                        <input
                                            type="number"
                                            id="master"
                                            name="master"
                                            value={formData.master}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors.master ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors.master && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.master}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm py-1 px-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-2">
                      <div className="grid grid-cols-2 gap-2 items-center mb-1">
                         <label
                            htmlFor="damagePercentage"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300">伤害百分比(%) <span className="text-red-500">*</span>
                        </label>
                        <div>
                            <input
                                type="number"
                                id="damagePercentage"
                                name="damagePercentage"
                                value={formData.damagePercentage}
                                onChange={handleChange}
                         className={cn(
                             "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none",
                             errors.damagePercentage ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                         )}
                                min="0" />
                            {errors.damagePercentage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.damagePercentage}</p>}
                        </div>
                     </div>
  											<div className="grid grid-cols-2 gap-2 items-center mb-1">
                                 <label
                                    htmlFor="criticalDamage"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">暴击伤害(%) <span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <input
                                        type="number"
                                        id="criticalDamage"
                                        name="criticalDamage"
                                        value={formData.criticalDamage}
                                        onChange={handleChange}
                         className={cn(
                             "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none",
                             errors.criticalDamage ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                         )}
                                        min="0"
                                        step="0.01" />
                                    {errors.criticalDamage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.criticalDamage}</p>}
                                </div>
                            </div>
                   
                              <div className="grid grid-cols-2 gap-2 items-center mb-1">
                                 <label
                                    htmlFor="finalDamagePercentage"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">终伤百分比(%) <span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <input
                                        type="number"
                                        id="finalDamagePercentage"
                                        name="finalDamagePercentage"
                                        value={formData.finalDamagePercentage}
                                        onChange={handleChange}
                         className={cn(
                             "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none",
                             errors.finalDamagePercentage ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                         )}
                                        min="0"
                                        step="0.01" />
                                    {errors.finalDamagePercentage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.finalDamagePercentage}</p>}
                                </div>
                             </div>
                              <div className="grid grid-cols-2 gap-2 items-center mb-1">
                                 <label
                                    htmlFor="bossDamage"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">BOSS伤害(%) <span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <input
                                        type="number"
                                        id="bossDamage"
                                        name="bossDamage"
                                        value={formData.bossDamage}
                                        onChange={handleChange}
                         className={cn(
                             "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none",
                             errors.bossDamage ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                         )}
                                        min="0" />
                                    {errors.bossDamage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bossDamage}</p>}
                                </div>
                             </div>
                              <div className="grid grid-cols-2 gap-2 items-center mb-1">
                                 <label
                                    htmlFor="ignoreDefenseRate"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">无视防御率(%) <span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <input
                                        type="number"
                                        id="ignoreDefenseRate"
                                        name="ignoreDefenseRate"
                                        value={formData.ignoreDefenseRate}
                                        onChange={handleChange}
                         className={cn(
                             "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none",
                             errors.ignoreDefenseRate ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                         )}
                                        min="0"
                                        max="100"
                                        step="0.01" />
                                    {errors.ignoreDefenseRate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ignoreDefenseRate}</p>}
                                </div>
                             </div>
  											 <div className="grid grid-cols-2 gap-2 items-center mb-1">
                                 <label
                                    htmlFor="criticalRate"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">暴击率(%) <span className="text-red-500">*</span>
                                </label>
                                <div>
                                    <input
                                        type="number"
                                        id="criticalRate"
                                        name="criticalRate"
                                        value={formData.criticalRate}
                                        onChange={handleChange}
                         className={cn(
                             "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none",
                             errors.criticalRate ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                         )}
                                        min="0" />
                                    {errors.criticalRate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.criticalRate}</p>}
                                </div>
                             </div>
                              <div className="grid grid-cols-2 gap-2 items-center mb-1">
                                 <label
                                    htmlFor="extdamage"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">异常状态伤害(%)
                                </label>
                                <div>
                                    <input
                                        type="number"
                                        id="extdamage"
                                        name="extdamage"
                                        value={formData.extdamage}
                                        onChange={handleChange}
                         className={cn(
                             "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none",
                             errors.extdamage ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                         )}
                                        min="0" />
                                    {errors.extdamage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.extdamage}</p>}
                                </div>
                             </div>
                              <div className="grid grid-cols-2 gap-2 items-center mb-1">
                                 <label
                                    htmlFor="ignoreext"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">无视属性抗性(%)
                                </label>
                                <div>
                                    <input
                                        type="number"
                                        id="ignoreext"
                                        name="ignoreext"
                                        value={formData.ignoreext}
                                        onChange={handleChange}
                         className={cn(
                             "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none",
                             errors.ignoreext ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                         )}
                                        min="0" />
                                    {errors.ignoreext && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ignoreext}</p>}
                                </div>
                             </div>
                              <div className="grid grid-cols-2 gap-2 items-center mb-1">
                                 <label
                                    htmlFor="bufftime"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">buff持续时间
                                </label>
                                <div>
                                    <input
                                        type="number"
                                        id="bufftime"
                                        name="bufftime"
                                        value={formData.bufftime}
                                        onChange={handleChange}
                         className={cn(
                             "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none",
                             errors.bufftime ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                         )}
                                        min="0" />
                                    {errors.bufftime && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bufftime}</p>}
                                </div>
                             </div>
                              <div className="grid grid-cols-2 gap-2 items-center mb-1">
                                 <label
                                    htmlFor="cdflush"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">无冷(%)
                                </label>
                                <div>
                                    <input
                                        type="number"
                                        id="cdflush"
                                        name="cdflush"
                                        value={formData.cdflush}
                                        onChange={handleChange}
                         className={cn(
                             "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none",
                             errors.cdflush ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                         )}
                                        min="0" />
                                    {errors.cdflush && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cdflush}</p>}
                                </div>
                            </div>                            
                      	</div>                            
                    </div>
                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate("/combat-power-equipment")}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">取消
                                                                                                                                                                                                                            </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? <>
                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>保存中...
                                                                                                                                                                                                                                                            </> : <>
                                <i className={`fa-solid ${isEditing ? "fa-edit" : "fa-save"} mr-2`}></i>
                                {isEditing ? "更新角色" : "保存角色"}
                            </>}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
