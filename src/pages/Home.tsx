import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
    return (
        <div className="space-y-8">
            {}
            <section
                className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="absolute inset-0 opacity-20">
                    <i className="fa-solid fa-gamepad absolute -top-10 -left-10 text-[200px]"></i>
                    <i className="fa-solid fa-shield-alt absolute top-20 right-10 text-[150px]"></i>
                    <i className="fa-solid fa-sword absolute bottom-10 left-1/3 text-[100px]"></i>
                </div>
                <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-16 md:py-20">
                    <div className="max-w-2xl">
                        <h1
                            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4">冒冒守护平台
                                        </h1>
                        <p className="text-lg sm:text-xl opacity-90 mb-8">您的《冒险岛》游戏数据管理与分析助手，助您轻松提升战力。
                                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/combat-power-equipment"
                                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-center">
                                <i className="fa-solid fa-shield-alt mr-2"></i>进入战力装备板块
                                              </Link>
                            <Link
                                to="/lottery-simulation"
                                className="px-6 py-3 bg-transparent border-2 border-white font-bold rounded-lg hover:bg-white/10 transition-all duration-300 text-center">
                                <i className="fa-solid fa-gift mr-2"></i>抽奖模拟系统
                                              </Link>
                        </div>
                    </div>
                </div>
            </section>
            {}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {}
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
                    whileHover={{
                        scale: 1.02
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300
                    }}>
                    <div
                        className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                        <i
                            className="fa-solid fa-shield-alt text-blue-600 dark:text-blue-400 text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold mb-2">战力装备系统</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">全面的角色创建与装备数据管理，精确计算战斗力，分析属性提升效益。
                                  </p>
                    <Link
                        to="/combat-power-equipment"
                        className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center hover:underline">了解更多 <i className="fa-solid fa-arrow-right ml-1"></i>
                    </Link>
                </motion.div>
                {}
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
                    whileHover={{
                        scale: 1.02
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300
                    }}>
                    <div
                        className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                        <i className="fa-solid fa-gift text-purple-600 dark:text-purple-400 text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold mb-2">抽奖模拟系统</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">模拟转蛋、敲敲乐等概率类活动，自定义概率，记录历史数据，优化抽奖策略。
                                  </p>
                    <Link
                        to="/lottery-simulation"
                        className="text-purple-600 dark:text-purple-400 font-medium inline-flex items-center hover:underline">了解更多 <i className="fa-solid fa-arrow-right ml-1"></i>
                    </Link>
                </motion.div>
                {}

            </section>
            {}
            <></>
        </div>
    );
}
