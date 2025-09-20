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
    strength: z.number().min(0, "力量不能为负数"),
    dexterity: z.number().min(0, "敏捷不能为负数"),
    intelligence: z.number().min(0, "智力不能为负数"),
    luck: z.number().min(0, "运气不能为负数"),
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
        secondaryAttribute: "",
        strength: 0,
        dexterity: 0,
        intelligence: 0,
        luck: 0,
        baseAttack: 0,
        attackPercentage: 0,
        additionalAttack: 0,
        damagePercentage: 0,
        finalDamagePercentage: 0,
        bossDamage: 0,
        ignoreDefenseRate: 0,
				mainAttributeBase: 0,
				mainAttributePercent: 0,
				mainAttributeExtra: 0,
    		secondaryAttributeBase: 0,
				secondaryAttributePercent: 0,
				secondaryAttributeExtra: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    strength: characterToEdit.strength || 0,
                    dexterity: characterToEdit.dexterity || 0,
                    intelligence: characterToEdit.intelligence || 0,
                    luck: characterToEdit.luck || 0,
                    weaponCoefficient: characterToEdit.weaponCoefficient,
                    baseAttack: characterToEdit.baseAttack || 0,
                    attackPercentage: characterToEdit.attackPercentage || 0,
                    additionalAttack: characterToEdit.additionalAttack || 0,
                    damagePercentage: characterToEdit.damagePercentage || 0,
                    finalDamagePercentage: characterToEdit.finalDamagePercentage || 0,
                    bossDamage: characterToEdit.bossDamage || 0,
                    ignoreDefenseRate: characterToEdit.ignoreDefenseRate || 0,
                    criticalRate: characterToEdit.criticalRate || 0,
                    criticalDamage: characterToEdit.criticalDamage || 0,
										mainAttributeBase: characterToEdit.mainAttributeBase || 0,
										mainAttributePercent: characterToEdit.mainAttributePercent || 0,
										mainAttributeExtra: characterToEdit.mainAttributeExtra || 0,
						    		secondaryAttributeBase: characterToEdit.secondaryAttributeBase || 0,
										secondaryAttributePercent: characterToEdit.secondaryAttributePercent || 0,
										secondaryAttributeExtra: characterToEdit.secondaryAttributeExtra || 0
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
            "strength",
            "dexterity",
            "intelligence",
            "luck",
						"mainAttributeBase",
						"mainAttributePercent",
						"mainAttributeExtra",
		    		"secondaryAttributeBase",
						"secondaryAttributePercent",
						"secondaryAttributeExtra"
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
                        weaponCoefficient: formData.weaponCoefficient,
                        baseAttack: formData.baseAttack,
                        attackPercentage: formData.attackPercentage,
                        additionalAttack: formData.additionalAttack,
                        damagePercentage: formData.damagePercentage,
                        finalDamagePercentage: formData.finalDamagePercentage,
                        bossDamage: formData.bossDamage,
                        ignoreDefenseRate: formData.ignoreDefenseRate,
                        criticalRate: formData.criticalRate || 0,
                        criticalDamage: formData.criticalDamage || 0,
										    mainAttributeBase: formData.mainAttributeBase,
												mainAttributePercent: formData.mainAttributePercent,
												mainAttributeExtra: formData.mainAttributeExtra,
								    		secondaryAttributeBase: formData.secondaryAttributeBase,
												secondaryAttributePercent: formData.secondaryAttributePercent,
                        secondaryAttributeExtra: formData.secondaryAttributeExtra,
                        createdAt: new Date().toISOString()
                    };

                    savedCharacters.push(newCharacter);
                    toast.success(`角色"${formData.name}"创建成功！`);
                }

                localStorage.setItem("mapleStoryCharacters", JSON.stringify(savedCharacters));
                toast.success(`角色"${formData.name}"创建成功！`);
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
                <p className="text-gray-600 dark:text-gray-300">填写您的角色信息，包括职业、等级和基础属性
                            </p>
            </div>
            {}
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {}
                    <div className="space-y-4">
                        <h2
                            className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">基本信息</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">角色名称 <span className="text-red-500">*</span>
                                </label>
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
                            {}
                            <div>
                                <label
                                    htmlFor="mainAttribute"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">主属性 <span className="text-red-500">*</span>
                                </label>
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
                            {}
                            <div>
                                <label
                                    htmlFor="secondaryAttribute"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">副属性 <span className="text-red-500">*</span>
                                </label>
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
                        </div>
                    </div>
                    {}
                    <div className="space-y-4 pt-4 border-t">
                        <h2
                            className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">角色等级</h2>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div>
                                <label
                                    htmlFor="level"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">等级 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="level"
                                    name="level"
                                    value={formData.level}
                                    onChange={e => {
                                        handleChange(e);
                                    }}
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
                        <div className="space-y-4 pt-4 border-t">
                            <h2
                                className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">武器系数</h2>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div>
                                    <label
                                        htmlFor="weaponCoefficient"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">武器系数 <span className="text-red-500">*</span>
                                    </label>
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
                                        <i className="fa-solid fa-info-circle mr-1"></i>根据武器类型设置，通常在1.0-3.0之间
                                                         </p>
                                    {errors.weaponCoefficient && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.weaponCoefficient}</p>}
                                </div>
                            </div>
                        </div>
                        {}
                        <div className="space-y-4 pt-4 border-t">
                            <h2
                                className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">战斗参数</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="baseAttack"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">基础攻击 <span className="text-red-500">*</span>
                                    </label>
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
                                <div>
                                    <label
                                        htmlFor="attackPercentage"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">攻击百分比(%) <span className="text-red-500">*</span>
                                    </label>
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
                                <div>
                                    <label
                                        htmlFor="additionalAttack"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">额外攻击 <span className="text-red-500">*</span>
                                    </label>
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
                                <div>
                                    <label
                                        htmlFor="damagePercentage"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">伤害百分比(%) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="damagePercentage"
                                        name="damagePercentage"
                                        value={formData.damagePercentage}
                                        onChange={handleChange}
                                        className={cn(
                                            "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            errors.damagePercentage ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        )}
                                        min="0" />
                                    {errors.damagePercentage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.damagePercentage}</p>}
                                </div>
                                <div>
                                    <label
                                        htmlFor="finalDamagePercentage"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">终伤百分比(%) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="finalDamagePercentage"
                                        name="finalDamagePercentage"
                                        value={formData.finalDamagePercentage}
                                        onChange={handleChange}
                                        className={cn(
                                            "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            errors.finalDamagePercentage ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        )}
                                        min="0"
																				step="0.01" />
                                    {errors.finalDamagePercentage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.finalDamagePercentage}</p>}
                                </div>
                                <div>
                                    <label
                                        htmlFor="bossDamage"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BOSS伤害(%) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="bossDamage"
                                        name="bossDamage"
                                        value={formData.bossDamage}
                                        onChange={handleChange}
                                        className={cn(
                                            "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            errors.bossDamage ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        )}
                                        min="0" />
                                    {errors.bossDamage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bossDamage}</p>}
                                </div>
                                <div>
                                    <label
                                        htmlFor="ignoreDefenseRate"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">无视防御率(%) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="ignoreDefenseRate"
                                        name="ignoreDefenseRate"
                                        value={formData.ignoreDefenseRate}
                                        onChange={handleChange}
                                        className={cn(
                                            "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            errors.ignoreDefenseRate ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        )}
                                        min="0"
                                        max="100"
                                        step="0.01" />
                                    {errors.ignoreDefenseRate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ignoreDefenseRate}</p>}
                                </div>
                                <div>
                                    <label
                                        htmlFor="criticalRate"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">暴击率(%) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="criticalRate"
                                        name="criticalRate"
                                        value={formData.criticalRate}
                                        onChange={handleChange}
                                        className={cn(
                                            "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            errors.criticalRate ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        )}
                                        min="0" />
                                    {errors.criticalRate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.criticalRate}</p>}
                                </div>
                                <div>
                                    <label
                                        htmlFor="criticalDamage"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">暴击伤害(%) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="criticalDamage"
                                        name="criticalDamage"
                                        value={formData.criticalDamage}
                                        onChange={handleChange}
                                        className={cn(
                                            "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            errors.criticalDamage ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        )}
                                        min="0"
                                        step="0.01" />
                                    {errors.criticalDamage && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.criticalDamage}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    {}
                    <div className="space-y-6 pt-4 border-t">
                        <h2
                            className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">属性配置</h2>
                        {}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {}
                            <div
                                className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                                <h3
                                    className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                    <i className="fa-solid fa-star text-blue-600 dark:text-blue-400 mr-2"></i>主属性: {attributes.find(a => a.id === formData.mainAttribute)?.name}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor={`mainAttributeBase`}
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">基础{attributes.find(a => a.id === formData.mainAttribute)?.name}
                                        </label>
                                        <input
                                            type="number"
                                            id={`mainAttributeBase`}
                                            name={`mainAttributeBase`}
                                            value={formData.mainAttributeBase}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors[`mainAttributeBase`] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors[`mainAttributeBase`] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`mainAttributeBase`]}</p>}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`mainAttributePercent`}
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {attributes.find(a => a.id === formData.mainAttribute)?.name}百分比(%)
                                                                </label>
                                        <input
                                            type="number"
                                            id={`mainAttributePercent`}
                                            name={`mainAttributePercent`}
                                            value={formData.mainAttributePercent}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors[`mainAttributePercent`] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors[`mainAttributePercent`] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`mainAttributePercent`]}</p>}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`mainAttributeExtra`}
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">额外{attributes.find(a => a.id === formData.mainAttribute)?.name}
                                        </label>
                                        <input
                                            type="number"
                                            id={`mainAttributeExtra`}
                                            name={`mainAttributeExtra`}
                                            value={formData.mainAttributeExtra}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                errors[`mainAttributeExtra`] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors[`mainAttributeExtra`] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`mainAttributeExtra`]}</p>}
                                    </div>
                                    <></>
                                </div>
                            </div>
                            {}
                            <div
                                className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-100 dark:border-green-800">
                                <h3
                                    className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                    <i
                                        className="fa-solid fa-star-half-stroke text-green-600 dark:text-green-400 mr-2"></i>副属性: {attributes.find(a => a.id === formData.secondaryAttribute)?.name}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor={`secondaryAttributeBase`}
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">基础{attributes.find(a => a.id === formData.secondaryAttribute)?.name}
                                        </label>
                                        <input
                                            type="number"
                                            id={`secondaryAttributeBase`}
                                            name={`secondaryAttributeBase`}
                                            value={formData.secondaryAttributeBase}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500",
                                                errors[`secondaryAttributeBase`] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors[`secondaryAttributeBase`] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`secondaryAttributeBase`]}</p>}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`secondaryAttributePercent`}
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {attributes.find(a => a.id === formData.secondaryAttribute)?.name}百分比(%)
                                                                </label>
                                        <input
                                            type="number"
                                            id={`secondaryAttributePercent`}
                                            name={`secondaryAttributePercent`}
                                            value={formData.secondaryAttributePercent}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500",
                                                errors[`secondaryAttributePercent`] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors[`secondaryAttributePercent`] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`secondaryAttributePercent`]}</p>}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`secondaryAttributeExtra`}
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">额外{attributes.find(a => a.id === formData.secondaryAttribute)?.name}
                                        </label>
                                        <input
                                            type="number"
                                            id={`secondaryAttributeExtra`}
                                            name={`secondaryAttributeExtra`}
                                            value={formData.secondaryAttributeExtra}
                                            onChange={handleChange}
                                            className={cn(
                                                "block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500",
                                                errors[`secondaryAttributeExtra`] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            )}
                                            min="0" />
                                        {errors[`secondaryAttributeExtra`] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`secondaryAttributeExtra`]}</p>}
                                    </div>
                                    <></>
                                </div>
                            </div>
                        </div>
                    </div>
                    {}
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
                            </>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}